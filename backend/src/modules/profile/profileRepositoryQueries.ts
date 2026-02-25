import {
  and,
  asc,
  eq,
  inArray,
  sql,
  type InferSelectModel,
} from 'drizzle-orm';

import { db } from '../../db/client.js';
import {
  appProfile,
  completedDose,
  plannedDose,
  profileMember,
  vaccinationSeries,
} from '../../db/schema.js';

import {
  toAccountsState,
  toVaccinationState,
} from './profileRepositoryMappers.js';
import { ProfileAccountNotFoundError } from './profileRepositoryErrors.js';
import type {
  AppLanguage,
  CountryCode,
  ProfileSnapshot,
  VaccinationStorageState,
} from './profileTypes.js';

export const APP_PROFILE_ID = 1;

type DatabaseClient = typeof db;

type AppProfileRow = InferSelectModel<typeof appProfile>;
export type ProfileMemberRow = InferSelectModel<typeof profileMember>;
type VaccinationSeriesRow = InferSelectModel<typeof vaccinationSeries>;

export const loadProfileRowUsingDb = async (
  database: DatabaseClient,
): Promise<AppProfileRow> => {
  const [profile] = await database
    .select()
    .from(appProfile)
    .where(eq(appProfile.id, APP_PROFILE_ID))
    .limit(1);

  if (!profile) {
    throw new Error('Default application profile is missing.');
  }

  return profile;
};

export const loadProfileMembersUsingDb = async (
  database: DatabaseClient,
): Promise<ProfileMemberRow[]> => (
  database
    .select()
    .from(profileMember)
    .where(eq(profileMember.appProfileId, APP_PROFILE_ID))
    .orderBy(asc(profileMember.sortOrder), asc(profileMember.id))
);

export const ensureDefaultProfileUsingDb = async (
  database: DatabaseClient,
): Promise<void> => {
  await database
    .insert(appProfile)
    .values({
      id: APP_PROFILE_ID,
      language: 'ru',
    })
    .onConflictDoNothing();

  const profile = await loadProfileRowUsingDb(database);
  let members = await loadProfileMembersUsingDb(database);
  let primaryMember = members.find((member) => member.kind === 'primary') ?? null;

  if (!primaryMember) {
    const [createdPrimaryMember] = await database
      .insert(profileMember)
      .values({
        appProfileId: APP_PROFILE_ID,
        kind: 'primary',
        country: profile.country,
        sortOrder: 0,
      })
      .returning();

    if (!createdPrimaryMember) {
      throw new Error('Unable to create primary profile member.');
    }

    primaryMember = createdPrimaryMember;
    members = await loadProfileMembersUsingDb(database);
  }

  const selectedMemberIsValid = members.some((member) => member.id === profile.selectedMemberId);

  if (!selectedMemberIsValid) {
    await database
      .update(appProfile)
      .set({
        selectedMemberId: primaryMember.id,
        updatedAt: sql`now()`,
      })
      .where(eq(appProfile.id, APP_PROFILE_ID));
  }
};

const getProfileContextUsingDb = async (
  database: DatabaseClient,
): Promise<{
  members: ProfileMemberRow[];
  profile: AppProfileRow;
  selectedMember: ProfileMemberRow;
}> => {
  await ensureDefaultProfileUsingDb(database);

  const [profile, members] = await Promise.all([
    loadProfileRowUsingDb(database),
    loadProfileMembersUsingDb(database),
  ]);

  const selectedMember = members.find((member) => member.id === profile.selectedMemberId) ?? null;

  if (!selectedMember) {
    throw new Error('Selected profile member is missing after initialization.');
  }

  return {
    members,
    profile,
    selectedMember,
  };
};

export const getProfileMemberByIdUsingDb = async (
  database: DatabaseClient,
  accountId: number,
): Promise<ProfileMemberRow> => {
  await ensureDefaultProfileUsingDb(database);

  const [member] = await database
    .select()
    .from(profileMember)
    .where(and(
      eq(profileMember.id, accountId),
      eq(profileMember.appProfileId, APP_PROFILE_ID),
    ))
    .limit(1);

  if (!member) {
    throw new ProfileAccountNotFoundError(accountId);
  }

  return member;
};

const loadVaccinationStateForMemberUsingDb = async (
  database: DatabaseClient,
  member: ProfileMemberRow,
): Promise<VaccinationStorageState> => {
  const seriesRows = await database
    .select()
    .from(vaccinationSeries)
    .where(eq(vaccinationSeries.memberId, member.id))
    .orderBy(asc(vaccinationSeries.diseaseId));
  const seriesIds = seriesRows.map((series: VaccinationSeriesRow) => series.id);

  if (seriesIds.length === 0) {
    return {
      country: (member.country as CountryCode | null) ?? null,
      records: [],
    };
  }

  const [completedRows, plannedRows] = await Promise.all([
    database
      .select()
      .from(completedDose)
      .where(inArray(completedDose.seriesId, seriesIds))
      .orderBy(
        asc(completedDose.seriesId),
        asc(completedDose.completedAt),
        asc(completedDose.externalId),
      ),
    database
      .select()
      .from(plannedDose)
      .where(inArray(plannedDose.seriesId, seriesIds))
      .orderBy(
        asc(plannedDose.seriesId),
        asc(plannedDose.dueAt),
        asc(plannedDose.externalId),
      ),
  ]);

  return toVaccinationState({
    completedRows,
    member,
    plannedRows,
    seriesRows,
  });
};

export const getProfileSnapshotUsingDb = async (
  database: DatabaseClient,
): Promise<ProfileSnapshot> => {
  const { members, profile, selectedMember } = await getProfileContextUsingDb(database);

  return {
    accountsState: toAccountsState({ members, selectedMember }),
    language: profile.language as AppLanguage,
    vaccinationState: await loadVaccinationStateForMemberUsingDb(database, selectedMember),
  };
};

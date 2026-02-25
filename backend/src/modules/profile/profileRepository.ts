import {
  and,
  eq,
  sql,
} from 'drizzle-orm';

import { db } from '../../db/client.js';
import {
  appProfile,
  completedDose,
  plannedDose,
  profileMember,
  vaccinationSeries,
} from '../../db/schema.js';
import { toIsoDateTime } from './profileRepositoryDate.js';
import {
  OptimisticConcurrencyError,
  ProfileAccountNotFoundError,
  ProfilePrimaryAccountDeletionError,
} from './profileRepositoryErrors.js';
import {
  assertVaccinationSeriesVersionMatches,
  loadCompletedDoseRowsForSeriesUsingDb,
  loadVaccinationSeriesVersionForMemberUsingDb,
  syncPlannedDosesForSeriesUsingDb,
  touchVaccinationSeriesUsingDb,
  upsertVaccinationSeriesForRecordSubmissionUsingDb,
} from './profileRepositoryVaccinationSeries.js';
import {
  APP_PROFILE_ID,
  ensureDefaultProfileUsingDb,
  getProfileMemberByIdUsingDb,
  getProfileSnapshotUsingDb,
  loadProfileMembersUsingDb,
  loadProfileRowUsingDb,
} from './profileRepositoryQueries.js';

import type {
  AppLanguage,
  CountryCode,
  DoseKind,
  ProfileSnapshot,
  VaccinationStoragePlannedDose,
  VaccinationStorageRepeatRule,
} from './profileTypes.js';

type DatabaseClient = typeof db;

interface SubmitVaccinationRecordInput {
  batchNumber: string | null;
  completedAt: string;
  completedDoseKind: DoseKind;
  completedDoseId: string | null;
  diseaseId: string;
  expectedUpdatedAt: string | null;
  futureDueDoses: VaccinationStoragePlannedDose[];
  repeatEvery: VaccinationStorageRepeatRule | null;
  tradeName: string | null;
}

interface CompleteVaccinationDoseInput {
  batchNumber: string | null;
  completedAt: string;
  diseaseId: string;
  doseId: string;
  expectedUpdatedAt: string | null;
  kind: DoseKind;
  plannedDoseId: string | null;
  tradeName: string | null;
}

export interface ProfileRepository {
  createFamilyAccount: (input: {
    birthYear: number;
    country: CountryCode | null;
    name: string;
  }) => Promise<ProfileSnapshot>;
  deleteFamilyAccount: (accountId: number) => Promise<ProfileSnapshot>;
  ensureDefaultProfile: () => Promise<void>;
  getProfileSnapshot: () => Promise<ProfileSnapshot>;
  removeVaccinationRecord: (accountId: number, diseaseId: string) => Promise<void>;
  selectAccount: (accountId: number) => Promise<ProfileSnapshot>;
  setVaccinationCountry: (accountId: number, country: CountryCode) => Promise<void>;
  submitVaccinationRecord: (
    accountId: number,
    input: SubmitVaccinationRecordInput,
  ) => Promise<string>;
  completeVaccinationDose: (
    accountId: number,
    input: CompleteVaccinationDoseInput,
  ) => Promise<string>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  updateAccount: (input: {
    accountId: number;
    birthYear: number;
    country: CountryCode | null;
    name: string;
  }) => Promise<ProfileSnapshot>;
}

export const createProfileRepository = (
  database: DatabaseClient = db,
): ProfileRepository => ({
  createFamilyAccount: async ({ birthYear, country, name }) => {
    await database.transaction(async (transaction) => {
      const tx = transaction as unknown as DatabaseClient;

      await ensureDefaultProfileUsingDb(tx);
      const members = await loadProfileMembersUsingDb(tx);
      const nextSortOrder = members.reduce(
        (maxSortOrder, member) => Math.max(maxSortOrder, member.sortOrder),
        -1,
      ) + 1;

      await tx.insert(profileMember).values({
        appProfileId: APP_PROFILE_ID,
        birthYear,
        country,
        kind: 'family',
        name,
        sortOrder: nextSortOrder,
      });
    });

    return getProfileSnapshotUsingDb(database);
  },
  deleteFamilyAccount: async (accountId) => {
    await database.transaction(async (transaction) => {
      const tx = transaction as unknown as DatabaseClient;
      const member = await getProfileMemberByIdUsingDb(tx, accountId);

      if (member.kind === 'primary') {
        throw new ProfilePrimaryAccountDeletionError(accountId);
      }

      const profile = await loadProfileRowUsingDb(tx);

      await tx
        .delete(profileMember)
        .where(and(
          eq(profileMember.id, accountId),
          eq(profileMember.appProfileId, APP_PROFILE_ID),
        ));

      if (profile.selectedMemberId === accountId) {
        const membersAfterDelete = await loadProfileMembersUsingDb(tx);
        const fallbackSelectedMember = membersAfterDelete.find((current) => current.kind === 'primary')
          ?? membersAfterDelete[0];

        if (!fallbackSelectedMember) {
          throw new Error('Unable to resolve fallback account after deletion.');
        }

        await tx
          .update(appProfile)
          .set({
            selectedMemberId: fallbackSelectedMember.id,
            updatedAt: sql`now()`,
          })
          .where(eq(appProfile.id, APP_PROFILE_ID));
      }
    });

    return getProfileSnapshotUsingDb(database);
  },
  ensureDefaultProfile: async () => {
    await ensureDefaultProfileUsingDb(database);
  },
  getProfileSnapshot: async () => {
    return getProfileSnapshotUsingDb(database);
  },
  removeVaccinationRecord: async (accountId, diseaseId) => {
    const member = await getProfileMemberByIdUsingDb(database, accountId);

    await database
      .delete(vaccinationSeries)
      .where(and(
        eq(vaccinationSeries.memberId, member.id),
        eq(vaccinationSeries.diseaseId, diseaseId),
      ));
  },
  selectAccount: async (accountId) => {
    await getProfileMemberByIdUsingDb(database, accountId);

    await database
      .update(appProfile)
      .set({
        selectedMemberId: accountId,
        updatedAt: sql`now()`,
      })
      .where(eq(appProfile.id, APP_PROFILE_ID));

    return getProfileSnapshotUsingDb(database);
  },
  setVaccinationCountry: async (accountId, country) => {
    const member = await getProfileMemberByIdUsingDb(database, accountId);

    await database
      .update(profileMember)
      .set({
        country,
        updatedAt: sql`now()`,
      })
      .where(eq(profileMember.id, member.id));
  },
  submitVaccinationRecord: async (accountId, input) => {
    const member = await getProfileMemberByIdUsingDb(database, accountId);

    return database.transaction(async (transaction) => {
      const tx = transaction as unknown as DatabaseClient;

      await ensureDefaultProfileUsingDb(tx);
      const {
        id: seriesId,
        updatedAt: seriesUpdatedAt,
      } = await upsertVaccinationSeriesForRecordSubmissionUsingDb(
        tx,
        member.id,
        APP_PROFILE_ID,
        input,
      );

      const completedRows = await loadCompletedDoseRowsForSeriesUsingDb(tx, seriesId);
      const targetCompletedRow = input.completedDoseId
        ? completedRows.find((row) => row.externalId === input.completedDoseId) ?? null
        : completedRows[completedRows.length - 1] ?? null;

      if (targetCompletedRow) {
        await tx
          .update(completedDose)
          .set({
            batchNumber: input.batchNumber,
            completedAt: input.completedAt,
            kind: input.completedDoseKind,
            tradeName: input.tradeName,
          })
          .where(eq(completedDose.id, targetCompletedRow.id));
      } else {
        if (!input.completedDoseId) {
          throw new Error(`Completed dose id is required to create vaccination series "${input.diseaseId}".`);
        }

        await tx
          .insert(completedDose)
          .values({
            batchNumber: input.batchNumber,
            completedAt: input.completedAt,
            externalId: input.completedDoseId,
            kind: input.completedDoseKind,
            seriesId,
            tradeName: input.tradeName,
          });
      }

      await syncPlannedDosesForSeriesUsingDb(tx, seriesId, input.futureDueDoses);

      return toIsoDateTime(seriesUpdatedAt);
    });
  },
  completeVaccinationDose: async (accountId, input) => {
    const member = await getProfileMemberByIdUsingDb(database, accountId);

    return database.transaction(async (transaction) => {
      const tx = transaction as unknown as DatabaseClient;

      await ensureDefaultProfileUsingDb(tx);

      const existingSeries = await loadVaccinationSeriesVersionForMemberUsingDb(
        tx,
        member.id,
        input.diseaseId,
      );

      if (!existingSeries) {
        throw new OptimisticConcurrencyError(
          `Vaccination series "${input.diseaseId}" no longer exists.`,
        );
      }
      assertVaccinationSeriesVersionMatches({
        diseaseId: input.diseaseId,
        expectedUpdatedAt: input.expectedUpdatedAt,
        series: existingSeries,
      });
      const updatedSeriesUpdatedAt = await touchVaccinationSeriesUsingDb(
        tx,
        existingSeries.id,
        input.diseaseId,
      );

      await tx
        .insert(completedDose)
        .values({
          batchNumber: input.batchNumber,
          completedAt: input.completedAt,
          externalId: input.doseId,
          kind: input.kind,
          seriesId: existingSeries.id,
          tradeName: input.tradeName,
        });

      if (input.plannedDoseId) {
        await tx
          .delete(plannedDose)
          .where(and(
            eq(plannedDose.seriesId, existingSeries.id),
            eq(plannedDose.externalId, input.plannedDoseId),
          ));
      }

      return toIsoDateTime(updatedSeriesUpdatedAt);
    });
  },
  setLanguage: async (language) => {
    await ensureDefaultProfileUsingDb(database);

    await database
      .update(appProfile)
      .set({
        language,
        updatedAt: sql`now()`,
      })
      .where(eq(appProfile.id, APP_PROFILE_ID));
  },
  updateAccount: async ({ accountId, birthYear, country, name }) => {
    await getProfileMemberByIdUsingDb(database, accountId);

    await database
      .update(profileMember)
      .set({
        birthYear,
        country,
        name,
        updatedAt: sql`now()`,
      })
      .where(and(
        eq(profileMember.id, accountId),
        eq(profileMember.appProfileId, APP_PROFILE_ID),
      ));

    return getProfileSnapshotUsingDb(database);
  },
});

export { APP_PROFILE_ID };
export { toVaccinationState } from './profileRepositoryMappers.js';
export {
  OptimisticConcurrencyError,
  ProfileAccountNotFoundError,
  ProfilePrimaryAccountDeletionError,
};

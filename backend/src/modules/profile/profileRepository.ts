import {
  and,
  asc,
  eq,
  inArray,
  sql,
  type InferInsertModel,
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

import type {
  AppLanguage,
  CountryCode,
  DoseKind,
  ProfileAccountSummary,
  ProfileAccountsState,
  ProfileSnapshot,
  RepeatUnit,
  VaccinationStorageCompletedDose,
  VaccinationStoragePlannedDose,
  VaccinationStorageRecord,
  VaccinationStorageRepeatRule,
  VaccinationStorageState,
} from './profileTypes.js';

const APP_PROFILE_ID = 1;

type DatabaseClient = typeof db;

type AppProfileRow = InferSelectModel<typeof appProfile>;
type ProfileMemberRow = InferSelectModel<typeof profileMember>;
type VaccinationSeriesRow = InferSelectModel<typeof vaccinationSeries>;
type CompletedDoseRow = InferSelectModel<typeof completedDose>;
type PlannedDoseRow = InferSelectModel<typeof plannedDose>;
type PlannedDoseInsert = InferInsertModel<typeof plannedDose>;

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

export class OptimisticConcurrencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OptimisticConcurrencyError';
  }
}

export class ProfileAccountNotFoundError extends Error {
  constructor(accountId: number) {
    super(`Profile account ${accountId} is not found.`);
    this.name = 'ProfileAccountNotFoundError';
  }
}

export class ProfilePrimaryAccountDeletionError extends Error {
  constructor(accountId: number) {
    super(`Primary account ${accountId} cannot be deleted.`);
    this.name = 'ProfilePrimaryAccountDeletionError';
  }
}

const toIsoDateTime = (
  value: Date | string,
): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return new Date().toISOString();
  }

  return new Date(timestamp).toISOString();
};

const normalizeIsoDateTime = (
  value: string,
): string | null => {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return new Date(timestamp).toISOString();
};

const toIsoDate = (
  value: Date | string,
): string => {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
};

const toRepeatEvery = (
  row: VaccinationSeriesRow,
): VaccinationStorageRecord['repeatEvery'] => {
  if (
    row.repeatInterval === null
    || row.repeatKind === null
    || row.repeatUnit === null
  ) {
    return null;
  }

  return {
    interval: row.repeatInterval,
    kind: row.repeatKind as DoseKind,
    unit: row.repeatUnit as RepeatUnit,
  };
};

const toProfileAccountSummary = (
  member: ProfileMemberRow,
): ProfileAccountSummary => ({
  birthYear: member.birthYear ?? null,
  country: (member.country as CountryCode | null) ?? null,
  id: member.id,
  kind: member.kind as ProfileAccountSummary['kind'],
  name: member.name ?? null,
});

const toAccountsState = ({
  members,
  selectedMember,
}: {
  members: ProfileMemberRow[];
  selectedMember: ProfileMemberRow;
}): ProfileAccountsState => ({
  accounts: members.map(toProfileAccountSummary),
  selectedAccountId: selectedMember.id,
});

const toVaccinationState = ({
  completedRows,
  member,
  plannedRows,
  seriesRows,
}: {
  completedRows: InferSelectModel<typeof completedDose>[];
  member: Pick<ProfileMemberRow, 'country'>;
  plannedRows: InferSelectModel<typeof plannedDose>[];
  seriesRows: VaccinationSeriesRow[];
}): VaccinationStorageState => {
  const completedBySeriesId = new Map<number, VaccinationStorageCompletedDose[]>();
  const plannedBySeriesId = new Map<number, VaccinationStoragePlannedDose[]>();

  for (const row of completedRows) {
    const doses = completedBySeriesId.get(row.seriesId) ?? [];

    doses.push({
      batchNumber: row.batchNumber ?? null,
      completedAt: toIsoDate(row.completedAt),
      id: row.externalId,
      kind: row.kind as DoseKind,
      tradeName: row.tradeName ?? null,
    });
    completedBySeriesId.set(row.seriesId, doses);
  }

  for (const row of plannedRows) {
    const doses = plannedBySeriesId.get(row.seriesId) ?? [];

    doses.push({
      dueAt: toIsoDate(row.dueAt),
      id: row.externalId,
      kind: row.kind as DoseKind,
    });
    plannedBySeriesId.set(row.seriesId, doses);
  }

  return {
    country: (member.country as CountryCode | null) ?? null,
    records: seriesRows.map((series) => ({
      completedDoses: completedBySeriesId.get(series.id) ?? [],
      diseaseId: series.diseaseId,
      futureDueDoses: plannedBySeriesId.get(series.id) ?? [],
      repeatEvery: toRepeatEvery(series),
      updatedAt: toIsoDateTime(series.updatedAt),
    })),
  };
};

const loadProfileRowUsingDb = async (
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

const loadProfileMembersUsingDb = async (
  database: DatabaseClient,
): Promise<ProfileMemberRow[]> => (
  database
    .select()
    .from(profileMember)
    .where(eq(profileMember.appProfileId, APP_PROFILE_ID))
    .orderBy(asc(profileMember.sortOrder), asc(profileMember.id))
);

const ensureDefaultProfileUsingDb = async (
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

const getProfileMemberByIdUsingDb = async (
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

const getProfileSnapshotUsingDb = async (
  database: DatabaseClient,
): Promise<ProfileSnapshot> => {
  const { members, profile, selectedMember } = await getProfileContextUsingDb(database);

  return {
    accountsState: toAccountsState({ members, selectedMember }),
    language: profile.language as AppLanguage,
    vaccinationState: await loadVaccinationStateForMemberUsingDb(database, selectedMember),
  };
};

const loadCompletedDoseRowsForSeriesUsingDb = async (
  database: DatabaseClient,
  seriesId: number,
): Promise<CompletedDoseRow[]> => (
  database
    .select()
    .from(completedDose)
    .where(eq(completedDose.seriesId, seriesId))
    .orderBy(
      asc(completedDose.completedAt),
      asc(completedDose.externalId),
    )
);

const loadPlannedDoseRowsForSeriesUsingDb = async (
  database: DatabaseClient,
  seriesId: number,
): Promise<PlannedDoseRow[]> => (
  database
    .select()
    .from(plannedDose)
    .where(eq(plannedDose.seriesId, seriesId))
    .orderBy(
      asc(plannedDose.dueAt),
      asc(plannedDose.externalId),
    )
);

const syncPlannedDosesForSeriesUsingDb = async (
  database: DatabaseClient,
  seriesId: number,
  nextDoses: readonly VaccinationStoragePlannedDose[],
): Promise<void> => {
  const existingRows = await loadPlannedDoseRowsForSeriesUsingDb(database, seriesId);
  const nextDoseByExternalId = new Map(nextDoses.map((dose) => [dose.id, dose]));
  const existingRowByExternalId = new Map(existingRows.map((row) => [row.externalId, row]));
  const plannedDoseIdsToDelete = existingRows
    .filter((row) => !nextDoseByExternalId.has(row.externalId))
    .map((row) => row.id);

  if (plannedDoseIdsToDelete.length > 0) {
    await database
      .delete(plannedDose)
      .where(inArray(plannedDose.id, plannedDoseIdsToDelete));
  }

  for (const dose of nextDoses) {
    const existingRow = existingRowByExternalId.get(dose.id);

    if (!existingRow) {
      const plannedRowToInsert: PlannedDoseInsert = {
        dueAt: dose.dueAt,
        externalId: dose.id,
        kind: dose.kind,
        seriesId,
      };

      await database.insert(plannedDose).values(plannedRowToInsert);
      continue;
    }

    await database
      .update(plannedDose)
      .set({
        dueAt: dose.dueAt,
        kind: dose.kind,
      })
      .where(eq(plannedDose.id, existingRow.id));
  }
};

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

      const repeatEvery = input.repeatEvery;
      const seriesPayload = {
        repeatInterval: repeatEvery?.interval ?? null,
        repeatKind: repeatEvery?.kind ?? null,
        repeatUnit: repeatEvery?.unit ?? null,
        updatedAt: sql`now()`,
      };

      const [existingSeries] = await tx
        .select({ id: vaccinationSeries.id, updatedAt: vaccinationSeries.updatedAt })
        .from(vaccinationSeries)
        .where(and(
          eq(vaccinationSeries.memberId, member.id),
          eq(vaccinationSeries.diseaseId, input.diseaseId),
        ))
        .limit(1);

      let seriesId: number;
      let seriesUpdatedAt: Date | string;

      if (existingSeries) {
        const expectedUpdatedAt = input.expectedUpdatedAt
          ? normalizeIsoDateTime(input.expectedUpdatedAt)
          : null;
        const currentUpdatedAt = toIsoDateTime(existingSeries.updatedAt);

        if (!expectedUpdatedAt || expectedUpdatedAt !== currentUpdatedAt) {
          throw new OptimisticConcurrencyError(
            `Vaccination series "${input.diseaseId}" has been modified by another request.`,
          );
        }

        seriesId = existingSeries.id;
        const [updatedSeries] = await tx
          .update(vaccinationSeries)
          .set(seriesPayload)
          .where(eq(vaccinationSeries.id, seriesId))
          .returning({ updatedAt: vaccinationSeries.updatedAt });

        if (!updatedSeries) {
          throw new Error(`Unable to update vaccination series for ${input.diseaseId}.`);
        }

        seriesUpdatedAt = updatedSeries.updatedAt;
      } else {
        if (input.expectedUpdatedAt !== null) {
          throw new OptimisticConcurrencyError(
            `Vaccination series "${input.diseaseId}" no longer exists.`,
          );
        }

        const [createdSeries] = await tx
          .insert(vaccinationSeries)
          .values({
            diseaseId: input.diseaseId,
            memberId: member.id,
            profileId: APP_PROFILE_ID,
            ...seriesPayload,
          })
          .returning({
            id: vaccinationSeries.id,
            updatedAt: vaccinationSeries.updatedAt,
          });

        if (!createdSeries) {
          throw new Error(`Unable to create vaccination series for ${input.diseaseId}.`);
        }

        seriesId = createdSeries.id;
        seriesUpdatedAt = createdSeries.updatedAt;
      }

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

      const [existingSeries] = await tx
        .select({ id: vaccinationSeries.id, updatedAt: vaccinationSeries.updatedAt })
        .from(vaccinationSeries)
        .where(and(
          eq(vaccinationSeries.memberId, member.id),
          eq(vaccinationSeries.diseaseId, input.diseaseId),
        ))
        .limit(1);

      if (!existingSeries) {
        throw new OptimisticConcurrencyError(
          `Vaccination series "${input.diseaseId}" no longer exists.`,
        );
      }

      const expectedUpdatedAt = input.expectedUpdatedAt
        ? normalizeIsoDateTime(input.expectedUpdatedAt)
        : null;
      const currentUpdatedAt = toIsoDateTime(existingSeries.updatedAt);

      if (!expectedUpdatedAt || expectedUpdatedAt !== currentUpdatedAt) {
        throw new OptimisticConcurrencyError(
          `Vaccination series "${input.diseaseId}" has been modified by another request.`,
        );
      }

      const [updatedSeries] = await tx
        .update(vaccinationSeries)
        .set({ updatedAt: sql`now()` })
        .where(eq(vaccinationSeries.id, existingSeries.id))
        .returning({ updatedAt: vaccinationSeries.updatedAt });

      if (!updatedSeries) {
        throw new Error(`Unable to update vaccination series for ${input.diseaseId}.`);
      }

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

      return toIsoDateTime(updatedSeries.updatedAt);
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
export { toVaccinationState };

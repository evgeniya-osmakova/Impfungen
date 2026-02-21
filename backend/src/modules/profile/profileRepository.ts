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
  vaccinationSeries,
} from '../../db/schema.js';

import type {
  AppLanguage,
  CountryCode,
  DoseKind,
  ProfileSnapshot,
  RepeatUnit,
  UpsertVaccinationStorageRecordInput,
  VaccinationStorageCompletedDose,
  VaccinationStoragePlannedDose,
  VaccinationStorageRecord,
  VaccinationStorageState,
} from './profileTypes.js';

const APP_PROFILE_ID = 1;

type DatabaseClient = typeof db;

type AppProfileRow = InferSelectModel<typeof appProfile>;
type VaccinationSeriesRow = InferSelectModel<typeof vaccinationSeries>;
type CompletedDoseInsert = InferInsertModel<typeof completedDose>;
type PlannedDoseInsert = InferInsertModel<typeof plannedDose>;

export class OptimisticConcurrencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OptimisticConcurrencyError';
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

const toVaccinationState = ({
  completedRows,
  plannedRows,
  profile,
  seriesRows,
}: {
  completedRows: InferSelectModel<typeof completedDose>[];
  plannedRows: InferSelectModel<typeof plannedDose>[];
  profile: AppProfileRow;
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
    country: (profile.country as CountryCode | null) ?? null,
    records: seriesRows.map((series) => ({
      completedDoses: completedBySeriesId.get(series.id) ?? [],
      diseaseId: series.diseaseId,
      futureDueDoses: plannedBySeriesId.get(series.id) ?? [],
      repeatEvery: toRepeatEvery(series),
      updatedAt: toIsoDateTime(series.updatedAt),
    })),
  };
};

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
};

const upsertVaccinationRecordUsingDb = async (
  database: DatabaseClient,
  record: UpsertVaccinationStorageRecordInput,
): Promise<string> => {
  return database.transaction(async (transaction) => {
    const tx = transaction as unknown as DatabaseClient;

    await ensureDefaultProfileUsingDb(tx);

    const repeatEvery = record.repeatEvery;
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
        eq(vaccinationSeries.profileId, APP_PROFILE_ID),
        eq(vaccinationSeries.diseaseId, record.diseaseId),
      ))
      .limit(1);
    let seriesId: number;
    let seriesUpdatedAt: Date | string;

    if (existingSeries) {
      const expectedUpdatedAt = record.expectedUpdatedAt
        ? normalizeIsoDateTime(record.expectedUpdatedAt)
        : null;
      const currentUpdatedAt = toIsoDateTime(existingSeries.updatedAt);

      if (!expectedUpdatedAt || expectedUpdatedAt !== currentUpdatedAt) {
        throw new OptimisticConcurrencyError(
          `Vaccination series "${record.diseaseId}" has been modified by another request.`,
        );
      }

      seriesId = existingSeries.id;
      const [updatedSeries] = await tx
        .update(vaccinationSeries)
        .set(seriesPayload)
        .where(eq(vaccinationSeries.id, seriesId))
        .returning({ updatedAt: vaccinationSeries.updatedAt });

      if (!updatedSeries) {
        throw new Error(`Unable to update vaccination series for ${record.diseaseId}.`);
      }

      seriesUpdatedAt = updatedSeries.updatedAt;
    } else {
      if (record.expectedUpdatedAt !== null) {
        throw new OptimisticConcurrencyError(
          `Vaccination series "${record.diseaseId}" no longer exists.`,
        );
      }

      const [createdSeries] = await tx
        .insert(vaccinationSeries)
        .values({
          diseaseId: record.diseaseId,
          profileId: APP_PROFILE_ID,
          ...seriesPayload,
        })
        .returning({
          id: vaccinationSeries.id,
          updatedAt: vaccinationSeries.updatedAt,
        });

      if (!createdSeries) {
        throw new Error(`Unable to create vaccination series for ${record.diseaseId}.`);
      }

      seriesId = createdSeries.id;
      seriesUpdatedAt = createdSeries.updatedAt;
    }

    await tx.delete(completedDose).where(eq(completedDose.seriesId, seriesId));
    await tx.delete(plannedDose).where(eq(plannedDose.seriesId, seriesId));

    if (record.completedDoses.length > 0) {
      const completedRowsToInsert: CompletedDoseInsert[] = record.completedDoses.map((dose) => ({
        batchNumber: dose.batchNumber,
        completedAt: dose.completedAt,
        externalId: dose.id,
        kind: dose.kind,
        seriesId,
        tradeName: dose.tradeName,
      }));

      await tx.insert(completedDose).values(completedRowsToInsert);
    }

    if (record.futureDueDoses.length > 0) {
      const plannedRowsToInsert: PlannedDoseInsert[] = record.futureDueDoses.map((dose) => ({
        dueAt: dose.dueAt,
        externalId: dose.id,
        kind: dose.kind,
        seriesId,
      }));

      await tx.insert(plannedDose).values(plannedRowsToInsert);
    }

    return toIsoDateTime(seriesUpdatedAt);
  });
};

export interface ProfileRepository {
  ensureDefaultProfile: () => Promise<void>;
  getProfileSnapshot: () => Promise<ProfileSnapshot>;
  removeVaccinationRecord: (diseaseId: string) => Promise<void>;
  setVaccinationCountry: (country: CountryCode) => Promise<void>;
  upsertVaccinationRecord: (record: UpsertVaccinationStorageRecordInput) => Promise<string>;
  setLanguage: (language: AppLanguage) => Promise<void>;
}

export const createProfileRepository = (
  database: DatabaseClient = db,
): ProfileRepository => ({
  ensureDefaultProfile: async () => {
    await ensureDefaultProfileUsingDb(database);
  },
  getProfileSnapshot: async () => {
    await ensureDefaultProfileUsingDb(database);

    const [profile] = await database
      .select()
      .from(appProfile)
      .where(eq(appProfile.id, APP_PROFILE_ID))
      .limit(1);

    if (!profile) {
      throw new Error('Default application profile is missing.');
    }

    const seriesRows = await database
      .select()
      .from(vaccinationSeries)
      .where(eq(vaccinationSeries.profileId, APP_PROFILE_ID))
      .orderBy(asc(vaccinationSeries.diseaseId));
    const seriesIds = seriesRows.map((series: VaccinationSeriesRow) => series.id);

    if (seriesIds.length === 0) {
      return {
        language: profile.language as AppLanguage,
        vaccinationState: {
          country: (profile.country as CountryCode | null) ?? null,
          records: [],
        },
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

    return {
      language: profile.language as AppLanguage,
      vaccinationState: toVaccinationState({
        completedRows,
        plannedRows,
        profile,
        seriesRows,
      }),
    };
  },
  removeVaccinationRecord: async (diseaseId) => {
    await database.transaction(async (transaction) => {
      const tx = transaction as unknown as DatabaseClient;

      await ensureDefaultProfileUsingDb(tx);
      await tx
        .delete(vaccinationSeries)
        .where(and(
          eq(vaccinationSeries.profileId, APP_PROFILE_ID),
          eq(vaccinationSeries.diseaseId, diseaseId),
        ));
    });
  },
  setVaccinationCountry: async (country) => {
    await ensureDefaultProfileUsingDb(database);

    await database
      .update(appProfile)
      .set({
        country,
        updatedAt: sql`now()`,
      })
      .where(eq(appProfile.id, APP_PROFILE_ID));
  },
  upsertVaccinationRecord: async (record) => {
    return upsertVaccinationRecordUsingDb(database, record);
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
});

export { APP_PROFILE_ID };
export { toVaccinationState };

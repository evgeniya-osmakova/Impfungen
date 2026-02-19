import { asc, eq, inArray, sql, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

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

interface ExistingSeriesRow {
  diseaseId: string;
  id: number;
}

interface SeriesReconciliationPlan {
  createDiseaseIds: string[];
  deleteSeriesIds: number[];
  updateDiseaseIds: string[];
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

const toDateTime = (
  value: string,
): Date => {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return new Date();
  }

  return new Date(timestamp);
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
    isCountryConfirmed: profile.isCountryConfirmed,
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
      isCountryConfirmed: false,
      language: 'ru',
    })
    .onConflictDoNothing();
};

const toSeriesReconciliationPlan = (
  existingSeries: readonly ExistingSeriesRow[],
  nextRecords: readonly VaccinationStorageRecord[],
): SeriesReconciliationPlan => {
  const existingByDiseaseId = new Map<string, ExistingSeriesRow>();

  for (const row of existingSeries) {
    existingByDiseaseId.set(row.diseaseId, row);
  }

  const createDiseaseIds: string[] = [];
  const updateDiseaseIds: string[] = [];

  for (const record of nextRecords) {
    if (existingByDiseaseId.has(record.diseaseId)) {
      updateDiseaseIds.push(record.diseaseId);
      continue;
    }

    createDiseaseIds.push(record.diseaseId);
  }

  const nextDiseaseIds = new Set(nextRecords.map((record) => record.diseaseId));
  const deleteSeriesIds: number[] = [];

  for (const existing of existingSeries) {
    if (!nextDiseaseIds.has(existing.diseaseId)) {
      deleteSeriesIds.push(existing.id);
    }
  }

  return {
    createDiseaseIds,
    deleteSeriesIds,
    updateDiseaseIds,
  };
};

export interface ProfileRepository {
  ensureDefaultProfile: () => Promise<void>;
  getProfileSnapshot: () => Promise<ProfileSnapshot>;
  replaceVaccinationState: (state: VaccinationStorageState) => Promise<void>;
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
          isCountryConfirmed: profile.isCountryConfirmed,
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
  replaceVaccinationState: async (state) => {
    await database.transaction(async (transaction: any) => {
      await ensureDefaultProfileUsingDb(transaction as DatabaseClient);

      await transaction
        .update(appProfile)
        .set({
          country: state.country,
          isCountryConfirmed: state.isCountryConfirmed,
          updatedAt: sql`now()`,
        })
        .where(eq(appProfile.id, APP_PROFILE_ID));

      const existingSeries = await transaction
        .select({
          diseaseId: vaccinationSeries.diseaseId,
          id: vaccinationSeries.id,
        })
        .from(vaccinationSeries)
        .where(eq(vaccinationSeries.profileId, APP_PROFILE_ID));
      const seriesByDiseaseId = new Map<string, ExistingSeriesRow>();

      for (const series of existingSeries) {
        seriesByDiseaseId.set(series.diseaseId, series);
      }

      const reconciliationPlan = toSeriesReconciliationPlan(existingSeries, state.records);

      if (reconciliationPlan.deleteSeriesIds.length > 0) {
        await transaction
          .delete(vaccinationSeries)
          .where(inArray(vaccinationSeries.id, reconciliationPlan.deleteSeriesIds));
      }

      for (const record of state.records) {
        const repeatEvery = record.repeatEvery;
        const seriesPayload = {
          repeatInterval: repeatEvery?.interval ?? null,
          repeatKind: repeatEvery?.kind ?? null,
          repeatUnit: repeatEvery?.unit ?? null,
          updatedAt: toDateTime(record.updatedAt),
        };
        const existingSeriesRow = seriesByDiseaseId.get(record.diseaseId);
        let seriesId: number;

        if (existingSeriesRow) {
          seriesId = existingSeriesRow.id;
          await transaction
            .update(vaccinationSeries)
            .set(seriesPayload)
            .where(eq(vaccinationSeries.id, seriesId));
        } else {
          const [createdSeries] = await transaction
            .insert(vaccinationSeries)
            .values({
              diseaseId: record.diseaseId,
              profileId: APP_PROFILE_ID,
              ...seriesPayload,
            })
            .returning({ id: vaccinationSeries.id });

          if (!createdSeries) {
            throw new Error(`Unable to create vaccination series for ${record.diseaseId}.`);
          }

          seriesId = createdSeries.id;
        }

        await transaction.delete(completedDose).where(eq(completedDose.seriesId, seriesId));
        await transaction.delete(plannedDose).where(eq(plannedDose.seriesId, seriesId));

        if (record.completedDoses.length > 0) {
          const completedRowsToInsert: CompletedDoseInsert[] = record.completedDoses.map((dose) => ({
            batchNumber: dose.batchNumber,
            completedAt: dose.completedAt,
            externalId: dose.id,
            kind: dose.kind,
            seriesId,
            tradeName: dose.tradeName,
          }));

          await transaction.insert(completedDose).values(completedRowsToInsert);
        }

        if (record.futureDueDoses.length > 0) {
          const plannedRowsToInsert: PlannedDoseInsert[] = record.futureDueDoses.map((dose) => ({
            dueAt: dose.dueAt,
            externalId: dose.id,
            kind: dose.kind,
            seriesId,
          }));

          await transaction.insert(plannedDose).values(plannedRowsToInsert);
        }
      }
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
});

export { APP_PROFILE_ID, toSeriesReconciliationPlan };
export { toVaccinationState };
export type { ExistingSeriesRow, SeriesReconciliationPlan };

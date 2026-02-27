import {
  and,
  asc,
  eq,
  inArray,
  sql,
  type InferInsertModel,
  type InferSelectModel,
} from 'drizzle-orm';

import type { db } from '../../db/client.js';
import { completedDose, plannedDose, vaccinationSeries } from '../../db/schema.js';

import type {
  VaccinationStoragePlannedDose,
  VaccinationStorageRepeatRule,
} from './profileTypes.js';
import { normalizeIsoDateTime, toIsoDateTime } from './profileRepositoryDate.js';
import { OptimisticConcurrencyError } from './profileRepositoryErrors.js';

type DatabaseClient = typeof db;

type VaccinationSeriesRow = InferSelectModel<typeof vaccinationSeries>;
type CompletedDoseRow = InferSelectModel<typeof completedDose>;
type PlannedDoseRow = InferSelectModel<typeof plannedDose>;
type PlannedDoseInsert = InferInsertModel<typeof plannedDose>;

export type VaccinationSeriesVersionRow = Pick<VaccinationSeriesRow, 'id' | 'updatedAt'>;

export interface SubmitVaccinationSeriesUpsertInput {
  diseaseId: string;
  expectedUpdatedAt: string | null;
  repeatEvery: VaccinationStorageRepeatRule | null;
}

export const loadCompletedDoseRowsForSeriesUsingDb = async (
  database: DatabaseClient,
  seriesId: number,
): Promise<CompletedDoseRow[]> =>
  database
    .select()
    .from(completedDose)
    .where(eq(completedDose.seriesId, seriesId))
    .orderBy(asc(completedDose.completedAt), asc(completedDose.externalId));

const loadPlannedDoseRowsForSeriesUsingDb = async (
  database: DatabaseClient,
  seriesId: number,
): Promise<PlannedDoseRow[]> =>
  database
    .select()
    .from(plannedDose)
    .where(eq(plannedDose.seriesId, seriesId))
    .orderBy(asc(plannedDose.dueAt), asc(plannedDose.externalId));

export const syncPlannedDosesForSeriesUsingDb = async (
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
    await database.delete(plannedDose).where(inArray(plannedDose.id, plannedDoseIdsToDelete));
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

export const loadVaccinationSeriesVersionForMemberUsingDb = async (
  database: DatabaseClient,
  memberId: number,
  diseaseId: string,
): Promise<VaccinationSeriesVersionRow | null> => {
  const [series] = await database
    .select({ id: vaccinationSeries.id, updatedAt: vaccinationSeries.updatedAt })
    .from(vaccinationSeries)
    .where(
      and(eq(vaccinationSeries.memberId, memberId), eq(vaccinationSeries.diseaseId, diseaseId)),
    )
    .limit(1);

  return series ?? null;
};

export const assertVaccinationSeriesVersionMatches = ({
  diseaseId,
  expectedUpdatedAt,
  series,
}: {
  diseaseId: string;
  expectedUpdatedAt: string | null;
  series: VaccinationSeriesVersionRow;
}): void => {
  const normalizedExpectedUpdatedAt = expectedUpdatedAt
    ? normalizeIsoDateTime(expectedUpdatedAt)
    : null;
  const currentUpdatedAt = toIsoDateTime(series.updatedAt);

  if (!normalizedExpectedUpdatedAt || normalizedExpectedUpdatedAt !== currentUpdatedAt) {
    throw new OptimisticConcurrencyError(
      `Vaccination series "${diseaseId}" has been modified by another request.`,
    );
  }
};

export const touchVaccinationSeriesUsingDb = async (
  database: DatabaseClient,
  seriesId: number,
  diseaseId: string,
): Promise<VaccinationSeriesVersionRow['updatedAt']> => {
  const [updatedSeries] = await database
    .update(vaccinationSeries)
    .set({ updatedAt: sql`now()` })
    .where(eq(vaccinationSeries.id, seriesId))
    .returning({ updatedAt: vaccinationSeries.updatedAt });

  if (!updatedSeries) {
    throw new Error(`Unable to update vaccination series for ${diseaseId}.`);
  }

  return updatedSeries.updatedAt;
};

const updateVaccinationSeriesRepeatRuleUsingDb = async (
  database: DatabaseClient,
  seriesId: number,
  diseaseId: string,
  repeatEvery: VaccinationStorageRepeatRule | null,
): Promise<VaccinationSeriesVersionRow['updatedAt']> => {
  const [updatedSeries] = await database
    .update(vaccinationSeries)
    .set({
      repeatInterval: repeatEvery?.interval ?? null,
      repeatKind: repeatEvery?.kind ?? null,
      repeatUnit: repeatEvery?.unit ?? null,
      updatedAt: sql`now()`,
    })
    .where(eq(vaccinationSeries.id, seriesId))
    .returning({ updatedAt: vaccinationSeries.updatedAt });

  if (!updatedSeries) {
    throw new Error(`Unable to update vaccination series for ${diseaseId}.`);
  }

  return updatedSeries.updatedAt;
};

const createVaccinationSeriesForMemberUsingDb = async (
  database: DatabaseClient,
  memberId: number,
  profileId: number,
  diseaseId: string,
  repeatEvery: VaccinationStorageRepeatRule | null,
): Promise<VaccinationSeriesVersionRow> => {
  const [createdSeries] = await database
    .insert(vaccinationSeries)
    .values({
      diseaseId,
      memberId,
      profileId,
      repeatInterval: repeatEvery?.interval ?? null,
      repeatKind: repeatEvery?.kind ?? null,
      repeatUnit: repeatEvery?.unit ?? null,
      updatedAt: sql`now()`,
    })
    .returning({
      id: vaccinationSeries.id,
      updatedAt: vaccinationSeries.updatedAt,
    });

  if (!createdSeries) {
    throw new Error(`Unable to create vaccination series for ${diseaseId}.`);
  }

  return createdSeries;
};

export const upsertVaccinationSeriesForRecordSubmissionUsingDb = async (
  database: DatabaseClient,
  memberId: number,
  profileId: number,
  input: SubmitVaccinationSeriesUpsertInput,
): Promise<VaccinationSeriesVersionRow> => {
  const existingSeries = await loadVaccinationSeriesVersionForMemberUsingDb(
    database,
    memberId,
    input.diseaseId,
  );

  if (!existingSeries) {
    if (input.expectedUpdatedAt !== null) {
      throw new OptimisticConcurrencyError(
        `Vaccination series "${input.diseaseId}" no longer exists.`,
      );
    }

    return createVaccinationSeriesForMemberUsingDb(
      database,
      memberId,
      profileId,
      input.diseaseId,
      input.repeatEvery,
    );
  }

  assertVaccinationSeriesVersionMatches({
    diseaseId: input.diseaseId,
    expectedUpdatedAt: input.expectedUpdatedAt,
    series: existingSeries,
  });

  const updatedAt = await updateVaccinationSeriesRepeatRuleUsingDb(
    database,
    existingSeries.id,
    input.diseaseId,
    input.repeatEvery,
  );

  return {
    id: existingSeries.id,
    updatedAt,
  };
};

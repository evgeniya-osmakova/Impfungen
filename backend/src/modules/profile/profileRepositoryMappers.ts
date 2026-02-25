import type { InferSelectModel } from 'drizzle-orm';

import {
  completedDose,
  plannedDose,
  profileMember,
  vaccinationSeries,
} from '../../db/schema.js';

import type {
  CountryCode,
  DoseKind,
  ProfileAccountSummary,
  ProfileAccountsState,
  RepeatUnit,
  VaccinationStorageCompletedDose,
  VaccinationStoragePlannedDose,
  VaccinationStorageRecord,
  VaccinationStorageState,
} from './profileTypes.js';
import { toIsoDate, toIsoDateTime } from './profileRepositoryDate.js';

type ProfileMemberRow = InferSelectModel<typeof profileMember>;
type VaccinationSeriesRow = InferSelectModel<typeof vaccinationSeries>;
type CompletedDoseRow = InferSelectModel<typeof completedDose>;
type PlannedDoseRow = InferSelectModel<typeof plannedDose>;

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

export const toAccountsState = ({
  members,
  selectedMember,
}: {
  members: ProfileMemberRow[];
  selectedMember: ProfileMemberRow;
}): ProfileAccountsState => ({
  accounts: members.map(toProfileAccountSummary),
  selectedAccountId: selectedMember.id,
});

export const toVaccinationState = ({
  completedRows,
  member,
  plannedRows,
  seriesRows,
}: {
  completedRows: CompletedDoseRow[];
  member: Pick<ProfileMemberRow, 'country'>;
  plannedRows: PlannedDoseRow[];
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

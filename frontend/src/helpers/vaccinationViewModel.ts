import {
  resolveLatestCompletedDose,
  resolveRemainingFutureDueDoses,
  sortCompletedDoses,
} from 'src/helpers/recordHelpers.ts';
import type { ImmunizationSeriesView } from 'src/interfaces/immunizationRecord.ts';
import type { VaccinationRecordCardView } from 'src/interfaces/vaccinationViewData.ts';

export const toVaccinationRecordCardViews = (
  records: readonly ImmunizationSeriesView[],
): VaccinationRecordCardView[] =>
  records.map((record) => ({
    completedDoseHistory: sortCompletedDoses(record.completedDoses).reverse(),
    ...record,
    latestCompletedDose: resolveLatestCompletedDose(record.completedDoses),
    remainingFutureDueDoses: resolveRemainingFutureDueDoses(record.futureDueDoses, record.nextDue),
  }));

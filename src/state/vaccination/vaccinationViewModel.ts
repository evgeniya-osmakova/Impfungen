import type { VaccinationRecordCardView } from './vaccinationViewData';
import {
  resolveLatestCompletedDose,
  resolveRemainingFutureDueDoses,
  sortCompletedDoses,
} from '../../domain/vaccination/recordHelpers';
import type { Disease } from '../../interfaces/disease';
import type { ImmunizationSeriesView } from '../../interfaces/immunizationRecord';

export const toVaccinationRecordCardViews = (
  records: readonly ImmunizationSeriesView[],
): VaccinationRecordCardView[] =>
  records.map((record) => ({
    completedDoseHistory: sortCompletedDoses(record.completedDoses).reverse(),
    ...record,
    latestCompletedDose: resolveLatestCompletedDose(record.completedDoses),
    remainingFutureDueDoses: resolveRemainingFutureDueDoses(record.futureDueDoses, record.nextDue),
  }));

export const sortDiseasesByLabel = (
  diseases: readonly Disease[],
  resolveDiseaseLabel: (disease: Disease) => string,
): Disease[] =>
  [...diseases].sort((leftDisease, rightDisease) =>
    resolveDiseaseLabel(leftDisease).localeCompare(resolveDiseaseLabel(rightDisease)));

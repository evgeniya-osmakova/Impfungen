import type { Category } from '../../interfaces/base';
import type { Disease } from '../../interfaces/disease';
import type { CompletedDose, PlannedDose } from '../../interfaces/dose';
import type {
  ImmunizationSeries,
  ImmunizationSeriesView,
} from '../../interfaces/immunizationRecord';

export interface VaccinationRecordCardView extends ImmunizationSeriesView {
  completedDoseHistory: CompletedDose[];
  latestCompletedDose: CompletedDose | null;
  remainingFutureDueDoses: PlannedDose[];
}

export interface VaccinationStoreViewData {
  availableDiseases: Disease[];
  categoryCounts: Record<Category, number>;
  diseasesForForm: Disease[];
  recordForEdit: ImmunizationSeries | null;
  recordsDueInNextYear: ImmunizationSeriesView[];
  recordsForView: VaccinationRecordCardView[];
  recordsWithNextDate: number;
}

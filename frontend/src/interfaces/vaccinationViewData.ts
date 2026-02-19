import type { Category } from 'src/interfaces/base.ts';
import type { Disease } from 'src/interfaces/disease.ts';
import type { CompletedDose, PlannedDose } from 'src/interfaces/dose.ts';
import type {
  ImmunizationSeries,
  ImmunizationSeriesView,
} from 'src/interfaces/immunizationRecord.ts';

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

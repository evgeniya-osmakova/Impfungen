import type { CategoryFilter, CountryCode } from 'src/interfaces/base.ts'
import type { ImmunizationSeries } from 'src/interfaces/immunizationRecord.ts'

export interface VaccinationState {
  country: CountryCode | null;
  records: ImmunizationSeries[];
}

export interface VaccinationUiState {
  categoryFilter: CategoryFilter;
  editingDiseaseId: string | null;
  searchQuery: string;
}

export interface VaccinationStoreState extends VaccinationState, VaccinationUiState {}

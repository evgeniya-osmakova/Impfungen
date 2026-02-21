import type { VaccinationStorageState } from '@backend/contracts';
import type { CategoryFilter } from 'src/interfaces/base.ts'

export type VaccinationState = VaccinationStorageState;

export interface VaccinationUiState {
  categoryFilter: CategoryFilter;
  editingDiseaseId: string | null;
  searchQuery: string;
}

export interface VaccinationStoreState extends VaccinationState, VaccinationUiState {}

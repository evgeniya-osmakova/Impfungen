import type { CategoryFilter } from './base';

export interface VaccinationPageUiState {
  categoryFilter: CategoryFilter;
  editingDiseaseId: string | null;
  searchQuery: string;
}

export interface VaccinationPageUiActions {
  cancelEdit: () => void;
  setCategoryFilter: (categoryFilter: CategoryFilter) => void;
  setSearchQuery: (searchQuery: string) => void;
  startEditRecord: (diseaseId: string) => void;
}

export type VaccinationPageUi = VaccinationPageUiState & VaccinationPageUiActions;

import type { CategoryFilter } from '../../interfaces/base';

export interface VaccinationUiState {
  categoryFilter: CategoryFilter;
  editingDiseaseId: string | null;
  searchQuery: string;
}

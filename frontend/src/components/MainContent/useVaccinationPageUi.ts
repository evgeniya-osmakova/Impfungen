import { useState } from 'react';
import {
  VACCINATION_DEFAULT_CATEGORY_FILTER,
  VACCINATION_DEFAULT_SEARCH_QUERY,
} from 'src/constants/vaccination';
import type { VaccinationPageUi } from 'src/interfaces/vaccinationPageUi';

export const useVaccinationPageUi = (): VaccinationPageUi => {
  const [categoryFilter, setCategoryFilter] = useState(VACCINATION_DEFAULT_CATEGORY_FILTER);
  const [editingDiseaseId, setEditingDiseaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(VACCINATION_DEFAULT_SEARCH_QUERY);

  return {
    cancelEdit: () => {
      setEditingDiseaseId(null);
    },
    categoryFilter,
    editingDiseaseId,
    searchQuery,
    setCategoryFilter,
    setSearchQuery,
    startEditRecord: (diseaseId) => {
      setEditingDiseaseId(diseaseId);
    },
  };
};

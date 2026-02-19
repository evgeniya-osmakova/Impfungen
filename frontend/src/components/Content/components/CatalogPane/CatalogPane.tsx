import { useMemo } from 'react';
import { sortDiseasesByLabel } from 'src/helpers/vaccinationListAdapter.ts';
import { useLanguageStore } from 'src/state/language'
import { useShallow } from 'zustand/react/shallow';

import { useDiseaseLabels } from '../../../../hooks/useDiseaseLabels';
import { useInternalHomeUiStore } from '../../../../state/internalHomeUi';
import { useVaccinationStore } from '../../../../state/vaccination';
import { selectVaccinationViewData } from '../../../../state/vaccination/selectors';
import { filterDiseases } from '../../../../utils/vaccinationSelectors';

import { VaccinationCatalog } from './components/VaccinationCatalog/VaccinationCatalog';

import styles from './CatalogPane.module.css';

export const CatalogPane = () => {
  const { language } = useLanguageStore();
  const { resolveDiseaseLabel } = useDiseaseLabels();
  const {
    cancelEdit,
    categoryFilter,
    country,
    editingDiseaseId,
    records,
    searchQuery,
    setCategoryFilter,
    setSearchQuery,
  } = useVaccinationStore(
    useShallow((state) => ({
      cancelEdit: state.cancelEdit,
      categoryFilter: state.categoryFilter,
      country: state.country,
      editingDiseaseId: state.editingDiseaseId,
      records: state.records,
      searchQuery: state.searchQuery,
      setCategoryFilter: state.setCategoryFilter,
      setSearchQuery: state.setSearchQuery,
    })),
  );
  const openFormModalWithPrefilledDisease = useInternalHomeUiStore(
    (state) => state.openFormModalWithPrefilledDisease,
  );

  const { availableDiseases, categoryCounts } = selectVaccinationViewData({
    country,
    editingDiseaseId,
    records,
  });
  const catalogDiseases = useMemo(() => {
    if (!country) {
      return [];
    }

    const filteredDiseases = filterDiseases(availableDiseases, {
      categoryFilter,
      country,
      language,
      query: searchQuery,
      resolveDiseaseLabel,
    });

    return sortDiseasesByLabel(filteredDiseases, resolveDiseaseLabel);
  }, [
    availableDiseases,
    categoryFilter,
    country,
    language,
    resolveDiseaseLabel,
    searchQuery,
  ]);

  if (!country) {
    return null;
  }

  const handleSelectDiseaseFromCatalog = (diseaseId: string) => {
    cancelEdit();
    openFormModalWithPrefilledDisease(diseaseId);
  };

  return (
    <div className={styles.catalogPane}>
      <VaccinationCatalog
        categoryCounts={categoryCounts}
        categoryFilter={categoryFilter}
        country={country}
        diseases={catalogDiseases}
        onChangeCategoryFilter={setCategoryFilter}
        onChangeSearchQuery={setSearchQuery}
        onSelectDiseaseFromCatalog={handleSelectDiseaseFromCatalog}
        resolveDiseaseLabel={resolveDiseaseLabel}
        searchQuery={searchQuery}
      />
    </div>
  );
};

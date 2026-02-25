import { useMemo } from 'react';
import { sortDiseasesByLabel } from 'src/helpers/vaccinationListAdapter.ts';
import type { MainPageUi } from 'src/interfaces/mainPageUi.ts';
import type { VaccinationPageUi } from 'src/interfaces/vaccinationPageUi.ts';
import { useLanguageStore } from 'src/state/language'
import { useShallow } from 'zustand/react/shallow';

import { useDiseaseLabels } from '../../../../hooks/useDiseaseLabels';
import { useVaccinationStore } from '../../../../state/vaccination';
import { selectCatalogViewData } from '../../../../state/vaccination/selectors';
import { filterDiseases } from '../../../../utils/vaccinationSelectors';

import { VaccinationCatalog } from './components/VaccinationCatalog/VaccinationCatalog';

import styles from './CatalogPane.module.css';

interface CatalogPaneProps {
  ui: Pick<
    MainPageUi,
    'openFormModalWithPrefilledDisease'
  > & Pick<
    VaccinationPageUi,
    'cancelEdit' | 'categoryFilter' | 'editingDiseaseId' | 'searchQuery' | 'setCategoryFilter' | 'setSearchQuery'
  >;
}

export const CatalogPane = ({ ui }: CatalogPaneProps) => {
  const { language } = useLanguageStore();
  const { resolveDiseaseLabel } = useDiseaseLabels();
  const { country, records } = useVaccinationStore(
    useShallow((state) => ({
      country: state.country,
      records: state.records,
    })),
  );
  const { availableDiseases, categoryCounts } = selectCatalogViewData({
    country,
    editingDiseaseId: ui.editingDiseaseId,
    records,
  });
  const {
    cancelEdit,
    categoryFilter,
    searchQuery,
    setCategoryFilter,
    setSearchQuery,
    openFormModalWithPrefilledDisease,
  } = ui;

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

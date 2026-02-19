import { useTranslation } from 'react-i18next';

import { resolveAppLanguage } from '../../i18n/resources';
import type { VaccinationDisease } from '../../interfaces/vaccination';
import { useInternalHomeUiStore } from '../../store/internalHomeUiStore';
import { useVaccinationStore } from '../../store/vaccinationStore';
import { selectVaccinationViewData } from '../../store/vaccinationStoreSelectors';
import { filterDiseases } from '../../utils/vaccinationSelectors';

import { useDiseaseLabels } from './useDiseaseLabels';
import { VaccinationCatalog } from './VaccinationCatalog';

import styles from './Content.module.css';

const sortDiseasesByLabel = (
  diseases: readonly VaccinationDisease[],
  resolveDiseaseLabel: (disease: VaccinationDisease) => string,
): VaccinationDisease[] =>
  [...diseases].sort((leftDisease, rightDisease) =>
    resolveDiseaseLabel(leftDisease).localeCompare(resolveDiseaseLabel(rightDisease)),
  );

export const CatalogPane = () => {
  const { i18n } = useTranslation();
  const language = resolveAppLanguage(i18n.resolvedLanguage);
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
  } = useVaccinationStore();
  const { openFormModalWithPrefilledDisease } = useInternalHomeUiStore();

  const { availableDiseases, categoryCounts } = selectVaccinationViewData({
    country,
    editingDiseaseId,
    records,
  });
  const availableDiseasesSorted = sortDiseasesByLabel(availableDiseases, resolveDiseaseLabel);

  const catalogDiseases = !country
    ? []
    : sortDiseasesByLabel(
        filterDiseases(availableDiseasesSorted, {
          categoryFilter,
          country,
          language,
          query: searchQuery,
          resolveDiseaseLabel,
        }),
        resolveDiseaseLabel,
      );

  if (!country) {
    return null;
  }

  const handleSelectDiseaseFromCatalog = (diseaseId: string) => {
    cancelEdit();
    openFormModalWithPrefilledDisease(diseaseId);
  };

  return (
    <div className={styles.internalHomeContent__catalogPane}>
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

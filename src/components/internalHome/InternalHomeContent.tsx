import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE } from '../../constants/internalHomeText';
import { resolveAppLanguage } from '../../i18n/resources';
import type {
  VaccinationCountryCode,
  VaccinationDisease,
  VaccinationRecordInput,
} from '../../interfaces/vaccination';
import { useVaccinationStore } from '../../store/vaccinationStore';
import {
  getVaccinationDiseaseById,
  selectVaccinationViewData,
} from '../../store/vaccinationStoreSelectors';
import { filterDiseases } from '../../utils/vaccinationSelectors';

import { CountrySwitcher } from './CountrySwitcher';
import { VaccinationCatalog } from './VaccinationCatalog';
import { VaccinationForm } from './VaccinationForm';
import { VaccinationRecords } from './VaccinationRecords';
import { VaccinationSummary } from './VaccinationSummary';

import styles from './InternalHomeContent.module.css';

const sortDiseasesByLabel = (
  diseases: readonly VaccinationDisease[],
  resolveDiseaseLabel: (disease: VaccinationDisease) => string,
): VaccinationDisease[] =>
  [...diseases].sort((leftDisease, rightDisease) =>
    resolveDiseaseLabel(leftDisease).localeCompare(resolveDiseaseLabel(rightDisease)),
  );

export const InternalHomeContent = () => {
  const { i18n, t } = useTranslation();
  const language = resolveAppLanguage(i18n.resolvedLanguage);
  const [formErrorKey, setFormErrorKey] = useState<string | null>(null);
  const [prefilledDiseaseId, setPrefilledDiseaseId] = useState<string | null>(null);
  const diseaseFieldRef = useRef<HTMLSelectElement | null>(null);
  const formSectionRef = useRef<HTMLElement | null>(null);
  const {
    categoryFilter,
    cancelEdit,
    country,
    editingDiseaseId,
    records,
    removeRecord,
    searchQuery,
    setCategoryFilter,
    setCountry,
    setSearchQuery,
    startEditRecord,
    submitRecord,
  } = useVaccinationStore();

  if (!country) {
    return null;
  }

  const resolveDiseaseLabel = (disease: VaccinationDisease) => t(disease.labelKey);
  const {
    availableDiseases,
    categoryCounts,
    diseasesForForm,
    recordForEdit,
    recordsForView,
    recordsWithNextDate,
  } = selectVaccinationViewData({
    country,
    editingDiseaseId,
    records,
  });
  const availableDiseasesSorted = sortDiseasesByLabel(availableDiseases, resolveDiseaseLabel);
  const diseasesForFormSorted = sortDiseasesByLabel(diseasesForForm, resolveDiseaseLabel);
  const catalogDiseases = sortDiseasesByLabel(
    filterDiseases(availableDiseasesSorted, {
      categoryFilter,
      country,
      language,
      query: searchQuery,
      resolveDiseaseLabel,
    }),
    resolveDiseaseLabel,
  );

  const resolveDiseaseLabelById = (diseaseId: string): string => {
    const disease = getVaccinationDiseaseById(diseaseId);

    if (!disease) {
      return diseaseId;
    }

    return resolveDiseaseLabel(disease);
  };

  const handleSubmitRecord = (recordInput: VaccinationRecordInput) => {
    const errorCode = submitRecord(recordInput);

    if (errorCode) {
      setFormErrorKey(INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE[errorCode]);

      return;
    }

    setFormErrorKey(null);
  };

  const handleChangeCountry = (nextCountry: VaccinationCountryCode) => {
    setCountry(nextCountry);
    setFormErrorKey(null);
    setPrefilledDiseaseId(null);
  };

  const handleEditRecord = (diseaseId: string) => {
    startEditRecord(diseaseId);
    setFormErrorKey(null);
  };

  const handleCancelEdit = () => {
    cancelEdit();
    setFormErrorKey(null);
  };

  const scrollToDiseaseField = () => {
    const formSection = formSectionRef.current;

    if (!formSection) {
      return;
    }

    formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

    diseaseFieldRef.current?.focus({ preventScroll: true });
  };

  const handleSelectDiseaseFromCatalog = (diseaseId: string) => {
    cancelEdit();
    setPrefilledDiseaseId(diseaseId);
    setFormErrorKey(null);
    scrollToDiseaseField();
  };

  return (
    <div className={styles.internalHomeContent}>
      <CountrySwitcher country={country} onChangeCountry={handleChangeCountry} />
      <VaccinationSummary
        country={country}
        recordsTotal={records.length}
        withNextDate={recordsWithNextDate}
      />
      <div className={styles.internalHomeContent__grid}>
        <VaccinationForm
          diseases={diseasesForFormSorted}
          diseaseFieldRef={diseaseFieldRef}
          errorKey={formErrorKey}
          formSectionRef={formSectionRef}
          onCancelEdit={handleCancelEdit}
          onSubmitRecord={handleSubmitRecord}
          prefilledDiseaseId={prefilledDiseaseId}
          recordForEdit={recordForEdit}
          resolveDiseaseLabel={resolveDiseaseLabel}
        />
        <VaccinationRecords
          language={language}
          onDeleteRecord={removeRecord}
          onEditRecord={handleEditRecord}
          records={recordsForView}
          resolveDiseaseLabelById={resolveDiseaseLabelById}
        />
      </div>
      <VaccinationCatalog
        categoryCounts={categoryCounts}
        categoryFilter={categoryFilter}
        country={country}
        diseases={catalogDiseases}
        onSelectDiseaseFromCatalog={handleSelectDiseaseFromCatalog}
        onChangeCategoryFilter={setCategoryFilter}
        onChangeSearchQuery={setSearchQuery}
        resolveDiseaseLabel={resolveDiseaseLabel}
        searchQuery={searchQuery}
      />
    </div>
  );
};

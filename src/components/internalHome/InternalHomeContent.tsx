import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE } from '../../constants/internalHomeText';
import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from '../../constants/ui';
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
import { Button, Modal } from '../../ui';
import { filterDiseases } from '../../utils/vaccinationSelectors';

import { CountrySwitcher } from './CountrySwitcher';
import { VaccinationCatalog } from './VaccinationCatalog';
import { VaccinationForm } from './VaccinationForm';
import { VaccinationRecords } from './VaccinationRecords';
import { VaccinationSummary } from './VaccinationSummary';
import { VaccinationUpcoming } from './VaccinationUpcoming';

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
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [prefilledDiseaseId, setPrefilledDiseaseId] = useState<string | null>(null);
  const diseaseFieldRef = useRef<HTMLSelectElement | null>(null);
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

  useEffect(() => {
    if (!isFormModalOpen) {
      return;
    }

    diseaseFieldRef.current?.focus({ preventScroll: true });
  }, [isFormModalOpen]);

  if (!country) {
    return null;
  }

  const resolveDiseaseLabel = (disease: VaccinationDisease) => t(disease.labelKey);
  const {
    availableDiseases,
    categoryCounts,
    diseasesForForm,
    recordForEdit,
    recordsDueInNextYear,
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
    setPrefilledDiseaseId(null);
    setIsFormModalOpen(false);
  };

  const handleChangeCountry = (nextCountry: VaccinationCountryCode) => {
    setCountry(nextCountry);
    setFormErrorKey(null);
    setPrefilledDiseaseId(null);
    setIsFormModalOpen(false);
  };

  const handleOpenFormModal = () => {
    cancelEdit();
    setFormErrorKey(null);
    setPrefilledDiseaseId(null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    cancelEdit();
    setFormErrorKey(null);
    setPrefilledDiseaseId(null);
    setIsFormModalOpen(false);
  };

  const handleEditRecord = (diseaseId: string) => {
    startEditRecord(diseaseId);
    setFormErrorKey(null);
    setPrefilledDiseaseId(null);
    setIsFormModalOpen(true);
  };

  const handleSelectDiseaseFromCatalog = (diseaseId: string) => {
    cancelEdit();
    setPrefilledDiseaseId(diseaseId);
    setFormErrorKey(null);
    setIsFormModalOpen(true);
  };

  return (
    <div className={styles.internalHomeContent}>
      <div className={styles.internalHomeContent__topRow}>
        <CountrySwitcher country={country} onChangeCountry={handleChangeCountry} />
        <VaccinationSummary
          country={country}
          recordsTotal={records.length}
          withNextDate={recordsWithNextDate}
        />
      </div>
      <VaccinationUpcoming
        language={language}
        records={recordsDueInNextYear}
        resolveDiseaseLabelById={resolveDiseaseLabelById}
      />
      <div className={styles.internalHomeContent__workspace}>
        <div className={styles.internalHomeContent__workspaceToolbar}>
          <Button
            className={styles.internalHomeContent__openFormButton}
            onClick={handleOpenFormModal}
            type={HTML_BUTTON_TYPE.button}
            variant={BUTTON_VARIANT.primary}
          >
            {t('internal.form.actions.openModal')}
          </Button>
        </div>
        <div className={styles.internalHomeContent__recordsPane}>
          <VaccinationRecords
            language={language}
            onDeleteRecord={removeRecord}
            onEditRecord={handleEditRecord}
            records={recordsForView}
            resolveDiseaseLabelById={resolveDiseaseLabelById}
          />
        </div>
      </div>
      <Modal
        ariaLabel={t('internal.form.modal.title')}
        closeAriaLabel={t('internal.form.actions.closeModal')}
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
      >
        <VaccinationForm
          diseases={diseasesForFormSorted}
          diseaseFieldRef={diseaseFieldRef}
          errorKey={formErrorKey}
          isInModal
          onCancelEdit={handleCloseFormModal}
          onSubmitRecord={handleSubmitRecord}
          prefilledDiseaseId={prefilledDiseaseId}
          recordForEdit={recordForEdit}
          resolveDiseaseLabel={resolveDiseaseLabel}
        />
      </Modal>
      <div className={styles.internalHomeContent__catalogPane}>
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
    </div>
  );
};

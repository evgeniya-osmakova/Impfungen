import { useEffect, useRef } from 'react';

import { INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE } from '../../constants/internalHomeText';
import type { VaccinationDisease } from '../../interfaces/vaccination';
import { useInternalHomeUiStore } from '../../store/internalHomeUiStore';
import { useVaccinationStore } from '../../store/vaccinationStore';
import { selectVaccinationViewData } from '../../store/vaccinationStoreSelectors';
import { Modal } from '../../ui';

import { useDiseaseLabels } from './useDiseaseLabels';
import { VaccinationCompleteDoseForm } from './VaccinationCompleteDoseForm';
import { VaccinationForm } from './VaccinationForm';

const sortDiseasesByLabel = (
  diseases: readonly VaccinationDisease[],
  resolveDiseaseLabel: (disease: VaccinationDisease) => string,
): VaccinationDisease[] =>
  [...diseases].sort((leftDisease, rightDisease) =>
    resolveDiseaseLabel(leftDisease).localeCompare(resolveDiseaseLabel(rightDisease)),
  );

export const Modals = () => {
  const {
    completeDoseDraft,
    completeDoseErrorKey,
    formErrorKey,
    isCompleteDoseModalOpen,
    isFormModalOpen,
    prefilledDiseaseId,
    closeCompleteDoseModal,
    closeFormModal,
    setCompleteDoseErrorKey,
    setFormErrorKey,
  } = useInternalHomeUiStore();
  const {
    cancelEdit,
    country,
    editingDiseaseId,
    records,
    submitCompletedDose,
    submitRecord,
  } = useVaccinationStore();
  const diseaseFieldRef = useRef<HTMLSelectElement | null>(null);
  const { resolveDiseaseLabel, t } = useDiseaseLabels();

  useEffect(() => {
    if (!isFormModalOpen) {
      return;
    }

    diseaseFieldRef.current?.focus({ preventScroll: true });
  }, [isFormModalOpen]);

  const { diseasesForForm, recordForEdit } = selectVaccinationViewData({
    country,
    editingDiseaseId,
    records,
  });
  const diseasesForFormSorted = sortDiseasesByLabel(diseasesForForm, resolveDiseaseLabel);

  const handleSubmitRecord = (recordInput: Parameters<typeof submitRecord>[0]) => {
    const errorCode = submitRecord(recordInput);

    if (errorCode) {
      setFormErrorKey(INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE[errorCode]);

      return;
    }

    closeFormModal();
  };

  const handleSubmitCompletedDose = (doseInput: Parameters<typeof submitCompletedDose>[0]) => {
    const errorCode = submitCompletedDose(doseInput);

    if (errorCode) {
      setCompleteDoseErrorKey(INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE[errorCode]);

      return;
    }

    closeCompleteDoseModal();
  };

  const handleCloseFormModal = () => {
    cancelEdit();
    closeFormModal();
  };

  return (
    <>
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
      <Modal
        ariaLabel={t('internal.form.modal.completeDoseTitle')}
        closeAriaLabel={t('internal.form.actions.closeModal')}
        isOpen={isCompleteDoseModalOpen}
        onClose={closeCompleteDoseModal}
      >
        {completeDoseDraft && (
          <VaccinationCompleteDoseForm
            diseaseId={completeDoseDraft.diseaseId}
            errorKey={completeDoseErrorKey}
            initialValues={completeDoseDraft.initialValues}
            isInModal
            isMarkPlannedFlow={completeDoseDraft.isMarkPlannedFlow}
            onCancel={closeCompleteDoseModal}
            onSubmit={handleSubmitCompletedDose}
          />
        )}
      </Modal>
    </>
  );
};

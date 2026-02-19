import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { sortDiseasesByLabel } from 'src/helpers/vaccinationListAdapter.ts';
import { useShallow } from 'zustand/react/shallow';

import { INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE } from '../../../../constants/internalHomeText';
import { useDiseaseLabels } from '../../../../hooks/useDiseaseLabels';
import type {
  ImmunizationDoseInput,
  ImmunizationSeriesInput,
} from '../../../../interfaces/immunizationRecord';
import { useInternalHomeUiStore } from '../../../../state/internalHomeUi';
import { useVaccinationStore } from '../../../../state/vaccination';
import { selectVaccinationViewData } from '../../../../state/vaccination/selectors';
import { Modal } from '../../../../ui';

import { VaccinationCompleteDoseForm } from './components/VaccinationCompleteDoseForm/VaccinationCompleteDoseForm';
import { VaccinationForm } from './components/VaccinationForm/VaccinationForm';

export const Modals = () => {
  const { t } = useTranslation();
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
  } = useInternalHomeUiStore(
    useShallow((state) => ({
      completeDoseDraft: state.completeDoseDraft,
      completeDoseErrorKey: state.completeDoseErrorKey,
      formErrorKey: state.formErrorKey,
      isCompleteDoseModalOpen: state.isCompleteDoseModalOpen,
      isFormModalOpen: state.isFormModalOpen,
      prefilledDiseaseId: state.prefilledDiseaseId,
      closeCompleteDoseModal: state.closeCompleteDoseModal,
      closeFormModal: state.closeFormModal,
      setCompleteDoseErrorKey: state.setCompleteDoseErrorKey,
      setFormErrorKey: state.setFormErrorKey,
    })),
  );
  const {
    cancelEdit,
    country,
    editingDiseaseId,
    records,
    submitCompletedDose,
    submitRecord,
  } = useVaccinationStore(
    useShallow((state) => ({
      cancelEdit: state.cancelEdit,
      country: state.country,
      editingDiseaseId: state.editingDiseaseId,
      records: state.records,
      submitCompletedDose: state.submitCompletedDose,
      submitRecord: state.submitRecord,
    })),
  );
  const { resolveDiseaseLabel } = useDiseaseLabels();
  const diseaseFieldRef = useRef<HTMLSelectElement | null>(null);

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

  const handleSubmitRecord = async (recordInput: ImmunizationSeriesInput) => {
    const errorCode = await submitRecord(recordInput);

    if (errorCode) {
      setFormErrorKey(INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE[errorCode]);

      return;
    }

    closeFormModal();
  };

  const handleSubmitCompletedDose = async (doseInput: ImmunizationDoseInput) => {
    const errorCode = await submitCompletedDose(doseInput);

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

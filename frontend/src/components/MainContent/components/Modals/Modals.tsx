import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE } from 'src/constants/internalHomeText';
import { sortDiseasesByLabel } from 'src/helpers/vaccinationListAdapter.ts';
import { useDiseaseLabels } from 'src/hooks/useDiseaseLabels';
import type {
  ImmunizationDoseInput,
  ImmunizationSeriesInput,
} from 'src/interfaces/immunizationRecord';
import type { MainPageUi } from 'src/interfaces/mainPageUi.ts';
import type { VaccinationPageUi } from 'src/interfaces/vaccinationPageUi.ts';
import { useVaccinationStore } from 'src/state/vaccination';
import { useVaccinationCommands } from 'src/state/vaccination/commands';
import { selectModalsViewData } from 'src/state/vaccination/selectors';
import { Modal } from 'src/ui';
import { useShallow } from 'zustand/react/shallow';

import { VaccinationCompleteDoseForm } from './components/VaccinationCompleteDoseForm/VaccinationCompleteDoseForm';
import { VaccinationForm } from './components/VaccinationForm/VaccinationForm';

interface ModalsProps {
  ui: Pick<
    MainPageUi,
    | 'closeCompleteDoseModal'
    | 'closeFormModal'
    | 'completeDoseDraft'
    | 'completeDoseErrorKey'
    | 'formErrorKey'
    | 'isCompleteDoseModalOpen'
    | 'isFormModalOpen'
    | 'prefilledDiseaseId'
    | 'setCompleteDoseErrorKey'
    | 'setFormErrorKey'
  >;
  vaccinationUi: Pick<VaccinationPageUi, 'cancelEdit' | 'editingDiseaseId'>;
}

export const Modals = ({ ui, vaccinationUi }: ModalsProps) => {
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
  } = ui;
  const { country, records } = useVaccinationStore(
    useShallow((state) => ({
      country: state.country,
      records: state.records,
    })),
  );
  const { diseasesForForm, recordForEdit } = selectModalsViewData({
    country,
    editingDiseaseId: vaccinationUi.editingDiseaseId,
    records,
  });
  const { cancelEdit } = vaccinationUi;
  const { submitCompletedDose, submitRecord } = useVaccinationCommands();
  const { resolveDiseaseLabel } = useDiseaseLabels();
  const diseaseFieldRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    if (!isFormModalOpen) {
      return;
    }

    diseaseFieldRef.current?.focus({ preventScroll: true });
  }, [isFormModalOpen]);

  const diseasesForFormSorted = sortDiseasesByLabel(diseasesForForm, resolveDiseaseLabel);

  const handleSubmitRecord = async (recordInput: ImmunizationSeriesInput) => {
    const errorCode = await submitRecord(recordInput);

    if (errorCode) {
      setFormErrorKey(INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE[errorCode]);

      return;
    }

    cancelEdit();
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

import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from '../../../../constants/ui';
import { useDiseaseLabels } from '../../../../hooks/useDiseaseLabels';
import { useDoseModalActions } from '../../../../hooks/useDoseModalActions';
import { resolveAppLanguage } from '../../../../i18n/resources';
import { useInternalHomeUiStore } from '../../../../state/internalHomeUi';
import { useVaccinationStore } from '../../../../state/vaccination';
import { selectVaccinationViewData } from '../../../../state/vaccination/selectors';
import { Button } from '../../../../ui';

import { VaccinationRecords } from './components/VaccinationRecords/VaccinationRecords';

import styles from './Workspace.module.css';

export const Workspace = () => {
  const { i18n, t } = useTranslation();
  const language = resolveAppLanguage(i18n.resolvedLanguage);
  const { resolveDiseaseLabelById } = useDiseaseLabels();
  const {
    cancelEdit,
    country,
    editingDiseaseId,
    records,
    removeRecord,
    startEditRecord,
  } = useVaccinationStore(
    useShallow((state) => ({
      cancelEdit: state.cancelEdit,
      country: state.country,
      editingDiseaseId: state.editingDiseaseId,
      records: state.records,
      removeRecord: state.removeRecord,
      startEditRecord: state.startEditRecord,
    })),
  );
  const openFormModal = useInternalHomeUiStore((state) => state.openFormModal);
  const { openAddDoseModal, openMarkPlannedDoneModal } = useDoseModalActions();

  const { recordsForView } = selectVaccinationViewData({ country, editingDiseaseId, records });

  if (!country) {
    return null;
  }

  const handleOpenFormModal = () => {
    cancelEdit();
    openFormModal();
  };

  const handleEditRecord = (diseaseId: string) => {
    startEditRecord(diseaseId);
    openFormModal();
  };

  return (
    <div className={styles.workspace}>
      <div className={styles.workspace__toolbar}>
        <Button
          className={styles.workspace__openFormButton}
          onClick={handleOpenFormModal}
          type={HTML_BUTTON_TYPE.button}
          variant={BUTTON_VARIANT.primary}
        >
          {t('internal.form.actions.openModal')}
        </Button>
      </div>
      <div className={styles.workspace__recordsPane}>
        <VaccinationRecords
          language={language}
          onAddDose={openAddDoseModal}
          onDeleteRecord={removeRecord}
          onEditRecord={handleEditRecord}
          onMarkPlannedDone={openMarkPlannedDoneModal}
          records={recordsForView}
          resolveDiseaseLabelById={resolveDiseaseLabelById}
        />
      </div>
    </div>
  );
};

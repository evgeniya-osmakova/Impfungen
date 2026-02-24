import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from '../../../../constants/ui';
import { useDiseaseLabels } from '../../../../hooks/useDiseaseLabels';
import { useDoseModalActions } from '../../../../hooks/useDoseModalActions';
import { useMainPageUiStore } from 'src/state/mainPageUi';
import { useVaccinationStore } from '../../../../state/vaccination';
import { selectWorkspaceViewData } from '../../../../state/vaccination/selectors';
import { Button } from '../../../../ui';

import { VaccinationRecords } from './components/VaccinationRecords/VaccinationRecords';

import styles from './Workspace.module.css';

export const Workspace = () => {
  const { t } = useTranslation();
  const { resolveDiseaseLabelById } = useDiseaseLabels();
  const { country, recordsForView } = useVaccinationStore(
    useShallow(selectWorkspaceViewData),
  );
  const {
    cancelEdit,
    removeRecord,
    startEditRecord,
  } = useVaccinationStore(
    useShallow((state) => ({
      cancelEdit: state.cancelEdit,
      removeRecord: state.removeRecord,
      startEditRecord: state.startEditRecord,
    })),
  );
  const openFormModal = useMainPageUiStore((state) => state.openFormModal);
  const { openAddDoseModal, openMarkPlannedDoneModal } = useDoseModalActions();

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

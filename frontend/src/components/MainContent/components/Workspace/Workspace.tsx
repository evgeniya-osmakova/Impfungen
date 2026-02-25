import { useTranslation } from 'react-i18next';
import { useMainPageUiStore } from 'src/state/mainPageUi';
import { useShallow } from 'zustand/react/shallow';

import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from '../../../../constants/ui';
import { useDiseaseLabels } from '../../../../hooks/useDiseaseLabels';
import { useDoseModalActions } from '../../../../hooks/useDoseModalActions';
import { useVaccinationStore } from '../../../../state/vaccination';
import { selectWorkspaceViewData } from '../../../../state/vaccination/selectors';
import { Button, Error } from '../../../../ui';

import { VaccinationRecords } from './components/VaccinationRecords/VaccinationRecords';
import { useWorkspaceExportController } from './useWorkspaceExportController';

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
  const {
    exportError,
    handleExportCsv,
    handleExportPdf,
    hasCompletedDoses,
    isExporting,
  } = useWorkspaceExportController({
    recordsForView,
    resolveDiseaseLabelById,
  });

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
        <div className={styles.workspace__exportActions}>
          <Button
            className={styles.workspace__exportButton}
            disabled={!hasCompletedDoses || isExporting}
            onClick={handleExportCsv}
            type={HTML_BUTTON_TYPE.button}
            variant={BUTTON_VARIANT.secondary}
          >
            {t('internal.records.export.actions.csv')}
          </Button>
          <Button
            className={styles.workspace__exportButton}
            disabled={!hasCompletedDoses || isExporting}
            onClick={handleExportPdf}
            type={HTML_BUTTON_TYPE.button}
            variant={BUTTON_VARIANT.secondary}
          >
            {isExporting
              ? t('internal.records.export.actions.pdfLoading')
              : t('internal.records.export.actions.pdf')}
          </Button>
        </div>
      </div>
      <Error className={styles.workspace__exportError} message={exportError} />
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

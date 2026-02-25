import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DownloadIcon from 'src/assets/icons/download.svg';
import UploadIcon from 'src/assets/icons/upload.svg';
import type { MainPageUi } from 'src/interfaces/mainPageUi.ts';
import type { VaccinationPageUi } from 'src/interfaces/vaccinationPageUi.ts';
import { useShallow } from 'zustand/react/shallow';

import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from '../../../../constants/ui';
import { useDiseaseLabels } from '../../../../hooks/useDiseaseLabels';
import { useDoseModalActions } from '../../../../hooks/useDoseModalActions';
import { useVaccinationCommands } from '../../../../state/vaccination/commands';
import { useVaccinationStore } from '../../../../state/vaccination';
import { selectWorkspaceViewData } from '../../../../state/vaccination/selectors';
import { Button, Error, Input } from '../../../../ui';

import { WorkspaceImportReport } from './components/WorkspaceImportReport/WorkspaceImportReport';
import { VaccinationRecords } from './components/VaccinationRecords/VaccinationRecords';
import { useWorkspaceCsvImportController } from './useWorkspaceCsvImportController';
import { useWorkspaceExportController } from './useWorkspaceExportController';

import styles from './Workspace.module.css';

interface WorkspaceProps {
  ui: Pick<MainPageUi, 'openCompleteDoseModal' | 'openFormModal'>;
  vaccinationUi: Pick<VaccinationPageUi, 'cancelEdit' | 'editingDiseaseId' | 'startEditRecord'>;
}

export const Workspace = ({ ui, vaccinationUi }: WorkspaceProps) => {
  const { t } = useTranslation();
  const [isImportReportModalOpen, setIsImportReportModalOpen] = useState(false);
  const { resolveDiseaseLabelById } = useDiseaseLabels();
  const { country, records } = useVaccinationStore(
    useShallow((state) => ({
      country: state.country,
      records: state.records,
    })),
  );
  const { recordsForView } = selectWorkspaceViewData({
    country,
    editingDiseaseId: vaccinationUi.editingDiseaseId,
    records,
  });
  const { openFormModal, openCompleteDoseModal } = ui;
  const { cancelEdit, startEditRecord } = vaccinationUi;
  const { removeRecord } = useVaccinationCommands();
  const { openAddDoseModal, openMarkPlannedDoneModal } = useDoseModalActions({
    openCompleteDoseModal,
  });
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
  const {
    fileInputRef,
    handleImportFileChange,
    handleOpenImportDialog,
    importFatalError,
    importReport,
    isImporting,
  } = useWorkspaceCsvImportController();
  const isTransferBusy = isExporting || isImporting;

  useEffect(() => {
    if (!importReport) {
      return;
    }

    setIsImportReportModalOpen(true);
  }, [importReport]);

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

  const handleDeleteRecord = async (diseaseId: string) => {
    if (vaccinationUi.editingDiseaseId === diseaseId) {
      cancelEdit();
    }

    return removeRecord(diseaseId);
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
          <Input
            accept=".csv,text/csv"
            aria-label={t('internal.records.import.inputLabel')}
            className={styles.workspace__visuallyHiddenFileInput}
            onChange={handleImportFileChange}
            ref={fileInputRef}
            type="file"
          />
          <Button
            className={`${styles.workspace__exportButton} ${styles.workspace__importButton}`}
            disabled={isTransferBusy}
            onClick={handleOpenImportDialog}
            type={HTML_BUTTON_TYPE.button}
            variant={BUTTON_VARIANT.secondary}
          >
            <UploadIcon aria-hidden="true" className={styles.workspace__actionIcon} />
            {isImporting
              ? t('internal.records.import.actions.csvLoading')
              : t('internal.records.import.actions.csv')}
          </Button>
          <div className={styles.workspace__exportCluster}>
            <Button
              className={`${styles.workspace__exportButton} ${styles.workspace__exportClusterButton}`}
              disabled={!hasCompletedDoses || isTransferBusy}
              onClick={handleExportCsv}
              type={HTML_BUTTON_TYPE.button}
              variant={BUTTON_VARIANT.secondary}
            >
              <DownloadIcon aria-hidden="true" className={styles.workspace__actionIcon} />
              {t('internal.records.export.actions.csv')}
            </Button>
            <Button
              className={`${styles.workspace__exportButton} ${styles.workspace__exportClusterButton}`}
              disabled={!hasCompletedDoses || isTransferBusy}
              onClick={handleExportPdf}
              type={HTML_BUTTON_TYPE.button}
              variant={BUTTON_VARIANT.secondary}
            >
              <DownloadIcon aria-hidden="true" className={styles.workspace__actionIcon} />
              {isExporting
                ? t('internal.records.export.actions.pdfLoading')
                : t('internal.records.export.actions.pdf')}
            </Button>
          </div>
        </div>
      </div>
      <Error className={styles.workspace__exportError} message={exportError} />
      <Error className={styles.workspace__exportError} message={importFatalError} />
      {importReport && (
        <WorkspaceImportReport
          isOpen={isImportReportModalOpen}
          onClose={() => setIsImportReportModalOpen(false)}
          report={importReport}
        />
      )}
      <div className={styles.workspace__recordsPane}>
        <VaccinationRecords
          onAddDose={openAddDoseModal}
          onDeleteRecord={handleDeleteRecord}
          onEditRecord={handleEditRecord}
          onMarkPlannedDone={openMarkPlannedDoneModal}
          records={recordsForView}
          resolveDiseaseLabelById={resolveDiseaseLabelById}
        />
      </div>
    </div>
  );
};

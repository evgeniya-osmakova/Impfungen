import { useTranslation } from 'react-i18next';
import type { VaccinationCompletedImportReport, VaccinationCompletedImportRowError } from 'src/interfaces/vaccinationImport.ts';
import { Modal } from 'src/ui';

import styles from './WorkspaceImportReport.module.css';

interface WorkspaceImportReportProps {
  isOpen: boolean;
  onClose: () => void;
  report: VaccinationCompletedImportReport;
}

export const WorkspaceImportReport = ({
  isOpen,
  onClose,
  report,
}: WorkspaceImportReportProps) => {
  const { t } = useTranslation();

  const renderImportRowError = (
    rowError: VaccinationCompletedImportRowError,
    index: number,
  ) => {
    const reason = t(rowError.messageKey, rowError.messageValues);

    return (
      <li key={`${rowError.rowNumber}-${rowError.code}-${index}`}>
        {t('internal.records.import.report.rowError.line', {
          message: reason,
          rowNumber: rowError.rowNumber,
        })}
      </li>
    );
  };

  return (
    <Modal
      ariaLabel={t('internal.records.import.report.summary')}
      closeAriaLabel={t('internal.form.actions.closeModal')}
      isOpen={isOpen}
      onClose={onClose}
    >
      <section className={styles.workspaceImportReport} role="status">
        <p className={styles.workspaceImportReportTitle}>
          {t('internal.records.import.report.summary')}
        </p>
        {report.totalDataRows === 0 ? (
          <p className={styles.workspaceImportReportEmpty}>
            {t('internal.records.import.report.noRows')}
          </p>
        ) : (
          <>
            <ul className={styles.workspaceImportReportCounts}>
              <li>{t('internal.records.import.report.counts.totalRows', { count: report.totalDataRows })}</li>
              <li>{t('internal.records.import.report.counts.importedRows', { count: report.importedRows })}</li>
              <li>{t('internal.records.import.report.counts.duplicateRows', { count: report.duplicateRows })}</li>
              <li>{t('internal.records.import.report.counts.invalidRows', { count: report.invalidRows })}</li>
            </ul>
            {report.errors.length > 0 && (
              <ul className={styles.workspaceImportReportErrors}>
                {report.errors.map(renderImportRowError)}
              </ul>
            )}
          </>
        )}
      </section>
    </Modal>
  );
};

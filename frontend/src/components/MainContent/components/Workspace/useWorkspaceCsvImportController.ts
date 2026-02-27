import { type ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parseVaccinationCompletedImportCsv } from 'src/helpers/vaccinationImportCsv.ts';
import type { VaccinationCompletedImportReport } from 'src/interfaces/vaccinationImport.ts';
import { useVaccinationStore } from 'src/state/vaccination';
import { importCompletedVaccinations } from 'src/state/vaccination/importCompletedVaccinations.ts';

const mergeImportReports = ({
  parsedRowErrors,
  parsedTotalDataRows,
  persistedReport,
}: {
  parsedRowErrors: VaccinationCompletedImportReport['errors'];
  parsedTotalDataRows: number;
  persistedReport: VaccinationCompletedImportReport;
}): VaccinationCompletedImportReport => ({
  duplicateRows: persistedReport.duplicateRows,
  errors: [...parsedRowErrors, ...persistedReport.errors].sort(
    (leftError, rightError) => leftError.rowNumber - rightError.rowNumber,
  ),
  importedRows: persistedReport.importedRows,
  invalidRows: parsedRowErrors.length + persistedReport.invalidRows,
  totalDataRows: parsedTotalDataRows,
});

const readFileAsText = async (file: File): Promise<string> => {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(reader.error ?? new Error('Unable to read file.'));
    };
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsText(file);
  });
};

export const useWorkspaceCsvImportController = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importFatalError, setImportFatalError] = useState<string | null>(null);
  const [importReport, setImportReport] = useState<VaccinationCompletedImportReport | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleOpenImportDialog = () => {
    if (isImporting) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    setImportFatalError(null);
    setImportReport(null);
    setIsImporting(true);

    try {
      const { activeAccountId, country } = useVaccinationStore.getState();

      if (activeAccountId === null || country === null) {
        setImportFatalError(t('internal.records.import.error.targetUnavailable'));

        return;
      }

      let fileText = '';

      try {
        fileText = await readFileAsText(file);
      } catch (error) {
        console.error('Failed to read CSV file for import.', error);
        setImportFatalError(t('internal.records.import.error.readFailed'));

        return;
      }

      const parsedCsv = parseVaccinationCompletedImportCsv(fileText);

      if (parsedCsv.fileError) {
        setImportFatalError(t(parsedCsv.fileError.messageKey));

        return;
      }

      const persistedReport = await importCompletedVaccinations({
        rows: parsedCsv.rows,
      });

      setImportReport(
        mergeImportReports({
          parsedRowErrors: parsedCsv.rowErrors,
          parsedTotalDataRows: parsedCsv.totalDataRows,
          persistedReport,
        }),
      );
    } catch (error) {
      console.error('Failed to import completed vaccinations from CSV.', error);
      setImportFatalError(t('internal.records.import.error.processFailed'));
    } finally {
      input.value = '';
      setIsImporting(false);
    }
  };

  return {
    fileInputRef,
    handleImportFileChange,
    handleOpenImportDialog,
    importFatalError,
    importReport,
    isImporting,
  };
};

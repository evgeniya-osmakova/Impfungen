import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { downloadVaccinationCompletedCsv } from 'src/helpers/vaccinationExportCsv.ts';
import { exportVaccinationCompletedPdf } from 'src/helpers/vaccinationExportPdf.ts';
import { resolveVaccinationCompletedExportPayload } from 'src/helpers/vaccinationExportPayload.ts';
import type { VaccinationRecordCardView } from 'src/interfaces/vaccinationViewData.ts';
import { resolveSelectedAccount, useAccountsStore } from 'src/state/accounts';
import { useLanguageStore } from 'src/state/language';
import { getTodayIsoDate } from 'src/utils/date.ts';
import { useShallow } from 'zustand/react/shallow';

interface UseWorkspaceExportControllerParams {
  recordsForView: readonly VaccinationRecordCardView[];
  resolveDiseaseLabelById: (diseaseId: string) => string;
}

export const useWorkspaceExportController = ({
  recordsForView,
  resolveDiseaseLabelById,
}: UseWorkspaceExportControllerParams) => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const language = useLanguageStore((state) => state.language);
  const { accounts, selectedAccountId } = useAccountsStore(
    useShallow((state) => ({
      accounts: state.accounts,
      selectedAccountId: state.selectedAccountId,
    })),
  );

  const selectedAccount = resolveSelectedAccount(accounts, selectedAccountId);
  const hasCompletedDoses = recordsForView.some((record) => record.completedDoseHistory.length > 0);
  const exportColumnLabels = {
    batchNumber: t('internal.records.export.columns.batchNumber'),
    completedAt: t('internal.records.export.columns.completedAt'),
    disease: t('internal.records.export.columns.disease'),
    doseKind: t('internal.records.export.columns.doseKind'),
    tradeName: t('internal.records.export.columns.tradeName'),
  };
  const exportPdfLabels = {
    exportedAtLabel: t('internal.records.export.pdf.exportedAtLabel'),
    profileLabel: t('internal.records.export.pdf.profileLabel'),
    recordsCountLabel: t('internal.records.export.pdf.recordsCountLabel'),
    title: t('internal.records.export.pdf.title'),
  };

  const resolveExportPayload = () =>
    resolveVaccinationCompletedExportPayload({
      exportDate: getTodayIsoDate(),
      records: recordsForView,
      resolveDiseaseLabelById,
      resolveDoseKindLabel: (kind) => t(`internal.doseKind.${kind}`),
      selectedAccountName: selectedAccount?.name ?? null,
      unnamedProfileLabel: t('internal.records.export.unnamedProfile'),
    });

  const handleExportCsv = () => {
    if (!hasCompletedDoses || isExporting) {
      return;
    }

    setExportError(null);

    try {
      const payload = resolveExportPayload();

      if (!payload) {
        return;
      }

      downloadVaccinationCompletedCsv({
        columnLabels: exportColumnLabels,
        filename: `${payload.fileBaseName}.csv`,
        rows: payload.rows,
      });
    } catch (error) {
      console.error('Failed to export completed vaccinations as CSV.', error);
      setExportError(t('internal.records.export.error'));
    }
  };

  const handleExportPdf = async () => {
    if (!hasCompletedDoses || isExporting) {
      return;
    }

    setExportError(null);
    setIsExporting(true);

    try {
      const payload = resolveExportPayload();

      if (!payload) {
        return;
      }

      await exportVaccinationCompletedPdf({
        columnLabels: exportColumnLabels,
        filename: `${payload.fileBaseName}.pdf`,
        groups: payload.pdfGroups,
        meta: {
          exportedAt: new Date(),
          language,
          profileName: payload.profileName,
        },
        pdfLabels: exportPdfLabels,
      });
    } catch (error) {
      console.error('Failed to export completed vaccinations as PDF.', error);
      setExportError(t('internal.records.export.error'));
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportError,
    handleExportCsv,
    handleExportPdf,
    hasCompletedDoses,
    isExporting,
  };
};


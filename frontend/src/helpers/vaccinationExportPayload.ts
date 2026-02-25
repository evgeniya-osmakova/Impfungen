import type { DoseKind } from 'src/interfaces/base.ts';
import type {
  VaccinationCompletedExportGroup,
  VaccinationCompletedExportRow,
} from 'src/interfaces/vaccinationExport.ts';
import type { VaccinationRecordCardView } from 'src/interfaces/vaccinationViewData.ts';
import { normalizeOptionalText } from 'src/utils/string.ts';

import {
  buildVaccinationCompletedExportFileBaseName,
  buildVaccinationCompletedExportGroups,
  buildVaccinationCompletedExportRows,
} from './vaccinationExportRows';

interface ResolveVaccinationCompletedExportPayloadParams {
  exportDate: string;
  records: readonly VaccinationRecordCardView[];
  resolveDiseaseLabelById: (diseaseId: string) => string;
  resolveDoseKindLabel: (kind: DoseKind) => string;
  selectedAccountName: string | null;
  unnamedProfileLabel: string;
}

interface VaccinationCompletedExportPayload {
  fileBaseName: string;
  pdfGroups: VaccinationCompletedExportGroup[];
  profileName: string;
  rows: VaccinationCompletedExportRow[];
}

export const resolveVaccinationCompletedExportPayload = ({
  exportDate,
  records,
  resolveDiseaseLabelById,
  resolveDoseKindLabel,
  selectedAccountName,
  unnamedProfileLabel,
}: ResolveVaccinationCompletedExportPayloadParams): VaccinationCompletedExportPayload | null => {
  const rows = buildVaccinationCompletedExportRows({
    records,
    resolveDiseaseLabelById,
    resolveDoseKindLabel,
  });

  if (rows.length === 0) {
    return null;
  }

  const pdfGroups = buildVaccinationCompletedExportGroups({
    records,
    resolveDiseaseLabelById,
    resolveDoseKindLabel,
  });
  const profileName = normalizeOptionalText(selectedAccountName) ?? unnamedProfileLabel;
  const fileBaseName = buildVaccinationCompletedExportFileBaseName({
    exportDate,
    profileName,
  });

  return {
    fileBaseName,
    pdfGroups,
    profileName,
    rows,
  };
};


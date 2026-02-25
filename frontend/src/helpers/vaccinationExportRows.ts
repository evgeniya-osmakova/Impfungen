import type { DoseKind } from 'src/interfaces/base.ts';
import type { VaccinationRecordCardView } from 'src/interfaces/vaccinationViewData.ts';
import type {
  VaccinationCompletedExportDoseRow,
  VaccinationCompletedExportGroup,
  VaccinationCompletedExportRow,
} from 'src/interfaces/vaccinationExport.ts';
import { parseIsoDateToUtc, toIsoPart } from 'src/utils/date.ts';

interface BuildVaccinationCompletedExportRowsParams {
  records: readonly VaccinationRecordCardView[];
  resolveDiseaseLabelById: (diseaseId: string) => string;
  resolveDoseKindLabel: (kind: DoseKind) => string;
}

interface BuildVaccinationCompletedExportFileBaseNameParams {
  exportDate: string;
  profileName: string;
}

const FILE_NAME_SAFE_CHARS_PATTERN = /[^\p{L}\p{N}._-]+/gu;
const FILE_NAME_TRIM_UNDERSCORES_PATTERN = /^_+|_+$/g;

export const formatVaccinationExportDate = (value: string): string => {
  const parsedDate = parseIsoDateToUtc(value);

  if (!parsedDate) {
    return value;
  }

  const day = toIsoPart(parsedDate.getUTCDate());
  const month = toIsoPart(parsedDate.getUTCMonth() + 1);
  const year = parsedDate.getUTCFullYear();

  return `${day}.${month}.${year}`;
};

const compareRowsByDiseaseThenDateDesc = (
  leftRow: Pick<VaccinationCompletedExportRow, 'completedAt' | 'diseaseLabel' | 'doseKindLabel'>,
  rightRow: Pick<VaccinationCompletedExportRow, 'completedAt' | 'diseaseLabel' | 'doseKindLabel'>,
): number => {
  const byDiseaseLabel = leftRow.diseaseLabel.localeCompare(rightRow.diseaseLabel);

  if (byDiseaseLabel !== 0) {
    return byDiseaseLabel;
  }

  const byCompletedDate = rightRow.completedAt.localeCompare(leftRow.completedAt);

  if (byCompletedDate !== 0) {
    return byCompletedDate;
  }

  return leftRow.doseKindLabel.localeCompare(rightRow.doseKindLabel);
};

const compareDoseRowsByDateAsc = (
  leftRow: Pick<VaccinationCompletedExportDoseRow, 'completedAt' | 'doseKindLabel'>,
  rightRow: Pick<VaccinationCompletedExportDoseRow, 'completedAt' | 'doseKindLabel'>,
): number => {
  const byCompletedDate = leftRow.completedAt.localeCompare(rightRow.completedAt);

  if (byCompletedDate !== 0) {
    return byCompletedDate;
  }

  return leftRow.doseKindLabel.localeCompare(rightRow.doseKindLabel);
};

export const buildVaccinationCompletedExportRows = ({
  records,
  resolveDiseaseLabelById,
  resolveDoseKindLabel,
}: BuildVaccinationCompletedExportRowsParams): VaccinationCompletedExportRow[] => {
  const rows = records.flatMap((record) => {
    const diseaseLabel = resolveDiseaseLabelById(record.diseaseId);

    return record.completedDoseHistory.map((dose) => ({
      batchNumber: dose.batchNumber,
      completedAt: dose.completedAt,
      diseaseLabel,
      formattedCompletedAt: formatVaccinationExportDate(dose.completedAt),
      doseKind: dose.kind,
      doseKindLabel: resolveDoseKindLabel(dose.kind),
      tradeName: dose.tradeName,
    }));
  });

  return rows.sort(compareRowsByDiseaseThenDateDesc);
};

export const buildVaccinationCompletedExportGroups = ({
  records,
  resolveDiseaseLabelById,
  resolveDoseKindLabel,
}: BuildVaccinationCompletedExportRowsParams): VaccinationCompletedExportGroup[] => {
  const groupedDoseRowsByDiseaseLabel = new Map<string, VaccinationCompletedExportDoseRow[]>();

  for (const record of records) {
    const diseaseLabel = resolveDiseaseLabelById(record.diseaseId);
    const existingRows = groupedDoseRowsByDiseaseLabel.get(diseaseLabel) ?? [];

    for (const dose of record.completedDoseHistory) {
      existingRows.push({
        batchNumber: dose.batchNumber,
        completedAt: dose.completedAt,
        formattedCompletedAt: formatVaccinationExportDate(dose.completedAt),
        doseKind: dose.kind,
        doseKindLabel: resolveDoseKindLabel(dose.kind),
        tradeName: dose.tradeName,
      });
    }

    groupedDoseRowsByDiseaseLabel.set(diseaseLabel, existingRows);
  }

  return [...groupedDoseRowsByDiseaseLabel.entries()]
    .sort(([leftDiseaseLabel], [rightDiseaseLabel]) => leftDiseaseLabel.localeCompare(rightDiseaseLabel))
    .map(([diseaseLabel, doses]) => ({
      diseaseLabel,
      doses: [...doses].sort(compareDoseRowsByDateAsc),
    }));
};

export const sanitizeFileNameSegment = (value: string): string => {
  const sanitized = value
    .trim()
    .replace(FILE_NAME_SAFE_CHARS_PATTERN, '_')
    .replace(FILE_NAME_TRIM_UNDERSCORES_PATTERN, '');

  return sanitized || 'profile';
};

export const buildVaccinationCompletedExportFileBaseName = ({
  exportDate,
  profileName,
}: BuildVaccinationCompletedExportFileBaseNameParams): string =>
  `vaccinations-completed-${sanitizeFileNameSegment(profileName)}-${exportDate}`;

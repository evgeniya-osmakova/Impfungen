import type {
  VaccinationCompletedExportColumnLabels,
  VaccinationCompletedExportRow,
} from 'src/interfaces/vaccinationExport.ts';
import { downloadBlob } from 'src/utils/downloadBlob.ts';

const CSV_BOM = '\uFEFF';
const CSV_DELIMITER = ';';
const CSV_LINE_BREAK = '\r\n';
const EXCEL_SEPARATOR_HINT = 'sep=;';
const FORMULA_PREFIX_PATTERN = /^[=+\-@]/;

interface CreateVaccinationCompletedCsvParams {
  columnLabels: VaccinationCompletedExportColumnLabels;
  rows: readonly VaccinationCompletedExportRow[];
}

interface DownloadVaccinationCompletedCsvParams extends CreateVaccinationCompletedCsvParams {
  filename: string;
}

const sanitizeCsvCellValue = (value: string): string =>
  FORMULA_PREFIX_PATTERN.test(value) ? `'${value}` : value;

const toCsvCell = (value: string | null): string => {
  const sanitizedValue = sanitizeCsvCellValue(value ?? '');
  const escapedValue = sanitizedValue.replaceAll('"', '""');

  return `"${escapedValue}"`;
};

const toCsvLine = (values: Array<string | null>): string =>
  values.map((value) => toCsvCell(value)).join(CSV_DELIMITER);

export const createVaccinationCompletedCsv = ({
  columnLabels,
  rows,
}: CreateVaccinationCompletedCsvParams): string => {
  const lines = [
    EXCEL_SEPARATOR_HINT,
    toCsvLine([
      columnLabels.completedAt,
      columnLabels.disease,
      columnLabels.doseKind,
      columnLabels.tradeName,
      columnLabels.batchNumber,
    ]),
    ...rows.map((row) => toCsvLine([
      row.formattedCompletedAt,
      row.diseaseLabel,
      row.doseKindLabel,
      row.tradeName,
      row.batchNumber,
    ])),
  ];

  return `${CSV_BOM}${lines.join(CSV_LINE_BREAK)}`;
};

export const downloadVaccinationCompletedCsv = ({
  columnLabels,
  filename,
  rows,
}: DownloadVaccinationCompletedCsvParams): void => {
  const csvContent = createVaccinationCompletedCsv({ columnLabels, rows });

  downloadBlob({
    blob: new Blob([csvContent], { type: 'text/csv;charset=utf-8' }),
    filename,
  });
};

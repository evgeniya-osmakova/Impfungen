import { VACCINATION_DISEASE_CATALOG } from 'src/constants/vaccinationCatalog.ts';
import { resources } from 'src/i18n/resources.ts';
import type {
  VaccinationCompletedImportParseResult,
  VaccinationCompletedImportRow,
  VaccinationCompletedImportRowError,
} from 'src/interfaces/vaccinationImport.ts';
import { parseIsoDateToUtc } from 'src/utils/date.ts';
import { normalizeOptionalText } from 'src/utils/string.ts';

import { DOSE_KIND_VALUES, type DoseKind } from '../interfaces/base';

const CSV_DELIMITER = ';';
const CSV_BOM = '\uFEFF';
const EXCEL_SEPARATOR_HINT = 'sep=;';
const CSV_FORMULA_PREFIX_PATTERN = /^'([=+\-@].*)$/;
const EXPORT_DATE_PATTERN = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const HEADER_COLUMN_KEYS = [
  'completedAt',
  'disease',
  'doseKind',
  'tradeName',
  'batchNumber',
] as const;

interface ParsedCsvRow {
  cells: string[];
  rowNumber: number;
}

type LocaleTranslation = (typeof resources)[keyof typeof resources]['translation'];

interface CsvParseResult {
  fileError: VaccinationCompletedImportParseResult['fileError'];
  rows: ParsedCsvRow[];
}

const normalizeLookupKey = (value: string): string =>
  value.trim().replace(/\s+/g, ' ').toLowerCase();

const normalizeCsvCellValue = (value: string): string => {
  const match = value.match(CSV_FORMULA_PREFIX_PATTERN);

  return match ? match[1] : value;
};

const getTranslationByPath = (translation: LocaleTranslation, path: string): string | null => {
  const value = path.split('.').reduce<unknown>((accumulator, key) => {
    if (!accumulator || typeof accumulator !== 'object' || !(key in accumulator)) {
      return null;
    }

    return (accumulator as Record<string, unknown>)[key];
  }, translation);

  return typeof value === 'string' ? value : null;
};

const serializeHeader = (cells: readonly string[]): string =>
  cells.map((cell) => normalizeLookupKey(cell)).join('\u0001');

const buildSupportedHeaderSignatures = (): Set<string> => {
  const signatures = new Set<string>();

  for (const locale of Object.values(resources)) {
    const headerValues = HEADER_COLUMN_KEYS.map((key) =>
      getTranslationByPath(locale.translation, `internal.records.export.columns.${key}`) ?? '',
    );

    signatures.add(serializeHeader(headerValues));
  }

  return signatures;
};

const buildDiseaseLabelLookup = (): Map<string, string> => {
  const lookup = new Map<string, string>();

  for (const locale of Object.values(resources)) {
    for (const disease of VACCINATION_DISEASE_CATALOG) {
      const diseaseLabel = getTranslationByPath(locale.translation, disease.labelKey);

      if (!diseaseLabel) {
        continue;
      }

      lookup.set(normalizeLookupKey(diseaseLabel), disease.id);
    }
  }

  return lookup;
};

const buildDoseKindLookup = (): Map<string, DoseKind> => {
  const lookup = new Map<string, DoseKind>();

  for (const locale of Object.values(resources)) {
    for (const kind of DOSE_KIND_VALUES) {
      const label = getTranslationByPath(locale.translation, `internal.doseKind.${kind}`);

      if (!label) {
        continue;
      }

      lookup.set(normalizeLookupKey(label), kind);
    }
  }

  for (const kind of DOSE_KIND_VALUES) {
    lookup.set(normalizeLookupKey(kind), kind);
  }

  return lookup;
};

const SUPPORTED_HEADER_SIGNATURES = buildSupportedHeaderSignatures();
const DISEASE_ID_BY_LABEL = buildDiseaseLabelLookup();
const DOSE_KIND_BY_LABEL = buildDoseKindLookup();

const parseCsv = (input: string): CsvParseResult => {
  const text = input.startsWith(CSV_BOM) ? input.slice(1) : input;
  const rows: ParsedCsvRow[] = [];
  let currentCell = '';
  let currentRow: string[] = [];
  let inQuotes = false;

  const pushCell = () => {
    currentRow.push(currentCell);
    currentCell = '';
  };

  const pushRow = () => {
    rows.push({
      cells: currentRow.map((cell) => normalizeCsvCellValue(cell)),
      rowNumber: rows.length + 1,
    });
    currentRow = [];
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === '"') {
      if (inQuotes && text[index + 1] === '"') {
        currentCell += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && char === CSV_DELIMITER) {
      pushCell();
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      pushCell();
      pushRow();

      if (char === '\r' && text[index + 1] === '\n') {
        index += 1;
      }

      continue;
    }

    currentCell += char;
  }

  if (inQuotes) {
    return {
      fileError: {
        code: 'invalid_csv',
        messageKey: 'internal.records.import.error.invalidFile',
      },
      rows: [],
    };
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    pushCell();
    pushRow();
  }

  return {
    fileError: null,
    rows,
  };
};

const isSeparatorHintRow = (row: ParsedCsvRow): boolean =>
  row.cells.join(CSV_DELIMITER).trim().toLowerCase() === EXCEL_SEPARATOR_HINT;

const isEmptyDataRow = (row: ParsedCsvRow): boolean =>
  row.cells.every((cell) => cell.trim() === '');

const toIsoDateFromImportValue = (value: string): string | null => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (parseIsoDateToUtc(trimmedValue)) {
    return trimmedValue;
  }

  const exportDateMatch = trimmedValue.match(EXPORT_DATE_PATTERN);

  if (!exportDateMatch) {
    return null;
  }

  const [, day, month, year] = exportDateMatch;
  const isoDate = `${year}-${month}-${day}`;

  return parseIsoDateToUtc(isoDate) ? isoDate : null;
};

const createRowError = (
  rowNumber: number,
  code: VaccinationCompletedImportRowError['code'],
): VaccinationCompletedImportRowError => {
  if (code === 'invalid_columns') {
    return {
      code,
      messageKey: 'internal.records.import.report.rowError.invalidColumns',
      rowNumber,
    };
  }

  if (code === 'unknown_disease') {
    return {
      code,
      messageKey: 'internal.records.import.report.rowError.unknownDisease',
      rowNumber,
    };
  }

  if (code === 'unknown_dose_kind') {
    return {
      code,
      messageKey: 'internal.records.import.report.rowError.unknownDoseKind',
      rowNumber,
    };
  }

  return {
    code,
    messageKey: 'internal.records.import.report.rowError.invalidCompletedAt',
    rowNumber,
  };
};

export const parseVaccinationCompletedImportCsv = (
  csvText: string,
): VaccinationCompletedImportParseResult => {
  if (typeof csvText !== 'string' || csvText.trim() === '') {
    return {
      fileError: {
        code: 'invalid_file',
        messageKey: 'internal.records.import.error.invalidFile',
      },
      rowErrors: [],
      rows: [],
      totalDataRows: 0,
    };
  }

  const parsedCsv = parseCsv(csvText);

  if (parsedCsv.fileError) {
    return {
      fileError: parsedCsv.fileError,
      rowErrors: [],
      rows: [],
      totalDataRows: 0,
    };
  }

  const rowsWithoutEmptyLines = parsedCsv.rows.filter((row) => !isEmptyDataRow(row));
  const rowsWithoutSeparatorHint = rowsWithoutEmptyLines[0] && isSeparatorHintRow(rowsWithoutEmptyLines[0])
    ? rowsWithoutEmptyLines.slice(1)
    : rowsWithoutEmptyLines;
  const [headerRow, ...dataRows] = rowsWithoutSeparatorHint;

  if (!headerRow) {
    return {
      fileError: {
        code: 'invalid_file',
        messageKey: 'internal.records.import.error.invalidFile',
      },
      rowErrors: [],
      rows: [],
      totalDataRows: 0,
    };
  }

  if (!SUPPORTED_HEADER_SIGNATURES.has(serializeHeader(headerRow.cells))) {
    return {
      fileError: {
        code: 'unsupported_header',
        messageKey: 'internal.records.import.error.unsupportedHeader',
      },
      rowErrors: [],
      rows: [],
      totalDataRows: 0,
    };
  }

  const validRows: VaccinationCompletedImportRow[] = [];
  const rowErrors: VaccinationCompletedImportRowError[] = [];

  for (const row of dataRows) {
    if (row.cells.length !== HEADER_COLUMN_KEYS.length) {
      rowErrors.push(createRowError(row.rowNumber, 'invalid_columns'));
      continue;
    }

    const [completedAtValue, diseaseLabel, doseKindLabel, tradeNameValue, batchNumberValue] = row.cells;
    const completedAt = toIsoDateFromImportValue(completedAtValue);

    if (!completedAt) {
      rowErrors.push(createRowError(row.rowNumber, 'invalid_completed_at'));
      continue;
    }

    const diseaseId = DISEASE_ID_BY_LABEL.get(normalizeLookupKey(diseaseLabel));

    if (!diseaseId) {
      rowErrors.push(createRowError(row.rowNumber, 'unknown_disease'));
      continue;
    }

    const doseKind = DOSE_KIND_BY_LABEL.get(normalizeLookupKey(doseKindLabel));

    if (!doseKind) {
      rowErrors.push(createRowError(row.rowNumber, 'unknown_dose_kind'));
      continue;
    }

    validRows.push({
      batchNumber: normalizeOptionalText(batchNumberValue),
      completedAt,
      diseaseId,
      kind: doseKind,
      rowNumber: row.rowNumber,
      tradeName: normalizeOptionalText(tradeNameValue),
    });
  }

  return {
    fileError: null,
    rowErrors,
    rows: validRows,
    totalDataRows: dataRows.length,
  };
};

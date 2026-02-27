import { resources } from 'src/i18n/resources.ts';
import type { VaccinationCompletedExportColumnLabels, VaccinationCompletedExportRow } from 'src/interfaces/vaccinationExport.ts';
import { describe, expect, it } from 'vitest';

import { createVaccinationCompletedCsv } from './vaccinationExportCsv';
import { parseVaccinationCompletedImportCsv } from './vaccinationImportCsv';

const getTranslationByPath = (translation: unknown, path: string): string => {
  const value = path.split('.').reduce<unknown>((accumulator, key) => {
    if (!accumulator || typeof accumulator !== 'object' || !(key in accumulator)) {
      return null;
    }

    return (accumulator as Record<string, unknown>)[key];
  }, translation);

  if (typeof value !== 'string') {
    throw new Error(`Missing translation for ${path}`);
  }

  return value;
};

const createColumnLabels = (translation: unknown): VaccinationCompletedExportColumnLabels => ({
  batchNumber: getTranslationByPath(translation, 'internal.records.export.columns.batchNumber'),
  completedAt: getTranslationByPath(translation, 'internal.records.export.columns.completedAt'),
  disease: getTranslationByPath(translation, 'internal.records.export.columns.disease'),
  doseKind: getTranslationByPath(translation, 'internal.records.export.columns.doseKind'),
  tradeName: getTranslationByPath(translation, 'internal.records.export.columns.tradeName'),
});

const createRow = (translation: unknown, overrides?: Partial<VaccinationCompletedExportRow>): VaccinationCompletedExportRow => ({
  batchNumber: 'A-1',
  completedAt: '2024-06-01',
  diseaseLabel: getTranslationByPath(translation, 'internal.diseases.measles'),
  doseKind: 'nextDose',
  doseKindLabel: getTranslationByPath(translation, 'internal.doseKind.nextDose'),
  formattedCompletedAt: '01.06.2024',
  tradeName: 'MMR',
  ...overrides,
});

describe('vaccinationImportCsv', () => {
  it('parses app export CSV with BOM, separator hint and CRLF', () => {
    const translation = resources.ru.translation;
    const csv = createVaccinationCompletedCsv({
      columnLabels: createColumnLabels(translation),
      rows: [createRow(translation)],
    });

    const parsed = parseVaccinationCompletedImportCsv(csv);

    expect(parsed.fileError).toBeNull();
    expect(parsed.totalDataRows).toBe(1);
    expect(parsed.rowErrors).toEqual([]);
    expect(parsed.rows).toEqual([{
      batchNumber: 'A-1',
      completedAt: '2024-06-01',
      diseaseId: 'measles',
      kind: 'nextDose',
      rowNumber: 3,
      tradeName: 'MMR',
    }]);
  });

  it.each([
    ['ru', resources.ru.translation],
    ['de', resources.de.translation],
    ['en', resources.en.translation],
  ] as const)('accepts localized headers and dose labels for %s', (_language, translation) => {
    const csv = createVaccinationCompletedCsv({
      columnLabels: createColumnLabels(translation),
      rows: [createRow(translation, {
        diseaseLabel: getTranslationByPath(translation, 'internal.diseases.tetanus'),
        doseKind: 'revaccination',
        doseKindLabel: getTranslationByPath(translation, 'internal.doseKind.revaccination'),
      })],
    });

    const parsed = parseVaccinationCompletedImportCsv(csv);

    expect(parsed.fileError).toBeNull();
    expect(parsed.rowErrors).toEqual([]);
    expect(parsed.rows[0]).toMatchObject({
      completedAt: '2024-06-01',
      diseaseId: 'tetanus',
      kind: 'revaccination',
    });
  });

  it('accepts ISO date as fallback and keeps optional values null when empty', () => {
    const translation = resources.en.translation;
    const csv = createVaccinationCompletedCsv({
      columnLabels: createColumnLabels(translation),
      rows: [createRow(translation, {
        batchNumber: null,
        formattedCompletedAt: '2024-06-01',
        tradeName: null,
      })],
    });

    const parsed = parseVaccinationCompletedImportCsv(csv);

    expect(parsed.fileError).toBeNull();
    expect(parsed.rowErrors).toEqual([]);
    expect(parsed.rows[0]).toMatchObject({
      batchNumber: null,
      completedAt: '2024-06-01',
      tradeName: null,
    });
  });

  it('restores export-sanitized formula-prefixed values', () => {
    const translation = resources.en.translation;
    const csv = createVaccinationCompletedCsv({
      columnLabels: createColumnLabels(translation),
      rows: [createRow(translation, {
        batchNumber: '-BATCH',
        tradeName: '@Risk "MMR"',
      })],
    });

    const parsed = parseVaccinationCompletedImportCsv(csv);

    expect(parsed.fileError).toBeNull();
    expect(parsed.rowErrors).toEqual([]);
    expect(parsed.rows[0]).toMatchObject({
      batchNumber: '-BATCH',
      tradeName: '@Risk "MMR"',
    });
  });

  it('reports malformed dates, unknown diseases and unknown dose kinds as row errors', () => {
    const csv = [
      '\uFEFFsep=;',
      '"Дата выполнения";"Заболевание";"Тип дозы";"Торговое название";"Серия"',
      '"31.02.2024";"Корь";"Плановая вакцинация";"";""',
      '"01.03.2024";"Неизвестно";"Плановая вакцинация";"";""',
      '"01.03.2024";"Корь";"Странный тип";"";""',
    ].join('\r\n');

    const parsed = parseVaccinationCompletedImportCsv(csv);

    expect(parsed.fileError).toBeNull();
    expect(parsed.totalDataRows).toBe(3);
    expect(parsed.rows).toEqual([]);
    expect(parsed.rowErrors.map((error) => [error.rowNumber, error.code])).toEqual([
      [3, 'invalid_completed_at'],
      [4, 'unknown_disease'],
      [5, 'unknown_dose_kind'],
    ]);
  });

  it('reports invalid column count per row and ignores trailing empty lines', () => {
    const labels = createColumnLabels(resources.en.translation);
    const csv = [
      '\uFEFFsep=;',
      `"${labels.completedAt}";"${labels.disease}";"${labels.doseKind}";"${labels.tradeName}";"${labels.batchNumber}"`,
      '"01.06.2024";"Measles";"Next dose";"MMR"',
      '',
      '',
    ].join('\r\n');

    const parsed = parseVaccinationCompletedImportCsv(csv);

    expect(parsed.fileError).toBeNull();
    expect(parsed.totalDataRows).toBe(1);
    expect(parsed.rows).toEqual([]);
    expect(parsed.rowErrors).toHaveLength(1);
    expect(parsed.rowErrors[0]).toMatchObject({
      code: 'invalid_columns',
      rowNumber: 3,
    });
  });

  it('returns file error for unsupported header', () => {
    const csv = [
      '\uFEFFsep=;',
      '"Wrong";"Header";"Columns";"Trade";"Batch"',
      '"01.06.2024";"Measles";"Next dose";"MMR";"A-1"',
    ].join('\r\n');

    const parsed = parseVaccinationCompletedImportCsv(csv);

    expect(parsed.fileError).toMatchObject({
      code: 'unsupported_header',
    });
    expect(parsed.rows).toEqual([]);
  });

  it('returns file error for malformed CSV quotes', () => {
    const csv = [
      '\uFEFFsep=;',
      '"Completed at";"Disease";"Dose type";"Trade name";"Batch"',
      '"01.06.2024";"Measles";"Next dose";"Broken;""',
    ].join('\r\n');

    const parsed = parseVaccinationCompletedImportCsv(csv);

    expect(parsed.fileError).toMatchObject({
      code: 'invalid_csv',
    });
    expect(parsed.rows).toEqual([]);
  });
});

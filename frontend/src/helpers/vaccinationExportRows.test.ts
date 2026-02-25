import { describe, expect, it } from 'vitest';

import type { VaccinationRecordCardView } from 'src/interfaces/vaccinationViewData.ts';

import {
  buildVaccinationCompletedExportGroups,
  buildVaccinationCompletedExportRows,
  formatVaccinationExportDate,
  sanitizeFileNameSegment,
} from './vaccinationExportRows';

const createRecordCardView = (
  diseaseId: string,
  completedDoseHistory: VaccinationRecordCardView['completedDoseHistory'],
): VaccinationRecordCardView => ({
  completedDoseHistory,
  completedDoses: completedDoseHistory,
  diseaseId,
  futureDueDoses: [{ dueAt: '2030-01-01', id: `planned-${diseaseId}`, kind: 'nextDose' }],
  latestCompletedDose: completedDoseHistory[0] ?? null,
  nextDue: null,
  remainingFutureDueDoses: [{ dueAt: '2030-01-01', id: `planned-${diseaseId}`, kind: 'nextDose' }],
  repeatEvery: null,
  updatedAt: '2025-01-02T10:00:00.000Z',
});

describe('vaccinationExportRows', () => {
  it('flattens completed doses from all records, excludes planned doses and groups by disease name', () => {
    const records: VaccinationRecordCardView[] = [
      createRecordCardView('measles', [
        {
          batchNumber: 'B-1',
          completedAt: '2024-04-10',
          id: 'dose-1',
          kind: 'nextDose',
          tradeName: 'MMR',
        },
        {
          batchNumber: null,
          completedAt: '2024-01-01',
          id: 'dose-2',
          kind: 'revaccination',
          tradeName: null,
        },
      ]),
      createRecordCardView('tetanus', [
        {
          batchNumber: 'T-7',
          completedAt: '2024-06-01',
          id: 'dose-3',
          kind: 'nextDose',
          tradeName: 'Tdap',
        },
      ]),
    ];

    const rows = buildVaccinationCompletedExportRows({
      records,
      resolveDiseaseLabelById: (diseaseId) => ({
        measles: 'Measles',
        tetanus: 'Tetanus',
      }[diseaseId] ?? diseaseId),
      resolveDoseKindLabel: (kind) => ({
        nextDose: 'Next dose',
        revaccination: 'Revaccination',
      }[kind]),
    });

    expect(rows).toHaveLength(3);
    expect(rows.map((row) => `${row.diseaseLabel}|${row.completedAt}`)).toEqual([
      'Measles|2024-04-10',
      'Measles|2024-01-01',
      'Tetanus|2024-06-01',
    ]);
    expect(rows.every((row) => row.diseaseLabel !== 'planned-tetanus')).toBe(true);
    expect(rows[0]).toMatchObject({
      batchNumber: 'B-1',
      completedAt: '2024-04-10',
      diseaseLabel: 'Measles',
      formattedCompletedAt: '10.04.2024',
      doseKindLabel: 'Next dose',
      tradeName: 'MMR',
    });
  });

  it('sorts rows by disease label and keeps newest doses first inside each disease group', () => {
    const records: VaccinationRecordCardView[] = [
      createRecordCardView('hepatitisB', [
        {
          batchNumber: null,
          completedAt: '2024-05-01',
          id: 'dose-1',
          kind: 'nextDose',
          tradeName: null,
        },
        {
          batchNumber: null,
          completedAt: '2024-01-01',
          id: 'dose-3',
          kind: 'revaccination',
          tradeName: null,
        },
      ]),
      createRecordCardView('anthrax', [{
        batchNumber: null,
        completedAt: '2024-05-01',
        id: 'dose-2',
        kind: 'nextDose',
        tradeName: null,
      }]),
    ];

    const rows = buildVaccinationCompletedExportRows({
      records,
      resolveDiseaseLabelById: (diseaseId) => ({
        anthrax: 'Anthrax',
        hepatitisB: 'Hepatitis B',
      }[diseaseId] ?? diseaseId),
      resolveDoseKindLabel: () => 'Next dose',
    });

    expect(rows.map((row) => `${row.diseaseLabel}|${row.completedAt}`)).toEqual([
      'Anthrax|2024-05-01',
      'Hepatitis B|2024-05-01',
      'Hepatitis B|2024-01-01',
    ]);
  });

  it('keeps unicode letters in sanitized file name segments and replaces unsafe chars', () => {
    expect(sanitizeFileNameSegment('  Jane / Иван #1  ')).toBe('Jane_Иван_1');
    expect(sanitizeFileNameSegment('***')).toBe('profile');
  });

  it('formats export dates as DD.MM.YYYY and keeps invalid values unchanged', () => {
    expect(formatVaccinationExportDate('2024-01-09')).toBe('09.01.2024');
    expect(formatVaccinationExportDate('invalid-date')).toBe('invalid-date');
  });

  it('builds grouped pdf export data sorted by disease and dose date ascending', () => {
    const records: VaccinationRecordCardView[] = [
      createRecordCardView('hepatitisB', [
        {
          batchNumber: 'HB-2',
          completedAt: '2024-05-01',
          id: 'dose-2',
          kind: 'revaccination',
          tradeName: null,
        },
        {
          batchNumber: 'HB-1',
          completedAt: '2024-01-01',
          id: 'dose-1',
          kind: 'nextDose',
          tradeName: 'Combi',
        },
      ]),
      createRecordCardView('anthrax', [{
        batchNumber: null,
        completedAt: '2024-03-05',
        id: 'dose-3',
        kind: 'nextDose',
        tradeName: null,
      }]),
    ];

    const groups = buildVaccinationCompletedExportGroups({
      records,
      resolveDiseaseLabelById: (diseaseId) => ({
        anthrax: 'Anthrax',
        hepatitisB: 'Hepatitis B',
      }[diseaseId] ?? diseaseId),
      resolveDoseKindLabel: (kind) => ({
        nextDose: 'Next dose',
        revaccination: 'Revaccination',
      }[kind]),
    });

    expect(groups.map((group) => group.diseaseLabel)).toEqual(['Anthrax', 'Hepatitis B']);
    expect(groups[0]?.doses).toHaveLength(1);
    expect(groups[1]?.doses.map((dose) => `${dose.completedAt}|${dose.formattedCompletedAt}`)).toEqual([
      '2024-01-01|01.01.2024',
      '2024-05-01|01.05.2024',
    ]);
  });
});

import { describe, expect, it } from 'vitest';

import { VACCINATION_DISEASE_CATALOG } from '../constants/vaccinationCatalog';
import type { VaccinationRecord } from '../interfaces/vaccination';

import {
  filterDiseases,
  getAvailableDiseases,
  getCategoryCounts,
  getRecordsDueInNextYear,
  sortRecordsByNextDueDate,
} from './vaccinationSelectors';

const resolveDiseaseLabel = (labelKey: string) => labelKey;
const toIsoPart = (value: number) => String(value).padStart(2, '0');
const toIsoDate = (date: Date) =>
  `${date.getUTCFullYear()}-${toIsoPart(date.getUTCMonth() + 1)}-${toIsoPart(date.getUTCDate())}`;
const getDateShiftedFromToday = (days: number) => {
  const now = new Date();

  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + days));
};

describe('vaccinationSelectors', () => {
  it('excludes already recorded diseases from available list', () => {
    const records: VaccinationRecord[] = [
      {
        batchNumber: null,
        completedAt: '2025-01-02',
        diseaseId: 'measles',
        futureDueDates: ['2027-01-02'],
        repeatEvery: null,
        tradeName: null,
        updatedAt: '2025-01-02T10:00:00.000Z',
      },
    ];

    const available = getAvailableDiseases(VACCINATION_DISEASE_CATALOG, records, 'RU');

    expect(available.some((disease) => disease.id === 'measles')).toBe(false);
    expect(available.length).toBeGreaterThan(0);
  });

  it('filters diseases by category and search query', () => {
    const available = getAvailableDiseases(VACCINATION_DISEASE_CATALOG, [], 'DE');

    const filtered = filterDiseases(available, {
      categoryFilter: 'recommended',
      country: 'DE',
      language: 'de',
      query: 'tetanus',
      resolveDiseaseLabel: (disease) => resolveDiseaseLabel(disease.labelKey),
    });

    expect(filtered.map((disease) => disease.id)).toContain('tetanus');
    expect(
      filtered.every((disease) => disease.countryCategory.DE === 'recommended'),
    ).toBe(true);
  });

  it('returns category counts for available diseases', () => {
    const available = getAvailableDiseases(VACCINATION_DISEASE_CATALOG, [], 'RU');
    const counts = getCategoryCounts(available, 'RU');

    expect(counts.recommended).toBeGreaterThan(0);
    expect(counts.optional).toBeGreaterThan(0);
  });

  it('sorts records by next due date and keeps no-date records at the end', () => {
    const records: VaccinationRecord[] = [
      {
        batchNumber: null,
        completedAt: '2024-01-01',
        diseaseId: 'influenza',
        futureDueDates: [],
        repeatEvery: null,
        tradeName: null,
        updatedAt: '2025-01-02T10:00:00.000Z',
      },
      {
        batchNumber: null,
        completedAt: '2024-01-01',
        diseaseId: 'hepatitisB',
        futureDueDates: ['2029-01-01'],
        repeatEvery: null,
        tradeName: null,
        updatedAt: '2025-01-02T10:00:00.000Z',
      },
      {
        batchNumber: null,
        completedAt: '2024-01-01',
        diseaseId: 'measles',
        futureDueDates: ['2027-01-01'],
        repeatEvery: null,
        tradeName: null,
        updatedAt: '2025-01-02T10:00:00.000Z',
      },
    ];

    const sorted = sortRecordsByNextDueDate(records);

    expect(sorted.map((record) => record.diseaseId)).toEqual(['measles', 'hepatitisB', 'influenza']);
    expect(sorted[0].nextDueAt).toBe('2027-01-01');
  });

  it('keeps stable order for records in the same due-date group', () => {
    const records: VaccinationRecord[] = [
      {
        batchNumber: null,
        completedAt: '2024-01-01',
        diseaseId: 'influenza',
        futureDueDates: [],
        repeatEvery: null,
        tradeName: null,
        updatedAt: '2025-01-01T10:00:00.000Z',
      },
      {
        batchNumber: null,
        completedAt: '2024-01-01',
        diseaseId: 'measles',
        futureDueDates: [],
        repeatEvery: null,
        tradeName: null,
        updatedAt: '2026-01-01T10:00:00.000Z',
      },
    ];

    const sorted = sortRecordsByNextDueDate(records);

    expect(sorted.map((record) => record.diseaseId)).toEqual(['influenza', 'measles']);
  });

  it('returns only records that are due within the next year', () => {
    const records = [
      {
        batchNumber: null,
        completedAt: '2024-01-01',
        diseaseId: 'measles',
        futureDueDates: [],
        nextDueAt: toIsoDate(getDateShiftedFromToday(35)),
        repeatEvery: null,
        tradeName: null,
        updatedAt: '2025-01-01T10:00:00.000Z',
      },
      {
        batchNumber: null,
        completedAt: '2024-01-01',
        diseaseId: 'influenza',
        futureDueDates: [],
        nextDueAt: toIsoDate(getDateShiftedFromToday(500)),
        repeatEvery: null,
        tradeName: null,
        updatedAt: '2025-01-01T10:00:00.000Z',
      },
      {
        batchNumber: null,
        completedAt: '2024-01-01',
        diseaseId: 'tetanus',
        futureDueDates: [],
        nextDueAt: toIsoDate(getDateShiftedFromToday(-10)),
        repeatEvery: null,
        tradeName: null,
        updatedAt: '2025-01-01T10:00:00.000Z',
      },
    ];

    const dueInNextYear = getRecordsDueInNextYear(records);

    expect(dueInNextYear.map((record) => record.diseaseId)).toEqual(['measles']);
  });
});

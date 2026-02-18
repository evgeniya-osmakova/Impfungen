import { describe, expect, it } from 'vitest';

import { VACCINATION_DISEASE_CATALOG } from '../constants/vaccinationCatalog';
import type { VaccinationRecord } from '../interfaces/vaccination';

import {
  filterDiseases,
  getAvailableDiseases,
  getCategoryCounts,
  sortRecordsByNextDueDate,
} from './vaccinationSelectors';

const resolveDiseaseLabel = (labelKey: string) => labelKey;

describe('vaccinationSelectors', () => {
  it('excludes already recorded diseases from available list', () => {
    const records: VaccinationRecord[] = [
      {
        completedAt: '2025-01-02',
        diseaseId: 'measles',
        nextDueAt: '2027-01-02',
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
        completedAt: '2024-01-01',
        diseaseId: 'influenza',
        nextDueAt: null,
        updatedAt: '2025-01-02T10:00:00.000Z',
      },
      {
        completedAt: '2024-01-01',
        diseaseId: 'hepatitisB',
        nextDueAt: '2028-01-01',
        updatedAt: '2025-01-02T10:00:00.000Z',
      },
      {
        completedAt: '2024-01-01',
        diseaseId: 'measles',
        nextDueAt: '2026-01-01',
        updatedAt: '2025-01-02T10:00:00.000Z',
      },
    ];

    const sorted = sortRecordsByNextDueDate(records);

    expect(sorted.map((record) => record.diseaseId)).toEqual(['measles', 'hepatitisB', 'influenza']);
  });
});

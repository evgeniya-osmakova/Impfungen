import { describe, expect, it } from 'vitest';

import { VACCINATION_DISEASE_CATALOG } from '../constants/vaccinationCatalog';
import {
  VACCINATION_NEXT_DUE_SOURCE,
  type VaccinationRecord,
  type VaccinationRecordView,
} from '../interfaces/vaccination';

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

const createRecord = (
  diseaseId: string,
  options: Partial<VaccinationRecord> = {},
): VaccinationRecord => ({
  completedDoses: options.completedDoses ?? [{
    batchNumber: null,
    completedAt: '2024-01-01',
    id: `done-${diseaseId}`,
    kind: 'nextDose',
    tradeName: null,
  }],
  diseaseId,
  futureDueDoses: options.futureDueDoses ?? [],
  repeatEvery: options.repeatEvery ?? null,
  updatedAt: options.updatedAt ?? '2025-01-02T10:00:00.000Z',
});

describe('vaccinationSelectors', () => {
  it('excludes already recorded diseases from available list', () => {
    const records: VaccinationRecord[] = [
      createRecord('measles', {
        futureDueDoses: [{ dueAt: '2027-01-02', id: 'plan-1', kind: 'nextDose' }],
      }),
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

  it('returns universal list without recommendation categorization for NONE country', () => {
    const available = getAvailableDiseases(VACCINATION_DISEASE_CATALOG, [], 'NONE');
    const filtered = filterDiseases(available, {
      categoryFilter: 'recommended',
      country: 'NONE',
      language: 'ru',
      query: '',
      resolveDiseaseLabel: (disease) => resolveDiseaseLabel(disease.labelKey),
    });
    const counts = getCategoryCounts(available, 'NONE');

    expect(available).toHaveLength(VACCINATION_DISEASE_CATALOG.length);
    expect(filtered).toHaveLength(available.length);
    expect(counts).toEqual({ optional: 0, recommended: 0 });
  });

  it('sorts records by next due date and keeps no-date records at the end', () => {
    const records: VaccinationRecord[] = [
      createRecord('influenza'),
      createRecord('hepatitisB', {
        futureDueDoses: [{ dueAt: '2029-01-01', id: 'plan-2', kind: 'nextDose' }],
      }),
      createRecord('measles', {
        futureDueDoses: [{ dueAt: '2027-01-01', id: 'plan-1', kind: 'nextDose' }],
      }),
    ];

    const sorted = sortRecordsByNextDueDate(records);

    expect(sorted.map((record) => record.diseaseId)).toEqual(['measles', 'hepatitisB', 'influenza']);
    expect(sorted[0].nextDue?.dueAt).toBe('2027-01-01');
  });

  it('keeps stable order for records in the same due-date group', () => {
    const records: VaccinationRecord[] = [
      createRecord('influenza', { updatedAt: '2025-01-01T10:00:00.000Z' }),
      createRecord('measles', { updatedAt: '2026-01-01T10:00:00.000Z' }),
    ];

    const sorted = sortRecordsByNextDueDate(records);

    expect(sorted.map((record) => record.diseaseId)).toEqual(['influenza', 'measles']);
  });

  it('returns only records that are due within the next year', () => {
    const records: VaccinationRecordView[] = [
      {
        ...createRecord('measles'),
        nextDue: {
          dueAt: toIsoDate(getDateShiftedFromToday(35)),
          kind: 'nextDose',
          plannedDoseId: 'plan-1',
          source: VACCINATION_NEXT_DUE_SOURCE.manual,
        },
      },
      {
        ...createRecord('influenza'),
        nextDue: {
          dueAt: toIsoDate(getDateShiftedFromToday(500)),
          kind: 'revaccination',
          plannedDoseId: null,
          source: VACCINATION_NEXT_DUE_SOURCE.repeat,
        },
      },
      {
        ...createRecord('tetanus'),
        nextDue: {
          dueAt: toIsoDate(getDateShiftedFromToday(-10)),
          kind: 'nextDose',
          plannedDoseId: 'plan-3',
          source: VACCINATION_NEXT_DUE_SOURCE.manual,
        },
      },
    ];

    const dueInNextYear = getRecordsDueInNextYear(records);

    expect(dueInNextYear.map((record) => record.diseaseId)).toEqual(['measles']);
  });
});

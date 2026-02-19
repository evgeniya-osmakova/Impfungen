import { describe, expect, it } from 'vitest';

import { NEXT_DUE_SOURCE } from '../interfaces/nextDue';

import { resolveVaccinationRecordNextDue } from './vaccinationSchedule';

describe('vaccinationSchedule', () => {
  it('returns nearest future manual dose', () => {
    const nextDue = resolveVaccinationRecordNextDue(
      {
        completedDoses: [{
          batchNumber: null,
          completedAt: '2024-01-01',
          id: 'done-1',
          kind: 'nextDose',
          tradeName: null,
        }],
        futureDueDoses: [
          { dueAt: '2025-06-01', id: 'planned-2', kind: 'revaccination' },
          { dueAt: '2025-04-01', id: 'planned-1', kind: 'nextDose' },
          { dueAt: '2025-10-01', id: 'planned-3', kind: 'nextDose' },
        ],
        repeatEvery: null,
      },
      '2025-05-01',
    );

    expect(nextDue).toEqual({
      dueAt: '2025-06-01',
      kind: 'revaccination',
      plannedDoseId: 'planned-2',
      source: NEXT_DUE_SOURCE.manual,
    });
  });

  it('resolves next due by repeat rule from last completed dose', () => {
    const nextDue = resolveVaccinationRecordNextDue(
      {
        completedDoses: [
          {
            batchNumber: null,
            completedAt: '2020-01-10',
            id: 'done-1',
            kind: 'nextDose',
            tradeName: null,
          },
          {
            batchNumber: null,
            completedAt: '2024-02-10',
            id: 'done-2',
            kind: 'revaccination',
            tradeName: null,
          },
        ],
        futureDueDoses: [],
        repeatEvery: { interval: 10, kind: 'revaccination', unit: 'years' },
      },
      '2026-01-01',
    );

    expect(nextDue).toEqual({
      dueAt: '2034-02-10',
      kind: 'revaccination',
      plannedDoseId: null,
      source: NEXT_DUE_SOURCE.repeat,
    });
  });

  it('returns null when no schedule is configured', () => {
    const nextDue = resolveVaccinationRecordNextDue(
      {
        completedDoses: [{
          batchNumber: null,
          completedAt: '2024-01-01',
          id: 'done-1',
          kind: 'nextDose',
          tradeName: null,
        }],
        futureDueDoses: [],
        repeatEvery: null,
      },
      '2026-01-01',
    );

    expect(nextDue).toBeNull();
  });
});

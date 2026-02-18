import { describe, expect, it } from 'vitest';

import { resolveVaccinationRecordNextDueAt } from './vaccinationSchedule';

describe('vaccinationSchedule', () => {
  it('returns nearest future date from manual list', () => {
    const nextDueAt = resolveVaccinationRecordNextDueAt(
      {
        completedAt: '2024-01-01',
        futureDueDates: ['2025-06-01', '2025-04-01', '2025-10-01'],
        repeatEvery: null,
      },
      '2025-05-01',
    );

    expect(nextDueAt).toBe('2025-06-01');
  });

  it('resolves next due by repeat rule', () => {
    const nextDueAt = resolveVaccinationRecordNextDueAt(
      {
        completedAt: '2020-01-10',
        futureDueDates: [],
        repeatEvery: { interval: 10, unit: 'years' },
      },
      '2026-01-01',
    );

    expect(nextDueAt).toBe('2030-01-10');
  });

  it('returns null when no schedule is configured', () => {
    const nextDueAt = resolveVaccinationRecordNextDueAt(
      {
        completedAt: '2024-01-01',
        futureDueDates: [],
        repeatEvery: null,
      },
      '2026-01-01',
    );

    expect(nextDueAt).toBeNull();
  });
});

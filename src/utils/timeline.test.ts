import { describe, expect, it } from 'vitest';

import { resolveVaccinationTimeline } from './timeline';

describe('timeline', () => {
  it('returns overdue status', () => {
    const result = resolveVaccinationTimeline('2024-03-09', '2024-03-10');

    expect(result).toEqual({ daysUntil: -1, status: 'overdue' });
  });

  it('returns today status', () => {
    const result = resolveVaccinationTimeline('2024-03-10', '2024-03-10');

    expect(result).toEqual({ daysUntil: 0, status: 'today' });
  });

  it('returns upcoming status', () => {
    const result = resolveVaccinationTimeline('2024-03-12', '2024-03-10');

    expect(result).toEqual({ daysUntil: 2, status: 'upcoming' });
  });

  it('returns null for invalid date value', () => {
    const result = resolveVaccinationTimeline('invalid-date', '2024-03-10');

    expect(result).toBeNull();
  });
});

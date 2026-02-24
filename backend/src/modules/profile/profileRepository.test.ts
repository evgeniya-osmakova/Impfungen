import type { InferSelectModel } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { completedDose, plannedDose, profileMember, vaccinationSeries } from '../../db/schema.js';

import { toVaccinationState } from './profileRepository.js';

describe('profileRepository helpers', () => {
  it('maps db rows to vaccination state snapshot payload', () => {
    const memberRow: InferSelectModel<typeof profileMember> = {
      appProfileId: 1,
      birthYear: null,
      country: 'DE',
      id: 1,
      kind: 'primary',
      name: null,
      sortOrder: 0,
      updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    };
    const seriesRows: InferSelectModel<typeof vaccinationSeries>[] = [
      {
        id: 100,
        memberId: 1,
        profileId: 1,
        diseaseId: 'measles',
        repeatInterval: 10,
        repeatKind: 'revaccination',
        repeatUnit: 'years',
        updatedAt: new Date('2024-06-01T10:00:00.000Z'),
      },
    ];
    const completedRows: InferSelectModel<typeof completedDose>[] = [
      {
        id: 1,
        seriesId: 100,
        externalId: 'done-1',
        completedAt: '2024-01-10',
        kind: 'nextDose',
        batchNumber: 'B-1',
        tradeName: 'MMR',
      },
    ];
    const plannedRows: InferSelectModel<typeof plannedDose>[] = [
      {
        id: 2,
        seriesId: 100,
        externalId: 'plan-1',
        dueAt: '2034-01-10',
        kind: 'revaccination',
      },
    ];

    const vaccinationState = toVaccinationState({
      member: memberRow,
      seriesRows,
      completedRows,
      plannedRows,
    });

    expect(vaccinationState).toEqual({
      country: 'DE',
      records: [
        {
          diseaseId: 'measles',
          updatedAt: '2024-06-01T10:00:00.000Z',
          completedDoses: [
            {
              batchNumber: 'B-1',
              completedAt: '2024-01-10',
              id: 'done-1',
              kind: 'nextDose',
              tradeName: 'MMR',
            },
          ],
          futureDueDoses: [
            {
              dueAt: '2034-01-10',
              id: 'plan-1',
              kind: 'revaccination',
            },
          ],
          repeatEvery: {
            interval: 10,
            kind: 'revaccination',
            unit: 'years',
          },
        },
      ],
    });
  });
});

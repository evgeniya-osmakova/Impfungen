import type { InferSelectModel } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { appProfile, completedDose, plannedDose, vaccinationSeries } from '../../db/schema.js';

import {
  toSeriesReconciliationPlan,
  toVaccinationState,
} from './profileRepository.js';

describe('profileRepository helpers', () => {
  it('builds reconciliation plan for create/update/delete series', () => {
    const plan = toSeriesReconciliationPlan(
      [
        { diseaseId: 'measles', id: 1 },
        { diseaseId: 'tetanus', id: 2 },
      ],
      [
        {
          completedDoses: [],
          diseaseId: 'measles',
          futureDueDoses: [],
          repeatEvery: null,
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          completedDoses: [],
          diseaseId: 'polio',
          futureDueDoses: [],
          repeatEvery: null,
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    );

    expect(plan).toEqual({
      createDiseaseIds: ['polio'],
      deleteSeriesIds: [2],
      updateDiseaseIds: ['measles'],
    });
  });

  it('maps db rows to vaccination state snapshot payload', () => {
    const profileRow: InferSelectModel<typeof appProfile> = {
      id: 1,
      language: 'ru',
      country: 'DE',
      isCountryConfirmed: true,
      updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    };
    const seriesRows: InferSelectModel<typeof vaccinationSeries>[] = [
      {
        id: 100,
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
      profile: profileRow,
      seriesRows,
      completedRows,
      plannedRows,
    });

    expect(vaccinationState).toEqual({
      country: 'DE',
      isCountryConfirmed: true,
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

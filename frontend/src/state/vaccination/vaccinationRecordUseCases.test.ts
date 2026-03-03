import { VACCINATION_VALIDATION_ERROR_CODE } from 'src/constants/vaccinationValidation.ts';
import type { VaccinationState } from 'src/interfaces/vaccinationState.ts';
import { describe, expect, it } from 'vitest';

import {
  removeCompletedDoseUseCase,
  updateCompletedDoseUseCase,
} from './vaccinationRecordUseCases.ts';

const createRecords = (): VaccinationState['records'] => [
  {
    completedDoses: [
      {
        batchNumber: 'A-1',
        completedAt: '2024-01-10',
        id: 'dose-1',
        kind: 'nextDose',
        tradeName: 'Dose One',
      },
      {
        batchNumber: 'A-2',
        completedAt: '2024-06-10',
        id: 'dose-2',
        kind: 'revaccination',
        tradeName: 'Dose Two',
      },
    ],
    diseaseId: 'measles',
    futureDueDoses: [],
    repeatEvery: null,
    updatedAt: '2025-01-10T00:00:00.000Z',
  },
];

describe('vaccinationRecordUseCases dose-level mutations', () => {
  it('updates only selected dose by doseId and keeps history sorted', () => {
    const result = updateCompletedDoseUseCase(createRecords(), {
      batchNumber: 'B-9',
      completedAt: '2024-07-01',
      diseaseId: 'measles',
      doseId: 'dose-1',
      kind: 'revaccination',
      plannedDoseId: null,
      tradeName: 'Updated Dose',
    });

    expect(result.errorCode).toBeNull();
    expect(result.records).not.toBeNull();
    expect(result.records?.[0]?.completedDoses).toEqual([
      {
        batchNumber: 'A-2',
        completedAt: '2024-06-10',
        id: 'dose-2',
        kind: 'revaccination',
        tradeName: 'Dose Two',
      },
      {
        batchNumber: 'B-9',
        completedAt: '2024-07-01',
        id: 'dose-1',
        kind: 'revaccination',
        tradeName: 'Updated Dose',
      },
    ]);
  });

  it('returns sync conflict when target dose for update is missing', () => {
    const result = updateCompletedDoseUseCase(createRecords(), {
      batchNumber: null,
      completedAt: '2024-07-01',
      diseaseId: 'measles',
      doseId: 'missing-dose',
      kind: 'nextDose',
      plannedDoseId: null,
      tradeName: null,
    });

    expect(result.errorCode).toBe(VACCINATION_VALIDATION_ERROR_CODE.sync_conflict);
    expect(result.records).toBeNull();
  });

  it('removes only selected dose by doseId', () => {
    const result = removeCompletedDoseUseCase(createRecords(), {
      diseaseId: 'measles',
      doseId: 'dose-1',
    });

    expect(result.errorCode).toBeNull();
    expect(result.records?.[0]?.completedDoses).toEqual([
      {
        batchNumber: 'A-2',
        completedAt: '2024-06-10',
        id: 'dose-2',
        kind: 'revaccination',
        tradeName: 'Dose Two',
      },
    ]);
  });

  it('blocks removal when completed dose is the last one in record', () => {
    const result = removeCompletedDoseUseCase(
      [
        {
          completedDoses: [
            {
              batchNumber: null,
              completedAt: '2024-01-10',
              id: 'dose-1',
              kind: 'nextDose',
              tradeName: null,
            },
          ],
          diseaseId: 'measles',
          futureDueDoses: [],
          repeatEvery: null,
          updatedAt: '2025-01-10T00:00:00.000Z',
        },
      ],
      {
        diseaseId: 'measles',
        doseId: 'dose-1',
      },
    );

    expect(result.errorCode).toBe(VACCINATION_VALIDATION_ERROR_CODE.save_failed);
    expect(result.records).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';

import { VACCINATION_VALIDATION_ERROR_CODE } from '../constants/vaccinationValidation';

import { validateVaccinationRecordInput } from './vaccinationValidation';

describe('vaccinationValidation', () => {
  it('requires disease id', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-01-01',
      diseaseId: '',
      futureDueDates: [],
      repeatEvery: null,
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.disease_required,
      isValid: false,
    });
  });

  it('requires completed date', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '',
      diseaseId: 'measles',
      futureDueDates: [],
      repeatEvery: null,
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.completed_required,
      isValid: false,
    });
  });

  it('rejects invalid future dates', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      diseaseId: 'measles',
      futureDueDates: ['bad-date'],
      repeatEvery: null,
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.future_dates_invalid,
      isValid: false,
    });
  });

  it('rejects future date earlier than completed date', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      diseaseId: 'measles',
      futureDueDates: ['2024-04-19'],
      repeatEvery: null,
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.future_date_before_completed,
      isValid: false,
    });
  });

  it('rejects conflicting schedule options', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      diseaseId: 'measles',
      futureDueDates: ['2024-06-20'],
      repeatEvery: { interval: 12, unit: 'months' },
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.schedule_conflict,
      isValid: false,
    });
  });

  it('rejects invalid repeat interval', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      diseaseId: 'measles',
      futureDueDates: [],
      repeatEvery: { interval: 0, unit: 'years' },
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.repeat_interval_invalid,
      isValid: false,
    });
  });

  it('accepts valid record with manual future dates', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      diseaseId: 'measles',
      futureDueDates: ['2024-10-20', '2025-10-20'],
      repeatEvery: null,
    });

    expect(result).toEqual({ errorCode: null, isValid: true });
  });

  it('accepts valid record with repeat rule', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      diseaseId: 'measles',
      futureDueDates: [],
      repeatEvery: { interval: 10, unit: 'years' },
    });

    expect(result).toEqual({ errorCode: null, isValid: true });
  });
});

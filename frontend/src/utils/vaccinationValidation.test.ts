import { VACCINATION_VALIDATION_ERROR_CODE } from 'src/constants/vaccinationValidation';
import { describe, expect, it } from 'vitest';

import { getTodayIsoDate } from './date';
import {
  validateVaccinationCompleteDoseInput,
  validateVaccinationRecordInput,
} from './vaccinationValidation';

const toTomorrowIsoDate = () => {
  const [year, month, day] = getTodayIsoDate()
    .split('-')
    .map((part) => Number.parseInt(part, 10));
  const tomorrowDate = new Date(Date.UTC(year, month - 1, day + 1));

  return tomorrowDate.toISOString().slice(0, 10);
};

describe('vaccinationValidation', () => {
  it('requires disease id', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-01-01',
      completedDoseKind: 'nextDose',
      diseaseId: '',
      futureDueDoses: [],
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
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [],
      repeatEvery: null,
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.completed_required,
      isValid: false,
    });
  });

  it('rejects completed date in the future', () => {
    const result = validateVaccinationRecordInput({
      completedAt: toTomorrowIsoDate(),
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [],
      repeatEvery: null,
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.completed_in_future,
      isValid: false,
    });
  });

  it('rejects invalid completed kind', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      completedDoseKind: 'bad-kind' as 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [],
      repeatEvery: null,
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.dose_kind_invalid,
      isValid: false,
    });
  });

  it('rejects invalid future dates', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [{ dueAt: 'bad-date', id: 'plan-1', kind: 'nextDose' }],
      repeatEvery: null,
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.future_dates_invalid,
      isValid: false,
    });
  });

  it('rejects invalid future kind', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [{ dueAt: '2024-05-20', id: 'plan-1', kind: 'bad-kind' as 'nextDose' }],
      repeatEvery: null,
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.dose_kind_invalid,
      isValid: false,
    });
  });

  it('rejects future date earlier than completed date', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [{ dueAt: '2024-04-19', id: 'plan-1', kind: 'nextDose' }],
      repeatEvery: null,
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.future_date_before_completed,
      isValid: false,
    });
  });

  it('rejects duplicate future dates', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [
        { dueAt: '2024-10-20', id: 'plan-1', kind: 'nextDose' },
        { dueAt: '2024-10-20', id: 'plan-2', kind: 'revaccination' },
      ],
      repeatEvery: null,
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.future_dates_duplicate,
      isValid: false,
    });
  });

  it('rejects conflicting schedule options', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [{ dueAt: '2024-06-20', id: 'plan-1', kind: 'nextDose' }],
      repeatEvery: { interval: 12, kind: 'revaccination', unit: 'months' },
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.schedule_conflict,
      isValid: false,
    });
  });

  it('rejects invalid repeat interval', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [],
      repeatEvery: { interval: 0, kind: 'nextDose', unit: 'years' },
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.repeat_interval_invalid,
      isValid: false,
    });
  });

  it('rejects invalid repeat kind', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [],
      repeatEvery: { interval: 12, kind: 'bad-kind' as 'nextDose', unit: 'years' },
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.dose_kind_invalid,
      isValid: false,
    });
  });

  it('accepts valid record with manual future doses', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [
        { dueAt: '2024-10-20', id: 'plan-1', kind: 'nextDose' },
        { dueAt: '2025-10-20', id: 'plan-2', kind: 'revaccination' },
      ],
      repeatEvery: null,
    });

    expect(result).toEqual({ errorCode: null, isValid: true });
  });

  it('accepts valid record with repeat rule', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [],
      repeatEvery: { interval: 10, kind: 'revaccination', unit: 'years' },
    });

    expect(result).toEqual({ errorCode: null, isValid: true });
  });

  it('validates complete dose input', () => {
    const valid = validateVaccinationCompleteDoseInput({
      completedAt: '2025-01-01',
      diseaseId: 'measles',
      kind: 'revaccination',
    });
    const invalid = validateVaccinationCompleteDoseInput({
      completedAt: '',
      diseaseId: 'measles',
      kind: 'revaccination',
    });

    expect(valid).toEqual({ errorCode: null, isValid: true });
    expect(invalid).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.completed_required,
      isValid: false,
    });
  });

  it('rejects complete dose date in the future', () => {
    const result = validateVaccinationCompleteDoseInput({
      completedAt: toTomorrowIsoDate(),
      diseaseId: 'measles',
      kind: 'revaccination',
    });

    expect(result).toEqual({
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.completed_in_future,
      isValid: false,
    });
  });
});

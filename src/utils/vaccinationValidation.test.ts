import { describe, expect, it } from 'vitest';

import { validateVaccinationRecordInput } from './vaccinationValidation';

describe('vaccinationValidation', () => {
  it('requires disease id', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-01-01',
      diseaseId: '',
      nextDueAt: null,
    });

    expect(result).toEqual({ errorCode: 'disease_required', isValid: false });
  });

  it('requires completed date', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '',
      diseaseId: 'measles',
      nextDueAt: null,
    });

    expect(result).toEqual({ errorCode: 'completed_required', isValid: false });
  });

  it('rejects next date earlier than completed date', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      diseaseId: 'measles',
      nextDueAt: '2024-04-19',
    });

    expect(result).toEqual({ errorCode: 'next_before_completed', isValid: false });
  });

  it('accepts record with optional next date', () => {
    const result = validateVaccinationRecordInput({
      completedAt: '2024-04-20',
      diseaseId: 'measles',
      nextDueAt: null,
    });

    expect(result).toEqual({ errorCode: null, isValid: true });
  });
});

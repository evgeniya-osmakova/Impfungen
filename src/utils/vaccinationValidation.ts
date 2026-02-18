import type { VaccinationRecordInput } from '../interfaces/vaccination';

import { isIsoDateValue } from './date';

export type VaccinationValidationErrorCode =
  | 'completed_required'
  | 'disease_required'
  | 'next_before_completed';

export interface VaccinationValidationResult {
  errorCode: VaccinationValidationErrorCode | null;
  isValid: boolean;
}

export const validateVaccinationRecordInput = (
  input: Pick<VaccinationRecordInput, 'completedAt' | 'diseaseId' | 'nextDueAt'>,
): VaccinationValidationResult => {
  if (!input.diseaseId.trim()) {
    return {
      errorCode: 'disease_required',
      isValid: false,
    };
  }

  if (!input.completedAt.trim() || !isIsoDateValue(input.completedAt)) {
    return {
      errorCode: 'completed_required',
      isValid: false,
    };
  }

  if (!input.nextDueAt) {
    return {
      errorCode: null,
      isValid: true,
    };
  }

  if (!isIsoDateValue(input.nextDueAt) || input.nextDueAt < input.completedAt) {
    return {
      errorCode: 'next_before_completed',
      isValid: false,
    };
  }

  return {
    errorCode: null,
    isValid: true,
  };
};

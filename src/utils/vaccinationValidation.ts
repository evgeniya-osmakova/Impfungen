import { VACCINATION_REPEAT_UNIT } from '../constants/vaccination';
import {
  VACCINATION_VALIDATION_ERROR_CODE,
  type VaccinationValidationErrorCode,
} from '../constants/vaccinationValidation';
import type { VaccinationRecordInput } from '../interfaces/vaccination';

import { isIsoDateValue } from './date';

export interface VaccinationValidationResult {
  errorCode: VaccinationValidationErrorCode | null;
  isValid: boolean;
}

export type { VaccinationValidationErrorCode } from '../constants/vaccinationValidation';

export const validateVaccinationRecordInput = (
  input: Pick<VaccinationRecordInput, 'completedAt' | 'diseaseId' | 'futureDueDates' | 'repeatEvery'>,
): VaccinationValidationResult => {
  if (!input.diseaseId.trim()) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.disease_required,
      isValid: false,
    };
  }

  if (!input.completedAt.trim() || !isIsoDateValue(input.completedAt)) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.completed_required,
      isValid: false,
    };
  }

  if (input.futureDueDates.some((dateValue) => !isIsoDateValue(dateValue))) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.future_dates_invalid,
      isValid: false,
    };
  }

  if (input.futureDueDates.some((dateValue) => dateValue < input.completedAt)) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.future_date_before_completed,
      isValid: false,
    };
  }

  if (input.futureDueDates.length > 0 && input.repeatEvery) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.schedule_conflict,
      isValid: false,
    };
  }

  if (!input.repeatEvery) {
    return {
      errorCode: null,
      isValid: true,
    };
  }

  if (
    !Number.isInteger(input.repeatEvery.interval)
    || input.repeatEvery.interval <= 0
    || (
      input.repeatEvery.unit !== VACCINATION_REPEAT_UNIT.months
      && input.repeatEvery.unit !== VACCINATION_REPEAT_UNIT.years
    )
  ) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.repeat_interval_invalid,
      isValid: false,
    };
  }

  return {
    errorCode: null,
    isValid: true,
  };
};

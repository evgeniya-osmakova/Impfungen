import { VaccinationValidationErrorCode } from 'src/interfaces/validation.ts'

import {
  VACCINATION_DOSE_KIND,
  VACCINATION_REPEAT_UNIT,
} from '../constants/vaccination';
import {
  VACCINATION_VALIDATION_ERROR_CODE,
} from '../constants/vaccinationValidation';
import type {
  ImmunizationDoseInput,
  ImmunizationSeriesInput,
} from '../interfaces/immunizationRecord';

import { getTodayIsoDate, isIsoDateValue } from './date';

interface VaccinationValidationResult {
  errorCode: VaccinationValidationErrorCode | null;
  isValid: boolean;
}

export const validateVaccinationRecordInput = (
  input: Pick<
    ImmunizationSeriesInput,
    'completedAt' | 'completedDoseKind' | 'diseaseId' | 'futureDueDoses' | 'repeatEvery'
  >,
): VaccinationValidationResult => {
  const todayIsoDate = getTodayIsoDate();

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

  if (input.completedAt > todayIsoDate) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.completed_in_future,
      isValid: false,
    };
  }

  if (
    input.completedDoseKind !== VACCINATION_DOSE_KIND.nextDose
    && input.completedDoseKind !== VACCINATION_DOSE_KIND.revaccination
  ) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.dose_kind_invalid,
      isValid: false,
    };
  }

  if (input.futureDueDoses.some((dose) => !isIsoDateValue(dose.dueAt))) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.future_dates_invalid,
      isValid: false,
    };
  }

  if (
    input.futureDueDoses.some(
      (dose) =>
        dose.kind !== VACCINATION_DOSE_KIND.nextDose
        && dose.kind !== VACCINATION_DOSE_KIND.revaccination,
    )
  ) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.dose_kind_invalid,
      isValid: false,
    };
  }

  const dueDates = input.futureDueDoses.map((dose) => dose.dueAt);

  if (new Set(dueDates).size !== dueDates.length) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.future_dates_duplicate,
      isValid: false,
    };
  }

  if (input.futureDueDoses.some((dose) => dose.dueAt < input.completedAt)) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.future_date_before_completed,
      isValid: false,
    };
  }

  if (input.futureDueDoses.length > 0 && input.repeatEvery) {
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
    input.repeatEvery.kind !== VACCINATION_DOSE_KIND.nextDose
    && input.repeatEvery.kind !== VACCINATION_DOSE_KIND.revaccination
  ) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.dose_kind_invalid,
      isValid: false,
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

export const validateVaccinationCompleteDoseInput = (
  input: Pick<ImmunizationDoseInput, 'completedAt' | 'diseaseId' | 'kind'>,
): VaccinationValidationResult => {
  const todayIsoDate = getTodayIsoDate();

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

  if (input.completedAt > todayIsoDate) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.completed_in_future,
      isValid: false,
    };
  }

  if (
    input.kind !== VACCINATION_DOSE_KIND.nextDose
    && input.kind !== VACCINATION_DOSE_KIND.revaccination
  ) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.dose_kind_invalid,
      isValid: false,
    };
  }

  return {
    errorCode: null,
    isValid: true,
  };
};

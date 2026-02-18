export const VACCINATION_VALIDATION_ERROR_CODE = {
  completed_required: 'completed_required',
  disease_required: 'disease_required',
  future_date_before_completed: 'future_date_before_completed',
  future_dates_invalid: 'future_dates_invalid',
  repeat_interval_invalid: 'repeat_interval_invalid',
  schedule_conflict: 'schedule_conflict',
} as const;

export type VaccinationValidationErrorCode =
  (typeof VACCINATION_VALIDATION_ERROR_CODE)[keyof typeof VACCINATION_VALIDATION_ERROR_CODE];

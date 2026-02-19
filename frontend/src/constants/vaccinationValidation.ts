export const VACCINATION_VALIDATION_ERROR_CODE = {
  completed_in_future: 'completed_in_future',
  completed_required: 'completed_required',
  disease_required: 'disease_required',
  dose_kind_invalid: 'dose_kind_invalid',
  future_date_before_completed: 'future_date_before_completed',
  future_dates_duplicate: 'future_dates_duplicate',
  future_dates_invalid: 'future_dates_invalid',
  repeat_interval_invalid: 'repeat_interval_invalid',
  schedule_conflict: 'schedule_conflict',
} as const;

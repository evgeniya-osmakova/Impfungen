import { VACCINATION_VALIDATION_ERROR_CODE } from './vaccinationValidation';

export const getDiseaseLabelKey = (diseaseId: string) => `internal.diseases.${diseaseId}`;

export const INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE = {
  [VACCINATION_VALIDATION_ERROR_CODE.completed_in_future]: 'internal.form.errors.completedInFuture',
  [VACCINATION_VALIDATION_ERROR_CODE.completed_required]: 'internal.form.errors.completedRequired',
  [VACCINATION_VALIDATION_ERROR_CODE.disease_required]: 'internal.form.errors.diseaseRequired',
  [VACCINATION_VALIDATION_ERROR_CODE.dose_kind_invalid]: 'internal.form.errors.doseKindInvalid',
  [VACCINATION_VALIDATION_ERROR_CODE.future_date_before_completed]:
    'internal.form.errors.futureDateBeforeCompleted',
  [VACCINATION_VALIDATION_ERROR_CODE.future_dates_duplicate]:
    'internal.form.errors.futureDatesDuplicate',
  [VACCINATION_VALIDATION_ERROR_CODE.future_dates_invalid]:
    'internal.form.errors.futureDatesInvalid',
  [VACCINATION_VALIDATION_ERROR_CODE.repeat_interval_invalid]:
    'internal.form.errors.repeatIntervalInvalid',
  [VACCINATION_VALIDATION_ERROR_CODE.save_failed]: 'internal.form.errors.saveFailed',
  [VACCINATION_VALIDATION_ERROR_CODE.schedule_conflict]: 'internal.form.errors.scheduleConflict',
  [VACCINATION_VALIDATION_ERROR_CODE.sync_conflict]: 'internal.form.errors.syncConflict',
} as const;

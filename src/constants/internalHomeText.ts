export const getDiseaseLabelKey = (diseaseId: string) => `internal.diseases.${diseaseId}`;

export const INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE = {
  completed_required: 'internal.form.errors.completedRequired',
  disease_required: 'internal.form.errors.diseaseRequired',
  next_before_completed: 'internal.form.errors.nextBeforeCompleted',
} as const;

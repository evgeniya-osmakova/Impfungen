import { type RefObject, type SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  INTERNAL_HOME_EMPTY_FIELD_VALUE,
  INTERNAL_HOME_FORM_FIELD_ID,
} from '../../constants/internalHomeUi';
import {
  BUTTON_VARIANT,
  HTML_BUTTON_TYPE,
  HTML_INPUT_TYPE,
} from '../../constants/ui';
import type { VaccinationDisease, VaccinationRecord, VaccinationRecordInput } from '../../interfaces/vaccination';
import { Button } from '../../ui';
import { normalizeDateInputValue } from '../../utils/date';

import styles from './VaccinationForm.module.css';

interface VaccinationFormProps {
  diseases: readonly VaccinationDisease[];
  diseaseFieldRef: RefObject<HTMLSelectElement | null>;
  errorKey: string | null;
  formSectionRef: RefObject<HTMLElement | null>;
  onCancelEdit: () => void;
  onSubmitRecord: (record: VaccinationRecordInput) => void;
  prefilledDiseaseId: string | null;
  recordForEdit: VaccinationRecord | null;
  resolveDiseaseLabel: (disease: VaccinationDisease) => string;
}

const resolveInitialDiseaseId = (recordForEdit: VaccinationRecord | null): string => {
  if (recordForEdit?.diseaseId) {
    return recordForEdit.diseaseId;
  }

  return INTERNAL_HOME_EMPTY_FIELD_VALUE;
};

export const VaccinationForm = ({
  diseases,
  diseaseFieldRef,
  errorKey,
  formSectionRef,
  onCancelEdit,
  onSubmitRecord,
  prefilledDiseaseId,
  recordForEdit,
  resolveDiseaseLabel,
}: VaccinationFormProps) => {
  const { t } = useTranslation();
  const isEditMode = Boolean(recordForEdit);

  const [selectedDiseaseId, setSelectedDiseaseId] = useState(() => resolveInitialDiseaseId(recordForEdit));
  const [completedAt, setCompletedAt] = useState(
    recordForEdit?.completedAt ?? INTERNAL_HOME_EMPTY_FIELD_VALUE,
  );
  const [nextDueAt, setNextDueAt] = useState(recordForEdit?.nextDueAt ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);

  const hasDiseasesForAdd = diseases.length > 0;
  const canSubmit = Boolean(selectedDiseaseId) && Boolean(completedAt);

  useEffect(() => {
    setSelectedDiseaseId(resolveInitialDiseaseId(recordForEdit));
    setCompletedAt(recordForEdit?.completedAt ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);
    setNextDueAt(recordForEdit?.nextDueAt ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);
  }, [recordForEdit]);

  useEffect(() => {
    if (isEditMode || !prefilledDiseaseId) {
      return;
    }

    const hasDisease = diseases.some((disease) => disease.id === prefilledDiseaseId);

    if (!hasDisease) {
      return;
    }

    setSelectedDiseaseId(prefilledDiseaseId);
  }, [diseases, isEditMode, prefilledDiseaseId]);

  const formTitle = isEditMode ? 'internal.form.titleEdit' : 'internal.form.titleAdd';
  const submitLabel = isEditMode ? 'internal.form.actions.saveEdit' : 'internal.form.actions.saveAdd';
  const showUnavailableHint = !isEditMode && !hasDiseasesForAdd;

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmitRecord({
      completedAt,
      diseaseId: selectedDiseaseId,
      nextDueAt: normalizeDateInputValue(nextDueAt),
    });
  };

  return (
    <section className={styles.vaccinationForm} ref={formSectionRef}>
      <header className={styles.vaccinationForm__header}>
        <h2 className={styles.vaccinationForm__title}>{t(formTitle)}</h2>
        <p className={styles.vaccinationForm__subtitle}>{t('internal.form.subtitle')}</p>
      </header>

      <form className={styles.vaccinationForm__body} onSubmit={handleSubmit}>
        <label
          className={styles.vaccinationForm__fieldLabel}
          htmlFor={INTERNAL_HOME_FORM_FIELD_ID.disease}
        >
          {t('internal.form.fields.disease')}
        </label>
        <select
          className={styles.vaccinationForm__fieldControl}
          disabled={isEditMode || !hasDiseasesForAdd}
          id={INTERNAL_HOME_FORM_FIELD_ID.disease}
          onChange={(event) => setSelectedDiseaseId(event.target.value)}
          ref={diseaseFieldRef}
          value={selectedDiseaseId}
        >
          {!isEditMode && (
            <option disabled value={INTERNAL_HOME_EMPTY_FIELD_VALUE}>
              {t('internal.form.fields.diseasePlaceholder')}
            </option>
          )}
          {diseases.map((disease) => (
            <option key={disease.id} value={disease.id}>
              {resolveDiseaseLabel(disease)}
            </option>
          ))}
        </select>

        <label
          className={styles.vaccinationForm__fieldLabel}
          htmlFor={INTERNAL_HOME_FORM_FIELD_ID.completedAt}
        >
          {t('internal.form.fields.completedAt')}
        </label>
        <input
          className={styles.vaccinationForm__fieldControl}
          id={INTERNAL_HOME_FORM_FIELD_ID.completedAt}
          onChange={(event) => setCompletedAt(event.target.value)}
          required
          type={HTML_INPUT_TYPE.date}
          value={completedAt}
        />

        <label
          className={styles.vaccinationForm__fieldLabel}
          htmlFor={INTERNAL_HOME_FORM_FIELD_ID.nextDueAt}
        >
          {t('internal.form.fields.nextDueAt')}
        </label>
        <input
          className={styles.vaccinationForm__fieldControl}
          id={INTERNAL_HOME_FORM_FIELD_ID.nextDueAt}
          min={completedAt || undefined}
          onChange={(event) => setNextDueAt(event.target.value)}
          type={HTML_INPUT_TYPE.date}
          value={nextDueAt}
        />

        {errorKey && <p className={styles.vaccinationForm__error}>{t(errorKey)}</p>}
        {showUnavailableHint && (
          <p className={styles.vaccinationForm__hint}>{t('internal.form.noDiseasesForAdd')}</p>
        )}

        <div className={styles.vaccinationForm__actions}>
          <Button
            disabled={!canSubmit || showUnavailableHint}
            type={HTML_BUTTON_TYPE.submit}
            variant={BUTTON_VARIANT.primary}
          >
            {t(submitLabel)}
          </Button>
          {isEditMode && (
            <Button
              onClick={onCancelEdit}
              type={HTML_BUTTON_TYPE.button}
              variant={BUTTON_VARIANT.secondary}
            >
              {t('internal.form.actions.cancelEdit')}
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

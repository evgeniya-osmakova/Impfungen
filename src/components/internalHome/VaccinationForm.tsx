import classNames from 'classnames';
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
import {
  VACCINATION_REPEAT_UNIT,
  VACCINATION_REPEAT_UNIT_OPTIONS,
} from '../../constants/vaccination';
import type {
  VaccinationDisease,
  VaccinationRecord,
  VaccinationRecordInput,
  VaccinationRepeatUnit,
} from '../../interfaces/vaccination';
import { Button } from '../../ui';
import { normalizeDateInputValue } from '../../utils/date';
import { normalizeOptionalText } from '../../utils/string';

import styles from './VaccinationForm.module.css';

interface VaccinationFormProps {
  diseases: readonly VaccinationDisease[];
  diseaseFieldRef: RefObject<HTMLSelectElement | null>;
  errorKey: string | null;
  isInModal?: boolean;
  onCancelEdit: () => void;
  onSubmitRecord: (record: VaccinationRecordInput) => void;
  prefilledDiseaseId: string | null;
  recordForEdit: VaccinationRecord | null;
  resolveDiseaseLabel: (disease: VaccinationDisease) => string;
}

const VACCINATION_SCHEDULE_MODE = {
  manual: 'manual',
  none: 'none',
  repeat: 'repeat',
} as const;

type VaccinationScheduleMode =
  (typeof VACCINATION_SCHEDULE_MODE)[keyof typeof VACCINATION_SCHEDULE_MODE];

const resolveInitialDiseaseId = (recordForEdit: VaccinationRecord | null): string => {
  if (recordForEdit?.diseaseId) {
    return recordForEdit.diseaseId;
  }

  return INTERNAL_HOME_EMPTY_FIELD_VALUE;
};

const resolveInitialScheduleMode = (
  recordForEdit: VaccinationRecord | null,
): VaccinationScheduleMode => {
  if (recordForEdit?.repeatEvery) {
    return VACCINATION_SCHEDULE_MODE.repeat;
  }

  if (recordForEdit && recordForEdit.futureDueDates.length > 0) {
    return VACCINATION_SCHEDULE_MODE.manual;
  }

  return VACCINATION_SCHEDULE_MODE.none;
};

const resolveInitialFutureDates = (recordForEdit: VaccinationRecord | null): string[] => {
  if (!recordForEdit || recordForEdit.futureDueDates.length === 0) {
    return [INTERNAL_HOME_EMPTY_FIELD_VALUE];
  }

  return [...recordForEdit.futureDueDates];
};

const resolveInitialRepeatInterval = (recordForEdit: VaccinationRecord | null): string => {
  if (!recordForEdit?.repeatEvery) {
    return INTERNAL_HOME_EMPTY_FIELD_VALUE;
  }

  return String(recordForEdit.repeatEvery.interval);
};

const resolveInitialRepeatUnit = (recordForEdit: VaccinationRecord | null): VaccinationRepeatUnit => {
  if (!recordForEdit?.repeatEvery) {
    return VACCINATION_REPEAT_UNIT.years;
  }

  return recordForEdit.repeatEvery.unit;
};

const resolveRepeatUnitTextKey = (unit: VaccinationRepeatUnit): string =>
  unit === VACCINATION_REPEAT_UNIT.years
    ? 'internal.form.repeatUnits.years'
    : 'internal.form.repeatUnits.months';

export const VaccinationForm = ({
  diseases,
  diseaseFieldRef,
  errorKey,
  isInModal = false,
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
  const [tradeName, setTradeName] = useState(recordForEdit?.tradeName ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);
  const [batchNumber, setBatchNumber] = useState(
    recordForEdit?.batchNumber ?? INTERNAL_HOME_EMPTY_FIELD_VALUE,
  );
  const [scheduleMode, setScheduleMode] = useState(() => resolveInitialScheduleMode(recordForEdit));
  const [futureDueDates, setFutureDueDates] = useState(() => resolveInitialFutureDates(recordForEdit));
  const [repeatInterval, setRepeatInterval] = useState(() => resolveInitialRepeatInterval(recordForEdit));
  const [repeatUnit, setRepeatUnit] = useState<VaccinationRepeatUnit>(() => resolveInitialRepeatUnit(recordForEdit));

  const hasDiseasesForAdd = diseases.length > 0;
  const canSubmit = Boolean(selectedDiseaseId) && Boolean(completedAt);

  useEffect(() => {
    setSelectedDiseaseId(resolveInitialDiseaseId(recordForEdit));
    setCompletedAt(recordForEdit?.completedAt ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);
    setTradeName(recordForEdit?.tradeName ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);
    setBatchNumber(recordForEdit?.batchNumber ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);
    setScheduleMode(resolveInitialScheduleMode(recordForEdit));
    setFutureDueDates(resolveInitialFutureDates(recordForEdit));
    setRepeatInterval(resolveInitialRepeatInterval(recordForEdit));
    setRepeatUnit(resolveInitialRepeatUnit(recordForEdit));
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

    const normalizedFutureDates = futureDueDates
      .map((futureDate) => normalizeDateInputValue(futureDate))
      .filter((futureDate): futureDate is string => Boolean(futureDate));
    const repeatIntervalValue = Number.parseInt(repeatInterval, 10);
    const hasRepeatInterval = Number.isInteger(repeatIntervalValue) && repeatIntervalValue > 0;

    onSubmitRecord({
      batchNumber: normalizeOptionalText(batchNumber),
      completedAt,
      diseaseId: selectedDiseaseId,
      futureDueDates:
        scheduleMode === VACCINATION_SCHEDULE_MODE.manual ? normalizedFutureDates : [],
      repeatEvery:
        scheduleMode === VACCINATION_SCHEDULE_MODE.repeat && hasRepeatInterval
          ? { interval: repeatIntervalValue, unit: repeatUnit }
          : null,
      tradeName: normalizeOptionalText(tradeName),
    });
  };

  const handleScheduleModeChange = (mode: VaccinationScheduleMode) => {
    setScheduleMode(mode);

    if (mode === VACCINATION_SCHEDULE_MODE.manual && futureDueDates.length === 0) {
      setFutureDueDates([INTERNAL_HOME_EMPTY_FIELD_VALUE]);
    }
  };

  const handleFutureDateChange = (index: number, value: string) => {
    setFutureDueDates((prev) => prev.map((entry, idx) => (idx === index ? value : entry)));
  };

  const handleAddFutureDate = () => {
    setFutureDueDates((prev) => [...prev, INTERNAL_HOME_EMPTY_FIELD_VALUE]);
  };

  const handleRemoveFutureDate = (index: number) => {
    setFutureDueDates((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <section
      className={classNames(styles.vaccinationForm, isInModal && styles.vaccinationFormInModal)}
    >
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
          htmlFor={INTERNAL_HOME_FORM_FIELD_ID.tradeName}
        >
          {t('internal.form.fields.tradeName')}
        </label>
        <input
          className={styles.vaccinationForm__fieldControl}
          id={INTERNAL_HOME_FORM_FIELD_ID.tradeName}
          onChange={(event) => setTradeName(event.target.value)}
          type={HTML_INPUT_TYPE.text}
          value={tradeName}
        />

        <label
          className={styles.vaccinationForm__fieldLabel}
          htmlFor={INTERNAL_HOME_FORM_FIELD_ID.batchNumber}
        >
          {t('internal.form.fields.batchNumber')}
        </label>
        <input
          className={styles.vaccinationForm__fieldControl}
          id={INTERNAL_HOME_FORM_FIELD_ID.batchNumber}
          onChange={(event) => setBatchNumber(event.target.value)}
          type={HTML_INPUT_TYPE.text}
          value={batchNumber}
        />

        <label
          className={styles.vaccinationForm__fieldLabel}
          htmlFor={INTERNAL_HOME_FORM_FIELD_ID.scheduleMode}
        >
          {t('internal.form.fields.scheduleMode')}
        </label>
        <select
          className={styles.vaccinationForm__fieldControl}
          id={INTERNAL_HOME_FORM_FIELD_ID.scheduleMode}
          onChange={(event) => handleScheduleModeChange(event.target.value as VaccinationScheduleMode)}
          value={scheduleMode}
        >
          <option value={VACCINATION_SCHEDULE_MODE.none}>{t('internal.form.schedule.modes.none')}</option>
          <option value={VACCINATION_SCHEDULE_MODE.manual}>{t('internal.form.schedule.modes.manual')}</option>
          <option value={VACCINATION_SCHEDULE_MODE.repeat}>{t('internal.form.schedule.modes.repeat')}</option>
        </select>

        {scheduleMode === VACCINATION_SCHEDULE_MODE.manual && (
          <div className={styles.vaccinationForm__futureDates}>
            {futureDueDates.map((futureDate, index) => {
              const inputId = `${INTERNAL_HOME_FORM_FIELD_ID.futureDatePrefix}${index}`;

              return (
                <div className={styles.vaccinationForm__futureDateRow} key={inputId}>
                  <label className={styles.vaccinationForm__fieldLabel} htmlFor={inputId}>
                    {t('internal.form.fields.futureDate', { index: index + 1 })}
                  </label>
                  <div className={styles.vaccinationForm__futureDateControl}>
                    <input
                      className={styles.vaccinationForm__fieldControl}
                      id={inputId}
                      min={completedAt || undefined}
                      onChange={(event) => handleFutureDateChange(index, event.target.value)}
                      type={HTML_INPUT_TYPE.date}
                      value={futureDate}
                    />
                    {futureDueDates.length > 1 && (
                      <Button
                        className={styles.vaccinationForm__futureDateButton}
                        onClick={() => handleRemoveFutureDate(index)}
                        type={HTML_BUTTON_TYPE.button}
                        variant={BUTTON_VARIANT.secondary}
                      >
                        {t('internal.form.actions.removeDate')}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            <Button
              className={styles.vaccinationForm__addDateButton}
              fullWidth
              onClick={handleAddFutureDate}
              type={HTML_BUTTON_TYPE.button}
              variant={BUTTON_VARIANT.secondary}
            >
              {t('internal.form.actions.addDate')}
            </Button>
          </div>
        )}

        {scheduleMode === VACCINATION_SCHEDULE_MODE.repeat && (
          <div className={styles.vaccinationForm__repeat}>
            <label
              className={styles.vaccinationForm__fieldLabel}
              htmlFor={INTERNAL_HOME_FORM_FIELD_ID.repeatInterval}
            >
              {t('internal.form.fields.repeatInterval')}
            </label>
            <input
              className={styles.vaccinationForm__fieldControl}
              id={INTERNAL_HOME_FORM_FIELD_ID.repeatInterval}
              min={1}
              onChange={(event) => setRepeatInterval(event.target.value)}
              step={1}
              type={HTML_INPUT_TYPE.number}
              value={repeatInterval}
            />
            <label
              className={styles.vaccinationForm__fieldLabel}
              htmlFor={INTERNAL_HOME_FORM_FIELD_ID.repeatUnit}
            >
              {t('internal.form.fields.repeatUnit')}
            </label>
            <select
              className={styles.vaccinationForm__fieldControl}
              id={INTERNAL_HOME_FORM_FIELD_ID.repeatUnit}
              onChange={(event) => setRepeatUnit(event.target.value as VaccinationRepeatUnit)}
              value={repeatUnit}
            >
              {VACCINATION_REPEAT_UNIT_OPTIONS.map((unit) => (
                <option key={unit} value={unit}>
                  {t(resolveRepeatUnitTextKey(unit))}
                </option>
              ))}
            </select>
          </div>
        )}

        {errorKey && <p className={styles.vaccinationForm__error}>{t(errorKey)}</p>}
        {showUnavailableHint && (
          <p className={styles.vaccinationForm__hint}>{t('internal.form.noDiseasesForAdd')}</p>
        )}

        <div
          className={classNames(
            styles.vaccinationForm__actions,
            !isEditMode && styles.vaccinationForm__actionsSingle,
          )}
        >
          <Button
            className={styles.vaccinationForm__actionButton}
            disabled={!canSubmit || showUnavailableHint}
            fullWidth
            type={HTML_BUTTON_TYPE.submit}
            variant={BUTTON_VARIANT.primary}
          >
            {t(submitLabel)}
          </Button>
          {isEditMode && (
            <Button
              className={styles.vaccinationForm__actionButton}
              fullWidth
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

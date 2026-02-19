import classNames from 'classnames';
import { type RefObject, type SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  INTERNAL_HOME_EMPTY_FIELD_VALUE,
  INTERNAL_HOME_FORM_FIELD_ID,
} from '../../../../../../constants/internalHomeUi';
import {
  BUTTON_VARIANT,
  HTML_BUTTON_TYPE,
  HTML_INPUT_TYPE,
} from '../../../../../../constants/ui';
import {
  VACCINATION_DOSE_KIND,
  VACCINATION_DOSE_KIND_OPTIONS,
  VACCINATION_REPEAT_UNIT,
  VACCINATION_REPEAT_UNIT_OPTIONS,
} from '../../../../../../constants/vaccination';
import type { DoseKind, RepeatUnit } from '../../../../../../interfaces/base';
import type { Disease } from '../../../../../../interfaces/disease';
import type { PlannedDose } from '../../../../../../interfaces/dose';
import type {
  ImmunizationSeries,
  ImmunizationSeriesInput,
} from '../../../../../../interfaces/immunizationRecord';
import {
  buildVaccinationRecordInput,
  createClientDoseId,
  createEmptyPlannedDose,
  resolveLatestCompletedDose,
  VACCINATION_SCHEDULE_MODE,
  type VaccinationScheduleMode,
} from '../../../../../../state/vaccination/vaccinationFormAdapter';
import { Button } from '../../../../../../ui';
import { getTodayIsoDate } from '../../../../../../utils/date';

import styles from './VaccinationForm.module.css';

interface VaccinationFormProps {
  diseases: readonly Disease[];
  diseaseFieldRef: RefObject<HTMLSelectElement | null>;
  errorKey: string | null;
  isInModal?: boolean;
  onCancelEdit: () => void;
  onSubmitRecord: (record: ImmunizationSeriesInput) => void;
  prefilledDiseaseId: string | null;
  recordForEdit: ImmunizationSeries | null;
  resolveDiseaseLabel: (disease: Disease) => string;
}

const resolveInitialDiseaseId = (recordForEdit: ImmunizationSeries | null): string => {
  if (recordForEdit?.diseaseId) {
    return recordForEdit.diseaseId;
  }

  return INTERNAL_HOME_EMPTY_FIELD_VALUE;
};

const resolveInitialScheduleMode = (
  recordForEdit: ImmunizationSeries | null,
): VaccinationScheduleMode => {
  if (recordForEdit?.repeatEvery) {
    return VACCINATION_SCHEDULE_MODE.repeat;
  }

  if (recordForEdit && recordForEdit.futureDueDoses.length > 0) {
    return VACCINATION_SCHEDULE_MODE.manual;
  }

  return VACCINATION_SCHEDULE_MODE.none;
};

const resolveInitialFutureDoses = (recordForEdit: ImmunizationSeries | null): PlannedDose[] => {
  if (!recordForEdit || recordForEdit.futureDueDoses.length === 0) {
    return [{ ...createEmptyPlannedDose(createClientDoseId), dueAt: INTERNAL_HOME_EMPTY_FIELD_VALUE }];
  }

  return recordForEdit.futureDueDoses.map((dose) => ({ ...dose }));
};

const resolveInitialRepeatInterval = (recordForEdit: ImmunizationSeries | null): string => {
  if (!recordForEdit?.repeatEvery) {
    return INTERNAL_HOME_EMPTY_FIELD_VALUE;
  }

  return String(recordForEdit.repeatEvery.interval);
};

const resolveInitialRepeatUnit = (recordForEdit: ImmunizationSeries | null): RepeatUnit => {
  if (!recordForEdit?.repeatEvery) {
    return VACCINATION_REPEAT_UNIT.years;
  }

  return recordForEdit.repeatEvery.unit;
};

const resolveInitialRepeatKind = (recordForEdit: ImmunizationSeries | null): DoseKind => {
  if (!recordForEdit?.repeatEvery) {
    return VACCINATION_DOSE_KIND.nextDose;
  }

  return recordForEdit.repeatEvery.kind;
};

const resolveRepeatUnitTextKey = (unit: RepeatUnit): string =>
  unit === VACCINATION_REPEAT_UNIT.years
    ? 'internal.form.repeatUnits.years'
    : 'internal.form.repeatUnits.months';

const resolveDoseKindTextKey = (kind: DoseKind): string => `internal.doseKind.${kind}`;

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
  const todayIsoDate = getTodayIsoDate();
  const latestCompletedDose = resolveLatestCompletedDose(recordForEdit?.completedDoses ?? []);

  const [selectedDiseaseId, setSelectedDiseaseId] = useState(() => resolveInitialDiseaseId(recordForEdit));
  const [completedAt, setCompletedAt] = useState(
    latestCompletedDose?.completedAt ?? INTERNAL_HOME_EMPTY_FIELD_VALUE,
  );
  const [completedDoseKind, setCompletedDoseKind] = useState<DoseKind>(
    latestCompletedDose?.kind ?? VACCINATION_DOSE_KIND.nextDose,
  );
  const [tradeName, setTradeName] = useState(latestCompletedDose?.tradeName ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);
  const [batchNumber, setBatchNumber] = useState(
    latestCompletedDose?.batchNumber ?? INTERNAL_HOME_EMPTY_FIELD_VALUE,
  );
  const [scheduleMode, setScheduleMode] = useState(() => resolveInitialScheduleMode(recordForEdit));
  const [futureDueDoses, setFutureDueDoses] = useState(() => resolveInitialFutureDoses(recordForEdit));
  const [repeatInterval, setRepeatInterval] = useState(() => resolveInitialRepeatInterval(recordForEdit));
  const [repeatUnit, setRepeatUnit] = useState<RepeatUnit>(() => resolveInitialRepeatUnit(recordForEdit));
  const [repeatKind, setRepeatKind] = useState<DoseKind>(() => resolveInitialRepeatKind(recordForEdit));

  const hasDiseasesForAdd = diseases.length > 0;
  const canSubmit = Boolean(selectedDiseaseId) && Boolean(completedAt);

  useEffect(() => {
    const nextLatestCompletedDose = resolveLatestCompletedDose(recordForEdit?.completedDoses ?? []);

    setSelectedDiseaseId(resolveInitialDiseaseId(recordForEdit));
    setCompletedAt(nextLatestCompletedDose?.completedAt ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);
    setCompletedDoseKind(nextLatestCompletedDose?.kind ?? VACCINATION_DOSE_KIND.nextDose);
    setTradeName(nextLatestCompletedDose?.tradeName ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);
    setBatchNumber(nextLatestCompletedDose?.batchNumber ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);
    setScheduleMode(resolveInitialScheduleMode(recordForEdit));
    setFutureDueDoses(resolveInitialFutureDoses(recordForEdit));
    setRepeatInterval(resolveInitialRepeatInterval(recordForEdit));
    setRepeatUnit(resolveInitialRepeatUnit(recordForEdit));
    setRepeatKind(resolveInitialRepeatKind(recordForEdit));
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

    onSubmitRecord(buildVaccinationRecordInput({
      batchNumber,
      completedAt,
      completedDoseKind,
      diseaseId: selectedDiseaseId,
      futureDueDoses,
      repeatInterval,
      repeatKind,
      repeatUnit,
      scheduleMode,
      tradeName,
    }));
  };

  const handleScheduleModeChange = (mode: VaccinationScheduleMode) => {
    setScheduleMode(mode);

    if (mode === VACCINATION_SCHEDULE_MODE.manual && futureDueDoses.length === 0) {
      setFutureDueDoses([{ ...createEmptyPlannedDose(createClientDoseId), dueAt: INTERNAL_HOME_EMPTY_FIELD_VALUE }]);
    }
  };

  const handleFutureDateChange = (id: string, value: string) => {
    setFutureDueDoses((prev) => prev.map((entry) => (entry.id === id ? { ...entry, dueAt: value } : entry)));
  };

  const handleFutureKindChange = (id: string, kind: DoseKind) => {
    setFutureDueDoses((prev) => prev.map((entry) => (entry.id === id ? { ...entry, kind } : entry)));
  };

  const handleAddFutureDate = () => {
    setFutureDueDoses((prev) => [
      ...prev,
      { ...createEmptyPlannedDose(createClientDoseId), dueAt: INTERNAL_HOME_EMPTY_FIELD_VALUE },
    ]);
  };

  const handleRemoveFutureDate = (id: string) => {
    setFutureDueDoses((prev) => prev.filter((entry) => entry.id !== id));
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
          max={todayIsoDate}
          onChange={(event) => setCompletedAt(event.target.value)}
          required
          type={HTML_INPUT_TYPE.date}
          value={completedAt}
        />

        <label
          className={styles.vaccinationForm__fieldLabel}
          htmlFor={INTERNAL_HOME_FORM_FIELD_ID.completedDoseKind}
        >
          {t('internal.form.fields.completedDoseKind')}
        </label>
        <select
          className={styles.vaccinationForm__fieldControl}
          id={INTERNAL_HOME_FORM_FIELD_ID.completedDoseKind}
          onChange={(event) => setCompletedDoseKind(event.target.value as DoseKind)}
          value={completedDoseKind}
        >
          {VACCINATION_DOSE_KIND_OPTIONS.map((kind) => (
            <option key={kind} value={kind}>
              {t(resolveDoseKindTextKey(kind))}
            </option>
          ))}
        </select>

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
            {futureDueDoses.map((futureDose, index) => {
              const dateInputId = `${INTERNAL_HOME_FORM_FIELD_ID.futureDatePrefix}${index}`;
              const kindInputId = `${INTERNAL_HOME_FORM_FIELD_ID.futureDoseKindPrefix}${index}`;

              return (
                <div className={styles.vaccinationForm__futureDateRow} key={futureDose.id}>
                  <label className={styles.vaccinationForm__fieldLabel} htmlFor={dateInputId}>
                    {t('internal.form.fields.futureDate', { index: index + 1 })}
                  </label>
                  <div className={styles.vaccinationForm__futureDateControl}>
                    <input
                      className={styles.vaccinationForm__fieldControl}
                      id={dateInputId}
                      min={completedAt || undefined}
                      onChange={(event) => handleFutureDateChange(futureDose.id, event.target.value)}
                      type={HTML_INPUT_TYPE.date}
                      value={futureDose.dueAt}
                    />
                    {futureDueDoses.length > 1 && (
                      <Button
                        className={styles.vaccinationForm__futureDateButton}
                        onClick={() => handleRemoveFutureDate(futureDose.id)}
                        type={HTML_BUTTON_TYPE.button}
                        variant={BUTTON_VARIANT.secondary}
                      >
                        {t('internal.form.actions.removeDate')}
                      </Button>
                    )}
                  </div>
                  <label className={styles.vaccinationForm__fieldLabel} htmlFor={kindInputId}>
                    {t('internal.form.fields.plannedDoseKind')}
                  </label>
                  <select
                    className={styles.vaccinationForm__fieldControl}
                    id={kindInputId}
                    onChange={(event) => handleFutureKindChange(futureDose.id, event.target.value as DoseKind)}
                    value={futureDose.kind}
                  >
                    {VACCINATION_DOSE_KIND_OPTIONS.map((kind) => (
                      <option key={kind} value={kind}>
                        {t(resolveDoseKindTextKey(kind))}
                      </option>
                    ))}
                  </select>
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
              onChange={(event) => setRepeatUnit(event.target.value as RepeatUnit)}
              value={repeatUnit}
            >
              {VACCINATION_REPEAT_UNIT_OPTIONS.map((unit) => (
                <option key={unit} value={unit}>
                  {t(resolveRepeatUnitTextKey(unit))}
                </option>
              ))}
            </select>
            <label
              className={styles.vaccinationForm__fieldLabel}
              htmlFor={INTERNAL_HOME_FORM_FIELD_ID.repeatKind}
            >
              {t('internal.form.fields.plannedDoseKind')}
            </label>
            <select
              className={styles.vaccinationForm__fieldControl}
              id={INTERNAL_HOME_FORM_FIELD_ID.repeatKind}
              onChange={(event) => setRepeatKind(event.target.value as DoseKind)}
              value={repeatKind}
            >
              {VACCINATION_DOSE_KIND_OPTIONS.map((kind) => (
                <option key={kind} value={kind}>
                  {t(resolveDoseKindTextKey(kind))}
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

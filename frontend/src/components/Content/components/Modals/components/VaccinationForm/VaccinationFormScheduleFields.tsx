import { useTranslation } from 'react-i18next';

import { INTERNAL_HOME_FORM_FIELD_ID } from '../../../../../../constants/internalHomeUi';
import {
  BUTTON_VARIANT,
  HTML_BUTTON_TYPE,
  HTML_INPUT_TYPE,
} from '../../../../../../constants/ui';
import {
  VACCINATION_DOSE_KIND_OPTIONS,
  VACCINATION_REPEAT_UNIT,
  VACCINATION_REPEAT_UNIT_OPTIONS,
  VACCINATION_SCHEDULE_MODE,
} from '../../../../../../constants/vaccination';
import type { DoseKind, RepeatUnit } from '../../../../../../interfaces/base';
import type { PlannedDose } from '../../../../../../interfaces/dose';
import type { VaccinationScheduleMode } from '../../../../../../interfaces/immunizationRecord';
import { Button } from '../../../../../../ui';

import styles from './VaccinationForm.module.css';

interface VaccinationFormScheduleFieldsProps {
  completedAt: string;
  futureDueDoses: readonly PlannedDose[];
  onAddFutureDate: () => void;
  onFutureDateChange: (id: string, value: string) => void;
  onFutureKindChange: (id: string, kind: DoseKind) => void;
  onRemoveFutureDate: (id: string) => void;
  onRepeatIntervalChange: (value: string) => void;
  onRepeatKindChange: (kind: DoseKind) => void;
  onRepeatUnitChange: (unit: RepeatUnit) => void;
  onScheduleModeChange: (mode: VaccinationScheduleMode) => void;
  repeatInterval: string;
  repeatKind: DoseKind;
  repeatUnit: RepeatUnit;
  scheduleMode: VaccinationScheduleMode;
}

const resolveRepeatUnitTextKey = (unit: RepeatUnit): string =>
  unit === VACCINATION_REPEAT_UNIT.years
    ? 'internal.form.repeatUnits.years'
    : 'internal.form.repeatUnits.months';

const resolveDoseKindTextKey = (kind: DoseKind): string => `internal.doseKind.${kind}`;

export const VaccinationFormScheduleFields = ({
  completedAt,
  futureDueDoses,
  onAddFutureDate,
  onFutureDateChange,
  onFutureKindChange,
  onRemoveFutureDate,
  onRepeatIntervalChange,
  onRepeatKindChange,
  onRepeatUnitChange,
  onScheduleModeChange,
  repeatInterval,
  repeatKind,
  repeatUnit,
  scheduleMode,
}: VaccinationFormScheduleFieldsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <label
        className={styles.vaccinationForm__fieldLabel}
        htmlFor={INTERNAL_HOME_FORM_FIELD_ID.scheduleMode}
      >
        {t('internal.form.fields.scheduleMode')}
      </label>
      <select
        className={styles.vaccinationForm__fieldControl}
        id={INTERNAL_HOME_FORM_FIELD_ID.scheduleMode}
        onChange={(event) => onScheduleModeChange(event.target.value as VaccinationScheduleMode)}
        value={scheduleMode}
      >
        <option value={VACCINATION_SCHEDULE_MODE.none}>{t('internal.form.schedule.modes.none')}</option>
        <option value={VACCINATION_SCHEDULE_MODE.manual}>{t('internal.form.schedule.modes.manual')}</option>
        <option value={VACCINATION_SCHEDULE_MODE.repeat}>{t('internal.form.schedule.modes.repeat')}</option>
      </select>

      {scheduleMode === VACCINATION_SCHEDULE_MODE.manual ? (
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
                    onChange={(event) => onFutureDateChange(futureDose.id, event.target.value)}
                    type={HTML_INPUT_TYPE.date}
                    value={futureDose.dueAt}
                  />
                  {futureDueDoses.length > 1 ? (
                    <Button
                      className={styles.vaccinationForm__futureDateButton}
                      onClick={() => onRemoveFutureDate(futureDose.id)}
                      type={HTML_BUTTON_TYPE.button}
                      variant={BUTTON_VARIANT.secondary}
                    >
                      {t('internal.form.actions.removeDate')}
                    </Button>
                  ) : null}
                </div>
                <label className={styles.vaccinationForm__fieldLabel} htmlFor={kindInputId}>
                  {t('internal.form.fields.plannedDoseKind')}
                </label>
                <select
                  className={styles.vaccinationForm__fieldControl}
                  id={kindInputId}
                  onChange={(event) => onFutureKindChange(futureDose.id, event.target.value as DoseKind)}
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
            onClick={onAddFutureDate}
            type={HTML_BUTTON_TYPE.button}
            variant={BUTTON_VARIANT.secondary}
          >
            {t('internal.form.actions.addDate')}
          </Button>
        </div>
      ) : null}

      {scheduleMode === VACCINATION_SCHEDULE_MODE.repeat ? (
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
            onChange={(event) => onRepeatIntervalChange(event.target.value)}
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
            onChange={(event) => onRepeatUnitChange(event.target.value as RepeatUnit)}
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
            onChange={(event) => onRepeatKindChange(event.target.value as DoseKind)}
            value={repeatKind}
          >
            {VACCINATION_DOSE_KIND_OPTIONS.map((kind) => (
              <option key={kind} value={kind}>
                {t(resolveDoseKindTextKey(kind))}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </>
  );
};

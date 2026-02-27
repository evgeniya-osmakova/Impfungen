import type { DoseKind, RepeatUnit } from '@backend/contracts';
import classNames from 'classnames';
import { type RefObject, type SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { INTERNAL_HOME_EMPTY_FIELD_VALUE } from 'src/constants/internalHomeUi';
import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from 'src/constants/ui';
import {
  VACCINATION_DOSE_KIND,
  VACCINATION_REPEAT_UNIT,
  VACCINATION_SCHEDULE_MODE,
} from 'src/constants/vaccination';
import { resolveLatestCompletedDose } from 'src/helpers/recordHelpers.ts';
import {
  buildVaccinationRecordInput,
  createEmptyPlannedDose,
} from 'src/helpers/vaccinationFormAdapter.ts';
import type { Disease } from 'src/interfaces/disease';
import type { PlannedDose } from 'src/interfaces/dose';
import type {
  ImmunizationSeries,
  ImmunizationSeriesInput,
  VaccinationScheduleMode,
} from 'src/interfaces/immunizationRecord';
import { Button } from 'src/ui';
import { getTodayIsoDate } from 'src/utils/date';
import { generateId } from 'src/utils/systemIdGenerator.ts';

import { VaccinationFormBaseFields } from './VaccinationFormBaseFields';
import { VaccinationFormScheduleFields } from './VaccinationFormScheduleFields';

import styles from './VaccinationForm.module.css';

interface VaccinationFormProps {
  diseases: readonly Disease[];
  diseaseFieldRef: RefObject<HTMLSelectElement | null>;
  errorKey: string | null;
  isInModal?: boolean;
  onCancelEdit: () => void;
  onSubmitRecord: (record: ImmunizationSeriesInput) => Promise<void>;
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
    return [{ ...createEmptyPlannedDose(generateId), dueAt: INTERNAL_HOME_EMPTY_FIELD_VALUE }];
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

  const [selectedDiseaseId, setSelectedDiseaseId] = useState(() =>
    resolveInitialDiseaseId(recordForEdit),
  );
  const [completedAt, setCompletedAt] = useState(
    latestCompletedDose?.completedAt ?? INTERNAL_HOME_EMPTY_FIELD_VALUE,
  );
  const [completedDoseKind, setCompletedDoseKind] = useState<DoseKind>(
    latestCompletedDose?.kind ?? VACCINATION_DOSE_KIND.nextDose,
  );
  const [tradeName, setTradeName] = useState(
    latestCompletedDose?.tradeName ?? INTERNAL_HOME_EMPTY_FIELD_VALUE,
  );
  const [batchNumber, setBatchNumber] = useState(
    latestCompletedDose?.batchNumber ?? INTERNAL_HOME_EMPTY_FIELD_VALUE,
  );
  const [scheduleMode, setScheduleMode] = useState(() => resolveInitialScheduleMode(recordForEdit));
  const [futureDueDoses, setFutureDueDoses] = useState(() =>
    resolveInitialFutureDoses(recordForEdit),
  );
  const [repeatInterval, setRepeatInterval] = useState(() =>
    resolveInitialRepeatInterval(recordForEdit),
  );
  const [repeatUnit, setRepeatUnit] = useState<RepeatUnit>(() =>
    resolveInitialRepeatUnit(recordForEdit),
  );
  const [repeatKind, setRepeatKind] = useState<DoseKind>(() =>
    resolveInitialRepeatKind(recordForEdit),
  );

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
  const submitLabel = isEditMode
    ? 'internal.form.actions.saveEdit'
    : 'internal.form.actions.saveAdd';
  const showUnavailableHint = !isEditMode && !hasDiseasesForAdd;

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    void onSubmitRecord(
      buildVaccinationRecordInput({
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
      }),
    );
  };

  const handleScheduleModeChange = (mode: VaccinationScheduleMode) => {
    setScheduleMode(mode);

    if (mode === VACCINATION_SCHEDULE_MODE.manual && futureDueDoses.length === 0) {
      setFutureDueDoses([
        { ...createEmptyPlannedDose(generateId), dueAt: INTERNAL_HOME_EMPTY_FIELD_VALUE },
      ]);
    }
  };

  const handleFutureDateChange = (id: string, value: string) => {
    setFutureDueDoses((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, dueAt: value } : entry)),
    );
  };

  const handleFutureKindChange = (id: string, kind: DoseKind) => {
    setFutureDueDoses((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, kind } : entry)),
    );
  };

  const handleAddFutureDate = () => {
    setFutureDueDoses((prev) => [
      ...prev,
      { ...createEmptyPlannedDose(generateId), dueAt: INTERNAL_HOME_EMPTY_FIELD_VALUE },
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
        <VaccinationFormBaseFields
          batchNumber={batchNumber}
          completedAt={completedAt}
          completedDoseKind={completedDoseKind}
          diseaseFieldRef={diseaseFieldRef}
          diseases={diseases}
          hasDiseasesForAdd={hasDiseasesForAdd}
          isEditMode={isEditMode}
          onBatchNumberChange={setBatchNumber}
          onCompletedAtChange={setCompletedAt}
          onCompletedDoseKindChange={setCompletedDoseKind}
          onSelectedDiseaseIdChange={setSelectedDiseaseId}
          onTradeNameChange={setTradeName}
          resolveDiseaseLabel={resolveDiseaseLabel}
          selectedDiseaseId={selectedDiseaseId}
          todayIsoDate={todayIsoDate}
          tradeName={tradeName}
        />

        <VaccinationFormScheduleFields
          completedAt={completedAt}
          futureDueDoses={futureDueDoses}
          onAddFutureDate={handleAddFutureDate}
          onFutureDateChange={handleFutureDateChange}
          onFutureKindChange={handleFutureKindChange}
          onRemoveFutureDate={handleRemoveFutureDate}
          onRepeatIntervalChange={setRepeatInterval}
          onRepeatKindChange={setRepeatKind}
          onRepeatUnitChange={setRepeatUnit}
          onScheduleModeChange={handleScheduleModeChange}
          repeatInterval={repeatInterval}
          repeatKind={repeatKind}
          repeatUnit={repeatUnit}
          scheduleMode={scheduleMode}
        />

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

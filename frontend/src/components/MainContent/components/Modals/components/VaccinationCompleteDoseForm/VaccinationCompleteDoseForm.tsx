import classNames from 'classnames';
import { type SyntheticEvent, useEffect, useState } from 'react';
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
  VACCINATION_DOSE_KIND_OPTIONS,
} from '../../../../../../constants/vaccination';
import type { DoseKind } from '../../../../../../interfaces/base';
import type { ImmunizationDoseInput } from '../../../../../../interfaces/immunizationRecord';
import { Button, Input, Select } from '../../../../../../ui';
import { getTodayIsoDate } from '../../../../../../utils/date';
import { normalizeOptionalText } from '../../../../../../utils/string';

import styles from './VaccinationCompleteDoseForm.module.css';

interface VaccinationCompleteDoseFormInitialValues {
  batchNumber: string | null;
  completedAt: string;
  kind: DoseKind;
  plannedDoseId: string | null;
  tradeName: string | null;
}

interface VaccinationCompleteDoseFormProps {
  diseaseId: string;
  errorKey: string | null;
  initialValues: VaccinationCompleteDoseFormInitialValues;
  isInModal?: boolean;
  isMarkPlannedFlow: boolean;
  onCancel: () => void;
  onSubmit: (record: ImmunizationDoseInput) => void;
}

const resolveDoseKindTextKey = (kind: DoseKind): string => `internal.doseKind.${kind}`;

export const VaccinationCompleteDoseForm = ({
  diseaseId,
  errorKey,
  initialValues,
  isInModal = false,
  isMarkPlannedFlow,
  onCancel,
  onSubmit,
}: VaccinationCompleteDoseFormProps) => {
  const { t } = useTranslation();
  const todayIsoDate = getTodayIsoDate();
  const [completedAt, setCompletedAt] = useState(initialValues.completedAt);
  const [kind, setKind] = useState<DoseKind>(initialValues.kind);
  const [tradeName, setTradeName] = useState(initialValues.tradeName ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);
  const [batchNumber, setBatchNumber] = useState(initialValues.batchNumber ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);

  useEffect(() => {
    setCompletedAt(initialValues.completedAt);
    setKind(initialValues.kind);
    setTradeName(initialValues.tradeName ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);
    setBatchNumber(initialValues.batchNumber ?? INTERNAL_HOME_EMPTY_FIELD_VALUE);
  }, [initialValues]);

  const canSubmit = Boolean(completedAt);

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      batchNumber: normalizeOptionalText(batchNumber),
      completedAt,
      diseaseId,
      kind,
      plannedDoseId: initialValues.plannedDoseId,
      tradeName: normalizeOptionalText(tradeName),
    });
  };

  return (
    <section
      className={classNames(
        styles.vaccinationCompleteDoseForm,
        isInModal && styles.vaccinationCompleteDoseFormInModal,
      )}
    >
      <header className={styles.vaccinationCompleteDoseForm__header}>
        <h2 className={styles.vaccinationCompleteDoseForm__title}>
          {isMarkPlannedFlow ? t('internal.form.actions.markPlannedDone') : t('internal.form.actions.addDose')}
        </h2>
        <p className={styles.vaccinationCompleteDoseForm__subtitle}>{t('internal.form.markDoneSubtitle')}</p>
      </header>
      <form className={styles.vaccinationCompleteDoseForm__body} onSubmit={handleSubmit}>
        <label
          className={styles.vaccinationCompleteDoseForm__fieldLabel}
          htmlFor={INTERNAL_HOME_FORM_FIELD_ID.markDoneCompletedAt}
        >
          {t('internal.form.fields.completedAt')}
        </label>
        <Input
          className={styles.vaccinationCompleteDoseForm__fieldControl}
          id={INTERNAL_HOME_FORM_FIELD_ID.markDoneCompletedAt}
          max={todayIsoDate}
          onChange={(event) => setCompletedAt(event.target.value)}
          required
          type={HTML_INPUT_TYPE.date}
          value={completedAt}
        />

        <label
          className={styles.vaccinationCompleteDoseForm__fieldLabel}
          htmlFor={INTERNAL_HOME_FORM_FIELD_ID.markDoneKind}
        >
          {t('internal.form.fields.completedDoseKind')}
        </label>
        <Select
          className={styles.vaccinationCompleteDoseForm__fieldControl}
          id={INTERNAL_HOME_FORM_FIELD_ID.markDoneKind}
          onChange={(event) => setKind(event.target.value as DoseKind)}
          value={kind}
        >
          {VACCINATION_DOSE_KIND_OPTIONS.map((doseKind) => (
            <option key={doseKind} value={doseKind}>
              {t(resolveDoseKindTextKey(doseKind))}
            </option>
          ))}
        </Select>

        <label
          className={styles.vaccinationCompleteDoseForm__fieldLabel}
          htmlFor={INTERNAL_HOME_FORM_FIELD_ID.markDoneTradeName}
        >
          {t('internal.form.fields.tradeName')}
        </label>
        <Input
          className={styles.vaccinationCompleteDoseForm__fieldControl}
          id={INTERNAL_HOME_FORM_FIELD_ID.markDoneTradeName}
          onChange={(event) => setTradeName(event.target.value)}
          type={HTML_INPUT_TYPE.text}
          value={tradeName}
        />

        <label
          className={styles.vaccinationCompleteDoseForm__fieldLabel}
          htmlFor={INTERNAL_HOME_FORM_FIELD_ID.markDoneBatchNumber}
        >
          {t('internal.form.fields.batchNumber')}
        </label>
        <Input
          className={styles.vaccinationCompleteDoseForm__fieldControl}
          id={INTERNAL_HOME_FORM_FIELD_ID.markDoneBatchNumber}
          onChange={(event) => setBatchNumber(event.target.value)}
          type={HTML_INPUT_TYPE.text}
          value={batchNumber}
        />

        {errorKey && <p className={styles.vaccinationCompleteDoseForm__error}>{t(errorKey)}</p>}

        <div className={styles.vaccinationCompleteDoseForm__actions}>
          <Button
            className={styles.vaccinationCompleteDoseForm__actionButton}
            disabled={!canSubmit}
            fullWidth
            type={HTML_BUTTON_TYPE.submit}
            variant={BUTTON_VARIANT.primary}
          >
            {t('internal.form.actions.saveCompletedDose')}
          </Button>
          <Button
            className={styles.vaccinationCompleteDoseForm__actionButton}
            fullWidth
            onClick={onCancel}
            type={HTML_BUTTON_TYPE.button}
            variant={BUTTON_VARIANT.secondary}
          >
            {t('internal.form.actions.cancelEdit')}
          </Button>
        </div>
      </form>
    </section>
  );
};

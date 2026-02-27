import type { DoseKind } from '@backend/contracts';
import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import {
  INTERNAL_HOME_EMPTY_FIELD_VALUE,
  INTERNAL_HOME_FORM_FIELD_ID,
} from 'src/constants/internalHomeUi';
import { HTML_INPUT_TYPE } from 'src/constants/ui';
import { VACCINATION_DOSE_KIND_OPTIONS } from 'src/constants/vaccination';
import type { Disease } from 'src/interfaces/disease';
import { Input, Select } from 'src/ui';

import styles from './VaccinationForm.module.css';

interface VaccinationFormBaseFieldsProps {
  batchNumber: string;
  completedAt: string;
  completedDoseKind: DoseKind;
  diseaseFieldRef: RefObject<HTMLSelectElement | null>;
  diseases: readonly Disease[];
  hasDiseasesForAdd: boolean;
  isEditMode: boolean;
  onBatchNumberChange: (value: string) => void;
  onCompletedAtChange: (value: string) => void;
  onCompletedDoseKindChange: (kind: DoseKind) => void;
  onSelectedDiseaseIdChange: (diseaseId: string) => void;
  onTradeNameChange: (value: string) => void;
  resolveDiseaseLabel: (disease: Disease) => string;
  selectedDiseaseId: string;
  todayIsoDate: string;
  tradeName: string;
}

const resolveDoseKindTextKey = (kind: DoseKind): string => `internal.doseKind.${kind}`;

export const VaccinationFormBaseFields = ({
  batchNumber,
  completedAt,
  completedDoseKind,
  diseaseFieldRef,
  diseases,
  hasDiseasesForAdd,
  isEditMode,
  onBatchNumberChange,
  onCompletedAtChange,
  onCompletedDoseKindChange,
  onSelectedDiseaseIdChange,
  onTradeNameChange,
  resolveDiseaseLabel,
  selectedDiseaseId,
  todayIsoDate,
  tradeName,
}: VaccinationFormBaseFieldsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <label
        className={styles.vaccinationForm__fieldLabel}
        htmlFor={INTERNAL_HOME_FORM_FIELD_ID.disease}
      >
        {t('internal.form.fields.disease')}
      </label>
      <Select
        className={styles.vaccinationForm__fieldControl}
        disabled={isEditMode || !hasDiseasesForAdd}
        id={INTERNAL_HOME_FORM_FIELD_ID.disease}
        onChange={(event) => onSelectedDiseaseIdChange(event.target.value)}
        ref={diseaseFieldRef}
        value={selectedDiseaseId}
      >
        {!isEditMode ? (
          <option disabled value={INTERNAL_HOME_EMPTY_FIELD_VALUE}>
            {t('internal.form.fields.diseasePlaceholder')}
          </option>
        ) : null}
        {diseases.map((disease) => (
          <option key={disease.id} value={disease.id}>
            {resolveDiseaseLabel(disease)}
          </option>
        ))}
      </Select>

      <label
        className={styles.vaccinationForm__fieldLabel}
        htmlFor={INTERNAL_HOME_FORM_FIELD_ID.completedAt}
      >
        {t('internal.form.fields.completedAt')}
      </label>
      <Input
        className={styles.vaccinationForm__fieldControl}
        id={INTERNAL_HOME_FORM_FIELD_ID.completedAt}
        max={todayIsoDate}
        onChange={(event) => onCompletedAtChange(event.target.value)}
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
      <Select
        className={styles.vaccinationForm__fieldControl}
        id={INTERNAL_HOME_FORM_FIELD_ID.completedDoseKind}
        onChange={(event) => onCompletedDoseKindChange(event.target.value as DoseKind)}
        value={completedDoseKind}
      >
        {VACCINATION_DOSE_KIND_OPTIONS.map((kind) => (
          <option key={kind} value={kind}>
            {t(resolveDoseKindTextKey(kind))}
          </option>
        ))}
      </Select>

      <label
        className={styles.vaccinationForm__fieldLabel}
        htmlFor={INTERNAL_HOME_FORM_FIELD_ID.tradeName}
      >
        {t('internal.form.fields.tradeName')}
      </label>
      <Input
        className={styles.vaccinationForm__fieldControl}
        id={INTERNAL_HOME_FORM_FIELD_ID.tradeName}
        onChange={(event) => onTradeNameChange(event.target.value)}
        type={HTML_INPUT_TYPE.text}
        value={tradeName}
      />

      <label
        className={styles.vaccinationForm__fieldLabel}
        htmlFor={INTERNAL_HOME_FORM_FIELD_ID.batchNumber}
      >
        {t('internal.form.fields.batchNumber')}
      </label>
      <Input
        className={styles.vaccinationForm__fieldControl}
        id={INTERNAL_HOME_FORM_FIELD_ID.batchNumber}
        onChange={(event) => onBatchNumberChange(event.target.value)}
        type={HTML_INPUT_TYPE.text}
        value={batchNumber}
      />
    </>
  );
};

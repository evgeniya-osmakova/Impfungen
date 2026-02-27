import { VACCINATION_VALIDATION_ERROR_CODE } from 'src/constants/vaccinationValidation.ts';
import { sortCompletedDoses } from 'src/helpers/recordHelpers.ts';
import type { CompletedDose } from 'src/interfaces/dose.ts';
import type {
  ImmunizationDoseInput,
  ImmunizationSeriesInput,
} from 'src/interfaces/immunizationRecord.ts';
import type { VaccinationState } from 'src/interfaces/vaccinationState.ts';
import type { VaccinationValidationErrorCode } from 'src/interfaces/validation.ts';
import { getNowISODateTime } from 'src/utils/getNowISODateTime.ts';
import { normalizeOptionalText } from 'src/utils/string.ts';
import { generateId } from 'src/utils/systemIdGenerator.ts';
import { normalizeFutureDueDoses } from 'src/utils/vaccinationSchedule.ts';
import {
  validateVaccinationCompleteDoseInput,
  validateVaccinationRecordInput,
} from 'src/utils/vaccinationValidation.ts';

interface ValidationOutcome {
  errorCode: VaccinationValidationErrorCode | null;
  records: VaccinationState['records'] | null;
}

const resolveEditedCompletedDoses = (
  prevCompletedDoses: readonly CompletedDose[],
  input: ImmunizationSeriesInput,
): CompletedDose[] => {
  if (prevCompletedDoses.length === 0) {
    return [
      {
        batchNumber: normalizeOptionalText(input.batchNumber),
        completedAt: input.completedAt,
        id: generateId(),
        kind: input.completedDoseKind,
        tradeName: normalizeOptionalText(input.tradeName),
      },
    ];
  }

  const sortedCompletedDoses = sortCompletedDoses(prevCompletedDoses);
  const latestDose = sortedCompletedDoses[sortedCompletedDoses.length - 1];

  if (!latestDose) {
    return sortedCompletedDoses;
  }

  return sortCompletedDoses(
    sortedCompletedDoses.map((dose) => {
      if (dose.id !== latestDose.id) {
        return dose;
      }

      return {
        ...dose,
        batchNumber: normalizeOptionalText(input.batchNumber),
        completedAt: input.completedAt,
        kind: input.completedDoseKind,
        tradeName: normalizeOptionalText(input.tradeName),
      };
    }),
  );
};

export const upsertRecordUseCase = (
  records: readonly VaccinationState['records'][number][],
  input: ImmunizationSeriesInput,
): VaccinationState['records'] => {
  const existingRecord = records.find((record) => record.diseaseId === input.diseaseId);
  const nextUpdatedAt = getNowISODateTime();

  const nextCompletedDoses = existingRecord
    ? resolveEditedCompletedDoses(existingRecord.completedDoses, input)
    : [
        {
          batchNumber: normalizeOptionalText(input.batchNumber),
          completedAt: input.completedAt,
          id: generateId(),
          kind: input.completedDoseKind,
          tradeName: normalizeOptionalText(input.tradeName),
        },
      ];

  const nextRecord = {
    completedDoses: sortCompletedDoses(nextCompletedDoses),
    diseaseId: input.diseaseId,
    futureDueDoses: normalizeFutureDueDoses(input.futureDueDoses),
    repeatEvery: input.repeatEvery ? { ...input.repeatEvery } : null,
    updatedAt: nextUpdatedAt,
  };

  if (!existingRecord) {
    return [...records, nextRecord];
  }

  return records.map((record) => (record.diseaseId === input.diseaseId ? nextRecord : record));
};

const resolveRecordsWithCompletedDose = (
  records: readonly VaccinationState['records'][number][],
  input: ImmunizationDoseInput,
): VaccinationState['records'] =>
  records.map((record) => {
    if (record.diseaseId !== input.diseaseId) {
      return record;
    }

    const nextUpdatedAt = getNowISODateTime();

    const nextCompletedDose: CompletedDose = {
      batchNumber: normalizeOptionalText(input.batchNumber),
      completedAt: input.completedAt,
      id: generateId(),
      kind: input.kind,
      tradeName: normalizeOptionalText(input.tradeName),
    };

    const nextFutureDueDoses = input.plannedDoseId
      ? record.futureDueDoses.filter((dose) => dose.id !== input.plannedDoseId)
      : record.futureDueDoses;

    return {
      ...record,
      completedDoses: sortCompletedDoses([...record.completedDoses, nextCompletedDose]),
      futureDueDoses: nextFutureDueDoses,
      updatedAt: nextUpdatedAt,
    };
  });

export const submitRecordUseCase = (
  records: readonly VaccinationState['records'][number][],
  recordInput: ImmunizationSeriesInput,
): ValidationOutcome => {
  const validationResult = validateVaccinationRecordInput(recordInput);

  if (!validationResult.isValid) {
    return {
      errorCode: validationResult.errorCode,
      records: null,
    };
  }

  return {
    errorCode: null,
    records: upsertRecordUseCase(records, recordInput),
  };
};

export const submitCompletedDoseUseCase = (
  records: readonly VaccinationState['records'][number][],
  recordInput: ImmunizationDoseInput,
): ValidationOutcome => {
  const validationResult = validateVaccinationCompleteDoseInput(recordInput);

  if (!validationResult.isValid) {
    return {
      errorCode: validationResult.errorCode,
      records: null,
    };
  }

  const hasTargetRecord = records.some((record) => record.diseaseId === recordInput.diseaseId);

  if (!hasTargetRecord) {
    return {
      errorCode: VACCINATION_VALIDATION_ERROR_CODE.disease_required,
      records: null,
    };
  }

  return {
    errorCode: null,
    records: resolveRecordsWithCompletedDose(records, recordInput),
  };
};

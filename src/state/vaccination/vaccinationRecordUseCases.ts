import type { VaccinationAppState } from './vaccinationAppState';
import { VACCINATION_VALIDATION_ERROR_CODE } from '../../constants/vaccinationValidation';
import { sortCompletedDoses } from '../../domain/vaccination/recordHelpers';
import type { CompletedDose } from '../../interfaces/dose';
import type {
  ImmunizationDoseInput,
  ImmunizationSeriesInput,
} from '../../interfaces/immunizationRecord';
import { normalizeOptionalText } from '../../utils/string';
import { normalizeFutureDueDoses } from '../../utils/vaccinationSchedule';
import {
  type VaccinationValidationErrorCode,
  validateVaccinationCompleteDoseInput,
  validateVaccinationRecordInput,
} from '../../utils/vaccinationValidation';

export interface VaccinationRecordUseCaseDependencies {
  createDoseId: () => string;
  getNowIsoDateTime: () => string;
}

export interface ValidationOutcome {
  errorCode: VaccinationValidationErrorCode | null;
  records: VaccinationAppState['records'] | null;
}

export const removeRecordUseCase = (
  records: readonly VaccinationAppState['records'][number][],
  diseaseId: string,
): VaccinationAppState['records'] =>
  records.filter((record) => record.diseaseId !== diseaseId);

export const startEditRecordUseCase = (
  records: readonly VaccinationAppState['records'][number][],
  diseaseId: string,
): string | null => {
  const recordExists = records.some((record) => record.diseaseId === diseaseId);

  return recordExists ? diseaseId : null;
};

const resolveEditedCompletedDoses = (
  prevCompletedDoses: readonly CompletedDose[],
  input: ImmunizationSeriesInput,
  createDoseId: () => string,
): CompletedDose[] => {
  if (prevCompletedDoses.length === 0) {
    return [{
      batchNumber: normalizeOptionalText(input.batchNumber),
      completedAt: input.completedAt,
      id: createDoseId(),
      kind: input.completedDoseKind,
      tradeName: normalizeOptionalText(input.tradeName),
    }];
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
  records: readonly VaccinationAppState['records'][number][],
  input: ImmunizationSeriesInput,
  { createDoseId, getNowIsoDateTime }: VaccinationRecordUseCaseDependencies,
): VaccinationAppState['records'] => {
  const existingRecord = records.find((record) => record.diseaseId === input.diseaseId);
  const nextUpdatedAt = getNowIsoDateTime();

  const nextCompletedDoses = existingRecord
    ? resolveEditedCompletedDoses(existingRecord.completedDoses, input, createDoseId)
    : [{
        batchNumber: normalizeOptionalText(input.batchNumber),
        completedAt: input.completedAt,
        id: createDoseId(),
        kind: input.completedDoseKind,
        tradeName: normalizeOptionalText(input.tradeName),
      }];

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
  records: readonly VaccinationAppState['records'][number][],
  input: ImmunizationDoseInput,
  { createDoseId, getNowIsoDateTime }: VaccinationRecordUseCaseDependencies,
): VaccinationAppState['records'] => records.map((record) => {
  if (record.diseaseId !== input.diseaseId) {
    return record;
  }

  const nextUpdatedAt = getNowIsoDateTime();

  const nextCompletedDose: CompletedDose = {
    batchNumber: normalizeOptionalText(input.batchNumber),
    completedAt: input.completedAt,
    id: createDoseId(),
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
  records: readonly VaccinationAppState['records'][number][],
  recordInput: ImmunizationSeriesInput,
  deps: VaccinationRecordUseCaseDependencies,
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
    records: upsertRecordUseCase(records, recordInput, deps),
  };
};

export const submitCompletedDoseUseCase = (
  records: readonly VaccinationAppState['records'][number][],
  recordInput: ImmunizationDoseInput,
  deps: VaccinationRecordUseCaseDependencies,
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
    records: resolveRecordsWithCompletedDose(records, recordInput, deps),
  };
};

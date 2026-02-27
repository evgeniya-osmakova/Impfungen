import { VACCINATION_VALIDATION_ERROR_CODE } from 'src/constants/vaccinationValidation.ts';
import { resolveLatestCompletedDose } from 'src/helpers/recordHelpers.ts';
import type { CountryCode } from 'src/interfaces/base.ts';
import type {
  ImmunizationDoseInput,
  ImmunizationSeriesInput,
} from 'src/interfaces/immunizationRecord.ts';
import type { VaccinationState } from 'src/interfaces/vaccinationState.ts';
import { VaccinationValidationErrorCode } from 'src/interfaces/validation.ts';

import { useAccountsStore } from '../accounts';

import { isTrpcConflictError } from './errors.ts';
import { useVaccinationStore } from './index';
import {
  persistCompletedDose,
  persistRemovedRecord,
  persistSubmittedRecord,
  persistVaccinationCountry,
} from './persistence.ts';
import {
  submitCompletedDoseUseCase,
  submitRecordUseCase,
} from './vaccinationRecordUseCases.ts';

const resolveUpdatedRecord = (
  diseaseId: string,
  records: readonly VaccinationState['records'][number][],
) => {
  const updatedRecord = records.find((record) => record.diseaseId === diseaseId);

  if (!updatedRecord) {
    throw new Error(`Unable to resolve updated record for disease ${diseaseId}.`);
  }

  return updatedRecord;
};

const resolveNewCompletedDoseId = (
  previousRecord: VaccinationState['records'][number] | undefined,
  nextRecord: VaccinationState['records'][number],
): string | null => {
  const previousDoseIds = new Set((previousRecord?.completedDoses ?? []).map((dose) => dose.id));

  return nextRecord.completedDoses.find((dose) => !previousDoseIds.has(dose.id))?.id ?? null;
};

const resolveSubmitRecordCompletedDoseId = (
  previousRecord: VaccinationState['records'][number] | undefined,
  nextRecord: VaccinationState['records'][number],
): string | null => {
  const previousLatestDose = previousRecord
    ? resolveLatestCompletedDose(previousRecord.completedDoses)
    : null;

  if (previousLatestDose) {
    return previousLatestDose.id;
  }

  return resolveNewCompletedDoseId(previousRecord, nextRecord);
};

interface VaccinationCommands {
  removeRecord: (diseaseId: string) => Promise<boolean>;
  setCountry: (country: CountryCode) => Promise<void>;
  submitCompletedDose: (record: ImmunizationDoseInput) => Promise<VaccinationValidationErrorCode | null>;
  submitRecord: (record: ImmunizationSeriesInput) => Promise<VaccinationValidationErrorCode | null>;
}

export const useVaccinationCommands = (): VaccinationCommands => {
  const activeAccountId = useVaccinationStore((state) => state.activeAccountId);
  const records = useVaccinationStore((state) => state.records);
  const replaceRecords = useVaccinationStore((state) => state.replaceRecords);
  const setCountryLocal = useVaccinationStore((state) => state.setCountryLocal);

  const removeRecord: VaccinationCommands['removeRecord'] = async (diseaseId) => {
    if (activeAccountId === null) {
      return false;
    }

    try {
      const snapshot = await persistRemovedRecord({
        accountId: activeAccountId,
        diseaseId,
      });

      if (snapshot) {
        useAccountsStore.getState().replaceFromProfileSnapshot(snapshot);

        return true;
      }

      replaceRecords(records.filter((record) => record.diseaseId !== diseaseId));

      return true;
    } catch (error) {
      console.error('Unable to delete vaccination record.', error);

      return false;
    }
  };

  const setCountry: VaccinationCommands['setCountry'] = async (country) => {
    if (activeAccountId === null) {
      return;
    }

    const snapshot = await persistVaccinationCountry({
      accountId: activeAccountId,
      country,
    });

    if (snapshot) {
      useAccountsStore.getState().replaceFromProfileSnapshot(snapshot);

      return;
    }

    setCountryLocal(country);
  };

  const submitCompletedDose: VaccinationCommands['submitCompletedDose'] = async (recordInput) => {
    const currentRecords = records;
    const currentRecord = currentRecords.find((record) => record.diseaseId === recordInput.diseaseId);
    const submissionResult = submitCompletedDoseUseCase(currentRecords, recordInput);

    if (submissionResult.errorCode || !submissionResult.records) {
      return submissionResult.errorCode;
    }

    try {
      const nextRecord = resolveUpdatedRecord(recordInput.diseaseId, submissionResult.records);
      const newDoseId = resolveNewCompletedDoseId(currentRecord, nextRecord);

      if (!newDoseId) {
        throw new Error(`Unable to resolve new completed dose id for disease ${recordInput.diseaseId}.`);
      }

      const snapshot = await persistCompletedDose({
        accountId: activeAccountId,
        doseId: newDoseId,
        doseInput: recordInput,
        expectedUpdatedAt: currentRecord?.updatedAt ?? null,
      });

      if (snapshot) {
        useAccountsStore.getState().replaceFromProfileSnapshot(snapshot);
      } else {
        replaceRecords(submissionResult.records);
      }
    } catch (error) {
      if (isTrpcConflictError(error)) {
        return VACCINATION_VALIDATION_ERROR_CODE.sync_conflict;
      }

      console.error('Unable to save completed dose.', error);

      return VACCINATION_VALIDATION_ERROR_CODE.save_failed;
    }

    return null;
  };

  const submitRecord: VaccinationCommands['submitRecord'] = async (recordInput) => {
    const currentRecords = records;
    const currentRecord = currentRecords.find((record) => record.diseaseId === recordInput.diseaseId);
    const submissionResult = submitRecordUseCase(currentRecords, recordInput);

    if (submissionResult.errorCode || !submissionResult.records) {
      return submissionResult.errorCode;
    }

    try {
      const nextRecord = resolveUpdatedRecord(recordInput.diseaseId, submissionResult.records);
      const completedDoseId = resolveSubmitRecordCompletedDoseId(currentRecord, nextRecord);
      const snapshot = await persistSubmittedRecord({
        accountId: activeAccountId,
        completedDoseId,
        expectedUpdatedAt: currentRecord?.updatedAt ?? null,
        recordInput,
      });

      if (snapshot) {
        useAccountsStore.getState().replaceFromProfileSnapshot(snapshot);
      } else {
        replaceRecords(submissionResult.records);
      }
    } catch (error) {
      if (isTrpcConflictError(error)) {
        return VACCINATION_VALIDATION_ERROR_CODE.sync_conflict;
      }

      console.error('Unable to save vaccination record.', error);

      return VACCINATION_VALIDATION_ERROR_CODE.save_failed;
    }

    return null;
  };

  return {
    removeRecord,
    setCountry,
    submitCompletedDose,
    submitRecord,
  };
};

import { VACCINATION_VALIDATION_ERROR_CODE } from 'src/constants/vaccinationValidation.ts';
import type { CountryCode } from 'src/interfaces/base.ts';
import type {
  ImmunizationDoseInput,
  ImmunizationDoseUpdateInput,
  ImmunizationSeriesInput,
} from 'src/interfaces/immunizationRecord.ts';
import type { VaccinationValidationErrorCode } from 'src/interfaces/validation.ts';
import { useAccountsStore } from 'src/state/accounts';

import { isTrpcConflictError } from './errors.ts';
import { useVaccinationStore } from './index';
import {
  persistCompletedDose,
  persistRemovedDose,
  persistRemovedRecord,
  persistSubmittedRecord,
  persistUpdatedDose,
  persistVaccinationCountry,
} from './persistence.ts';
import {
  resolveNewCompletedDoseId,
  resolveSubmitRecordCompletedDoseId,
  resolveUpdatedRecord,
} from './recordResolution.ts';
import {
  removeCompletedDoseUseCase,
  submitCompletedDoseUseCase,
  submitRecordUseCase,
  updateCompletedDoseUseCase,
} from './vaccinationRecordUseCases.ts';

interface VaccinationCommands {
  removeCompletedDose: (payload: { diseaseId: string; doseId: string }) => Promise<boolean>;
  removeRecord: (diseaseId: string) => Promise<boolean>;
  setCountry: (country: CountryCode) => Promise<void>;
  submitCompletedDose: (
    record: ImmunizationDoseInput,
  ) => Promise<VaccinationValidationErrorCode | null>;
  submitRecord: (record: ImmunizationSeriesInput) => Promise<VaccinationValidationErrorCode | null>;
  updateCompletedDose: (
    record: ImmunizationDoseUpdateInput,
  ) => Promise<VaccinationValidationErrorCode | null>;
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

  const removeCompletedDose: VaccinationCommands['removeCompletedDose'] = async ({
    diseaseId,
    doseId,
  }) => {
    const currentRecords = records;
    const currentRecord = currentRecords.find((record) => record.diseaseId === diseaseId);
    const removalResult = removeCompletedDoseUseCase(currentRecords, { diseaseId, doseId });

    if (removalResult.errorCode || !removalResult.records) {
      return false;
    }

    try {
      const snapshot = await persistRemovedDose({
        accountId: activeAccountId,
        diseaseId,
        doseId,
        expectedUpdatedAt: currentRecord?.updatedAt ?? null,
      });

      if (snapshot) {
        useAccountsStore.getState().replaceFromProfileSnapshot(snapshot);
      } else {
        replaceRecords(removalResult.records);
      }

      return true;
    } catch (error) {
      console.error('Unable to remove completed dose.', error);

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
    const currentRecord = currentRecords.find(
      (record) => record.diseaseId === recordInput.diseaseId,
    );
    const submissionResult = submitCompletedDoseUseCase(currentRecords, recordInput);

    if (submissionResult.errorCode || !submissionResult.records) {
      return submissionResult.errorCode;
    }

    try {
      const nextRecord = resolveUpdatedRecord(recordInput.diseaseId, submissionResult.records);
      const newDoseId = resolveNewCompletedDoseId(currentRecord, nextRecord);

      if (!newDoseId) {
        console.error(
          `Unable to resolve new completed dose id for disease ${recordInput.diseaseId}.`,
        );

        return VACCINATION_VALIDATION_ERROR_CODE.save_failed;
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
    const currentRecord = currentRecords.find(
      (record) => record.diseaseId === recordInput.diseaseId,
    );
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

  const updateCompletedDose: VaccinationCommands['updateCompletedDose'] = async (recordInput) => {
    const currentRecords = records;
    const currentRecord = currentRecords.find(
      (record) => record.diseaseId === recordInput.diseaseId,
    );
    const updateResult = updateCompletedDoseUseCase(currentRecords, recordInput);

    if (updateResult.errorCode || !updateResult.records) {
      return updateResult.errorCode;
    }

    try {
      const snapshot = await persistUpdatedDose({
        accountId: activeAccountId,
        doseInput: recordInput,
        expectedUpdatedAt: currentRecord?.updatedAt ?? null,
      });

      if (snapshot) {
        useAccountsStore.getState().replaceFromProfileSnapshot(snapshot);
      } else {
        replaceRecords(updateResult.records);
      }
    } catch (error) {
      if (isTrpcConflictError(error)) {
        return VACCINATION_VALIDATION_ERROR_CODE.sync_conflict;
      }

      console.error('Unable to update completed dose.', error);

      return VACCINATION_VALIDATION_ERROR_CODE.save_failed;
    }

    return null;
  };

  return {
    removeCompletedDose,
    removeRecord,
    setCountry,
    submitCompletedDose,
    submitRecord,
    updateCompletedDose,
  };
};

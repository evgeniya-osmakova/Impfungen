import { getProfileApi } from 'src/api/profileApi.ts'
import { VACCINATION_VALIDATION_ERROR_CODE } from 'src/constants/vaccinationValidation.ts';
import { resolveLatestCompletedDose } from 'src/helpers/recordHelpers.ts';
import type { VaccinationState, VaccinationStoreState } from 'src/interfaces/vaccinationState.ts'
import { VaccinationValidationErrorCode } from 'src/interfaces/validation.ts'
import {
  submitCompletedDoseUseCase,
  submitRecordUseCase,
} from 'src/state/vaccination/vaccinationRecordUseCases.ts'
import { create } from 'zustand';

import {
  VACCINATION_DEFAULT_CATEGORY_FILTER,
  VACCINATION_DEFAULT_SEARCH_QUERY,
} from '../../constants/vaccination';
import type { CategoryFilter, CountryCode } from '../../interfaces/base';
import type {
  ImmunizationDoseInput,
  ImmunizationSeriesInput,
} from '../../interfaces/immunizationRecord'

interface VaccinationStore extends VaccinationStoreState {
  activeAccountId: number | null;
  cancelEdit: () => void;
  removeRecord: (diseaseId: string) => Promise<void>;
  setActiveAccountId: (accountId: number | null) => void;
  setCategoryFilter: (categoryFilter: CategoryFilter) => void;
  setCountry: (country: CountryCode) => Promise<void>;
  setSearchQuery: (searchQuery: string) => void;
  setVaccinationStoreState: (store: VaccinationState) => void;
  submitCompletedDose: (record: ImmunizationDoseInput) => Promise<VaccinationValidationErrorCode | null>;
  submitRecord: (record: ImmunizationSeriesInput) => Promise<VaccinationValidationErrorCode | null>;
  startEditRecord: (diseaseId: string) => void;
}

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

const applyServerUpdatedAt = (
  records: readonly VaccinationState['records'][number][],
  diseaseId: string,
  updatedAt: string,
): VaccinationState['records'] =>
  records.map((record) => (
    record.diseaseId === diseaseId
      ? { ...record, updatedAt }
      : record
  ));

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

const persistSubmittedRecord = async (
  accountId: number | null,
  recordInput: ImmunizationSeriesInput,
  expectedUpdatedAt: string | null,
  completedDoseId: string | null,
): Promise<string | null> => {
  const api = getProfileApi();

  if (!api || accountId === null) {
    return null;
  }

  const result = await api.submitVaccinationRecord({
    accountId,
    ...recordInput,
    completedDoseId,
    expectedUpdatedAt,
  });

  return result.updatedAt;
};

const persistCompletedDose = async (
  accountId: number | null,
  doseInput: ImmunizationDoseInput,
  expectedUpdatedAt: string | null,
  doseId: string,
): Promise<string | null> => {
  const api = getProfileApi();

  if (!api || accountId === null) {
    return null;
  }

  const result = await api.completeVaccinationDose({
    accountId,
    ...doseInput,
    doseId,
    expectedUpdatedAt,
  });

  return result.updatedAt;
};

const isTrpcConflictError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const errorWithData = error as { data?: { code?: string } };

  return errorWithData.data?.code === 'CONFLICT';
};

export const useVaccinationStore =
  create<VaccinationStore>((set, get) => ({
    activeAccountId: null,
    country: null,
    records: [],
    categoryFilter: VACCINATION_DEFAULT_CATEGORY_FILTER,
    editingDiseaseId: null,
    searchQuery: VACCINATION_DEFAULT_SEARCH_QUERY,
    cancelEdit: () => set({ editingDiseaseId: null }),
    removeRecord: async (diseaseId) => {
      const state = get();
      const accountId = state.activeAccountId;
      const nextState = {
        editingDiseaseId: state.editingDiseaseId === diseaseId ? null : state.editingDiseaseId,
        records: state.records.filter((record) => record.diseaseId !== diseaseId),
      };
      const api = getProfileApi();

      if (accountId === null) {
        return;
      }

      await api?.removeVaccinationRecord({ accountId, diseaseId });
      set(nextState);
    },
    setActiveAccountId: (activeAccountId) => {
      set({ activeAccountId });
    },
    setCategoryFilter: (categoryFilter) => {
      set({ categoryFilter });
    },
    setCountry: async (country) => {
      const api = getProfileApi();
      const accountId = get().activeAccountId;

      if (accountId === null) {
        return;
      }

      await api?.setVaccinationCountry({ accountId, country });
      set({ country });
    },
    setSearchQuery: (searchQuery) => {
      set({ searchQuery });
    },
    setVaccinationStoreState: (store) => {
      set(store);
    },
    submitCompletedDose: async (recordInput) => {
      const currentRecords = get().records;
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

        const persistedUpdatedAt = await persistCompletedDose(
          get().activeAccountId,
          recordInput,
          currentRecord?.updatedAt ?? null,
          newDoseId,
        );

        const records = persistedUpdatedAt
          ? applyServerUpdatedAt(submissionResult.records, recordInput.diseaseId, persistedUpdatedAt)
          : submissionResult.records;

        set({ records });
      } catch (error) {
        if (isTrpcConflictError(error)) {
          return VACCINATION_VALIDATION_ERROR_CODE.sync_conflict;
        }

        throw error;
      }

      return null;
    },
    submitRecord: async (recordInput) => {
      const currentRecords = get().records;
      const currentRecord = currentRecords.find((record) => record.diseaseId === recordInput.diseaseId);
      const submissionResult = submitRecordUseCase(currentRecords, recordInput);

      if (submissionResult.errorCode || !submissionResult.records) {
        return submissionResult.errorCode;
      }

      try {
        const nextRecord = resolveUpdatedRecord(recordInput.diseaseId, submissionResult.records);
        const completedDoseId = resolveSubmitRecordCompletedDoseId(currentRecord, nextRecord);
        const persistedUpdatedAt = await persistSubmittedRecord(
          get().activeAccountId,
          recordInput,
          currentRecord?.updatedAt ?? null,
          completedDoseId,
        );

        const records = persistedUpdatedAt
          ? applyServerUpdatedAt(submissionResult.records, recordInput.diseaseId, persistedUpdatedAt)
          : submissionResult.records;

        set({
          editingDiseaseId: null,
          records,
        });
      } catch (error) {
        if (isTrpcConflictError(error)) {
          return VACCINATION_VALIDATION_ERROR_CODE.sync_conflict;
        }

        throw error;
      }

      return null;
    },
    startEditRecord: (diseaseId) => {
      const recordExists = get().records.some((record) => record.diseaseId === diseaseId);

      if (!recordExists) {
        return;
      }

      set({ editingDiseaseId: diseaseId });
    },
  }));

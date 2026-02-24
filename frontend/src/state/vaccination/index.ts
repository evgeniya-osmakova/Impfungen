import { getProfileApi } from 'src/api/profileApi.ts'
import { VACCINATION_VALIDATION_ERROR_CODE } from 'src/constants/vaccinationValidation.ts';
import type { VaccinationState, VaccinationStoreState } from 'src/interfaces/vaccinationState.ts'
import { VaccinationValidationErrorCode } from 'src/interfaces/validation.ts'
import {
  submitCompletedDoseUseCase,
  submitRecordUseCase, upsertRecordUseCase,
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
  upsertRecord: (record: ImmunizationSeriesInput) => Promise<void>;
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

const persistUpdatedRecord = async (
  accountId: number | null,
  diseaseId: string,
  records: readonly VaccinationState['records'][number][],
  expectedUpdatedAt: string | null,
): Promise<string | null> => {
  const api = getProfileApi();

  if (!api || accountId === null) {
    return null;
  }

  const result = await api.upsertVaccinationRecord({
    accountId,
    ...resolveUpdatedRecord(diseaseId, records),
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
        const persistedUpdatedAt = await persistUpdatedRecord(
          get().activeAccountId,
          recordInput.diseaseId,
          submissionResult.records,
          currentRecord?.updatedAt ?? null,
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
        const persistedUpdatedAt = await persistUpdatedRecord(
          get().activeAccountId,
          recordInput.diseaseId,
          submissionResult.records,
          currentRecord?.updatedAt ?? null,
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
    upsertRecord: async (recordInput) => {
      const state = get();
      const currentRecord = state.records.find((record) => record.diseaseId === recordInput.diseaseId);
      const nextRecords = upsertRecordUseCase(state.records, recordInput);

      const persistedUpdatedAt = await persistUpdatedRecord(
        state.activeAccountId,
        recordInput.diseaseId,
        nextRecords,
        currentRecord?.updatedAt ?? null,
      );

      const records = persistedUpdatedAt
        ? applyServerUpdatedAt(nextRecords, recordInput.diseaseId, persistedUpdatedAt)
        : nextRecords;

      set({
        editingDiseaseId: null,
        records,
      });
    },
  }));

import { getProfileApi } from 'src/api/profileApi.ts'
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
  cancelEdit: () => void;
  removeRecord: (diseaseId: string) => Promise<void>;
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

const persistUpdatedRecord = async (
  diseaseId: string,
  records: readonly VaccinationState['records'][number][],
) => {
  const api = getProfileApi();

  if (!api) {
    return;
  }

  await api.upsertVaccinationRecord(resolveUpdatedRecord(diseaseId, records));
};

export const useVaccinationStore =
  create<VaccinationStore>((set, get) => ({
    country: null,
    records: [],
    categoryFilter: VACCINATION_DEFAULT_CATEGORY_FILTER,
    editingDiseaseId: null,
    searchQuery: VACCINATION_DEFAULT_SEARCH_QUERY,
    cancelEdit: () => set({ editingDiseaseId: null }),
    removeRecord: async (diseaseId) => {
      const state = get();
      const nextState = {
        editingDiseaseId: state.editingDiseaseId === diseaseId ? null : state.editingDiseaseId,
        records: state.records.filter((record) => record.diseaseId !== diseaseId),
      };
      const api = getProfileApi();

      await api?.removeVaccinationRecord(diseaseId);
      set(nextState);
    },
    setCategoryFilter: (categoryFilter) => {
      set({ categoryFilter });
    },
    setCountry: async (country) => {
      const api = getProfileApi();

      await api?.setVaccinationCountry(country);
      set({ country });
    },
    setSearchQuery: (searchQuery) => {
      set({ searchQuery });
    },
    setVaccinationStoreState: (store) => {
      set(store);
    },
    submitCompletedDose: async (recordInput) => {
      const submissionResult = submitCompletedDoseUseCase(get().records, recordInput);

      if (submissionResult.errorCode || !submissionResult.records) {
        return submissionResult.errorCode;
      }

      await persistUpdatedRecord(recordInput.diseaseId, submissionResult.records);
      set({ records: submissionResult.records });

      return null;
    },
    submitRecord: async (recordInput) => {
      const submissionResult = submitRecordUseCase(get().records, recordInput);

      if (submissionResult.errorCode || !submissionResult.records) {
        return submissionResult.errorCode;
      }

      await persistUpdatedRecord(recordInput.diseaseId, submissionResult.records);
      set({
        editingDiseaseId: null,
        records: submissionResult.records,
      });

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
      const nextRecords = upsertRecordUseCase(state.records, recordInput);

      await persistUpdatedRecord(recordInput.diseaseId, nextRecords);
      set({
        editingDiseaseId: null,
        records: nextRecords,
      });
    },
  }));

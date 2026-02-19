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

const toVaccinationAppState = ({
  country,
  isCountryConfirmed,
  records,
}: VaccinationStoreState): VaccinationState => ({
  country,
  isCountryConfirmed,
  records,
});

const saveStoreState = async (
  state: VaccinationStoreState,
  patch: Partial<VaccinationStoreState>,
) => {
  const api = getProfileApi();
  await api?.saveVaccinationState(toVaccinationAppState({ ...state, ...patch }));
};

export const useVaccinationStore =
  create<VaccinationStore>((set, get) => ({
    country: null,
    isCountryConfirmed: false,
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

      await saveStoreState(state, nextState);
      set(nextState);
    },
    setCategoryFilter: (categoryFilter) => {
      set({ categoryFilter });
    },
    setCountry: async (country) => {
      const nextState = { country, isCountryConfirmed: true };
      await saveStoreState(get(), nextState);
      set(nextState);
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

      const nextState = { records: submissionResult.records };

      await saveStoreState(get(), nextState);
      set(nextState);

      return null;
    },
    submitRecord: async (recordInput) => {
      const submissionResult = submitRecordUseCase(get().records, recordInput);

      if (submissionResult.errorCode || !submissionResult.records) {
        return submissionResult.errorCode;
      }

      const nextState = {
        editingDiseaseId: null,
        records: submissionResult.records,
      };

      await saveStoreState(get(), nextState);
      set(nextState);

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
      const nextState = {
        editingDiseaseId: null,
        records: upsertRecordUseCase(state.records, recordInput),
      };

      await saveStoreState(state, nextState);
      set(nextState);
    },
  }));

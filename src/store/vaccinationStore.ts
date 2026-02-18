import { create } from 'zustand';

import {
  VACCINATION_DEFAULT_CATEGORY_FILTER,
  VACCINATION_DEFAULT_SEARCH_QUERY,
} from '../constants/vaccination';
import type { VaccinationCategoryFilter, VaccinationCountryCode, VaccinationRecordInput, VaccinationStoreState } from '../interfaces/vaccination';
import { createVaccinationPersistedDefaults, vaccinationRepositoryLocal } from '../utils/vaccinationRepositoryLocal';
import { type VaccinationValidationErrorCode, validateVaccinationRecordInput } from '../utils/vaccinationValidation';

interface VaccinationStore extends VaccinationStoreState {
  cancelEdit: () => void;
  confirmCountry: (country: VaccinationCountryCode) => void;
  hydrate: () => void;
  removeRecord: (diseaseId: string) => void;
  setCategoryFilter: (categoryFilter: VaccinationCategoryFilter) => void;
  setCountry: (country: VaccinationCountryCode) => void;
  setSearchQuery: (searchQuery: string) => void;
  submitRecord: (record: VaccinationRecordInput) => VaccinationValidationErrorCode | null;
  startEditRecord: (diseaseId: string) => void;
  upsertRecord: (record: VaccinationRecordInput) => void;
}

const repository = vaccinationRepositoryLocal;

const toStoreState = (persistedState: Pick<VaccinationStoreState, 'country' | 'isCountryConfirmed' | 'records'>): VaccinationStoreState => ({
  categoryFilter: VACCINATION_DEFAULT_CATEGORY_FILTER,
  country: persistedState.country,
  editingDiseaseId: null,
  isCountryConfirmed: persistedState.isCountryConfirmed,
  records: [...persistedState.records],
  searchQuery: VACCINATION_DEFAULT_SEARCH_QUERY,
});

const toPersistedState = ({ country, isCountryConfirmed, records }: VaccinationStoreState) => ({
  country,
  isCountryConfirmed,
  records,
});

const savePersistedSlice = (state: VaccinationStoreState) => {
  repository.save(toPersistedState(state));
};

const loadPersistedState = () => {
  const persistedState = repository.load();

  return toStoreState(persistedState);
};

const resolveNextRecords = (
  records: VaccinationStoreState['records'],
  input: VaccinationRecordInput,
) => {
  const nextUpdatedAt = new Date().toISOString();
  const nextRecord = {
    completedAt: input.completedAt,
    diseaseId: input.diseaseId,
    nextDueAt: input.nextDueAt,
    updatedAt: nextUpdatedAt,
  };
  const hasExistingRecord = records.some((record) => record.diseaseId === input.diseaseId);

  if (!hasExistingRecord) {
    return [...records, nextRecord];
  }

  return records.map((record) => (record.diseaseId === input.diseaseId ? nextRecord : record));
};

export const createVaccinationStoreDefaults = (): VaccinationStoreState =>
  toStoreState(createVaccinationPersistedDefaults());

export const useVaccinationStore = create<VaccinationStore>((set, get) => ({
  ...loadPersistedState(),
  cancelEdit: () => {
    set({ editingDiseaseId: null });
  },
  confirmCountry: (country) => {
    set((state) => {
      const nextState = {
        country,
        isCountryConfirmed: true,
      };

      savePersistedSlice({ ...state, ...nextState });

      return nextState;
    });
  },
  hydrate: () => {
    const hydratedState = loadPersistedState();

    set({
      categoryFilter: hydratedState.categoryFilter,
      country: hydratedState.country,
      editingDiseaseId: hydratedState.editingDiseaseId,
      isCountryConfirmed: hydratedState.isCountryConfirmed,
      records: hydratedState.records,
      searchQuery: hydratedState.searchQuery,
    });
  },
  removeRecord: (diseaseId) => {
    set((state) => {
      const nextRecords = state.records.filter((record) => record.diseaseId !== diseaseId);
      const nextState = {
        editingDiseaseId: state.editingDiseaseId === diseaseId ? null : state.editingDiseaseId,
        records: nextRecords,
      };

      savePersistedSlice({ ...state, ...nextState });

      return nextState;
    });
  },
  setCategoryFilter: (categoryFilter) => {
    set({ categoryFilter });
  },
  setCountry: (country) => {
    set((state) => {
      const nextState = {
        country,
      };

      savePersistedSlice({ ...state, ...nextState });

      return nextState;
    });
  },
  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
  },
  submitRecord: (recordInput) => {
    const validationResult = validateVaccinationRecordInput(recordInput);

    if (!validationResult.isValid) {
      return validationResult.errorCode;
    }

    get().upsertRecord(recordInput);

    return null;
  },
  startEditRecord: (diseaseId) => {
    const recordExists = get().records.some((record) => record.diseaseId === diseaseId);

    if (!recordExists) {
      return;
    }

    set({ editingDiseaseId: diseaseId });
  },
  upsertRecord: (recordInput) => {
    set((state) => {
      const nextState = {
        editingDiseaseId: null,
        records: resolveNextRecords(state.records, recordInput),
      };

      savePersistedSlice({ ...state, ...nextState });

      return nextState;
    });
  },
}));

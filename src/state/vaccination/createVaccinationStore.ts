import { create } from 'zustand';

import type { VaccinationApplicationService } from './vaccinationApplicationService';
import type { VaccinationAppState } from './vaccinationAppState';
import {
  VACCINATION_DEFAULT_CATEGORY_FILTER,
  VACCINATION_DEFAULT_SEARCH_QUERY,
} from '../../constants/vaccination';
import type { CategoryFilter, CountryCode } from '../../interfaces/base';
import type { ImmunizationDoseInput, ImmunizationSeriesInput } from '../../interfaces/immunizationRecord';
import type { VaccinationStoreState } from './vaccinationStoreState';
import type { VaccinationUiState } from './vaccinationUiState';
import type { VaccinationValidationErrorCode } from '../../utils/vaccinationValidation';

export interface VaccinationStore extends VaccinationStoreState {
  cancelEdit: () => void;
  confirmCountry: (country: CountryCode) => void;
  hydrate: () => void;
  removeRecord: (diseaseId: string) => void;
  setCategoryFilter: (categoryFilter: CategoryFilter) => void;
  setCountry: (country: CountryCode) => void;
  setSearchQuery: (searchQuery: string) => void;
  submitCompletedDose: (record: ImmunizationDoseInput) => VaccinationValidationErrorCode | null;
  submitRecord: (record: ImmunizationSeriesInput) => VaccinationValidationErrorCode | null;
  startEditRecord: (diseaseId: string) => void;
  upsertRecord: (record: ImmunizationSeriesInput) => void;
}

const createVaccinationUiDefaults = (): VaccinationUiState => ({
  categoryFilter: VACCINATION_DEFAULT_CATEGORY_FILTER,
  editingDiseaseId: null,
  searchQuery: VACCINATION_DEFAULT_SEARCH_QUERY,
});

const toStoreState = (appState: VaccinationAppState): VaccinationStoreState => ({
  ...appState,
  ...createVaccinationUiDefaults(),
});

const toVaccinationAppState = ({
  country,
  isCountryConfirmed,
  records,
}: VaccinationStoreState): VaccinationAppState => ({
  country,
  isCountryConfirmed,
  records,
});

const saveStoreState = (
  service: VaccinationApplicationService,
  state: VaccinationStoreState,
  patch: Partial<VaccinationStoreState>,
) => {
  service.saveState(toVaccinationAppState({ ...state, ...patch }));
};

export const createVaccinationStore = (service: VaccinationApplicationService) =>
  create<VaccinationStore>((set, get) => ({
    ...toStoreState(service.loadState()),
    cancelEdit: () => {
      set({ editingDiseaseId: null });
    },
    confirmCountry: (country) => {
      set((state) => {
        const nextState = service.confirmCountry(country);

        saveStoreState(service, state, nextState);

        return nextState;
      });
    },
    hydrate: () => {
      const hydratedState = toStoreState(service.loadState());

      set(hydratedState);
    },
    removeRecord: (diseaseId) => {
      set((state) => {
        const nextState = {
          editingDiseaseId: state.editingDiseaseId === diseaseId ? null : state.editingDiseaseId,
          records: service.removeRecord(state.records, diseaseId),
        };

        saveStoreState(service, state, nextState);

        return nextState;
      });
    },
    setCategoryFilter: (categoryFilter) => {
      set({ categoryFilter });
    },
    setCountry: (country) => {
      set((state) => {
        const nextState = service.setCountry(country);

        saveStoreState(service, state, nextState);

        return nextState;
      });
    },
    setSearchQuery: (searchQuery) => {
      set({ searchQuery });
    },
    submitCompletedDose: (recordInput) => {
      const submissionResult = service.submitCompletedDose(get().records, recordInput);

      if (submissionResult.errorCode || !submissionResult.records) {
        return submissionResult.errorCode;
      }

      const nextRecords = submissionResult.records;

      set((state) => {
        const nextState = {
          records: nextRecords,
        };

        saveStoreState(service, state, nextState);

        return nextState;
      });

      return null;
    },
    submitRecord: (recordInput) => {
      const submissionResult = service.submitRecord(get().records, recordInput);

      if (submissionResult.errorCode || !submissionResult.records) {
        return submissionResult.errorCode;
      }

      const nextRecords = submissionResult.records;

      set((state) => {
        const nextState = {
          editingDiseaseId: null,
          records: nextRecords,
        };

        saveStoreState(service, state, nextState);

        return nextState;
      });

      return null;
    },
    startEditRecord: (diseaseId) => {
      const nextEditingDiseaseId = service.startEditRecord(get().records, diseaseId);

      if (!nextEditingDiseaseId) {
        return;
      }

      set({ editingDiseaseId: nextEditingDiseaseId });
    },
    upsertRecord: (recordInput) => {
      set((state) => {
        const nextState = {
          editingDiseaseId: null,
          records: service.upsertRecord(state.records, recordInput),
        };

        saveStoreState(service, state, nextState);

        return nextState;
      });
    },
  }));

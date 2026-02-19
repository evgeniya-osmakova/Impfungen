import { create } from 'zustand';

import {
  VACCINATION_DEFAULT_CATEGORY_FILTER,
  VACCINATION_DEFAULT_SEARCH_QUERY,
} from '../constants/vaccination';
import { VACCINATION_VALIDATION_ERROR_CODE } from '../constants/vaccinationValidation';
import type {
  VaccinationCategoryFilter,
  VaccinationCompletedDose,
  VaccinationCompleteDoseInput,
  VaccinationCountryCode,
  VaccinationRecordInput,
  VaccinationStoreState,
} from '../interfaces/vaccination';
import { normalizeOptionalText } from '../utils/string';
import { createVaccinationPersistedDefaults, vaccinationRepositoryLocal } from '../utils/vaccinationRepositoryLocal';
import { normalizeFutureDueDoses } from '../utils/vaccinationSchedule';
import {
  type VaccinationValidationErrorCode,
  validateVaccinationCompleteDoseInput,
  validateVaccinationRecordInput,
} from '../utils/vaccinationValidation';

interface VaccinationStore extends VaccinationStoreState {
  cancelEdit: () => void;
  confirmCountry: (country: VaccinationCountryCode) => void;
  hydrate: () => void;
  removeRecord: (diseaseId: string) => void;
  setCategoryFilter: (categoryFilter: VaccinationCategoryFilter) => void;
  setCountry: (country: VaccinationCountryCode) => void;
  setSearchQuery: (searchQuery: string) => void;
  submitCompletedDose: (record: VaccinationCompleteDoseInput) => VaccinationValidationErrorCode | null;
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

const createDoseId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const sortCompletedDoses = (completedDoses: VaccinationCompletedDose[]): VaccinationCompletedDose[] =>
  [...completedDoses].sort((leftDose, rightDose) => leftDose.completedAt.localeCompare(rightDose.completedAt));

const resolveEditedCompletedDoses = (
  prevCompletedDoses: VaccinationCompletedDose[],
  input: VaccinationRecordInput,
): VaccinationCompletedDose[] => {
  if (prevCompletedDoses.length === 0) {
    return [{
      batchNumber: normalizeOptionalText(input.batchNumber),
      completedAt: input.completedAt,
      id: createDoseId(),
      kind: input.completedDoseKind,
      tradeName: normalizeOptionalText(input.tradeName),
    }];
  }

  const sorted = sortCompletedDoses(prevCompletedDoses);
  const lastDose = sorted[sorted.length - 1];

  if (!lastDose) {
    return sorted;
  }

  return sortCompletedDoses(
    sorted.map((dose) => {
      if (dose.id !== lastDose.id) {
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

const resolveNextRecords = (
  records: VaccinationStoreState['records'],
  input: VaccinationRecordInput,
) => {
  const nextUpdatedAt = new Date().toISOString();
  const existingRecord = records.find((record) => record.diseaseId === input.diseaseId);

  const nextCompletedDoses = existingRecord
    ? resolveEditedCompletedDoses(existingRecord.completedDoses, input)
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
  records: VaccinationStoreState['records'],
  input: VaccinationCompleteDoseInput,
) => records.map((record) => {
  if (record.diseaseId !== input.diseaseId) {
    return record;
  }

  const nextCompletedDose: VaccinationCompletedDose = {
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
    updatedAt: new Date().toISOString(),
  };
});

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
  submitCompletedDose: (recordInput) => {
    const validationResult = validateVaccinationCompleteDoseInput(recordInput);

    if (!validationResult.isValid) {
      return validationResult.errorCode;
    }

    const hasTargetRecord = get().records.some((record) => record.diseaseId === recordInput.diseaseId);

    if (!hasTargetRecord) {
      return VACCINATION_VALIDATION_ERROR_CODE.disease_required;
    }

    set((state) => {
      const nextState = {
        records: resolveRecordsWithCompletedDose(state.records, recordInput),
      };

      savePersistedSlice({ ...state, ...nextState });

      return nextState;
    });

    return null;
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

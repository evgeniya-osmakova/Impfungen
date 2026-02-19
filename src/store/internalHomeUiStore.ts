import { create } from 'zustand';

import type { VaccinationDoseKind } from '../interfaces/vaccination';

export interface CompleteDoseDraft {
  diseaseId: string;
  initialValues: {
    batchNumber: string | null;
    completedAt: string;
    kind: VaccinationDoseKind;
    plannedDoseId: string | null;
    tradeName: string | null;
  };
  isMarkPlannedFlow: boolean;
}

interface InternalHomeUiStoreState {
  completeDoseDraft: CompleteDoseDraft | null;
  completeDoseErrorKey: string | null;
  formErrorKey: string | null;
  isCompleteDoseModalOpen: boolean;
  isFormModalOpen: boolean;
  prefilledDiseaseId: string | null;
}

interface InternalHomeUiStoreActions {
  closeCompleteDoseModal: () => void;
  closeFormModal: () => void;
  openCompleteDoseModal: (draft: CompleteDoseDraft) => void;
  openFormModal: () => void;
  openFormModalWithPrefilledDisease: (diseaseId: string) => void;
  resetUi: () => void;
  setCompleteDoseErrorKey: (errorKey: string | null) => void;
  setFormErrorKey: (errorKey: string | null) => void;
}

type InternalHomeUiStore = InternalHomeUiStoreState & InternalHomeUiStoreActions;

const DEFAULT_STATE: InternalHomeUiStoreState = {
  completeDoseDraft: null,
  completeDoseErrorKey: null,
  formErrorKey: null,
  isCompleteDoseModalOpen: false,
  isFormModalOpen: false,
  prefilledDiseaseId: null,
};

export const useInternalHomeUiStore = create<InternalHomeUiStore>((set) => ({
  ...DEFAULT_STATE,
  closeCompleteDoseModal: () => {
    set({
      completeDoseDraft: null,
      completeDoseErrorKey: null,
      isCompleteDoseModalOpen: false,
    });
  },
  closeFormModal: () => {
    set({
      formErrorKey: null,
      isFormModalOpen: false,
      prefilledDiseaseId: null,
    });
  },
  openCompleteDoseModal: (draft) => {
    set({
      completeDoseDraft: draft,
      completeDoseErrorKey: null,
      formErrorKey: null,
      isCompleteDoseModalOpen: true,
      isFormModalOpen: false,
      prefilledDiseaseId: null,
    });
  },
  openFormModal: () => {
    set({
      completeDoseDraft: null,
      completeDoseErrorKey: null,
      formErrorKey: null,
      isCompleteDoseModalOpen: false,
      isFormModalOpen: true,
      prefilledDiseaseId: null,
    });
  },
  openFormModalWithPrefilledDisease: (diseaseId) => {
    set({
      completeDoseDraft: null,
      completeDoseErrorKey: null,
      formErrorKey: null,
      isCompleteDoseModalOpen: false,
      isFormModalOpen: true,
      prefilledDiseaseId: diseaseId,
    });
  },
  resetUi: () => {
    set(DEFAULT_STATE);
  },
  setCompleteDoseErrorKey: (completeDoseErrorKey) => {
    set({ completeDoseErrorKey });
  },
  setFormErrorKey: (formErrorKey) => {
    set({ formErrorKey });
  },
}));


import { create } from 'zustand';

import type { CompleteDoseDraft } from '../../interfaces/completeDoseDraft';

interface MainPageUiStoreState {
  completeDoseDraft: CompleteDoseDraft | null;
  completeDoseErrorKey: string | null;
  formErrorKey: string | null;
  isCompleteDoseModalOpen: boolean;
  isFormModalOpen: boolean;
  prefilledDiseaseId: string | null;
}

interface MainPageUiStoreActions {
  closeCompleteDoseModal: () => void;
  closeFormModal: () => void;
  openCompleteDoseModal: (draft: CompleteDoseDraft) => void;
  openFormModal: () => void;
  openFormModalWithPrefilledDisease: (diseaseId: string) => void;
  resetUi: () => void;
  setCompleteDoseErrorKey: (errorKey: string | null) => void;
  setFormErrorKey: (errorKey: string | null) => void;
}

type MainPageUiStore = MainPageUiStoreState & MainPageUiStoreActions;

const DEFAULT_STATE: MainPageUiStoreState = {
  completeDoseDraft: null,
  completeDoseErrorKey: null,
  formErrorKey: null,
  isCompleteDoseModalOpen: false,
  isFormModalOpen: false,
  prefilledDiseaseId: null,
};

export const useMainPageUiStore = create<MainPageUiStore>((set) => ({
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

import type { CompleteDoseDraft } from './completeDoseDraft';

export interface MainPageUiState {
  completeDoseDraft: CompleteDoseDraft | null;
  completeDoseErrorKey: string | null;
  formErrorKey: string | null;
  isCompleteDoseModalOpen: boolean;
  isFormModalOpen: boolean;
  prefilledDiseaseId: string | null;
}

export interface MainPageUiActions {
  closeCompleteDoseModal: () => void;
  closeFormModal: () => void;
  openCompleteDoseModal: (draft: CompleteDoseDraft) => void;
  openFormModal: () => void;
  openFormModalWithPrefilledDisease: (diseaseId: string) => void;
  setCompleteDoseErrorKey: (errorKey: string | null) => void;
  setFormErrorKey: (errorKey: string | null) => void;
}

export type MainPageUi = MainPageUiState & MainPageUiActions;

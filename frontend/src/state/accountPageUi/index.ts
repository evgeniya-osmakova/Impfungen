import { create } from 'zustand';

interface AccountPageUiStoreState {
  deleteCandidateAccountId: number | null;
  isAddMemberModalOpen: boolean;
  isAddingMember: boolean;
  isDeleting: boolean;
}

interface AccountPageUiStoreActions {
  closeAddMemberModal: () => void;
  closeDeleteFamilyMemberModal: () => void;
  openAddMemberModal: () => void;
  openDeleteFamilyMemberModal: (accountId: number) => void;
  resetUi: () => void;
  setIsAddingMember: (isAddingMember: boolean) => void;
  setIsDeleting: (isDeleting: boolean) => void;
}

type AccountPageUiStore = AccountPageUiStoreState & AccountPageUiStoreActions;

const DEFAULT_STATE: AccountPageUiStoreState = {
  deleteCandidateAccountId: null,
  isAddMemberModalOpen: false,
  isAddingMember: false,
  isDeleting: false,
};

export const useAccountPageUiStore = create<AccountPageUiStore>((set) => ({
  ...DEFAULT_STATE,
  closeAddMemberModal: () => {
    set({ isAddMemberModalOpen: false });
  },
  closeDeleteFamilyMemberModal: () => {
    set({ deleteCandidateAccountId: null });
  },
  openAddMemberModal: () => {
    set({ isAddMemberModalOpen: true });
  },
  openDeleteFamilyMemberModal: (accountId) => {
    set({ deleteCandidateAccountId: accountId });
  },
  resetUi: () => {
    set(DEFAULT_STATE);
  },
  setIsAddingMember: (isAddingMember) => {
    set({ isAddingMember });
  },
  setIsDeleting: (isDeleting) => {
    set({ isDeleting });
  },
}));

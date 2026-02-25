export interface AccountPageUiState {
  deleteCandidateAccountId: number | null;
  isAddMemberModalOpen: boolean;
  isAddingMember: boolean;
  isDeleting: boolean;
}

export interface AccountPageUiActions {
  closeAddMemberModal: () => void;
  closeDeleteFamilyMemberModal: () => void;
  openAddMemberModal: () => void;
  openDeleteFamilyMemberModal: (accountId: number) => void;
  setIsAddingMember: (isAddingMember: boolean) => void;
  setIsDeleting: (isDeleting: boolean) => void;
}

export type AccountPageUi = AccountPageUiState & AccountPageUiActions;

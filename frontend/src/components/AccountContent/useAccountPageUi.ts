import { useState } from 'react';
import type { AccountPageUi } from 'src/interfaces/accountPageUi.ts';

export const useAccountPageUi = (): AccountPageUi => {
  const [deleteCandidateAccountId, setDeleteCandidateAccountId] = useState<number | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return {
    closeAddMemberModal: () => {
      setIsAddMemberModalOpen(false);
    },
    closeDeleteFamilyMemberModal: () => {
      setDeleteCandidateAccountId(null);
    },
    deleteCandidateAccountId,
    isAddMemberModalOpen,
    isAddingMember,
    isDeleting,
    openAddMemberModal: () => {
      setIsAddMemberModalOpen(true);
    },
    openDeleteFamilyMemberModal: (accountId) => {
      setDeleteCandidateAccountId(accountId);
    },
    setIsAddingMember,
    setIsDeleting,
  };
};

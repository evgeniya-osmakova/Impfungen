import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccountPageUiStore } from 'src/state/accountPageUi';
import { useAccountsStore } from 'src/state/accounts';
import { useShallow } from 'zustand/react/shallow';

export const useDeleteFamilyMemberModalController = () => {
  const { t } = useTranslation();
  const { accounts, deleteFamilyAccount } = useAccountsStore(
    useShallow((state) => ({
      accounts: state.accounts,
      deleteFamilyAccount: state.deleteFamilyAccount,
    })),
  );
  const {
    closeDeleteFamilyMemberModal,
    deleteCandidateAccountId,
    isDeleting,
    setIsDeleting,
  } = useAccountPageUiStore(
    useShallow((state) => ({
      closeDeleteFamilyMemberModal: state.closeDeleteFamilyMemberModal,
      deleteCandidateAccountId: state.deleteCandidateAccountId,
      isDeleting: state.isDeleting,
      setIsDeleting: state.setIsDeleting,
    })),
  );
  const [requestError, setRequestError] = useState<string | null>(null);

  const deleteCandidateAccount = accounts.find((account) => account.id === deleteCandidateAccountId) ?? null;

  useEffect(() => {
    if (deleteCandidateAccountId === null) {
      return;
    }

    const stillExists = accounts.some((account) => account.id === deleteCandidateAccountId);

    if (!stillExists) {
      closeDeleteFamilyMemberModal();
    }
  }, [accounts, closeDeleteFamilyMemberModal, deleteCandidateAccountId]);

  useEffect(() => {
    setRequestError(null);
  }, [deleteCandidateAccountId]);

  const handleCloseDeleteFamilyMemberModal = () => {
    if (isDeleting) {
      return;
    }

    setRequestError(null);
    closeDeleteFamilyMemberModal();
  };

  const handleDeleteFamilyMember = async () => {
    if (!deleteCandidateAccount || deleteCandidateAccount.kind !== 'family') {
      return;
    }

    setRequestError(null);
    setIsDeleting(true);

    try {
      await deleteFamilyAccount(deleteCandidateAccount.id);
      closeDeleteFamilyMemberModal();
    } catch (error) {
      console.error('Unable to delete family account.', error);
      setRequestError(t('account.errors.deleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteCandidateAccount,
    handleCloseDeleteFamilyMemberModal,
    handleDeleteFamilyMember,
    isDeleting,
    requestError,
  };
};

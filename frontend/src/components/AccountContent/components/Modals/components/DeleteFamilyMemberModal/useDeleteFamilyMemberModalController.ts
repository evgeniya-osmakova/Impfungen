import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AccountPageUi } from 'src/interfaces/accountPageUi.ts';
import { useAccountsStore } from 'src/state/accounts';
import { useShallow } from 'zustand/react/shallow';

export const useDeleteFamilyMemberModalController = (
  ui: Pick<
    AccountPageUi,
    'closeDeleteFamilyMemberModal' | 'deleteCandidateAccountId' | 'isDeleting' | 'setIsDeleting'
  >,
) => {
  const { t } = useTranslation();
  const { accounts, deleteFamilyAccount } = useAccountsStore(
    useShallow((state) => ({
      accounts: state.accounts,
      deleteFamilyAccount: state.deleteFamilyAccount,
    })),
  );
  const { closeDeleteFamilyMemberModal, deleteCandidateAccountId, isDeleting, setIsDeleting } = ui;
  const [requestError, setRequestError] = useState<string | null>(null);

  const deleteCandidateAccount =
    accounts.find((account) => account.id === deleteCandidateAccountId) ?? null;

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

    const isDeleted = await deleteFamilyAccount(deleteCandidateAccount.id);

    if (isDeleted) {
      closeDeleteFamilyMemberModal();
    } else {
      setRequestError(t('account.errors.deleteFailed'));
    }

    setIsDeleting(false);
  };

  return {
    deleteCandidateAccount,
    handleCloseDeleteFamilyMemberModal,
    handleDeleteFamilyMember,
    isDeleting,
    requestError,
  };
};

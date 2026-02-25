import { AccountEditCard } from './components/AccountEditCard/AccountEditCard';
import { AccountMandatoryNotice } from './components/AccountMandatoryNotice/AccountMandatoryNotice';
import { AccountToolbar } from './components/AccountToolbar/AccountToolbar';
import { Modals } from './components/Modals/Modals';
import { useAccountPageUi } from './accountPageUi';

import styles from './AccountContent.module.css';

export const AccountContent = () => {
  const accountPageUi = useAccountPageUi();
  const toolbarUi = {
    isAddingMember: accountPageUi.isAddingMember,
    openAddMemberModal: accountPageUi.openAddMemberModal,
  };
  const editCardUi = {
    isDeleting: accountPageUi.isDeleting,
    openDeleteFamilyMemberModal: accountPageUi.openDeleteFamilyMemberModal,
  };
  const addFamilyMemberUi = {
    closeAddMemberModal: accountPageUi.closeAddMemberModal,
    isAddMemberModalOpen: accountPageUi.isAddMemberModalOpen,
    isAddingMember: accountPageUi.isAddingMember,
    setIsAddingMember: accountPageUi.setIsAddingMember,
  };
  const deleteFamilyMemberUi = {
    closeDeleteFamilyMemberModal: accountPageUi.closeDeleteFamilyMemberModal,
    deleteCandidateAccountId: accountPageUi.deleteCandidateAccountId,
    isDeleting: accountPageUi.isDeleting,
    setIsDeleting: accountPageUi.setIsDeleting,
  };

  return (
    <>
      <AccountMandatoryNotice />
      <AccountToolbar ui={toolbarUi} />

      <div className={styles.accountContent__content}>
        <AccountEditCard ui={editCardUi} />
      </div>

      <Modals addFamilyMemberUi={addFamilyMemberUi} deleteFamilyMemberUi={deleteFamilyMemberUi} />
    </>
  );
};

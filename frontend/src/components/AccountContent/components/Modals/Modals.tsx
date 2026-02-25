import type { AccountPageUi } from 'src/interfaces/accountPageUi.ts';

import { AddFamilyMemberModal } from './components/AddFamilyMemberModal/AddFamilyMemberModal';
import { DeleteFamilyMemberModal } from './components/DeleteFamilyMemberModal/DeleteFamilyMemberModal';

interface ModalsProps {
  addFamilyMemberUi: Pick<
    AccountPageUi,
    'closeAddMemberModal' | 'isAddMemberModalOpen' | 'isAddingMember' | 'setIsAddingMember'
  >;
  deleteFamilyMemberUi: Pick<
    AccountPageUi,
    'closeDeleteFamilyMemberModal' | 'deleteCandidateAccountId' | 'isDeleting' | 'setIsDeleting'
  >;
}

export const Modals = ({ addFamilyMemberUi, deleteFamilyMemberUi }: ModalsProps) => {
  return (
    <>
      <AddFamilyMemberModal ui={addFamilyMemberUi} />
      <DeleteFamilyMemberModal ui={deleteFamilyMemberUi} />
    </>
  );
};

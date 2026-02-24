import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PlusIcon from 'src/assets/icons/plus.svg';
import { useAccountPageUiStore } from 'src/state/accountPageUi';
import { useShallow } from 'zustand/react/shallow';

import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from '../../../../constants/ui';
import { isProfileAccountComplete, resolvePrimaryAccount, useAccountsStore } from '../../../../state/accounts';
import { Button, Select, SurfacePanel } from '../../../../ui';

import styles from './AccountToolbar.module.css';
import { resolveAccountOptionLabel } from 'src/helpers/resolveLabel.ts'

export const AccountToolbar = () => {
  const { t } = useTranslation();
  const [isSwitchingAccountId, setIsSwitchingAccountId] = useState<number | null>(null);
  const { accounts, selectAccount, selectedAccountId } = useAccountsStore(
    useShallow((state) => ({
      accounts: state.accounts,
      selectAccount: state.selectAccount,
      selectedAccountId: state.selectedAccountId,
    })),
  );
  const {
    isAddingMember,
    openAddMemberModal,
  } = useAccountPageUiStore(
    useShallow((state) => ({
      isAddingMember: state.isAddingMember,
      openAddMemberModal: state.openAddMemberModal,
    })),
  );

  const primaryAccount = resolvePrimaryAccount(accounts);

  if (!primaryAccount || !isProfileAccountComplete(primaryAccount)) {
    return null;
  }

  const handleSelectAccount = async (accountId: number) => {
    if (accountId === selectedAccountId || isSwitchingAccountId !== null) {
      return;
    }

    setIsSwitchingAccountId(accountId);

    try {
      await selectAccount(accountId);
    } catch (error) {
      console.error('Unable to switch account.', error);
    } finally {
      setIsSwitchingAccountId(null);
    }
  };

  return (
    <SurfacePanel className={styles.accountToolbar} compact>
      <div className={styles.accountToolbar__head}>
        <h2 className={styles.accountToolbar__title}>{t('account.list.selectLabel')}</h2>
        <Button
          className={styles.accountToolbar__addButton}
          disabled={isAddingMember}
          onClick={openAddMemberModal}
          type={HTML_BUTTON_TYPE.button}
          variant={BUTTON_VARIANT.secondary}
        >
          <PlusIcon aria-hidden="true" className={styles.accountToolbar__addButtonIcon} />
          <span>{t('account.actions.addMember')}</span>
        </Button>
      </div>

      <div className={styles.accountToolbar__selectWrap}>
        <Select
          aria-label={t('account.list.selectLabel')}
          className={`${styles.accountToolbar__input} ${styles.accountToolbar__switcherInput}`}
          disabled={isSwitchingAccountId !== null}
          onChange={(event) => {
            const nextAccountId = Number.parseInt(event.target.value, 10);

            if (Number.isFinite(nextAccountId)) {
              void handleSelectAccount(nextAccountId);
            }
          }}
          value={selectedAccountId === null ? '' : String(selectedAccountId)}
        >
          {accounts.map((account) => (
            <option key={account.id} value={String(account.id)}>
              {resolveAccountOptionLabel(account, t)}
            </option>
          ))}
        </Select>
      </div>
    </SurfacePanel>
  );
};

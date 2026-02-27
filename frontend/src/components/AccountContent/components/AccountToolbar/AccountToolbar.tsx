import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PlusIcon from 'src/assets/icons/plus.svg';
import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from 'src/constants/ui';
import { resolveAccountOptionLabel } from 'src/helpers/resolveLabel.ts';
import type { AccountPageUi } from 'src/interfaces/accountPageUi.ts';
import {
  isProfileAccountComplete,
  resolvePrimaryAccount,
  useAccountsStore,
} from 'src/state/accounts';
import { Button, Select, SurfacePanel } from 'src/ui';
import { useShallow } from 'zustand/react/shallow';

import styles from './AccountToolbar.module.css';

interface AccountToolbarProps {
  ui: Pick<AccountPageUi, 'isAddingMember' | 'openAddMemberModal'>;
}

export const AccountToolbar = ({ ui }: AccountToolbarProps) => {
  const { t } = useTranslation();
  const [isSwitchingAccountId, setIsSwitchingAccountId] = useState<number | null>(null);
  const { accounts, selectAccount, selectedAccountId } = useAccountsStore(
    useShallow((state) => ({
      accounts: state.accounts,
      selectAccount: state.selectAccount,
      selectedAccountId: state.selectedAccountId,
    })),
  );
  const { isAddingMember, openAddMemberModal } = ui;

  const primaryAccount = resolvePrimaryAccount(accounts);

  if (!primaryAccount || !isProfileAccountComplete(primaryAccount)) {
    return null;
  }

  const handleSelectAccount = async (accountId: number) => {
    if (accountId === selectedAccountId || isSwitchingAccountId !== null) {
      return;
    }

    setIsSwitchingAccountId(accountId);

    await selectAccount(accountId);
    setIsSwitchingAccountId(null);
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

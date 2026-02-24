import { useEffect } from 'react';
import { useAccountPageUiStore } from 'src/state/accountPageUi';

import { AccountEditCard } from './components/AccountEditCard/AccountEditCard';
import { AccountMandatoryNotice } from './components/AccountMandatoryNotice/AccountMandatoryNotice';
import { AccountToolbar } from './components/AccountToolbar/AccountToolbar';
import { Modals } from './components/Modals/Modals';

import styles from './AccountContent.module.css';

export const AccountContent = () => {
  useEffect(() => {
    useAccountPageUiStore.getState().resetUi();

    return () => {
      useAccountPageUiStore.getState().resetUi();
    };
  }, []);

  return (
    <>
      <AccountMandatoryNotice />
      <AccountToolbar />

      <div className={styles.accountContent__content}>
        <AccountEditCard />
      </div>

      <Modals />
    </>
  );
};

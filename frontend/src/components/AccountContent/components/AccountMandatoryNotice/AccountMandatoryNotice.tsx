import { useTranslation } from 'react-i18next';

import { isProfileAccountComplete, resolvePrimaryAccount, useAccountsStore } from '../../../../state/accounts';

import styles from './AccountMandatoryNotice.module.css';

export const AccountMandatoryNotice = () => {
  const { t } = useTranslation();
  const accounts = useAccountsStore((state) => state.accounts);
  const primaryAccount = resolvePrimaryAccount(accounts);

  if (!primaryAccount || isProfileAccountComplete(primaryAccount)) {
    return null;
  }

  return (
    <div className={styles.accountMandatoryNotice} role="status">
      <p className={styles.accountMandatoryNotice__title}>{t('account.mandatory.title')}</p>
      <p className={styles.accountMandatoryNotice__text}>{t('account.mandatory.description')}</p>
    </div>
  );
};

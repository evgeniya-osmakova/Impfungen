import { useTranslation } from 'react-i18next';
import { AccountContent } from 'src/components/AccountContent/AccountContent';
import { InternalLayout } from 'src/layouts/InternalLayout';
import { PageHero } from 'src/ui';

import styles from './Account.module.css';

export const Account = () => {
  const { t } = useTranslation();

  return (
    <InternalLayout>
      <section className={styles.accountPage}>
        <PageHero description={t('account.page.description')} title={t('account.page.title')} />
        <AccountContent />
      </section>
    </InternalLayout>
  );
};

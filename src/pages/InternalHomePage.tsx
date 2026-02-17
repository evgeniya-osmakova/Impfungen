import { useTranslation } from 'react-i18next';

import type { AuthUser } from '../interfaces/auth';
import { InternalLayout } from '../layouts/InternalLayout';

import styles from './InternalHomePage.module.css';

interface InternalHomePageProps {
  user: AuthUser;
}

export const InternalHomePage = ({ user }: InternalHomePageProps) => {
  const { t } = useTranslation();

  return (
    <InternalLayout user={user}>
      <section className={styles.placeholder}>
        <h1 className={styles.placeholder__title}>{t('internal.placeholderTitle')}</h1>
        <p className={styles.placeholder__description}>{t('internal.placeholderDescription')}</p>
      </section>
    </InternalLayout>
  );
};

import { useTranslation } from 'react-i18next';
import { MainContent } from 'src/components/MainContent/MainContent.tsx';
import { useVaccinationStore } from 'src/state/vaccination'

import { InternalLayout } from '../../layouts/InternalLayout';
import { PageHero } from '../../ui';

import styles from './Main.module.css';

export const Main = () => {
  const { t } = useTranslation();
  const country = useVaccinationStore((state) => state.country);

  return (
    <InternalLayout>
      <section className={styles.internalHomePage}>
        <PageHero
          description={t('internal.page.description')}
          title={t('internal.page.title')}
        />

        {country ? <MainContent /> : null}
      </section>
    </InternalLayout>
  );
};

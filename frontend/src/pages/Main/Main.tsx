import { useTranslation } from 'react-i18next';
import { useVaccinationStore } from 'src/state/vaccination'
import { useShallow } from 'zustand/react/shallow';

import { Content } from '../../components/Content/Content';
import { CountryOnboarding } from '../../components/CountryOnboarding/CountryOnboarding';
import { InternalLayout } from '../../layouts/InternalLayout';

import styles from './Main.module.css';

export const Main = () => {
  const { t } = useTranslation();
  const {
    country,
    setCountry,
  } = useVaccinationStore(
    useShallow((state) => ({
      country: state.country,
      setCountry: state.setCountry,
    })),
  );

  return (
    <InternalLayout>
      <section className={styles.internalHomePage}>
        <header className={styles.internalHomePage__header}>
          <h1 className={styles.internalHomePage__title}>{t('internal.page.title')}</h1>
          <p className={styles.internalHomePage__description}>{t('internal.page.description')}</p>
        </header>

        {!country ? (
          <CountryOnboarding
            onSelectCountry={setCountry}
            selectedCountry={country}
          />
        ) : (
          <Content />
        )}
      </section>
    </InternalLayout>
  );
};

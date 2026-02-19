import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import { Content } from '../../components/Content/Content';
import { CountryOnboarding } from '../../components/CountryOnboarding/CountryOnboarding';
import type { CountryCode } from '../../interfaces/base';
import { InternalLayout } from '../../layouts/InternalLayout';
import { useVaccinationStore } from '../../state/vaccination';

import styles from './Main.module.css';

export const Main = () => {
  const { t } = useTranslation();
  const {
    confirmCountry,
    country,
    isCountryConfirmed,
    setCountry,
  } = useVaccinationStore(
    useShallow((state) => ({
      confirmCountry: state.confirmCountry,
      country: state.country,
      isCountryConfirmed: state.isCountryConfirmed,
      setCountry: state.setCountry,
    })),
  );

  const handleChangeCountry = (nextCountry: CountryCode) => setCountry(nextCountry);

  const handleConfirmCountry = (nextCountry: CountryCode) => confirmCountry(nextCountry);

  return (
    <InternalLayout>
      <section className={styles.internalHomePage}>
        <header className={styles.internalHomePage__header}>
          <h1 className={styles.internalHomePage__title}>{t('internal.page.title')}</h1>
          <p className={styles.internalHomePage__description}>{t('internal.page.description')}</p>
        </header>

        {!isCountryConfirmed || !country ? (
          <CountryOnboarding
            onConfirmCountry={handleConfirmCountry}
            onSelectCountry={handleChangeCountry}
            selectedCountry={country}
          />
        ) : (
          <Content />
        )}
      </section>
    </InternalLayout>
  );
};

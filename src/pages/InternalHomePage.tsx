import { useTranslation } from 'react-i18next';

import {
  Content,
  CountryOnboarding,
} from '../components/internalHome';
import type { VaccinationCountryCode } from '../interfaces/vaccination';
import { InternalLayout } from '../layouts/InternalLayout';
import { useVaccinationStore } from '../store/vaccinationStore';

import styles from './InternalHomePage.module.css';

export const InternalHomePage = () => {
  const { t } = useTranslation();

  const {
    confirmCountry,
    country,
    isCountryConfirmed,
    setCountry,
  } = useVaccinationStore();

  const handleChangeCountry = (nextCountry: VaccinationCountryCode) => setCountry(nextCountry);

  const handleConfirmCountry = (nextCountry: VaccinationCountryCode) => confirmCountry(nextCountry);

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

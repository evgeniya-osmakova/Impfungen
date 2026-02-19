import { useTranslation } from 'react-i18next';

import { RADIO_PILL_GROUP_SIZE } from '../../constants/ui';
import { VACCINATION_COUNTRY, VACCINATION_COUNTRY_OPTIONS } from '../../constants/vaccination';
import type { CountryCode } from '../../interfaces/base';
import { RadioPillGroup } from '../../ui';

import styles from './CountryOnboarding.module.css';

interface CountryOnboardingProps {
  onSelectCountry: (country: CountryCode) => Promise<void>;
  selectedCountry: CountryCode | null;
}

export const CountryOnboarding = ({
  onSelectCountry,
  selectedCountry,
}: CountryOnboardingProps) => {
  const { t } = useTranslation();
  const resolveCountryLabel = (countryCode: CountryCode) => {
    if (countryCode === VACCINATION_COUNTRY.RU) {
      return t('internal.country.ru');
    }

    if (countryCode === VACCINATION_COUNTRY.DE) {
      return t('internal.country.de');
    }

    return t('internal.country.none');
  };

  const countryOptions = VACCINATION_COUNTRY_OPTIONS.map((countryCode) => ({
    label: resolveCountryLabel(countryCode),
    value: countryCode,
  }));

  return (
    <section className={styles.countryOnboarding}>
      <header className={styles.countryOnboarding__header}>
        <h2 className={styles.countryOnboarding__title}>{t('internal.countryOnboarding.title')}</h2>
        <p className={styles.countryOnboarding__description}>
          {t('internal.countryOnboarding.description')}
        </p>
      </header>

      <RadioPillGroup
        controlsClassName={styles.countryOnboarding__options}
        legend={t('internal.country.label')}
        onChange={onSelectCountry}
        options={countryOptions}
        size={RADIO_PILL_GROUP_SIZE.default}
        value={selectedCountry}
      />

      <p className={styles.countryOnboarding__hint}>{t('internal.countryOnboarding.hint')}</p>
    </section>
  );
};

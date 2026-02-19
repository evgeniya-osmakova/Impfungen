import { useTranslation } from 'react-i18next';

import { RADIO_PILL_GROUP_SIZE } from '../../../../../../constants/ui';
import { VACCINATION_COUNTRY, VACCINATION_COUNTRY_OPTIONS } from '../../../../../../constants/vaccination';
import type { CountryCode } from '../../../../../../interfaces/base';
import { RadioPillGroup } from '../../../../../../ui';

import styles from './CountrySwitcher.module.css';

interface CountrySwitcherProps {
  country: CountryCode;
  onChangeCountry: (country: CountryCode) => void;
}

export const CountrySwitcher = ({ country, onChangeCountry }: CountrySwitcherProps) => {
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

  const countryOptions = VACCINATION_COUNTRY_OPTIONS.map((countryOption) => ({
    label: resolveCountryLabel(countryOption),
    value: countryOption,
  }));

  return (
    <section className={styles.countrySwitcher}>
      <p className={styles.countrySwitcher__label}>{t('internal.country.label')}</p>
      <RadioPillGroup
        controlsClassName={styles.countrySwitcher__controls}
        legend={t('internal.country.label')}
        onChange={onChangeCountry}
        options={countryOptions}
        size={RADIO_PILL_GROUP_SIZE.compact}
        value={country}
      />
      <p className={styles.countrySwitcher__description}>
        {country === VACCINATION_COUNTRY.NONE
          ? t('internal.country.descriptionNoRecommendations')
          : t('internal.country.description')}
      </p>
    </section>
  );
};

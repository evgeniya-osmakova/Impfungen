import type { CountryCode, ProfileAccountSummary } from '@backend/contracts';
import type { TFunction } from 'i18next';
import type { useTranslation } from 'react-i18next';
import { VACCINATION_COUNTRY } from 'src/constants/vaccination.ts';

export const resolveCountryLabel = (t: TFunction, countryCode: CountryCode) => {
  if (countryCode === VACCINATION_COUNTRY.RU) {
    return t('internal.country.ru');
  }

  if (countryCode === VACCINATION_COUNTRY.DE) {
    return t('internal.country.de');
  }

  return t('internal.country.none');
};

export const resolveAccountOptionLabel = (
  account: ProfileAccountSummary,
  t: ReturnType<typeof useTranslation>['t'],
) => {
  const parts = [
    account.name ?? t('account.placeholders.noName'),
    String(account.birthYear ?? t('account.placeholders.noBirthYear')),
  ];

  if (account.kind === 'primary') {
    parts.push(t('account.kinds.primary'));
  }

  return parts.join(' • ');
};

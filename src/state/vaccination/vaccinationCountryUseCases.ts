import type { VaccinationAppState } from './vaccinationAppState';
import type { CountryCode } from '../../interfaces/base';

export const confirmCountryUseCase = (
  country: CountryCode,
): Pick<VaccinationAppState, 'country' | 'isCountryConfirmed'> => ({
  country,
  isCountryConfirmed: true,
});

export const setCountryUseCase = (
  country: CountryCode,
): Pick<VaccinationAppState, 'country'> => ({
  country,
});

import type { CountryCode } from '../../interfaces/base';
import type { ImmunizationSeries } from '../../interfaces/immunizationRecord';

export interface VaccinationDomainState {
  country: CountryCode | null;
  isCountryConfirmed: boolean;
  records: ImmunizationSeries[];
}

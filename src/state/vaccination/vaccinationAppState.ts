import type { VaccinationDomainState } from '../../domain/vaccination/vaccinationDomainState';

export interface VaccinationAppState {
  country: VaccinationDomainState['country'];
  isCountryConfirmed: VaccinationDomainState['isCountryConfirmed'];
  records: VaccinationDomainState['records'];
}

import type { VaccinationAppState } from './vaccinationAppState';
import type { VaccinationRepository } from './vaccinationRepository';
import type { VaccinationStorageState } from './vaccinationStorageState';

import {
  toVaccinationAppState,
  toVaccinationStorageState,
} from './vaccinationStateMapper';

export const createVaccinationStorageDefaults = (): VaccinationStorageState => ({
  country: null,
  isCountryConfirmed: false,
  records: [],
});

export const createVaccinationAppDefaults = (): VaccinationAppState =>
  toVaccinationAppState(createVaccinationStorageDefaults());

export const loadVaccinationAppState = (
  repository: VaccinationRepository,
): VaccinationAppState => toVaccinationAppState(repository.load());

export const saveVaccinationAppState = (
  repository: VaccinationRepository,
  state: VaccinationAppState,
): void => {
  repository.save(toVaccinationStorageState(state));
};

import type { VaccinationStorageState } from './vaccinationStorageState';

export interface VaccinationRepository {
  load: () => VaccinationStorageState;
  save: (state: VaccinationStorageState) => void;
}

import type { VaccinationAppState } from './vaccinationAppState';

import type { VaccinationUiState } from './vaccinationUiState';

export interface VaccinationStoreState extends VaccinationAppState, VaccinationUiState {}

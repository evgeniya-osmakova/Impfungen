import type { AppLanguage } from './language';

export type VaccinationCountryCode = 'RU' | 'DE';

export type VaccinationCategory = 'recommended' | 'optional';

export type VaccinationCategoryFilter = 'all' | VaccinationCategory;

export interface VaccinationDisease {
  countryCategory: Record<VaccinationCountryCode, VaccinationCategory | null>;
  id: string;
  labelKey: string;
  searchAliases: Record<AppLanguage, readonly string[]>;
}

export interface VaccinationRecord {
  completedAt: string;
  diseaseId: string;
  nextDueAt: string | null;
  updatedAt: string;
}

export interface VaccinationRecordInput {
  completedAt: string;
  diseaseId: string;
  nextDueAt: string | null;
}

export interface VaccinationPersistedState {
  country: VaccinationCountryCode | null;
  isCountryConfirmed: boolean;
  records: VaccinationRecord[];
}

export interface VaccinationStoreState extends VaccinationPersistedState {
  categoryFilter: VaccinationCategoryFilter;
  editingDiseaseId: string | null;
  searchQuery: string;
}

export interface VaccinationRepository {
  load: () => VaccinationPersistedState;
  save: (state: VaccinationPersistedState) => void;
}

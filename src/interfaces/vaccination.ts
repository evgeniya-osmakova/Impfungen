import { VACCINATION_REPEAT_UNIT } from '../constants/vaccination';

import type { AppLanguage } from './language';

export type VaccinationCountryCode = 'RU' | 'DE';

export type VaccinationCategory = 'recommended' | 'optional';

export type VaccinationCategoryFilter = 'all' | VaccinationCategory;

export type VaccinationRepeatUnit =
  (typeof VACCINATION_REPEAT_UNIT)[keyof typeof VACCINATION_REPEAT_UNIT];

export interface VaccinationRepeatRule {
  interval: number;
  unit: VaccinationRepeatUnit;
}

export interface VaccinationDisease {
  countryCategory: Record<VaccinationCountryCode, VaccinationCategory | null>;
  id: string;
  labelKey: string;
  searchAliases: Record<AppLanguage, readonly string[]>;
}

export interface VaccinationRecord {
  batchNumber: string | null;
  completedAt: string;
  diseaseId: string;
  futureDueDates: string[];
  repeatEvery: VaccinationRepeatRule | null;
  tradeName: string | null;
  updatedAt: string;
}

export interface VaccinationRecordInput {
  batchNumber: string | null;
  completedAt: string;
  diseaseId: string;
  futureDueDates: string[];
  repeatEvery: VaccinationRepeatRule | null;
  tradeName: string | null;
}

export interface VaccinationRecordView extends VaccinationRecord {
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

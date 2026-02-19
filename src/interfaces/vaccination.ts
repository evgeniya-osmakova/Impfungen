import { VACCINATION_REPEAT_UNIT, type VaccinationDoseKind } from '../constants/vaccination';

import type { AppLanguage } from './language';

export type VaccinationCountryCode = 'RU' | 'DE' | 'NONE';
export type VaccinationRecommendationCountryCode = Exclude<VaccinationCountryCode, 'NONE'>;

export type VaccinationCategory = 'recommended' | 'optional';

export type VaccinationCategoryFilter = 'all' | VaccinationCategory;

export type VaccinationRepeatUnit =
  (typeof VACCINATION_REPEAT_UNIT)[keyof typeof VACCINATION_REPEAT_UNIT];
export type { VaccinationDoseKind };

export interface VaccinationCompletedDose {
  batchNumber: string | null;
  completedAt: string;
  id: string;
  kind: VaccinationDoseKind;
  tradeName: string | null;
}

export interface VaccinationPlannedDose {
  dueAt: string;
  id: string;
  kind: VaccinationDoseKind;
}

export interface VaccinationRepeatRule {
  interval: number;
  kind: VaccinationDoseKind;
  unit: VaccinationRepeatUnit;
}

export interface VaccinationDisease {
  countryCategory: Record<VaccinationRecommendationCountryCode, VaccinationCategory | null>;
  id: string;
  labelKey: string;
  searchAliases: Record<AppLanguage, readonly string[]>;
}

export interface VaccinationRecord {
  completedDoses: VaccinationCompletedDose[];
  diseaseId: string;
  futureDueDoses: VaccinationPlannedDose[];
  repeatEvery: VaccinationRepeatRule | null;
  updatedAt: string;
}

export interface VaccinationRecordInput {
  batchNumber: string | null;
  completedAt: string;
  completedDoseKind: VaccinationDoseKind;
  diseaseId: string;
  futureDueDoses: VaccinationPlannedDose[];
  repeatEvery: VaccinationRepeatRule | null;
  tradeName: string | null;
}

export interface VaccinationCompleteDoseInput {
  batchNumber: string | null;
  completedAt: string;
  diseaseId: string;
  kind: VaccinationDoseKind;
  plannedDoseId: string | null;
  tradeName: string | null;
}

export const VACCINATION_NEXT_DUE_SOURCE = {
  manual: 'manual',
  repeat: 'repeat',
} as const;

export type VaccinationNextDueSource =
  (typeof VACCINATION_NEXT_DUE_SOURCE)[keyof typeof VACCINATION_NEXT_DUE_SOURCE];

export interface VaccinationNextDue {
  dueAt: string;
  kind: VaccinationDoseKind;
  plannedDoseId: string | null;
  source: VaccinationNextDueSource;
}

export interface VaccinationRecordView extends VaccinationRecord {
  nextDue: VaccinationNextDue | null;
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

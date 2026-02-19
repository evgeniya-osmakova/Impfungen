export const APP_LANGUAGE_VALUES = ['ru', 'de', 'en'] as const;
export type AppLanguage = (typeof APP_LANGUAGE_VALUES)[number];

export const COUNTRY_CODE_VALUES = ['RU', 'DE', 'NONE'] as const;
export type CountryCode = (typeof COUNTRY_CODE_VALUES)[number];

export const DOSE_KIND_VALUES = ['nextDose', 'revaccination'] as const;
export type DoseKind = (typeof DOSE_KIND_VALUES)[number];

export const REPEAT_UNIT_VALUES = ['months', 'years'] as const;
export type RepeatUnit = (typeof REPEAT_UNIT_VALUES)[number];

export interface VaccinationStorageCompletedDose {
  batchNumber: string | null;
  completedAt: string;
  id: string;
  kind: DoseKind;
  tradeName: string | null;
}

export interface VaccinationStoragePlannedDose {
  dueAt: string;
  id: string;
  kind: DoseKind;
}

export interface VaccinationStorageRepeatRule {
  interval: number;
  kind: DoseKind;
  unit: RepeatUnit;
}

export interface VaccinationStorageRecord {
  completedDoses: VaccinationStorageCompletedDose[];
  diseaseId: string;
  futureDueDoses: VaccinationStoragePlannedDose[];
  repeatEvery: VaccinationStorageRepeatRule | null;
  updatedAt: string;
}

export interface VaccinationStorageState {
  country: CountryCode | null;
  isCountryConfirmed: boolean;
  records: VaccinationStorageRecord[];
}

export interface ProfileSnapshot {
  language: AppLanguage;
  vaccinationState: VaccinationStorageState;
}

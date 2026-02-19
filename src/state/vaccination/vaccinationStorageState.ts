export interface VaccinationStorageCompletedDose {
  batchNumber: string | null;
  completedAt: string;
  id: string;
  kind: string;
  tradeName: string | null;
}

export interface VaccinationStoragePlannedDose {
  dueAt: string;
  id: string;
  kind: string;
}

export interface VaccinationStorageRepeatRule {
  interval: number;
  kind: string;
  unit: string;
}

export interface VaccinationStorageRecord {
  completedDoses: VaccinationStorageCompletedDose[];
  diseaseId: string;
  futureDueDoses: VaccinationStoragePlannedDose[];
  repeatEvery: VaccinationStorageRepeatRule | null;
  updatedAt: string;
}

export interface VaccinationStorageState {
  country: string | null;
  isCountryConfirmed: boolean;
  records: VaccinationStorageRecord[];
}

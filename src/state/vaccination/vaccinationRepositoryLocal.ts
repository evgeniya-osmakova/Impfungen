import type { VaccinationRepository } from './vaccinationRepository';
import {
  VACCINATION_STORAGE_KEY,
  VACCINATION_STORAGE_VERSION,
} from '../../constants/vaccination';
import type {
  VaccinationStorageCompletedDose,
  VaccinationStoragePlannedDose,
  VaccinationStorageRecord,
  VaccinationStorageRepeatRule,
  VaccinationStorageState,
} from './vaccinationStorageState';
import { createVaccinationStorageDefaults } from './vaccinationPersistence';

interface VaccinationPersistedPayload extends VaccinationStorageState {
  version: number;
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object';

const toStringOrNull = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  return value;
};

const toStorageCompletedDose = (
  value: unknown,
): VaccinationStorageCompletedDose | null => {
  if (!isObjectRecord(value)) {
    return null;
  }

  if (typeof value.completedAt !== 'string' || typeof value.id !== 'string' || typeof value.kind !== 'string') {
    return null;
  }

  return {
    batchNumber: toStringOrNull(value.batchNumber),
    completedAt: value.completedAt,
    id: value.id,
    kind: value.kind,
    tradeName: toStringOrNull(value.tradeName),
  };
};

const toStoragePlannedDose = (
  value: unknown,
): VaccinationStoragePlannedDose | null => {
  if (!isObjectRecord(value)) {
    return null;
  }

  if (typeof value.dueAt !== 'string' || typeof value.id !== 'string' || typeof value.kind !== 'string') {
    return null;
  }

  return {
    dueAt: value.dueAt,
    id: value.id,
    kind: value.kind,
  };
};

const toStorageRepeatEvery = (
  value: unknown,
): VaccinationStorageRepeatRule | null => {
  if (value === null) {
    return null;
  }

  if (!isObjectRecord(value)) {
    return null;
  }

  if (typeof value.interval !== 'number' || typeof value.kind !== 'string' || typeof value.unit !== 'string') {
    return null;
  }

  return {
    interval: value.interval,
    kind: value.kind,
    unit: value.unit,
  };
};

const toStorageRecord = (
  value: unknown,
): VaccinationStorageRecord | null => {
  if (!isObjectRecord(value)) {
    return null;
  }

  if (typeof value.diseaseId !== 'string' || typeof value.updatedAt !== 'string') {
    return null;
  }

  if (!Array.isArray(value.completedDoses) || !Array.isArray(value.futureDueDoses)) {
    return null;
  }

  const completedDoses = value.completedDoses
    .map((entry) => toStorageCompletedDose(entry))
    .filter((entry): entry is VaccinationStorageCompletedDose => Boolean(entry));
  const futureDueDoses = value.futureDueDoses
    .map((entry) => toStoragePlannedDose(entry))
    .filter((entry): entry is VaccinationStoragePlannedDose => Boolean(entry));

  return {
    completedDoses,
    diseaseId: value.diseaseId,
    futureDueDoses,
    repeatEvery: toStorageRepeatEvery(value.repeatEvery),
    updatedAt: value.updatedAt,
  };
};

const toStorageState = (value: unknown): VaccinationStorageState | null => {
  if (!isObjectRecord(value)) {
    return null;
  }

  if (!Array.isArray(value.records)) {
    return null;
  }

  return {
    country: toStringOrNull(value.country),
    isCountryConfirmed: value.isCountryConfirmed === true,
    records: value.records
      .map((entry) => toStorageRecord(entry))
      .filter((entry): entry is VaccinationStorageRecord => Boolean(entry)),
  };
};

export const vaccinationRepositoryLocal: VaccinationRepository = {
  load: () => {
    const rawValue = window.localStorage.getItem(VACCINATION_STORAGE_KEY);

    if (!rawValue) {
      return createVaccinationStorageDefaults();
    }

    try {
      const parsedPayload: unknown = JSON.parse(rawValue);

      if (!isObjectRecord(parsedPayload) || parsedPayload.version !== VACCINATION_STORAGE_VERSION) {
        return createVaccinationStorageDefaults();
      }

      const storageState = toStorageState(parsedPayload);

      return storageState ?? createVaccinationStorageDefaults();
    } catch {
      return createVaccinationStorageDefaults();
    }
  },
  save: (state) => {
    const payload: VaccinationPersistedPayload = {
      country: state.country,
      isCountryConfirmed: state.isCountryConfirmed,
      records: state.records,
      version: VACCINATION_STORAGE_VERSION,
    };

    window.localStorage.setItem(VACCINATION_STORAGE_KEY, JSON.stringify(payload));
  },
};

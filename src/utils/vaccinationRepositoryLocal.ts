import {
  VACCINATION_COUNTRY,
  VACCINATION_EMPTY_RECORDS,
  VACCINATION_STORAGE_KEY,
  VACCINATION_STORAGE_VERSION,
} from '../constants/vaccination';
import type {
  VaccinationCountryCode,
  VaccinationPersistedState,
  VaccinationRecord,
  VaccinationRepository,
} from '../interfaces/vaccination';

import { isIsoDateValue } from './date';

interface VaccinationPersistedPayload extends VaccinationPersistedState {
  version: number;
}

const DEFAULT_PERSISTED_STATE: VaccinationPersistedState = {
  country: null,
  isCountryConfirmed: false,
  records: VACCINATION_EMPTY_RECORDS,
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object';

const isCountryCode = (value: unknown): value is VaccinationCountryCode =>
  value === VACCINATION_COUNTRY.RU || value === VACCINATION_COUNTRY.DE;

const isVaccinationRecord = (value: unknown): value is VaccinationRecord => {
  if (!isObjectRecord(value)) {
    return false;
  }

  if (typeof value.diseaseId !== 'string' || !value.diseaseId.trim()) {
    return false;
  }

  if (typeof value.completedAt !== 'string' || !isIsoDateValue(value.completedAt)) {
    return false;
  }

  if (value.nextDueAt !== null && (typeof value.nextDueAt !== 'string' || !isIsoDateValue(value.nextDueAt))) {
    return false;
  }

  return typeof value.updatedAt === 'string' && Boolean(value.updatedAt.trim());
};

const sanitizeRecords = (value: unknown): VaccinationRecord[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const deduplicated = new Map<string, VaccinationRecord>();

  for (const entry of value) {
    if (!isVaccinationRecord(entry)) {
      continue;
    }

    const prev = deduplicated.get(entry.diseaseId);

    if (!prev || entry.updatedAt > prev.updatedAt) {
      deduplicated.set(entry.diseaseId, entry);
    }
  }

  return [...deduplicated.values()];
};

const cloneDefaultPersistedState = (): VaccinationPersistedState => ({
  country: DEFAULT_PERSISTED_STATE.country,
  isCountryConfirmed: DEFAULT_PERSISTED_STATE.isCountryConfirmed,
  records: [...DEFAULT_PERSISTED_STATE.records],
});

export const vaccinationRepositoryLocal: VaccinationRepository = {
  load: () => {
    const rawValue = window.localStorage.getItem(VACCINATION_STORAGE_KEY);

    if (!rawValue) {
      return cloneDefaultPersistedState();
    }

    try {
      const parsedPayload: unknown = JSON.parse(rawValue);

      if (!isObjectRecord(parsedPayload) || parsedPayload.version !== VACCINATION_STORAGE_VERSION) {
        return cloneDefaultPersistedState();
      }

      const country = isCountryCode(parsedPayload.country) ? parsedPayload.country : null;
      const isCountryConfirmed = Boolean(parsedPayload.isCountryConfirmed) && Boolean(country);

      return {
        country,
        isCountryConfirmed,
        records: sanitizeRecords(parsedPayload.records),
      };
    } catch {
      return cloneDefaultPersistedState();
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

export const createVaccinationPersistedDefaults = (): VaccinationPersistedState =>
  cloneDefaultPersistedState();

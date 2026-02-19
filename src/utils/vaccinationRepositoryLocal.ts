import {
  VACCINATION_COUNTRY,
  VACCINATION_DOSE_KIND,
  VACCINATION_EMPTY_RECORDS,
  VACCINATION_REPEAT_UNIT,
  VACCINATION_STORAGE_KEY,
  VACCINATION_STORAGE_VERSION,
} from '../constants/vaccination';
import type {
  VaccinationCompletedDose,
  VaccinationCountryCode,
  VaccinationDoseKind,
  VaccinationPersistedState,
  VaccinationPlannedDose,
  VaccinationRecord,
  VaccinationRepeatRule,
  VaccinationRepository,
} from '../interfaces/vaccination';

import { isIsoDateValue } from './date';
import { normalizeFutureDueDoses } from './vaccinationSchedule';

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
  value === VACCINATION_COUNTRY.RU
  || value === VACCINATION_COUNTRY.DE
  || value === VACCINATION_COUNTRY.NONE;

const isDoseKind = (value: unknown): value is VaccinationDoseKind =>
  value === VACCINATION_DOSE_KIND.nextDose || value === VACCINATION_DOSE_KIND.revaccination;

const sanitizeOptionalText = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized ? normalized : null;
};

const sanitizeDoseId = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized ? normalized : null;
};

const sanitizeCompletedDose = (value: unknown): VaccinationCompletedDose | null => {
  if (!isObjectRecord(value)) {
    return null;
  }

  const id = sanitizeDoseId(value.id);

  if (!id || typeof value.completedAt !== 'string' || !isIsoDateValue(value.completedAt) || !isDoseKind(value.kind)) {
    return null;
  }

  return {
    batchNumber: sanitizeOptionalText(value.batchNumber),
    completedAt: value.completedAt,
    id,
    kind: value.kind,
    tradeName: sanitizeOptionalText(value.tradeName),
  };
};

const sanitizeCompletedDoses = (value: unknown): VaccinationCompletedDose[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const deduplicated = new Map<string, VaccinationCompletedDose>();

  for (const entry of value) {
    const dose = sanitizeCompletedDose(entry);

    if (!dose) {
      continue;
    }

    deduplicated.set(dose.id, dose);
  }

  return [...deduplicated.values()].sort((leftDose, rightDose) =>
    leftDose.completedAt.localeCompare(rightDose.completedAt),
  );
};

const sanitizePlannedDose = (value: unknown): VaccinationPlannedDose | null => {
  if (!isObjectRecord(value)) {
    return null;
  }

  const id = sanitizeDoseId(value.id);

  if (!id || typeof value.dueAt !== 'string' || !isIsoDateValue(value.dueAt) || !isDoseKind(value.kind)) {
    return null;
  }

  return {
    dueAt: value.dueAt,
    id,
    kind: value.kind,
  };
};

const sanitizeFutureDueDoses = (value: unknown): VaccinationPlannedDose[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const doses = value
    .map((entry) => sanitizePlannedDose(entry))
    .filter((entry): entry is VaccinationPlannedDose => Boolean(entry));

  return normalizeFutureDueDoses(doses);
};

const sanitizeRepeatEvery = (value: unknown): VaccinationRepeatRule | null => {
  if (!isObjectRecord(value)) {
    return null;
  }

  const intervalValue = typeof value.interval === 'number' ? value.interval : Number.NaN;

  if (!Number.isInteger(intervalValue) || intervalValue <= 0 || !isDoseKind(value.kind)) {
    return null;
  }

  let unitValue: VaccinationRepeatRule['unit'] | null = null;

  if (value.unit === VACCINATION_REPEAT_UNIT.months) {
    unitValue = VACCINATION_REPEAT_UNIT.months;
  }

  if (value.unit === VACCINATION_REPEAT_UNIT.years) {
    unitValue = VACCINATION_REPEAT_UNIT.years;
  }

  if (!unitValue) {
    return null;
  }

  return {
    interval: intervalValue,
    kind: value.kind,
    unit: unitValue,
  };
};

const sanitizeRecord = (value: unknown): VaccinationRecord | null => {
  if (!isObjectRecord(value)) {
    return null;
  }

  if (typeof value.diseaseId !== 'string' || !value.diseaseId.trim()) {
    return null;
  }

  if (typeof value.updatedAt !== 'string' || !value.updatedAt.trim()) {
    return null;
  }

  const completedDoses = sanitizeCompletedDoses(value.completedDoses);

  if (completedDoses.length === 0) {
    return null;
  }

  return {
    completedDoses,
    diseaseId: value.diseaseId.trim(),
    futureDueDoses: sanitizeFutureDueDoses(value.futureDueDoses),
    repeatEvery: sanitizeRepeatEvery(value.repeatEvery),
    updatedAt: value.updatedAt,
  };
};

const sanitizeRecords = (value: unknown): VaccinationRecord[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const deduplicated = new Map<string, VaccinationRecord>();

  for (const entry of value) {
    const record = sanitizeRecord(entry);

    if (!record) {
      continue;
    }

    const prev = deduplicated.get(record.diseaseId);

    if (!prev || record.updatedAt > prev.updatedAt) {
      deduplicated.set(record.diseaseId, record);
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

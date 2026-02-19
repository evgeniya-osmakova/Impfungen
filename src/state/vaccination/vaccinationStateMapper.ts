import type { VaccinationAppState } from './vaccinationAppState';
import {
  VACCINATION_COUNTRY,
  VACCINATION_DOSE_KIND,
  VACCINATION_REPEAT_UNIT,
} from '../../constants/vaccination';
import type {
  VaccinationStorageCompletedDose,
  VaccinationStoragePlannedDose,
  VaccinationStorageRecord,
  VaccinationStorageRepeatRule,
  VaccinationStorageState,
} from './vaccinationStorageState';
import type { CountryCode, DoseKind } from '../../interfaces/base';
import type {
  CompletedDose,
  PlannedDose,
  RepeatRule,
} from '../../interfaces/dose';
import type { ImmunizationSeries } from '../../interfaces/immunizationRecord';
import { isIsoDateValue } from '../../utils/date';
import { normalizeFutureDueDoses } from '../../utils/vaccinationSchedule';

const isCountryCode = (value: string | null): value is CountryCode =>
  value === VACCINATION_COUNTRY.RU
  || value === VACCINATION_COUNTRY.DE
  || value === VACCINATION_COUNTRY.NONE;

const isDoseKind = (value: string): value is DoseKind =>
  value === VACCINATION_DOSE_KIND.nextDose || value === VACCINATION_DOSE_KIND.revaccination;

const sanitizeOptionalText = (value: string | null): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized ? normalized : null;
};

const sanitizeDoseId = (value: string): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized ? normalized : null;
};

const sanitizeCompletedDose = (
  value: VaccinationStorageCompletedDose,
): CompletedDose | null => {
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

const sanitizeCompletedDoses = (
  value: readonly VaccinationStorageCompletedDose[],
): CompletedDose[] => {
  const deduplicated = new Map<string, CompletedDose>();

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

const sanitizePlannedDose = (
  value: VaccinationStoragePlannedDose,
): PlannedDose | null => {
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

const sanitizeFutureDueDoses = (
  value: readonly VaccinationStoragePlannedDose[],
): PlannedDose[] => {
  const doses = value
    .map((entry) => sanitizePlannedDose(entry))
    .filter((entry): entry is PlannedDose => Boolean(entry));

  return normalizeFutureDueDoses(doses);
};

const sanitizeRepeatEvery = (
  value: VaccinationStorageRepeatRule | null,
): RepeatRule | null => {
  if (!value) {
    return null;
  }

  const intervalValue = typeof value.interval === 'number' ? value.interval : Number.NaN;

  if (!Number.isInteger(intervalValue) || intervalValue <= 0 || !isDoseKind(value.kind)) {
    return null;
  }

  let unitValue: RepeatRule['unit'] | null = null;

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

const sanitizeRecord = (
  value: VaccinationStorageRecord,
): ImmunizationSeries | null => {
  if (typeof value.diseaseId !== 'string' || !value.diseaseId.trim()) {
    return null;
  }

  if (typeof value.updatedAt !== 'string' || !value.updatedAt.trim()) {
    return null;
  }

  const updatedAtTimestamp = Date.parse(value.updatedAt);

  if (!Number.isFinite(updatedAtTimestamp)) {
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

const sanitizeRecords = (
  value: readonly VaccinationStorageRecord[],
): ImmunizationSeries[] => {
  const deduplicated = new Map<string, ImmunizationSeries>();

  for (const entry of value) {
    const record = sanitizeRecord(entry);

    if (!record) {
      continue;
    }

    const prevRecord = deduplicated.get(record.diseaseId);

    const recordUpdatedAt = Date.parse(record.updatedAt);
    const prevRecordUpdatedAt = prevRecord ? Date.parse(prevRecord.updatedAt) : Number.NEGATIVE_INFINITY;

    if (!prevRecord || recordUpdatedAt > prevRecordUpdatedAt) {
      deduplicated.set(record.diseaseId, record);
    }
  }

  return [...deduplicated.values()];
};

const toStorageCompletedDose = (
  dose: CompletedDose,
): VaccinationStorageCompletedDose => ({
  batchNumber: dose.batchNumber,
  completedAt: dose.completedAt,
  id: dose.id,
  kind: dose.kind,
  tradeName: dose.tradeName,
});

const toStoragePlannedDose = (
  dose: PlannedDose,
): VaccinationStoragePlannedDose => ({
  dueAt: dose.dueAt,
  id: dose.id,
  kind: dose.kind,
});

const toStorageRepeatEvery = (
  repeatEvery: RepeatRule | null,
): VaccinationStorageRepeatRule | null => {
  if (!repeatEvery) {
    return null;
  }

  return {
    interval: repeatEvery.interval,
    kind: repeatEvery.kind,
    unit: repeatEvery.unit,
  };
};

const toStorageRecord = (
  record: ImmunizationSeries,
): VaccinationStorageRecord => ({
  completedDoses: record.completedDoses.map(toStorageCompletedDose),
  diseaseId: record.diseaseId,
  futureDueDoses: record.futureDueDoses.map(toStoragePlannedDose),
  repeatEvery: toStorageRepeatEvery(record.repeatEvery),
  updatedAt: record.updatedAt,
});

export const toVaccinationAppState = (
  storageState: VaccinationStorageState,
): VaccinationAppState => {
  const country = isCountryCode(storageState.country) ? storageState.country : null;

  return {
    country,
    isCountryConfirmed: Boolean(storageState.isCountryConfirmed) && Boolean(country),
    records: sanitizeRecords(storageState.records),
  };
};

export const toVaccinationStorageState = (
  state: VaccinationAppState,
): VaccinationStorageState => ({
  country: state.country,
  isCountryConfirmed: state.isCountryConfirmed,
  records: state.records.map(toStorageRecord),
});

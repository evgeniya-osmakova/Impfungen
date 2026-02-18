import {
  VACCINATION_REPEAT_UNIT,
} from '../constants/vaccination';
import type {
  VaccinationRecord,
  VaccinationRepeatRule,
} from '../interfaces/vaccination';

import { addMonthsToIsoDate, getTodayIsoDate, isIsoDateValue } from './date';

const normalizeInterval = (value: number): number | null => {
  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
};

const addRepeatInterval = (
  value: string,
  repeatRule: VaccinationRepeatRule,
): string | null => {
  const interval = normalizeInterval(repeatRule.interval);

  if (!interval) {
    return null;
  }

  if (repeatRule.unit === VACCINATION_REPEAT_UNIT.months) {
    return addMonthsToIsoDate(value, interval);
  }

  if (repeatRule.unit === VACCINATION_REPEAT_UNIT.years) {
    return addMonthsToIsoDate(value, interval * 12);
  }

  return null;
};

const resolveNextDueByRepeat = (
  completedAt: string,
  repeatRule: VaccinationRepeatRule,
  referenceDate: string,
): string | null => {
  if (!isIsoDateValue(completedAt)) {
    return null;
  }

  let nextDueAt = addRepeatInterval(completedAt, repeatRule);

  if (!nextDueAt) {
    return null;
  }

  let guard = 0;

  while (nextDueAt < referenceDate && guard < 600) {
    const shifted = addRepeatInterval(nextDueAt, repeatRule);

    if (!shifted || shifted === nextDueAt) {
      return null;
    }

    nextDueAt = shifted;
    guard += 1;
  }

  return guard >= 600 ? null : nextDueAt;
};

export const normalizeFutureDueDates = (value: readonly string[]): string[] => {
  const normalized = value
    .filter((entry) => isIsoDateValue(entry))
    .sort((leftDate, rightDate) => leftDate.localeCompare(rightDate));

  return [...new Set(normalized)];
};

export const resolveVaccinationRecordNextDueAt = (
  record: Pick<VaccinationRecord, 'completedAt' | 'futureDueDates' | 'repeatEvery'>,
  referenceDate: string = getTodayIsoDate(),
): string | null => {
  const normalizedReferenceDate = isIsoDateValue(referenceDate) ? referenceDate : getTodayIsoDate();
  const nextFutureDate = normalizeFutureDueDates(record.futureDueDates).find(
    (futureDate) => futureDate >= normalizedReferenceDate,
  );

  if (nextFutureDate) {
    return nextFutureDate;
  }

  if (!record.repeatEvery) {
    return null;
  }

  return resolveNextDueByRepeat(
    record.completedAt,
    record.repeatEvery,
    normalizedReferenceDate,
  );
};

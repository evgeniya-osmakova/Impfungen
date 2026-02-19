import {
  VACCINATION_REPEAT_UNIT,
} from '../constants/vaccination';
import type { PlannedDose, RepeatRule } from '../interfaces/dose';
import type { ImmunizationSeries } from '../interfaces/immunizationRecord';
import type { NextDue } from '../interfaces/nextDue';
import { NEXT_DUE_SOURCE } from '../interfaces/nextDue';

import { addMonthsToIsoDate, getTodayIsoDate, isIsoDateValue } from './date';

const normalizeInterval = (value: number): number | null => {
  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
};

const addRepeatInterval = (
  value: string,
  repeatRule: RepeatRule,
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
  repeatRule: RepeatRule,
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

const resolveLatestCompletedAt = (
  completedDoses: Pick<ImmunizationSeries, 'completedDoses'>['completedDoses'],
): string | null => {
  const validCompletedDates = completedDoses
    .map((dose) => dose.completedAt)
    .filter((dateValue) => isIsoDateValue(dateValue));

  if (validCompletedDates.length === 0) {
    return null;
  }

  return [...validCompletedDates].sort((leftDate, rightDate) => leftDate.localeCompare(rightDate))[validCompletedDates.length - 1] ?? null;
};

export const normalizeFutureDueDoses = (
  value: readonly PlannedDose[],
): PlannedDose[] =>
  value
    .filter((entry) => isIsoDateValue(entry.dueAt))
    .sort((leftDose, rightDose) => leftDose.dueAt.localeCompare(rightDose.dueAt))
    .reduce<PlannedDose[]>((accumulator, dose) => {
      if (accumulator.some((item) => item.id === dose.id)) {
        return accumulator;
      }

      accumulator.push({ ...dose });

      return accumulator;
    }, []);

export const resolveVaccinationRecordNextDue = (
  record: Pick<ImmunizationSeries, 'completedDoses' | 'futureDueDoses' | 'repeatEvery'>,
  referenceDate: string = getTodayIsoDate(),
): NextDue | null => {
  const normalizedReferenceDate = isIsoDateValue(referenceDate) ? referenceDate : getTodayIsoDate();
  const nextFutureDose = normalizeFutureDueDoses(record.futureDueDoses).find(
    (futureDose) => futureDose.dueAt >= normalizedReferenceDate,
  );

  if (nextFutureDose) {
    return {
      dueAt: nextFutureDose.dueAt,
      kind: nextFutureDose.kind,
      plannedDoseId: nextFutureDose.id,
      source: NEXT_DUE_SOURCE.manual,
    };
  }

  if (!record.repeatEvery) {
    return null;
  }

  const latestCompletedAt = resolveLatestCompletedAt(record.completedDoses);

  if (!latestCompletedAt) {
    return null;
  }

  const nextDueAtByRepeat = resolveNextDueByRepeat(
    latestCompletedAt,
    record.repeatEvery,
    normalizedReferenceDate,
  );

  if (!nextDueAtByRepeat) {
    return null;
  }

  return {
    dueAt: nextDueAtByRepeat,
    kind: record.repeatEvery.kind,
    plannedDoseId: null,
    source: NEXT_DUE_SOURCE.repeat,
  };
};

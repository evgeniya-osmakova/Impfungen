import { VACCINATION_TIMELINE_STATUS } from '../constants/vaccination';
import type { VaccinationTimelineMeta } from '../interfaces/timeline';

import { getTodayIsoDate, parseIsoDateToUtc } from './date';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const toUtcMidnight = (date: Date) => Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

export const resolveVaccinationTimeline = (
  nextDueAt: string,
  referenceDate: string = getTodayIsoDate(),
): VaccinationTimelineMeta | null => {
  const dueDate = parseIsoDateToUtc(nextDueAt);
  const todayDate = parseIsoDateToUtc(referenceDate);

  if (!dueDate || !todayDate) {
    return null;
  }

  const daysUntil = Math.round((toUtcMidnight(dueDate) - toUtcMidnight(todayDate)) / MS_IN_DAY);

  if (daysUntil < 0) {
    return { daysUntil, status: VACCINATION_TIMELINE_STATUS.overdue };
  }

  if (daysUntil === 0) {
    return { daysUntil, status: VACCINATION_TIMELINE_STATUS.today };
  }

  return { daysUntil, status: VACCINATION_TIMELINE_STATUS.upcoming };
};

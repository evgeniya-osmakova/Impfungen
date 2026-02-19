import {
  VACCINATION_DOSE_KIND, VACCINATION_SCHEDULE_MODE,
} from 'src/constants/vaccination.ts'
import type { DoseKind, RepeatUnit } from 'src/interfaces/base.ts';
import type { CompletedDose, PlannedDose } from 'src/interfaces/dose.ts';
import type { ImmunizationSeriesInput, VaccinationScheduleMode } from 'src/interfaces/immunizationRecord.ts'
import { normalizeDateInputValue } from 'src/utils/date.ts';
import { normalizeOptionalText } from 'src/utils/string.ts';

interface BuildVaccinationRecordInputPayload {
  batchNumber: string;
  completedAt: string;
  completedDoseKind: DoseKind;
  diseaseId: string;
  futureDueDoses: readonly PlannedDose[];
  repeatInterval: string;
  repeatKind: DoseKind;
  repeatUnit: RepeatUnit;
  scheduleMode: VaccinationScheduleMode;
  tradeName: string;
}

export const buildVaccinationRecordInput = ({
  batchNumber,
  completedAt,
  completedDoseKind,
  diseaseId,
  futureDueDoses,
  repeatInterval,
  repeatKind,
  repeatUnit,
  scheduleMode,
  tradeName,
}: BuildVaccinationRecordInputPayload): ImmunizationSeriesInput => {
  const normalizedFutureDoses = futureDueDoses
    .map((futureDose) => ({
      ...futureDose,
      dueAt: normalizeDateInputValue(futureDose.dueAt),
    }))
    .filter((futureDose): futureDose is PlannedDose => Boolean(futureDose.dueAt));
  const repeatIntervalValue = Number.parseInt(repeatInterval, 10);
  const hasRepeatInterval = Number.isInteger(repeatIntervalValue) && repeatIntervalValue > 0;

  return {
    batchNumber: normalizeOptionalText(batchNumber),
    completedAt,
    completedDoseKind,
    diseaseId,
    futureDueDoses:
      scheduleMode === VACCINATION_SCHEDULE_MODE.manual ? normalizedFutureDoses : [],
    repeatEvery:
      scheduleMode === VACCINATION_SCHEDULE_MODE.repeat && hasRepeatInterval
        ? { interval: repeatIntervalValue, kind: repeatKind, unit: repeatUnit }
        : null,
    tradeName: normalizeOptionalText(tradeName),
  };
};

export const resolveLatestCompletedDose = (
  completedDoses: readonly CompletedDose[],
): CompletedDose | null => {
  const sortedCompletedDoses = [...completedDoses].sort((leftDose, rightDose) =>
    leftDose.completedAt.localeCompare(rightDose.completedAt),
  );

  return sortedCompletedDoses[sortedCompletedDoses.length - 1] ?? null;
};

export const createEmptyPlannedDose = (
  createId: () => string,
): PlannedDose => ({
  dueAt: '',
  id: createId(),
  kind: VACCINATION_DOSE_KIND.nextDose,
});

export const createClientDoseId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

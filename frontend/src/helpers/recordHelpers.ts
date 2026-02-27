import type { CompletedDose, PlannedDose } from 'src/interfaces/dose.ts';
import { NEXT_DUE_SOURCE, type NextDue } from 'src/interfaces/nextDue.ts';

export const sortCompletedDoses = (completedDoses: readonly CompletedDose[]): CompletedDose[] =>
  [...completedDoses].sort((leftDose, rightDose) =>
    leftDose.completedAt.localeCompare(rightDose.completedAt),
  );

export const resolveLatestCompletedDose = (
  completedDoses: readonly CompletedDose[],
): CompletedDose | null => {
  const sortedCompletedDoses = sortCompletedDoses(completedDoses);

  return sortedCompletedDoses[sortedCompletedDoses.length - 1] ?? null;
};

export const resolveRemainingFutureDueDoses = (
  futureDueDoses: readonly PlannedDose[],
  nextDue: NextDue | null,
): PlannedDose[] => {
  if (!nextDue || nextDue.source !== NEXT_DUE_SOURCE.manual) {
    return [...futureDueDoses];
  }

  if (nextDue.plannedDoseId) {
    return futureDueDoses.filter((dose) => dose.id !== nextDue.plannedDoseId);
  }

  return futureDueDoses.filter((dose) => dose.dueAt !== nextDue.dueAt);
};

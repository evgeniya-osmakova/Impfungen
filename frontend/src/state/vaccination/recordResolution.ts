import { resolveLatestCompletedDose } from 'src/helpers/recordHelpers.ts';
import type { VaccinationState } from 'src/interfaces/vaccinationState.ts';

type VaccinationRecord = VaccinationState['records'][number];

export const resolveUpdatedRecord = (
  diseaseId: string,
  records: readonly VaccinationRecord[],
): VaccinationRecord => {
  const updatedRecord = records.find((record) => record.diseaseId === diseaseId);

  if (!updatedRecord) {
    throw new Error(`Unable to resolve updated record for disease ${diseaseId}.`);
  }

  return updatedRecord;
};

export const resolveNewCompletedDoseId = (
  previousRecord: VaccinationRecord | undefined,
  nextRecord: VaccinationRecord,
): string | null => {
  const previousDoseIds = new Set((previousRecord?.completedDoses ?? []).map((dose) => dose.id));

  return nextRecord.completedDoses.find((dose) => !previousDoseIds.has(dose.id))?.id ?? null;
};

export const resolveSubmitRecordCompletedDoseId = (
  previousRecord: VaccinationRecord | undefined,
  nextRecord: VaccinationRecord,
): string | null => {
  const previousLatestDose = previousRecord
    ? resolveLatestCompletedDose(previousRecord.completedDoses)
    : null;

  if (previousLatestDose) {
    return previousLatestDose.id;
  }

  return resolveNewCompletedDoseId(previousRecord, nextRecord);
};

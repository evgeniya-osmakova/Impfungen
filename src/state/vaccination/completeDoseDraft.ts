import { VACCINATION_DOSE_KIND } from '../../constants/vaccination';
import { resolveLatestCompletedDose } from '../../domain/vaccination/recordHelpers';
import type { DoseKind } from '../../interfaces/base';
import type { CompleteDoseDraft } from '../../interfaces/completeDoseDraft';
import type { ImmunizationSeries } from '../../interfaces/immunizationRecord';

interface MarkPlannedDonePayload {
  diseaseId: string;
  dueAt: string;
  kind: DoseKind;
  plannedDoseId: string | null;
}

const resolveRecordByDiseaseId = (
  records: readonly ImmunizationSeries[],
  diseaseId: string,
): ImmunizationSeries | null => records.find((record) => record.diseaseId === diseaseId) ?? null;

export const buildAddDoseDraft = (
  records: readonly ImmunizationSeries[],
  diseaseId: string,
): CompleteDoseDraft => {
  const targetRecord = resolveRecordByDiseaseId(records, diseaseId);
  const latestCompletedDose = resolveLatestCompletedDose(targetRecord?.completedDoses ?? []);

  return {
    diseaseId,
    initialValues: {
      batchNumber: latestCompletedDose?.batchNumber ?? null,
      completedAt: '',
      kind: latestCompletedDose?.kind ?? VACCINATION_DOSE_KIND.nextDose,
      plannedDoseId: null,
      tradeName: latestCompletedDose?.tradeName ?? null,
    },
    isMarkPlannedFlow: false,
  };
};

export const buildMarkPlannedDoneDraft = (
  records: readonly ImmunizationSeries[],
  payload: MarkPlannedDonePayload,
): CompleteDoseDraft => {
  const targetRecord = resolveRecordByDiseaseId(records, payload.diseaseId);
  const latestCompletedDose = resolveLatestCompletedDose(targetRecord?.completedDoses ?? []);

  return {
    diseaseId: payload.diseaseId,
    initialValues: {
      batchNumber: latestCompletedDose?.batchNumber ?? null,
      completedAt: payload.dueAt,
      kind: payload.kind,
      plannedDoseId: payload.plannedDoseId,
      tradeName: latestCompletedDose?.tradeName ?? null,
    },
    isMarkPlannedFlow: true,
  };
};

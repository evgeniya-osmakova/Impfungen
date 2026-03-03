import type { DoseKind } from '@backend/contracts';
import { VACCINATION_DOSE_KIND } from 'src/constants/vaccination';
import { resolveLatestCompletedDose } from 'src/helpers/recordHelpers.ts';
import type { CompleteDoseDraft } from 'src/interfaces/completeDoseDraft';
import type { CompletedDose } from 'src/interfaces/dose.ts';
import type { ImmunizationSeries } from 'src/interfaces/immunizationRecord';

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

const resolveCompletedDoseById = (
  record: ImmunizationSeries | null,
  doseId: string,
): CompletedDose | null => record?.completedDoses.find((dose) => dose.id === doseId) ?? null;

export const buildAddDoseDraft = (
  records: readonly ImmunizationSeries[],
  diseaseId: string,
): CompleteDoseDraft => {
  const targetRecord = resolveRecordByDiseaseId(records, diseaseId);
  const latestCompletedDose = resolveLatestCompletedDose(targetRecord?.completedDoses ?? []);

  return {
    diseaseId,
    editingDoseId: null,
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
    editingDoseId: null,
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

export const buildEditDoseDraft = (
  records: readonly ImmunizationSeries[],
  payload: {
    diseaseId: string;
    doseId: string;
  },
): CompleteDoseDraft | null => {
  const targetRecord = resolveRecordByDiseaseId(records, payload.diseaseId);
  const targetDose = resolveCompletedDoseById(targetRecord, payload.doseId);

  if (!targetDose) {
    return null;
  }

  return {
    diseaseId: payload.diseaseId,
    editingDoseId: targetDose.id,
    initialValues: {
      batchNumber: targetDose.batchNumber,
      completedAt: targetDose.completedAt,
      kind: targetDose.kind,
      plannedDoseId: null,
      tradeName: targetDose.tradeName,
    },
    isMarkPlannedFlow: false,
  };
};

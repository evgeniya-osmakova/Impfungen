import type { DoseKind } from './base';

export interface CompleteDoseDraft {
  diseaseId: string;
  initialValues: {
    batchNumber: string | null;
    completedAt: string;
    kind: DoseKind;
    plannedDoseId: string | null;
    tradeName: string | null;
  };
  isMarkPlannedFlow: boolean;
}

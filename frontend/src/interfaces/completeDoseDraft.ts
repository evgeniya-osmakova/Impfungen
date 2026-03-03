import type { DoseKind } from './base';

export interface CompleteDoseDraft {
  diseaseId: string;
  editingDoseId: string | null;
  initialValues: {
    batchNumber: string | null;
    completedAt: string;
    kind: DoseKind;
    plannedDoseId: string | null;
    tradeName: string | null;
  };
  isMarkPlannedFlow: boolean;
}

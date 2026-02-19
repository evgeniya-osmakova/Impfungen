import type { DoseKind, RepeatUnit } from './base';

export interface CompletedDose {
  batchNumber: string | null;
  completedAt: string;
  id: string;
  kind: DoseKind;
  tradeName: string | null;
}

export interface PlannedDose {
  dueAt: string;
  id: string;
  kind: DoseKind;
}

export interface RepeatRule {
  interval: number;
  kind: DoseKind;
  unit: RepeatUnit;
}

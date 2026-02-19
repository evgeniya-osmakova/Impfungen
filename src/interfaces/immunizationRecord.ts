import type { DoseKind } from './base';
import type { CompletedDose, PlannedDose, RepeatRule } from './dose';
import type { NextDue } from './nextDue';

export interface ImmunizationSeries {
  completedDoses: CompletedDose[];
  diseaseId: string;
  futureDueDoses: PlannedDose[];
  repeatEvery: RepeatRule | null;
  updatedAt: string;
}

export interface ImmunizationSeriesView extends ImmunizationSeries {
  nextDue: NextDue | null;
}

export interface ImmunizationSeriesInput {
  batchNumber: string | null;
  completedAt: string;
  completedDoseKind: DoseKind;
  diseaseId: string;
  futureDueDoses: PlannedDose[];
  repeatEvery: RepeatRule | null;
  tradeName: string | null;
}

export interface ImmunizationDoseInput {
  batchNumber: string | null;
  completedAt: string;
  diseaseId: string;
  kind: DoseKind;
  plannedDoseId: string | null;
  tradeName: string | null;
}

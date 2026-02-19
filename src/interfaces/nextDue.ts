import type { DoseKind } from './base';

export const NEXT_DUE_SOURCE = {
  manual: 'manual',
  repeat: 'repeat',
} as const;

export type NextDueSource = (typeof NEXT_DUE_SOURCE)[keyof typeof NEXT_DUE_SOURCE];

export interface NextDue {
  dueAt: string;
  kind: DoseKind;
  plannedDoseId: string | null;
  source: NextDueSource;
}

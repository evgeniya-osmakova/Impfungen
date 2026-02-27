import type { CountryCode, DoseKind, RepeatUnit } from '@backend/contracts';

export type { CountryCode, DoseKind, RepeatUnit } from '@backend/contracts';
export type RecommendationCountryCode = Exclude<CountryCode, 'NONE'>;

export type Category = 'recommended' | 'optional';
export type CategoryFilter = 'all' | Category;

export const DOSE_KIND_VALUES = [
  'nextDose',
  'revaccination',
] as const satisfies readonly DoseKind[];
export const REPEAT_UNIT_VALUES = ['months', 'years'] as const satisfies readonly RepeatUnit[];

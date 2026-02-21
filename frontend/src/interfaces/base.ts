import {
  type CountryCode,
  DOSE_KIND_VALUES,
  REPEAT_UNIT_VALUES,
} from '@backend/contracts';

export type { CountryCode, DoseKind, RepeatUnit } from '@backend/contracts';
export type RecommendationCountryCode = Exclude<CountryCode, 'NONE'>;

export type Category = 'recommended' | 'optional';
export type CategoryFilter = 'all' | Category;

export { DOSE_KIND_VALUES, REPEAT_UNIT_VALUES };

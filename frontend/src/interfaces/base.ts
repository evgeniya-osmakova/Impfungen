export type CountryCode = 'RU' | 'DE' | 'NONE';
export type RecommendationCountryCode = Exclude<CountryCode, 'NONE'>;

export type Category = 'recommended' | 'optional';
export type CategoryFilter = 'all' | Category;

export const REPEAT_UNIT_VALUES = ['months', 'years'] as const;
export type RepeatUnit = (typeof REPEAT_UNIT_VALUES)[number];

export const DOSE_KIND_VALUES = ['nextDose', 'revaccination'] as const;
export type DoseKind = (typeof DOSE_KIND_VALUES)[number];

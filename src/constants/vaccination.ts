import type {
  VaccinationCategoryFilter,
  VaccinationCountryCode,
  VaccinationRecord,
} from '../interfaces/vaccination';

export const VACCINATION_COUNTRY: Record<VaccinationCountryCode, VaccinationCountryCode> = {
  RU: 'RU',
  DE: 'DE',
};

export const VACCINATION_CATEGORY_FILTER: Record<
  VaccinationCategoryFilter,
  VaccinationCategoryFilter
> = {
  all: 'all',
  recommended: 'recommended',
  optional: 'optional',
};

export const VACCINATION_COUNTRY_OPTIONS: readonly VaccinationCountryCode[] = [
  VACCINATION_COUNTRY.RU,
  VACCINATION_COUNTRY.DE,
];

export const VACCINATION_CATEGORY_FILTER_OPTIONS: readonly VaccinationCategoryFilter[] = [
  VACCINATION_CATEGORY_FILTER.all,
  VACCINATION_CATEGORY_FILTER.recommended,
  VACCINATION_CATEGORY_FILTER.optional,
];

export const VACCINATION_REPEAT_UNIT = {
  months: 'months',
  years: 'years',
} as const;

export const VACCINATION_REPEAT_UNIT_OPTIONS = [
  VACCINATION_REPEAT_UNIT.years,
  VACCINATION_REPEAT_UNIT.months,
] as const;

export const VACCINATION_STORAGE_KEY = 'impfungen.vaccination.state';
export const VACCINATION_STORAGE_VERSION = 1;
export const VACCINATION_DEFAULT_CATEGORY_FILTER: VaccinationCategoryFilter =
  VACCINATION_CATEGORY_FILTER.all;
export const VACCINATION_DEFAULT_SEARCH_QUERY = '';
export const VACCINATION_EMPTY_RECORDS: VaccinationRecord[] = [];
export const VACCINATION_ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const VACCINATION_TIMELINE_STATUS = {
  overdue: 'overdue',
  today: 'today',
  upcoming: 'upcoming',
} as const;

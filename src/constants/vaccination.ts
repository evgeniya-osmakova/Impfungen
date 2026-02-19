import {
  type CategoryFilter,
  type CountryCode,
  DOSE_KIND_VALUES,
  type DoseKind,
  REPEAT_UNIT_VALUES,
  type RepeatUnit,
} from '../interfaces/base';
import type { ImmunizationSeries } from '../interfaces/immunizationRecord';

const toSelfRecord = <T extends string>(values: readonly T[]): Record<T, T> =>
  values.reduce<Record<T, T>>((accumulator, value) => {
    accumulator[value] = value;

    return accumulator;
  }, {} as Record<T, T>);

export const VACCINATION_COUNTRY = {
  RU: 'RU',
  DE: 'DE',
  NONE: 'NONE',
} as const;

export const VACCINATION_CATEGORY_FILTER: Record<
  CategoryFilter,
  CategoryFilter
> = {
  all: 'all',
  recommended: 'recommended',
  optional: 'optional',
};

export const VACCINATION_COUNTRY_OPTIONS: readonly CountryCode[] = [
  VACCINATION_COUNTRY.RU,
  VACCINATION_COUNTRY.DE,
  VACCINATION_COUNTRY.NONE,
];

export const VACCINATION_CATEGORY_FILTER_OPTIONS: readonly CategoryFilter[] = [
  VACCINATION_CATEGORY_FILTER.all,
  VACCINATION_CATEGORY_FILTER.recommended,
  VACCINATION_CATEGORY_FILTER.optional,
];

export const VACCINATION_REPEAT_UNIT: Record<RepeatUnit, RepeatUnit> =
  toSelfRecord(REPEAT_UNIT_VALUES);

export const VACCINATION_REPEAT_UNIT_OPTIONS: readonly RepeatUnit[] = [...REPEAT_UNIT_VALUES];

export const VACCINATION_DOSE_KIND: Record<DoseKind, DoseKind> =
  toSelfRecord(DOSE_KIND_VALUES);

export const VACCINATION_DOSE_KIND_OPTIONS: readonly DoseKind[] = [...DOSE_KIND_VALUES];

export const VACCINATION_STORAGE_KEY = 'impfungen.vaccination.state';
export const VACCINATION_STORAGE_VERSION = 2;
export const VACCINATION_DEFAULT_CATEGORY_FILTER: CategoryFilter =
  VACCINATION_CATEGORY_FILTER.all;
export const VACCINATION_DEFAULT_SEARCH_QUERY = '';
export const VACCINATION_EMPTY_RECORDS: ImmunizationSeries[] = [];
export const VACCINATION_ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const VACCINATION_TIMELINE_STATUS = {
  overdue: 'overdue',
  today: 'today',
  upcoming: 'upcoming',
} as const;

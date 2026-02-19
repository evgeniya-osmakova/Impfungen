import {
  VACCINATION_CATEGORY_FILTER,
  VACCINATION_COUNTRY,
} from '../constants/vaccination';
import type {
  Category,
  CategoryFilter,
  CountryCode,
  RecommendationCountryCode,
} from '../interfaces/base';
import type { Disease } from '../interfaces/disease';
import type {
  ImmunizationSeries,
  ImmunizationSeriesView,
} from '../interfaces/immunizationRecord';
import type { AppLanguage } from '../interfaces/language';

import { getTodayIsoDate, parseIsoDateToUtc } from './date';
import { resolveVaccinationRecordNextDue } from './vaccinationSchedule';

interface FilterDiseasesOptions {
  categoryFilter: CategoryFilter;
  country: CountryCode;
  language: AppLanguage;
  query: string;
  resolveDiseaseLabel: (disease: Disease) => string;
}

const sanitizeSearchValue = (value: string): string => value.trim().toLowerCase();
const isRecommendationCountryCode = (
  country: CountryCode,
): country is RecommendationCountryCode =>
  country === VACCINATION_COUNTRY.RU || country === VACCINATION_COUNTRY.DE;

const toSearchAliases = (disease: Disease, language: AppLanguage): string[] => [
  ...disease.searchAliases[language],
  ...disease.searchAliases.de,
  ...disease.searchAliases.en,
  ...disease.searchAliases.ru,
];

export const getCountryRelevantDiseases = (
  diseases: readonly Disease[],
  country: CountryCode,
): Disease[] => {
  if (!isRecommendationCountryCode(country)) {
    return [...diseases];
  }

  return diseases.filter((disease) => Boolean(disease.countryCategory[country]));
};

export const getAvailableDiseases = (
  diseases: readonly Disease[],
  records: readonly ImmunizationSeries[],
  country: CountryCode,
): Disease[] => {
  const recordedDiseaseIds = new Set(records.map((record) => record.diseaseId));

  return getCountryRelevantDiseases(diseases, country).filter(
    (disease) => !recordedDiseaseIds.has(disease.id),
  );
};

export const filterDiseases = (
  diseases: readonly Disease[],
  { categoryFilter, country, language, query, resolveDiseaseLabel }: FilterDiseasesOptions,
): Disease[] => {
  const normalizedQuery = sanitizeSearchValue(query);
  const hasCountryRecommendations = isRecommendationCountryCode(country);

  return diseases.filter((disease) => {
    if (hasCountryRecommendations) {
      const diseaseCategory = disease.countryCategory[country];

      if (!diseaseCategory) {
        return false;
      }

      if (
        categoryFilter !== VACCINATION_CATEGORY_FILTER.all
        && diseaseCategory !== categoryFilter
      ) {
        return false;
      }
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableParts = [resolveDiseaseLabel(disease), ...toSearchAliases(disease, language)].map(
      (value) => sanitizeSearchValue(value),
    );

    return searchableParts.some((part) => part.includes(normalizedQuery));
  });
};

export const getCategoryCounts = (
  diseases: readonly Disease[],
  country: CountryCode,
): Record<Category, number> => {
  if (!isRecommendationCountryCode(country)) {
    return { optional: 0, recommended: 0 };
  }

  return diseases.reduce<Record<Category, number>>(
    (accumulator, disease) => {
      const category = disease.countryCategory[country];

      if (!category) {
        return accumulator;
      }

      accumulator[category] += 1;

      return accumulator;
    },
    { optional: 0, recommended: 0 },
  );
};

export const sortRecordsByNextDueDate = (
  records: readonly ImmunizationSeries[],
): ImmunizationSeriesView[] =>
  records
    .map((record) => ({
      ...record,
      nextDue: resolveVaccinationRecordNextDue(record),
    }))
    .sort((leftRecord, rightRecord) => {
      if (leftRecord.nextDue && rightRecord.nextDue) {
        return leftRecord.nextDue.dueAt.localeCompare(rightRecord.nextDue.dueAt);
      }

      if (leftRecord.nextDue && !rightRecord.nextDue) {
        return -1;
      }

      if (!leftRecord.nextDue && rightRecord.nextDue) {
        return 1;
      }

      return 0;
    });

export const getRecordsWithNextDateCount = (records: readonly ImmunizationSeries[]): number =>
  records.reduce(
    (accumulator, record) => accumulator + Number(Boolean(resolveVaccinationRecordNextDue(record))),
    0,
  );

export const getRecordsDueInNextYear = (
  records: readonly ImmunizationSeriesView[],
): ImmunizationSeriesView[] => {
  const todayDate = parseIsoDateToUtc(getTodayIsoDate());

  if (!todayDate) {
    return [];
  }

  const nextYearDate = new Date(
    Date.UTC(
      todayDate.getUTCFullYear() + 1,
      todayDate.getUTCMonth(),
      todayDate.getUTCDate(),
    ),
  );

  return records.filter((record) => {
    if (!record.nextDue) {
      return false;
    }

    const dueDate = parseIsoDateToUtc(record.nextDue.dueAt);

    if (!dueDate) {
      return false;
    }

    return dueDate >= todayDate && dueDate <= nextYearDate;
  });
};

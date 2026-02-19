import {
  VACCINATION_CATEGORY_FILTER,
  VACCINATION_COUNTRY,
} from '../constants/vaccination';
import type { AppLanguage } from '../interfaces/language';
import type {
  VaccinationCategory,
  VaccinationCategoryFilter,
  VaccinationCountryCode,
  VaccinationDisease,
  VaccinationRecommendationCountryCode,
  VaccinationRecord,
  VaccinationRecordView,
} from '../interfaces/vaccination';

import { getTodayIsoDate, parseIsoDateToUtc } from './date';
import { resolveVaccinationRecordNextDue } from './vaccinationSchedule';

interface FilterDiseasesOptions {
  categoryFilter: VaccinationCategoryFilter;
  country: VaccinationCountryCode;
  language: AppLanguage;
  query: string;
  resolveDiseaseLabel: (disease: VaccinationDisease) => string;
}

const sanitizeSearchValue = (value: string): string => value.trim().toLowerCase();
const isRecommendationCountryCode = (
  country: VaccinationCountryCode,
): country is VaccinationRecommendationCountryCode =>
  country === VACCINATION_COUNTRY.RU || country === VACCINATION_COUNTRY.DE;

const toSearchAliases = (disease: VaccinationDisease, language: AppLanguage): string[] => [
  ...disease.searchAliases[language],
  ...disease.searchAliases.de,
  ...disease.searchAliases.en,
  ...disease.searchAliases.ru,
];

export const getCountryRelevantDiseases = (
  diseases: readonly VaccinationDisease[],
  country: VaccinationCountryCode,
): VaccinationDisease[] => {
  if (!isRecommendationCountryCode(country)) {
    return [...diseases];
  }

  return diseases.filter((disease) => Boolean(disease.countryCategory[country]));
};

export const getAvailableDiseases = (
  diseases: readonly VaccinationDisease[],
  records: readonly VaccinationRecord[],
  country: VaccinationCountryCode,
): VaccinationDisease[] => {
  const recordedDiseaseIds = new Set(records.map((record) => record.diseaseId));

  return getCountryRelevantDiseases(diseases, country).filter(
    (disease) => !recordedDiseaseIds.has(disease.id),
  );
};

export const filterDiseases = (
  diseases: readonly VaccinationDisease[],
  { categoryFilter, country, language, query, resolveDiseaseLabel }: FilterDiseasesOptions,
): VaccinationDisease[] => {
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
  diseases: readonly VaccinationDisease[],
  country: VaccinationCountryCode,
): Record<VaccinationCategory, number> => {
  if (!isRecommendationCountryCode(country)) {
    return { optional: 0, recommended: 0 };
  }

  return diseases.reduce<Record<VaccinationCategory, number>>(
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
  records: readonly VaccinationRecord[],
): VaccinationRecordView[] =>
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

export const getRecordsWithNextDateCount = (records: readonly VaccinationRecord[]): number =>
  records.reduce(
    (accumulator, record) => accumulator + Number(Boolean(resolveVaccinationRecordNextDue(record))),
    0,
  );

export const getRecordsDueInNextYear = (
  records: readonly VaccinationRecordView[],
): VaccinationRecordView[] => {
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

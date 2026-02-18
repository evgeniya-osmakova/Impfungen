import type { AppLanguage } from '../interfaces/language';
import type {
  VaccinationCategory,
  VaccinationCategoryFilter,
  VaccinationCountryCode,
  VaccinationDisease,
  VaccinationRecord,
  VaccinationRecordView,
} from '../interfaces/vaccination';

import { getTodayIsoDate, parseIsoDateToUtc } from './date';
import { resolveVaccinationRecordNextDueAt } from './vaccinationSchedule';

interface FilterDiseasesOptions {
  categoryFilter: VaccinationCategoryFilter;
  country: VaccinationCountryCode;
  language: AppLanguage;
  query: string;
  resolveDiseaseLabel: (disease: VaccinationDisease) => string;
}

const sanitizeSearchValue = (value: string): string => value.trim().toLowerCase();

const toSearchAliases = (disease: VaccinationDisease, language: AppLanguage): string[] => [
  ...disease.searchAliases[language],
  ...disease.searchAliases.de,
  ...disease.searchAliases.en,
  ...disease.searchAliases.ru,
];

export const getCountryRelevantDiseases = (
  diseases: readonly VaccinationDisease[],
  country: VaccinationCountryCode,
): VaccinationDisease[] => diseases.filter((disease) => Boolean(disease.countryCategory[country]));

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

  return diseases.filter((disease) => {
    const diseaseCategory = disease.countryCategory[country];

    if (!diseaseCategory) {
      return false;
    }

    if (categoryFilter !== 'all' && diseaseCategory !== categoryFilter) {
      return false;
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
): Record<VaccinationCategory, number> =>
  diseases.reduce<Record<VaccinationCategory, number>>(
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

export const sortRecordsByNextDueDate = (
  records: readonly VaccinationRecord[],
): VaccinationRecordView[] =>
  records
    .map((record) => ({
      ...record,
      nextDueAt: resolveVaccinationRecordNextDueAt(record),
    }))
    .sort((leftRecord, rightRecord) => {
      if (leftRecord.nextDueAt && rightRecord.nextDueAt) {
        return leftRecord.nextDueAt.localeCompare(rightRecord.nextDueAt);
      }

      if (leftRecord.nextDueAt && !rightRecord.nextDueAt) {
        return -1;
      }

      if (!leftRecord.nextDueAt && rightRecord.nextDueAt) {
        return 1;
      }

      return 0;
    });

export const getRecordsWithNextDateCount = (records: readonly VaccinationRecord[]): number =>
  records.reduce(
    (accumulator, record) => accumulator + Number(Boolean(resolveVaccinationRecordNextDueAt(record))),
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
    if (!record.nextDueAt) {
      return false;
    }

    const dueDate = parseIsoDateToUtc(record.nextDueAt);

    if (!dueDate) {
      return false;
    }

    return dueDate >= todayDate && dueDate <= nextYearDate;
  });
};

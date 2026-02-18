import { VACCINATION_ISO_DATE_PATTERN } from '../constants/vaccination';
import type { AppLanguage } from '../interfaces/language';

const DATE_LOCALE_BY_LANGUAGE: Record<AppLanguage, string> = {
  de: 'de-DE',
  en: 'en-US',
  ru: 'ru-RU',
};

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};

const toIsoPart = (value: number) => String(value).padStart(2, '0');

export const isIsoDateValue = (value: string): boolean => VACCINATION_ISO_DATE_PATTERN.test(value);

export const getTodayIsoDate = (): string => {
  const now = new Date();

  return [now.getFullYear(), toIsoPart(now.getMonth() + 1), toIsoPart(now.getDate())].join('-');
};

export const parseIsoDateToUtc = (value: string): Date | null => {
  if (!isIsoDateValue(value)) {
    return null;
  }

  const [yearString, monthString, dayString] = value.split('-');
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day));

  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() + 1 !== month ||
    utcDate.getUTCDate() !== day
  ) {
    return null;
  }

  return utcDate;
};

export const formatDateByLanguage = (value: string, language: AppLanguage): string => {
  const parsedDate = parseIsoDateToUtc(value);

  if (!parsedDate) {
    return value;
  }

  return new Intl.DateTimeFormat(DATE_LOCALE_BY_LANGUAGE[language], DATE_FORMAT_OPTIONS).format(parsedDate);
};

export const normalizeDateInputValue = (value: string): string | null => {
  if (!value.trim()) {
    return null;
  }

  return value;
};

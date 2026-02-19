import type { AppLanguage } from '../interfaces/language';

import { de } from './locales/de';
import { en } from './locales/en';
import { ru } from './locales/ru';

export const supportedLanguages: readonly AppLanguage[] = ['ru', 'de', 'en'];
export const DEFAULT_LANGUAGE: AppLanguage = 'en';

export const resources = {
  ru,
  de,
  en,
} as const;

export const isSupportedLanguage = (language: string): language is AppLanguage =>
  supportedLanguages.includes(language as AppLanguage);

export const resolveAppLanguage = (language: string | null | undefined): AppLanguage =>
  language && isSupportedLanguage(language) ? language : DEFAULT_LANGUAGE;

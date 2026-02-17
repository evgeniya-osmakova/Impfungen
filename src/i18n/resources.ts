import { de } from './locales/de';
import { en } from './locales/en';
import { ru } from './locales/ru';

export const supportedLanguages = ['ru', 'de', 'en'] as const;

export type AppLanguage = (typeof supportedLanguages)[number];

export const LANGUAGE_STORAGE_KEY = 'app-language';

export const resources = {
  ru,
  de,
  en,
} as const;

export const isSupportedLanguage = (language: string): language is AppLanguage =>
  supportedLanguages.includes(language as AppLanguage);

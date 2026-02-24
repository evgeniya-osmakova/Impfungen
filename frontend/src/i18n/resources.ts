import i18n from 'src/i18n/index.ts'

import type { AppLanguage } from '../interfaces/language';

import { de } from './locales/de';
import { en } from './locales/en';
import { ru } from './locales/ru';

const APP_LANGUAGE_VALUES = ['ru', 'de', 'en'] as const;
export const supportedLanguages: readonly AppLanguage[] = APP_LANGUAGE_VALUES;
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

export const syncLanguage = (language: AppLanguage): void => {
  if (resolveAppLanguage(i18n.resolvedLanguage) === language) {
    return;
  }

  void i18n.changeLanguage(language).catch((error) => {
    console.error('Unable to switch i18n language.', error);
  });
};

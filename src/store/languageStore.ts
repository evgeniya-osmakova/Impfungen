import { create } from 'zustand';

import i18n from '../i18n';
import { LANGUAGE_STORAGE_KEY, resolveAppLanguage } from '../i18n/resources';
import type { AppLanguage } from '../interfaces/language';

interface LanguageStore {
  changeLanguage: (nextLanguage: AppLanguage) => void;
}

export const useLanguageStore = create<LanguageStore>(() => ({
  changeLanguage: (nextLanguage) => {
    const selectedLanguage = resolveAppLanguage(i18n.resolvedLanguage);

    if (nextLanguage === selectedLanguage) {
      return;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    }

    void i18n.changeLanguage(nextLanguage);
  },
}));


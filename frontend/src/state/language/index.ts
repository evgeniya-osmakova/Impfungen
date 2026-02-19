import { create } from 'zustand';

import { getProfileApi } from '../../api/profileApi';
import i18n from '../../i18n';
import { resolveAppLanguage } from '../../i18n/resources';
import type { AppLanguage } from '../../interfaces/language';

interface LanguageStore {
  language: AppLanguage;
  changeLanguage: (nextLanguage: AppLanguage) => void;
  setLanguage: (initialLanguage: AppLanguage) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: 'en',
  changeLanguage: (nextLanguage) => {
    const selectedLanguage = resolveAppLanguage(i18n.resolvedLanguage);

    if (nextLanguage === selectedLanguage) {
      return;
    }

    const profileApi = getProfileApi();

    if (profileApi) {
      void profileApi.setLanguage(nextLanguage).catch((error) => {
        console.error('Unable to persist language on backend.', error);
      });
    }

    void i18n.changeLanguage(nextLanguage);
  },
  setLanguage: (initialLanguage) => {
    set({ language: initialLanguage })
  }
}));

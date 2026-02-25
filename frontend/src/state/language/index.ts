import { create } from 'zustand';

import { getProfileApi } from '../../api/profileApi';
import i18n from '../../i18n';
import { resolveAppLanguage, syncLanguage } from '../../i18n/resources'
import type { AppLanguage } from '../../interfaces/language';

interface LanguageStore {
  language: AppLanguage;
  changeLanguage: (nextLanguage: AppLanguage) => void;
  setLanguage: (initialLanguage: AppLanguage) => void;
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  language: resolveAppLanguage(i18n?.resolvedLanguage),
  changeLanguage: (nextLanguage) => {
    const previousLanguage = get().language;

    if (nextLanguage === previousLanguage) {
      return;
    }

    set({ language: nextLanguage });

    const profileApi = getProfileApi();

    if (profileApi) {
      void profileApi.setLanguage(nextLanguage).catch((error) => {
        console.error('Unable to persist language on backend.', error);

        if (get().language !== nextLanguage) {
          return;
        }

        set({ language: previousLanguage });
        syncLanguage(previousLanguage);
      });
    }

    syncLanguage(nextLanguage);
  },
  setLanguage: (initialLanguage) => {
    if (get().language !== initialLanguage) {
      set({ language: initialLanguage });
    }

    syncLanguage(initialLanguage);
  },
}));

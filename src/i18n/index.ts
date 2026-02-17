import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, isSupportedLanguage, LANGUAGE_STORAGE_KEY } from './resources';

const defaultLanguage = 'ru';

const resolveInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return defaultLanguage;
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (storedLanguage && isSupportedLanguage(storedLanguage)) {
    return storedLanguage;
  }

  return defaultLanguage;
};

void i18n.use(initReactI18next).init({
  resources,
  lng: resolveInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  initImmediate: false,
});

export default i18n;

import { useEffect } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { AUTH_ERROR_TRANSLATION_KEY_BY_CODE } from './constants/auth';
import type { AppLanguage } from './interfaces/language';
import {
  LANGUAGE_STORAGE_KEY,
  resolveAppLanguage,
  supportedLanguages,
} from './i18n/resources';
import { useAuthStore } from './store/authStore';
import { Button, Error } from './ui';

import styles from './App.module.css';

const featureKeys = ['history', 'schedule', 'reminders'] as const;

const App = () => {
  const { i18n, t } = useTranslation();
  const { authError, handleAuthClick, initialize, isAuthenticated, isInitialized, isInitializing, oauthConfigured } =
    useAuthStore();
  const selectedLanguage = resolveAppLanguage(i18n.resolvedLanguage);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const handleLanguageChange = (nextLanguage: AppLanguage) => {
    if (nextLanguage === selectedLanguage) {
      return;
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    void i18n.changeLanguage(nextLanguage);
  };

  const authErrorMessage = authError
    ? [t(AUTH_ERROR_TRANSLATION_KEY_BY_CODE[authError.code]), authError.details]
        .filter(Boolean)
        .join(' ')
    : null;

  return (
    <main className={styles.app}>
      <section className={styles.hero}>
        <header className={styles.hero__topBar}>
          <p className={styles.hero__badge}>{t('hero.badge')}</p>
          <div className={styles.hero__actions}>
            <div className={styles.hero__language} role="group" aria-label={t('language.label')}>
              {supportedLanguages.map((language) => (
                <button
                  key={language}
                  aria-pressed={selectedLanguage === language}
                  className={classNames(
                    styles.hero__languageButton,
                    selectedLanguage === language && styles['hero__languageButton--active'],
                  )}
                  onClick={() => handleLanguageChange(language)}
                  type="button"
                >
                  {t(`language.${language}`)}
                </button>
              ))}
            </div>
            <Button
              className={styles.hero__loginButton}
              disabled={isInitializing}
              onClick={handleAuthClick}
              type="button"
            >
              {isAuthenticated ? t('actions.logout') : t('actions.login')}
            </Button>
          </div>
        </header>
        <h1 className={styles.hero__title}>{t('hero.title')}</h1>
        <p className={styles.hero__description}>{t('hero.description')}</p>
        {!isInitialized && <p className={styles.hero__authHint}>{t('auth.loading')}</p>}
        {isAuthenticated && <p className={styles.hero__authSuccess}>{t('auth.connected')}</p>}
        <Error className={styles.hero__authError} message={authErrorMessage} />
        {!oauthConfigured && !isAuthenticated && (
          <p className={styles.hero__authHint}>{t('auth.configHint')}</p>
        )}
        <div className={styles.hero__features}>
          {featureKeys.map((featureKey) => (
            <article className={styles.hero__featureCard} key={featureKey}>
              <h2 className={styles.hero__featureTitle}>{t(`hero.features.${featureKey}Title`)}</h2>
              <p className={styles.hero__featureDescription}>
                {t(`hero.features.${featureKey}Description`)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default App;

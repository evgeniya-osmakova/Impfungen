import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import {
  LANGUAGE_STORAGE_KEY,
  resolveAppLanguage,
  supportedLanguages,
} from '../i18n/resources';
import type { AppLanguage } from '../interfaces/language';
import { Button } from '../ui';

import styles from './LoginPage.module.css';

const featureKeys = ['history', 'schedule', 'reminders'] as const;

interface LoginPageProps {
  isInitializing: boolean;
  onLoginClick: () => void;
}

export const LoginPage = ({ isInitializing, onLoginClick }: LoginPageProps) => {
  const { i18n, t } = useTranslation();
  const selectedLanguage = resolveAppLanguage(i18n.resolvedLanguage);

  const handleLanguageChange = (nextLanguage: AppLanguage) => {
    if (nextLanguage === selectedLanguage) {
      return;
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    void i18n.changeLanguage(nextLanguage);
  };

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginPage__hero}>
        <header className={styles.loginPage__topBar}>
          <p className={styles.loginPage__badge}>{t('hero.badge')}</p>
          <div className={styles.loginPage__actions}>
            <div className={styles.loginPage__language} role="group" aria-label={t('language.label')}>
              {supportedLanguages.map((language) => (
                <button
                  key={language}
                  aria-pressed={selectedLanguage === language}
                  className={classNames(
                    styles.loginPage__languageButton,
                    selectedLanguage === language && styles.loginPage__languageButtonActive,
                  )}
                  onClick={() => handleLanguageChange(language)}
                  type="button"
                >
                  {t(`language.${language}`)}
                </button>
              ))}
            </div>
            <Button
              className={styles.loginPage__loginButton}
              disabled={isInitializing}
              onClick={onLoginClick}
              type="button"
            >
              {t('actions.login')}
            </Button>
          </div>
        </header>
        <h1 className={styles.loginPage__title}>{t('hero.title')}</h1>
        <p className={styles.loginPage__description}>{t('hero.description')}</p>
        {isInitializing && <p className={styles.loginPage__authHint}>{t('auth.loading')}</p>}
        <div className={styles.loginPage__features}>
          {featureKeys.map((featureKey) => (
            <article className={styles.loginPage__featureCard} key={featureKey}>
              <h2 className={styles.loginPage__featureTitle}>{t(`hero.features.${featureKey}Title`)}</h2>
              <p className={styles.loginPage__featureDescription}>
                {t(`hero.features.${featureKey}Description`)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

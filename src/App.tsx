import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { isSupportedLanguage, LANGUAGE_STORAGE_KEY, supportedLanguages } from './i18n/resources';
import { useCounterStore } from './store/counterStore';
import { Button, Separator } from './ui';

import styles from './App.module.css';

const App = () => {
  const { i18n, t } = useTranslation();
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);
  const resolvedLanguage = i18n.resolvedLanguage;
  const selectedLanguage =
    resolvedLanguage && isSupportedLanguage(resolvedLanguage) ? resolvedLanguage : 'ru';

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = event.target.value;

    if (!isSupportedLanguage(nextLanguage)) {
      return;
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    void i18n.changeLanguage(nextLanguage);
  };

  return (
    <main className={styles.app}>
      <section className={styles.app__card}>
        <header className={styles.app__header}>
          <h1 className={styles.app__title}>{t('app.title')}</h1>
          <label className={styles.app__language} htmlFor="language-select">
            <span className={styles.app__languageLabel}>{t('language.label')}</span>
            <select
              className={styles.app__languageSelect}
              id="language-select"
              onChange={handleLanguageChange}
              value={selectedLanguage}
            >
              {supportedLanguages.map((language) => (
                <option key={language} value={language}>
                  {t(`language.${language}`)}
                </option>
              ))}
            </select>
          </label>
        </header>
        <p className={styles.app__description}>{t('app.description')}</p>
        <p className={styles.app__counter}>{t('app.currentValue', { count })}</p>
        <Separator className={styles.app__separator} decorative />
        <div className={styles.app__controls}>
          <Button onClick={increment} variant="primary">
            {t('actions.increment')}
          </Button>
          <Button onClick={decrement} variant="secondary">
            {t('actions.decrement')}
          </Button>
          <Button onClick={reset} variant="danger">
            {t('actions.reset')}
          </Button>
        </div>
      </section>
    </main>
  );
};

export default App;

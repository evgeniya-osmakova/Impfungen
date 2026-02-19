import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { HTML_BUTTON_TYPE, HTML_ROLE } from '../constants/ui';
import {
  resolveAppLanguage,
  supportedLanguages,
} from '../i18n/resources';
import { useLanguageStore } from '../state/language';

import styles from './InternalLayout.module.css';

export const InternalLayout = ({ children }: PropsWithChildren) => {
  const { i18n, t } = useTranslation();
  const { changeLanguage } = useLanguageStore();
  const selectedLanguage = resolveAppLanguage(i18n.resolvedLanguage);
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.layout}>
      <header className={styles.layout__header}>
        <div className={styles.layout__headerInner}>
          <p className={styles.layout__brand}>Impfungen</p>
          <div
            aria-label={t('language.label')}
            className={styles.layout__language}
            role={HTML_ROLE.group}
          >
            {supportedLanguages.map((language) => (
              <button
                aria-pressed={selectedLanguage === language}
                className={classNames(
                  styles.layout__languageButton,
                  selectedLanguage === language && styles.layout__languageButtonActive,
                )}
                key={language}
                onClick={() => changeLanguage(language)}
                type={HTML_BUTTON_TYPE.button}
              >
                {t(`language.${language}`)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className={styles.layout__main}>
        {children}
      </main>

      <footer className={styles.layout__footer}>
        <div className={styles.layout__footerInner}>{currentYear}</div>
      </footer>
    </div>
  );
};

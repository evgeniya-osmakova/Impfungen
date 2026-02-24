import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { APP_ROUTE } from '../constants/app-route';
import { HTML_BUTTON_TYPE, HTML_ROLE } from '../constants/ui';
import { supportedLanguages } from '../i18n/resources';
import { isProfileAccountComplete, resolvePrimaryAccount, useAccountsStore } from '../state/accounts';
import { useLanguageStore } from '../state/language';

import styles from './InternalLayout.module.css';

export const InternalLayout = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  const { language: selectedLanguage, changeLanguage } = useLanguageStore();
  const accounts = useAccountsStore((state) => state.accounts);
  const primaryAccount = resolvePrimaryAccount(accounts);
  const shouldShowRouteNav = !primaryAccount || isProfileAccountComplete(primaryAccount);
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.layout}>
      <header className={styles.layout__header}>
        <div className={styles.layout__headerInner}>
          <div className={styles.layout__left}>
            <div className={styles.layout__brand}>
              <span aria-hidden="true" className={styles.layout__brandMark} />
              <div className={styles.layout__brandText}>
                <span className={styles.layout__brandTitle}>{t('hero.badge')}</span>
              </div>
            </div>
            {shouldShowRouteNav ? (
              <nav className={styles.layout__nav}>
                <NavLink
                  className={({ isActive }) => classNames(
                    styles.layout__navLink,
                    isActive && styles.layout__navLinkActive,
                  )}
                  to={APP_ROUTE.home}
                >
                  {t('internal.nav.journal')}
                </NavLink>
                <NavLink
                  className={({ isActive }) => classNames(
                    styles.layout__navLink,
                    isActive && styles.layout__navLinkActive,
                  )}
                  to={APP_ROUTE.account}
                >
                  {t('internal.nav.account')}
                </NavLink>
              </nav>
            ) : null}
          </div>
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

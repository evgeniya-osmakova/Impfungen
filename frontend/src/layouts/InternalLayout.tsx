import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { APP_ROUTE } from 'src/constants/app-route';
import { supportedLanguages } from 'src/i18n/resources';
import {
  isProfileAccountComplete,
  resolvePrimaryAccount,
  useAccountsStore,
} from 'src/state/accounts';
import { useLanguageStore } from 'src/state/language';
import { RadioPillGroup } from 'src/ui';

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
                  className={({ isActive }) =>
                    classNames(styles.layout__navLink, isActive && styles.layout__navLinkActive)
                  }
                  to={APP_ROUTE.home}
                >
                  {t('internal.nav.journal')}
                </NavLink>
                <NavLink
                  className={({ isActive }) =>
                    classNames(styles.layout__navLink, isActive && styles.layout__navLinkActive)
                  }
                  to={APP_ROUTE.account}
                >
                  {t('internal.nav.account')}
                </NavLink>
              </nav>
            ) : null}
          </div>
          <RadioPillGroup
            controlActiveClassName={styles.layout__languageButtonActive}
            controlClassName={styles.layout__languageButton}
            controlsClassName={styles.layout__language}
            legend={t('language.label')}
            onChange={changeLanguage}
            options={supportedLanguages.map((language) => ({
              label: t(`language.${language}`),
              value: language,
            }))}
            unstyled
            value={selectedLanguage}
          />
        </div>
      </header>

      <main className={styles.layout__main}>{children}</main>

      <footer className={styles.layout__footer}>
        <div className={styles.layout__footerInner}>{currentYear}</div>
      </footer>
    </div>
  );
};

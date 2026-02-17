import type { PropsWithChildren } from 'react';

import type { AuthUser } from '../interfaces/auth';

import styles from './InternalLayout.module.css';

interface InternalLayoutProps {
  user: AuthUser;
}

const getUserInitial = (user: AuthUser) => {
  const source = user.name || user.login || user.email;

  return source.trim().charAt(0).toUpperCase();
};

export const InternalLayout = ({ children, user }: PropsWithChildren<InternalLayoutProps>) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.header__inner}>
          <p className={styles.brand}>Impfungen</p>
          <div className={styles.userBlock}>
            <span aria-hidden className={styles.avatar}>
              {getUserInitial(user)}
            </span>
            <div className={styles.userData}>
              <p className={styles.userName}>{user.name}</p>
              <p className={styles.userMeta}>{user.login}</p>
              <p className={styles.userMeta}>{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footer__inner}>{currentYear}</div>
      </footer>
    </div>
  );
};

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
    <div className={styles.layout}>
      <header className={styles.layout__header}>
        <div className={styles.layout__headerInner}>
          <p className={styles.layout__brand}>Impfungen</p>
          <div className={styles.layout__userBlock}>
            <span aria-hidden className={styles.layout__avatar}>
              {getUserInitial(user)}
            </span>
            <div className={styles.layout__userData}>
              <p className={styles.layout__userName}>{user.name}</p>
              <p className={styles.layout__userMeta}>{user.login}</p>
              <p className={styles.layout__userMeta}>{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.layout__main}>{children}</main>

      <footer className={styles.layout__footer}>
        <div className={styles.layout__footerInner}>{currentYear}</div>
      </footer>
    </div>
  );
};

import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';

import styles from './PageHero.module.css';

interface PageHeroProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  description: ReactNode;
  title: ReactNode;
}

export const PageHero = ({ className, description, title, ...props }: PageHeroProps) => (
  <header className={classNames(styles.pageHero, className)} {...props}>
    <h1 className={styles.pageHero__title}>{title}</h1>
    <p className={styles.pageHero__description}>{description}</p>
  </header>
);

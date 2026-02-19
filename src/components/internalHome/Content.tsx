import { useEffect } from 'react';

import { useInternalHomeUiStore } from '../../store/internalHomeUiStore';

import { CatalogPane } from './CatalogPane';
import { Modals } from './Modals';
import { TopRow } from './TopRow';
import { Workspace } from './Workspace';

import styles from './Content.module.css';

export const Content = () => {
  const { resetUi } = useInternalHomeUiStore();

  useEffect(() => {
    resetUi();

    return () => {
      resetUi();
    };
  }, [resetUi]);

  return (
    <div className={styles.internalHomeContent}>
      <TopRow />
      <Workspace />
      <Modals />
      <CatalogPane />
    </div>
  );
};

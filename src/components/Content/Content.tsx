import { useEffect } from 'react';

import { useInternalHomeUiStore } from '../../state/internalHomeUi';

import { CatalogPane } from './components/CatalogPane/CatalogPane';
import { Modals } from './components/Modals/Modals';
import { TopRow } from './components/TopRow/TopRow';
import { Workspace } from './components/Workspace/Workspace';

import styles from './Content.module.css';

export const Content = () => {
  const resetUi = useInternalHomeUiStore((state) => state.resetUi);

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

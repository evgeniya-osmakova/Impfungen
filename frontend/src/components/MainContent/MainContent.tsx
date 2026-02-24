import { useEffect } from 'react';

import { useMainPageUiStore } from 'src/state/mainPageUi';

import { CatalogPane } from './components/CatalogPane/CatalogPane';
import { Modals } from './components/Modals/Modals';
import { TopRow } from './components/TopRow/TopRow';
import { Workspace } from './components/Workspace/Workspace';

import styles from './MainContent.module.css';

export const MainContent = () => {
  const resetUi = useMainPageUiStore((state) => state.resetUi);

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

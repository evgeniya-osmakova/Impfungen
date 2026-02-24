import classNames from 'classnames';
import type { HTMLAttributes } from 'react';

import styles from './SurfacePanel.module.css';

type SurfacePanelTag = 'article' | 'div' | 'section';

interface SurfacePanelProps extends HTMLAttributes<HTMLElement> {
  as?: SurfacePanelTag;
  compact?: boolean;
  topAccent?: boolean;
}

export const SurfacePanel = ({
  as = 'div',
  className,
  compact = false,
  topAccent = false,
  ...props
}: SurfacePanelProps) => {
  const Component = as;

  return (
    <Component
      className={classNames(
        styles.surfacePanel,
        compact && styles.surfacePanelCompact,
        topAccent && styles.surfacePanelTopAccent,
        className,
      )}
      {...props}
    />
  );
};

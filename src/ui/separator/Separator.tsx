import * as SeparatorPrimitive from '@radix-ui/react-separator';
import classNames from 'classnames';
import type { ComponentPropsWithoutRef } from 'react';

import styles from './Separator.module.css';

type SeparatorProps = ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>;

export const Separator = ({ className, ...props }: SeparatorProps) => {
  return <SeparatorPrimitive.Root className={classNames(styles.separator, className)} {...props} />;
};

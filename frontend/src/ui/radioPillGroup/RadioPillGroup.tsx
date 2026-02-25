import * as ToggleGroup from '@radix-ui/react-toggle-group';
import classNames from 'classnames';
import type { ReactNode } from 'react';

import { RADIO_PILL_GROUP_SIZE } from '../../constants/ui';

import styles from './RadioPillGroup.module.css';

interface RadioPillOption<T extends string> {
  ariaLabel?: string;
  disabled?: boolean;
  label: ReactNode;
  value: T;
}

type RadioPillGroupSize =
  (typeof RADIO_PILL_GROUP_SIZE)[keyof typeof RADIO_PILL_GROUP_SIZE];

interface RadioPillGroupProps<T extends string> {
  controlActiveClassName?: string;
  controlClassName?: string;
  controlsClassName?: string;
  legend: string;
  onChange: (value: T) => void | Promise<void>;
  options: readonly RadioPillOption<T>[];
  size?: RadioPillGroupSize;
  unstyled?: boolean;
  value: T | null;
}

const sizeClassNameByValue: Record<RadioPillGroupSize, string> = {
  [RADIO_PILL_GROUP_SIZE.compact]: styles.radioPillGroup__controlCompact,
  [RADIO_PILL_GROUP_SIZE.default]: styles.radioPillGroup__controlDefault,
};

export const RadioPillGroup = <T extends string>({
  controlActiveClassName,
  controlClassName,
  controlsClassName,
  legend,
  onChange,
  options,
  size = RADIO_PILL_GROUP_SIZE.default,
  unstyled = false,
  value,
}: RadioPillGroupProps<T>) => {
  return (
    <fieldset className={styles.radioPillGroup}>
      <legend className={styles.radioPillGroup__legend}>{legend}</legend>
      <ToggleGroup.Root
        aria-label={legend}
        className={classNames(styles.radioPillGroup__controls, controlsClassName)}
        onValueChange={(nextValue: T) => {
          if (!nextValue || nextValue === value) {
            return;
          }

          void onChange(nextValue);
        }}
        type="single"
        value={value ?? ''}
      >
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <ToggleGroup.Item
              aria-label={option.ariaLabel}
              className={classNames(
                !unstyled && styles.radioPillGroup__control,
                !unstyled && sizeClassNameByValue[size],
                controlClassName,
                isActive && !unstyled && styles.radioPillGroup__controlActive,
                isActive && controlActiveClassName,
              )}
              disabled={option.disabled}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </ToggleGroup.Item>
          );
        })}
      </ToggleGroup.Root>
    </fieldset>
  );
};

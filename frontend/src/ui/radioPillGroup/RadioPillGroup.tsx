import classNames from 'classnames';

import { HTML_BUTTON_TYPE, RADIO_PILL_GROUP_SIZE } from '../../constants/ui';

import styles from './RadioPillGroup.module.css';

interface RadioPillOption<T extends string> {
  label: string;
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
  value,
}: RadioPillGroupProps<T>) => (
  <fieldset className={styles.radioPillGroup}>
    <legend className={styles.radioPillGroup__legend}>{legend}</legend>
    <div className={classNames(styles.radioPillGroup__controls, controlsClassName)}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            aria-pressed={isActive}
            className={classNames(
              styles.radioPillGroup__control,
              sizeClassNameByValue[size],
              controlClassName,
              isActive && styles.radioPillGroup__controlActive,
              isActive && controlActiveClassName,
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            type={HTML_BUTTON_TYPE.button}
          >
            <span className={styles.radioPillGroup__controlText}>{option.label}</span>
          </button>
        );
      })}
    </div>
  </fieldset>
);

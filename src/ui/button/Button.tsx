import { Slot } from '@radix-ui/react-slot';
import classNames from 'classnames';
import type { ButtonHTMLAttributes } from 'react';

import { BUTTON_VARIANT, HTML_TAG } from '../../constants/ui';

import styles from './Button.module.css';

type ButtonVariant = (typeof BUTTON_VARIANT)[keyof typeof BUTTON_VARIANT];

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  fullWidth?: boolean;
  variant?: ButtonVariant;
}

const variantClassName: Record<ButtonVariant, string> = {
  [BUTTON_VARIANT.primary]: styles.buttonPrimary,
  [BUTTON_VARIANT.secondary]: styles.buttonSecondary,
  [BUTTON_VARIANT.danger]: styles.buttonDanger,
};

export const Button = ({
  asChild = false,
  className,
  fullWidth = false,
  variant = BUTTON_VARIANT.primary,
  ...props
}: ButtonProps) => {
  const Component = asChild ? Slot : HTML_TAG.button;

  return (
    <Component
      className={classNames(
        styles.button,
        variantClassName[variant],
        fullWidth && styles.buttonFullWidth,
        className,
      )}
      {...props}
    />
  );
};

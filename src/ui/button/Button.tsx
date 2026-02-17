import { Slot } from '@radix-ui/react-slot';
import classNames from 'classnames';
import type { ButtonHTMLAttributes } from 'react';

import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  fullWidth?: boolean;
  variant?: ButtonVariant;
}

const variantClassName: Record<ButtonVariant, string> = {
  primary: styles.buttonPrimary,
  secondary: styles.buttonSecondary,
  danger: styles.buttonDanger,
};

export const Button = ({
  asChild = false,
  className,
  fullWidth = false,
  variant = 'primary',
  ...props
}: ButtonProps) => {
  const Component = asChild ? Slot : 'button';

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

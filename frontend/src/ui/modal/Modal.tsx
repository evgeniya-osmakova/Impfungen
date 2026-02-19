import { type KeyboardEvent, type PropsWithChildren, useEffect, useRef } from 'react';
import CloseIcon from 'src/assets/icons/close.svg';

import { Key } from '../../constants/key';
import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from '../../constants/ui';
import { Button } from '../button/Button';

import styles from './Modal.module.css';

interface ModalProps extends PropsWithChildren {
  ariaLabel: string;
  closeAriaLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Modal = ({
  ariaLabel,
  children,
  closeAriaLabel,
  isOpen,
  onClose,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    dialogRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === String(Key.ESCAPE)) {
      onClose();
    }
  };

  return (
    <dialog
      aria-label={ariaLabel}
      className={styles.modal}
      onKeyDown={handleDialogKeyDown}
      onMouseDown={onClose}
      open
      ref={dialogRef}
      tabIndex={-1}
    >
      <div
        className={styles.modal__dialog}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.modal__head}>
          <Button
            aria-label={closeAriaLabel}
            className={styles.modal__closeButton}
            onClick={onClose}
            type={HTML_BUTTON_TYPE.button}
            variant={BUTTON_VARIANT.secondary}
          >
            <CloseIcon aria-hidden="true" className={styles.modal__closeIcon} />
          </Button>
        </div>
        <div className={styles.modal__body}>{children}</div>
      </div>
    </dialog>
  );
};

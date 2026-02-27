import * as Dialog from '@radix-ui/react-dialog';
import type { PropsWithChildren } from 'react';
import CloseIcon from 'src/assets/icons/close.svg';
import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from 'src/constants/ui';
import { Button } from 'src/ui/button/Button';

import styles from './Modal.module.css';

interface ModalProps extends PropsWithChildren {
  ariaLabel: string;
  closeAriaLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Modal = ({ ariaLabel, children, closeAriaLabel, isOpen, onClose }: ModalProps) => {
  return (
    <Dialog.Root
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      open={isOpen}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={styles.modal__overlay} />
        <Dialog.Content aria-label={ariaLabel} className={styles.modal__content}>
          <div className={styles.modal__head}>
            <Dialog.Close asChild>
              <Button
                aria-label={closeAriaLabel}
                className={styles.modal__closeButton}
                type={HTML_BUTTON_TYPE.button}
                variant={BUTTON_VARIANT.secondary}
              >
                <CloseIcon aria-hidden="true" className={styles.modal__closeIcon} />
              </Button>
            </Dialog.Close>
          </div>
          <div className={styles.modal__body}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

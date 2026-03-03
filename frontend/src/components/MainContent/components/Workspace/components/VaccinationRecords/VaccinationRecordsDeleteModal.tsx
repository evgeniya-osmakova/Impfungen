import { useTranslation } from 'react-i18next';
import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from 'src/constants/ui';
import { Button, Error, Modal } from 'src/ui';

import styles from './VaccinationRecords.module.css';

interface VaccinationRecordsDeleteModalProps {
  confirmLabel: string;
  isOpen: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  requestError: string | null;
  title: string;
  warning: string;
}

export const VaccinationRecordsDeleteModal = ({
  confirmLabel,
  isOpen,
  message,
  onCancel,
  onConfirm,
  requestError,
  title,
  warning,
}: VaccinationRecordsDeleteModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      ariaLabel={title}
      closeAriaLabel={t('internal.form.actions.closeModal')}
      isOpen={isOpen}
      onClose={onCancel}
    >
      <section className={styles.vaccinationRecords__deleteModal}>
        <h3 className={styles.vaccinationRecords__deleteModalTitle}>{title}</h3>
        <p className={styles.vaccinationRecords__deleteModalText}>{message}</p>
        <p className={styles.vaccinationRecords__deleteModalWarning}>{warning}</p>
        <Error className={styles.vaccinationRecords__deleteModalWarning} message={requestError} />
        <div className={styles.vaccinationRecords__deleteModalActions}>
          <Button
            className={styles.vaccinationRecords__deleteModalButton}
            onClick={onCancel}
            type={HTML_BUTTON_TYPE.button}
            variant={BUTTON_VARIANT.secondary}
          >
            {t('internal.records.deleteConfirm.cancel')}
          </Button>
          <Button
            className={styles.vaccinationRecords__deleteModalButton}
            onClick={onConfirm}
            type={HTML_BUTTON_TYPE.button}
            variant={BUTTON_VARIANT.danger}
          >
            {confirmLabel}
          </Button>
        </div>
      </section>
    </Modal>
  );
};

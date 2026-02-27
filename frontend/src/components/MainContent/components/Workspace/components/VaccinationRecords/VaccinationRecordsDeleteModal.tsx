import { useTranslation } from 'react-i18next';
import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from 'src/constants/ui';
import { Button, Error, Modal } from 'src/ui';

import styles from './VaccinationRecords.module.css';

interface VaccinationRecordsDeleteModalProps {
  deleteCandidateId: string | null;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  requestError: string | null;
  resolveDiseaseLabelById: (diseaseId: string) => string;
}

export const VaccinationRecordsDeleteModal = ({
  deleteCandidateId,
  onCancel,
  onConfirm,
  requestError,
  resolveDiseaseLabelById,
}: VaccinationRecordsDeleteModalProps) => {
  const { t } = useTranslation();
  const deleteCandidateDiseaseLabel = deleteCandidateId
    ? resolveDiseaseLabelById(deleteCandidateId)
    : null;

  return (
    <Modal
      ariaLabel={t('internal.records.deleteConfirm.title')}
      closeAriaLabel={t('internal.form.actions.closeModal')}
      isOpen={Boolean(deleteCandidateId)}
      onClose={onCancel}
    >
      <section className={styles.vaccinationRecords__deleteModal}>
        <h3 className={styles.vaccinationRecords__deleteModalTitle}>
          {t('internal.records.deleteConfirm.title')}
        </h3>
        <p className={styles.vaccinationRecords__deleteModalText}>
          {t('internal.records.deleteConfirm.message', {
            disease: deleteCandidateDiseaseLabel ?? '',
          })}
        </p>
        <p className={styles.vaccinationRecords__deleteModalWarning}>
          {t('internal.records.deleteConfirm.warning')}
        </p>
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
            {t('internal.records.deleteConfirm.confirm')}
          </Button>
        </div>
      </section>
    </Modal>
  );
};

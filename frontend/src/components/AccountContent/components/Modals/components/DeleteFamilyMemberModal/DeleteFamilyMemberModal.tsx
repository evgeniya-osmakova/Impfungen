import { useTranslation } from 'react-i18next';

import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from '../../../../../../constants/ui';
import { Button, Modal } from '../../../../../../ui';

import { useDeleteFamilyMemberModalController } from './useDeleteFamilyMemberModalController';

import styles from './DeleteFamilyMemberModal.module.css';

export const DeleteFamilyMemberModal = () => {
  const { t } = useTranslation();
  const {
    deleteCandidateAccount,
    handleCloseDeleteFamilyMemberModal,
    handleDeleteFamilyMember,
    isDeleting,
    requestError,
  } = useDeleteFamilyMemberModalController();

  return (
    <Modal
      ariaLabel={t('account.deleteConfirm.title')}
      closeAriaLabel={t('internal.form.actions.closeModal')}
      isOpen={Boolean(deleteCandidateAccount)}
      onClose={handleCloseDeleteFamilyMemberModal}
    >
      <section className={styles.deleteFamilyMemberModal}>
        <h3 className={styles.deleteFamilyMemberModal__title}>{t('account.deleteConfirm.title')}</h3>
        <p className={styles.deleteFamilyMemberModal__text}>
          {t('account.deleteConfirm.message', {
            name: deleteCandidateAccount?.name ?? t('account.placeholders.noName'),
          })}
        </p>
        <p className={styles.deleteFamilyMemberModal__warning}>{t('account.deleteConfirm.warning')}</p>
        {requestError ? (
          <p className={styles.deleteFamilyMemberModal__requestError} role="alert">
            {requestError}
          </p>
        ) : null}
        <div className={styles.deleteFamilyMemberModal__actions}>
          <Button
            disabled={isDeleting}
            onClick={handleCloseDeleteFamilyMemberModal}
            type={HTML_BUTTON_TYPE.button}
            variant={BUTTON_VARIANT.secondary}
          >
            {t('account.deleteConfirm.cancel')}
          </Button>
          <Button
            disabled={isDeleting}
            onClick={() => void handleDeleteFamilyMember()}
            type={HTML_BUTTON_TYPE.button}
            variant={BUTTON_VARIANT.danger}
          >
            {isDeleting ? t('account.actions.deleting') : t('account.deleteConfirm.confirm')}
          </Button>
        </div>
      </section>
    </Modal>
  );
};

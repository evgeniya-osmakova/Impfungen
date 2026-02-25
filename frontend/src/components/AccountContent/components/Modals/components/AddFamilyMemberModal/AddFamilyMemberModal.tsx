import { useTranslation } from 'react-i18next';
import {
  CURRENT_YEAR,
  EMPTY_COUNTRY_VALUE,
  MIN_BIRTH_YEAR,
} from 'src/constants/account';
import { resolveCountryLabel } from 'src/helpers/resolveLabel.ts';

import { BUTTON_VARIANT, HTML_BUTTON_TYPE, HTML_INPUT_TYPE } from '../../../../../../constants/ui';
import { VACCINATION_COUNTRY_OPTIONS } from '../../../../../../constants/vaccination';
import type { CountryCode } from '../../../../../../interfaces/base';
import type { AccountPageUi } from 'src/interfaces/accountPageUi.ts';
import { Button, Input, Modal, Select } from '../../../../../../ui';

import { useAddFamilyMemberModalController } from './useAddFamilyMemberModalController';

import styles from './AddFamilyMemberModal.module.css';

interface AddFamilyMemberModalProps {
  ui: Pick<
    AccountPageUi,
    'closeAddMemberModal' | 'isAddMemberModalOpen' | 'isAddingMember' | 'setIsAddingMember'
  >;
}

export const AddFamilyMemberModal = ({ ui }: AddFamilyMemberModalProps) => {
  const { t } = useTranslation();
  const {
    handleCloseAddMemberModal,
    handleCreateFamilyMember,
    handleNewMemberBirthYearChange,
    handleNewMemberCountryChange,
    handleNewMemberNameChange,
    isAddMemberModalOpen,
    isAddingMember,
    newMemberBirthYear,
    newMemberCountry,
    newMemberErrors,
    newMemberName,
    newMemberRequestError,
  } = useAddFamilyMemberModalController(ui);

  return (
    <Modal
      ariaLabel={t('account.add.title')}
      closeAriaLabel={t('internal.form.actions.closeModal')}
      isOpen={isAddMemberModalOpen}
      onClose={handleCloseAddMemberModal}
    >
      <section className={styles.addFamilyMemberModal}>
        <h3 className={styles.addFamilyMemberModal__title}>{t('account.add.title')}</h3>

        <form className={styles.addFamilyMemberModal__form} onSubmit={(event) => void handleCreateFamilyMember(event)}>
          <label className={styles.addFamilyMemberModal__field}>
            <span className={styles.addFamilyMemberModal__label}>{t('account.fields.name')}</span>
            <Input
              className={styles.addFamilyMemberModal__input}
              onChange={(event) => handleNewMemberNameChange(event.target.value)}
              type={HTML_INPUT_TYPE.text}
              value={newMemberName}
            />
            {newMemberErrors.name ? (
              <span className={`${styles.addFamilyMemberModal__error} ${styles.addFamilyMemberModal__fieldError}`}>
                {newMemberErrors.name}
              </span>
            ) : null}
          </label>

          <label className={styles.addFamilyMemberModal__field}>
            <span className={styles.addFamilyMemberModal__label}>{t('account.fields.birthYear')}</span>
            <Input
              className={styles.addFamilyMemberModal__input}
              inputMode="numeric"
              max={CURRENT_YEAR}
              min={MIN_BIRTH_YEAR}
              onChange={(event) => handleNewMemberBirthYearChange(event.target.value)}
              type={HTML_INPUT_TYPE.number}
              value={newMemberBirthYear}
            />
            {newMemberErrors.birthYear ? (
              <span className={`${styles.addFamilyMemberModal__error} ${styles.addFamilyMemberModal__fieldError}`}>
                {newMemberErrors.birthYear}
              </span>
            ) : null}
          </label>

          <label className={styles.addFamilyMemberModal__field}>
            <span className={styles.addFamilyMemberModal__label}>{t('account.fields.country')}</span>
            <div className={styles.addFamilyMemberModal__selectWrap}>
              <Select
                className={styles.addFamilyMemberModal__input}
                onChange={(event) => {
                  const nextValue = event.target.value;

                  handleNewMemberCountryChange(
                    nextValue === EMPTY_COUNTRY_VALUE ? EMPTY_COUNTRY_VALUE : (nextValue as CountryCode),
                  );
                }}
                value={newMemberCountry}
              >
                <option value={EMPTY_COUNTRY_VALUE}>{t('account.fields.countryUnset')}</option>
                {VACCINATION_COUNTRY_OPTIONS.map((countryCode) => (
                  <option key={countryCode} value={countryCode}>
                    {resolveCountryLabel(t, countryCode)}
                  </option>
                ))}
              </Select>
            </div>
            {newMemberErrors.country ? (
              <span className={`${styles.addFamilyMemberModal__error} ${styles.addFamilyMemberModal__fieldError}`}>
                {newMemberErrors.country}
              </span>
            ) : null}
          </label>

          <div className={styles.addFamilyMemberModal__requestErrorSlot}>
            {newMemberRequestError ? (
              <p className={styles.addFamilyMemberModal__requestError} role="alert">
                {newMemberRequestError}
              </p>
            ) : null}
          </div>

          <div className={styles.addFamilyMemberModal__actions}>
            <Button
              disabled={isAddingMember}
              onClick={handleCloseAddMemberModal}
              type={HTML_BUTTON_TYPE.button}
              variant={BUTTON_VARIANT.secondary}
            >
              {t('account.deleteConfirm.cancel')}
            </Button>
            <Button disabled={isAddingMember} type={HTML_BUTTON_TYPE.submit}>
              {isAddingMember ? t('account.actions.adding') : t('account.actions.addMember')}
            </Button>
          </div>
        </form>
      </section>
    </Modal>
  );
};

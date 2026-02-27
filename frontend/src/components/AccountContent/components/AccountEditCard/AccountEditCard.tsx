import { useTranslation } from 'react-i18next';
import TrashIcon from 'src/assets/icons/trash.svg';
import {
  CURRENT_YEAR,
  EMPTY_COUNTRY_VALUE,
  MIN_BIRTH_YEAR,
} from 'src/constants/account';
import { resolveCountryLabel } from 'src/helpers/resolveLabel.ts';
import type { AccountPageUi } from 'src/interfaces/accountPageUi.ts';

import { BUTTON_VARIANT, HTML_BUTTON_TYPE, HTML_INPUT_TYPE } from '../../../../constants/ui';
import { VACCINATION_COUNTRY_OPTIONS } from '../../../../constants/vaccination';
import type { CountryCode } from '../../../../interfaces/base';
import { Button, Input, Select, SurfacePanel } from '../../../../ui';

import { useAccountEditCardController } from './useAccountEditCardController';

import styles from './AccountEditCard.module.css';

interface AccountEditCardProps {
  ui: Pick<AccountPageUi, 'isDeleting' | 'openDeleteFamilyMemberModal'>;
}

export const AccountEditCard = ({ ui }: AccountEditCardProps) => {
  const { t } = useTranslation();
  const {
    editBirthYear,
    editCountry,
    editingAccount,
    editErrors,
    editName,
    editRequestError,
    handleEditBirthYearChange,
    handleEditCountryChange,
    handleEditNameChange,
    handleEditSubmit,
    handleOpenDeleteFamilyMemberModal,
    isDeleting,
    isPrimaryComplete,
    isSaving,
    saveEditingAccountIfNeeded,
  } = useAccountEditCardController(ui);

  return (
    <SurfacePanel as="section" className={styles.accountEditCard} topAccent>
      <div className={styles.accountEditCard__header}>
        <div className={styles.accountEditCard__headerTop}>
          <div className={styles.accountEditCard__headerText}>
            <h2 className={styles.accountEditCard__title}>{t('account.edit.title')}</h2>
            <p className={styles.accountEditCard__description}>
              {!isPrimaryComplete ? t('account.edit.primaryDescription') : t('account.edit.description')}
            </p>
          </div>
          <div className={styles.accountEditCard__headerActionSlot}>
            {editingAccount?.kind === 'family' ? (
              <Button
                aria-label={isDeleting ? t('account.actions.deleting') : t('account.actions.deleteMember')}
                className={`${styles.accountEditCard__iconButton} ${styles.accountEditCard__iconButton_danger}`}
                disabled={isSaving || isDeleting}
                onClick={handleOpenDeleteFamilyMemberModal}
                type={HTML_BUTTON_TYPE.button}
                variant={BUTTON_VARIANT.secondary}
              >
                <TrashIcon aria-hidden="true" className={styles.accountEditCard__actionIcon} />
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {editingAccount ? (
        <form className={styles.accountEditCard__form} onSubmit={handleEditSubmit}>
          <label className={styles.accountEditCard__field}>
            <span className={styles.accountEditCard__label}>{t('account.fields.name')}</span>
            <Input
              className={styles.accountEditCard__input}
              onBlur={() => void saveEditingAccountIfNeeded()}
              onChange={(event) => handleEditNameChange(event.target.value)}
              type={HTML_INPUT_TYPE.text}
              value={editName}
            />
            {editErrors.name ? <span className={styles.accountEditCard__error}>{editErrors.name}</span> : null}
          </label>

          <label className={styles.accountEditCard__field}>
            <span className={styles.accountEditCard__label}>{t('account.fields.birthYear')}</span>
            <Input
              className={styles.accountEditCard__input}
              inputMode="numeric"
              max={CURRENT_YEAR}
              min={MIN_BIRTH_YEAR}
              onBlur={() => void saveEditingAccountIfNeeded()}
              onChange={(event) => handleEditBirthYearChange(event.target.value)}
              type={HTML_INPUT_TYPE.number}
              value={editBirthYear}
            />
            {editErrors.birthYear ? (
              <span className={styles.accountEditCard__error}>{editErrors.birthYear}</span>
            ) : null}
          </label>

          <label className={styles.accountEditCard__field}>
            <span className={styles.accountEditCard__label}>{t('account.fields.country')}</span>
            <div className={styles.accountEditCard__selectWrap}>
              <Select
                className={styles.accountEditCard__input}
                onBlur={() => void saveEditingAccountIfNeeded()}
                onChange={(event) => {
                  const nextValue = event.target.value;

                  handleEditCountryChange(
                    nextValue === EMPTY_COUNTRY_VALUE ? EMPTY_COUNTRY_VALUE : (nextValue as CountryCode),
                  );
                }}
                value={editCountry}
              >
                <option value={EMPTY_COUNTRY_VALUE}>{t('account.fields.countryUnset')}</option>
                {VACCINATION_COUNTRY_OPTIONS.map((countryCode) => (
                  <option key={countryCode} value={countryCode}>
                    {resolveCountryLabel(t, countryCode)}
                  </option>
                ))}
              </Select>
            </div>
          </label>

          {isSaving ? <p className={styles.accountEditCard__meta}>{t('account.actions.saving')}</p> : null}
          {editRequestError ? (
            <p className={styles.accountEditCard__requestError} role="alert">
              {editRequestError}
            </p>
          ) : null}
        </form>
      ) : (
        <p className={styles.accountEditCard__empty}>{t('account.page.empty')}</p>
      )}
    </SurfacePanel>
  );
};

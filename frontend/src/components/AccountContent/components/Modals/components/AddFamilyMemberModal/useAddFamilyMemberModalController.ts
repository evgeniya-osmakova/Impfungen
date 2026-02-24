import { type SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_NEW_MEMBER_FIELD_ERRORS,
  EMPTY_COUNTRY_VALUE,
} from 'src/constants/account';
import { validateAccountFields } from 'src/helpers/validateAccountFields.ts';
import type { AccountCountryValue, NewMemberFieldErrors } from 'src/interfaces/accountForm';
import { useAccountPageUiStore } from 'src/state/accountPageUi';
import { useAccountsStore } from 'src/state/accounts';
import { useShallow } from 'zustand/react/shallow';

export const useAddFamilyMemberModalController = () => {
  const { t } = useTranslation();
  const createFamilyAccount = useAccountsStore((state) => state.createFamilyAccount);
  const {
    closeAddMemberModal,
    isAddMemberModalOpen,
    isAddingMember,
    setIsAddingMember,
  } = useAccountPageUiStore(
    useShallow((state) => ({
      closeAddMemberModal: state.closeAddMemberModal,
      isAddMemberModalOpen: state.isAddMemberModalOpen,
      isAddingMember: state.isAddingMember,
      setIsAddingMember: state.setIsAddingMember,
    })),
  );

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberBirthYear, setNewMemberBirthYear] = useState('');
  const [newMemberCountry, setNewMemberCountry] = useState<AccountCountryValue>(EMPTY_COUNTRY_VALUE);
  const [newMemberErrors, setNewMemberErrors] = useState<NewMemberFieldErrors>(DEFAULT_NEW_MEMBER_FIELD_ERRORS);
  const [newMemberRequestError, setNewMemberRequestError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAddMemberModalOpen) {
      return;
    }

    setNewMemberName('');
    setNewMemberBirthYear('');
    setNewMemberCountry(EMPTY_COUNTRY_VALUE);
    setNewMemberErrors(DEFAULT_NEW_MEMBER_FIELD_ERRORS);
    setNewMemberRequestError(null);
  }, [isAddMemberModalOpen]);

  const handleCloseAddMemberModal = () => {
    if (isAddingMember) {
      return;
    }

    closeAddMemberModal();
  };

  const handleNewMemberNameChange = (value: string) => {
    setNewMemberRequestError(null);
    setNewMemberErrors((prev) => ({ ...prev, name: null }));
    setNewMemberName(value);
  };

  const handleNewMemberBirthYearChange = (value: string) => {
    setNewMemberRequestError(null);
    setNewMemberErrors((prev) => ({ ...prev, birthYear: null }));
    setNewMemberBirthYear(value);
  };

  const handleNewMemberCountryChange = (value: AccountCountryValue) => {
    setNewMemberRequestError(null);
    setNewMemberErrors((prev) => ({ ...prev, country: null }));
    setNewMemberCountry(value);
  };

  const handleCreateFamilyMember = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = validateAccountFields(t, {
      birthYear: newMemberBirthYear,
      name: newMemberName,
    });
    const countryError = newMemberCountry === EMPTY_COUNTRY_VALUE ? t('account.validation.countryRequired') : null;
    const nextErrors: NewMemberFieldErrors = {
      ...validation.errors,
      country: countryError,
    };

    setNewMemberErrors(nextErrors);
    setNewMemberRequestError(null);

    if (!validation.isValid || validation.birthYear === null || countryError) {
      return;
    }

    if (newMemberCountry === EMPTY_COUNTRY_VALUE) {
      return;
    }

    setIsAddingMember(true);

    try {
      await createFamilyAccount({
        birthYear: validation.birthYear,
        country: newMemberCountry,
        name: validation.trimmedName,
      });
      closeAddMemberModal();
    } catch (error) {
      console.error('Unable to create family account.', error);
      setNewMemberRequestError(t('account.errors.createFailed'));
    } finally {
      setIsAddingMember(false);
    }
  };

  return {
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
  };
};

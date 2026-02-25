import { type SyntheticEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_FIELD_ERRORS,
  EMPTY_COUNTRY_VALUE,
} from 'src/constants/account';
import { validateAccountFields } from 'src/helpers/validateAccountFields.ts';
import type { AccountCountryValue, FieldErrors } from 'src/interfaces/accountForm';
import {
  isProfileAccountComplete,
  resolvePrimaryAccount,
  resolveSelectedAccount,
  useAccountsStore,
} from 'src/state/accounts';
import { useShallow } from 'zustand/react/shallow';
import type { AccountPageUi } from '../../accountPageUi';

export const useAccountEditCardController = (
  ui: Pick<AccountPageUi, 'isDeleting' | 'openDeleteFamilyMemberModal'>,
) => {
  const { t } = useTranslation();
  const pendingEditAutoSaveRef = useRef(false);
  const {
    accounts,
    selectedAccountId,
    updateAccount,
    updateSelectedAccount,
  } = useAccountsStore(
    useShallow((state) => ({
      accounts: state.accounts,
      selectedAccountId: state.selectedAccountId,
      updateAccount: state.updateAccount,
      updateSelectedAccount: state.updateSelectedAccount,
    })),
  );
  const { isDeleting, openDeleteFamilyMemberModal } = ui;

  const primaryAccount = resolvePrimaryAccount(accounts);
  const selectedAccount = resolveSelectedAccount(accounts, selectedAccountId);
  const isPrimaryComplete = isProfileAccountComplete(primaryAccount);
  const editingAccount = isPrimaryComplete ? selectedAccount : primaryAccount;

  const [editName, setEditName] = useState('');
  const [editBirthYear, setEditBirthYear] = useState('');
  const [editCountry, setEditCountry] = useState<AccountCountryValue>(EMPTY_COUNTRY_VALUE);
  const [editErrors, setEditErrors] = useState<FieldErrors>(DEFAULT_FIELD_ERRORS);
  const [editRequestError, setEditRequestError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!editingAccount) {
      return;
    }

    pendingEditAutoSaveRef.current = false;
    setEditName(editingAccount.name ?? '');
    setEditBirthYear(editingAccount.birthYear === null ? '' : String(editingAccount.birthYear));
    setEditCountry(editingAccount.country ?? EMPTY_COUNTRY_VALUE);
    setEditErrors(DEFAULT_FIELD_ERRORS);
    setEditRequestError(null);
  }, [editingAccount]);

  const saveEditingAccountIfNeeded = async () => {
    if (!editingAccount) {
      return;
    }

    const sourceName = editingAccount.name ?? '';
    const sourceBirthYear = editingAccount.birthYear === null ? '' : String(editingAccount.birthYear);
    const sourceCountry = editingAccount.country ?? EMPTY_COUNTRY_VALUE;
    const hasChanges = editName !== sourceName || editBirthYear !== sourceBirthYear || editCountry !== sourceCountry;

    const validation = validateAccountFields(t, {
      birthYear: editBirthYear,
      name: editName,
    });

    setEditErrors(validation.errors);

    if (!hasChanges || !validation.isValid || validation.birthYear === null) {
      return;
    }

    if (isSaving) {
      pendingEditAutoSaveRef.current = true;

      return;
    }

    const country = editCountry === EMPTY_COUNTRY_VALUE ? null : editCountry;

    setIsSaving(true);
    setEditRequestError(null);

    try {
      if (editingAccount.id === selectedAccountId) {
        await updateSelectedAccount({
          birthYear: validation.birthYear,
          country,
          name: validation.trimmedName,
        });
      } else {
        await updateAccount({
          accountId: editingAccount.id,
          birthYear: validation.birthYear,
          country,
          name: validation.trimmedName,
        });
      }
    } catch (error) {
      console.error('Unable to save account.', error);
      setEditRequestError(t('account.errors.saveFailed'));
    } finally {
      setIsSaving(false);

      if (pendingEditAutoSaveRef.current) {
        pendingEditAutoSaveRef.current = false;
        void saveEditingAccountIfNeeded();
      }
    }
  };

  const handleEditSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    void saveEditingAccountIfNeeded();
  };

  const handleEditNameChange = (value: string) => {
    setEditRequestError(null);
    setEditErrors((prev) => ({ ...prev, name: null }));
    setEditName(value);
  };

  const handleEditBirthYearChange = (value: string) => {
    setEditRequestError(null);
    setEditErrors((prev) => ({ ...prev, birthYear: null }));
    setEditBirthYear(value);
  };

  const handleEditCountryChange = (value: AccountCountryValue) => {
    setEditRequestError(null);
    setEditCountry(value);
  };

  const handleOpenDeleteFamilyMemberModal = () => {
    if (!editingAccount || editingAccount.kind !== 'family') {
      return;
    }

    openDeleteFamilyMemberModal(editingAccount.id);
  };

  return {
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
  };
};

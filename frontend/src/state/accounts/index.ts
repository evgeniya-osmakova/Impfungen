import type { ProfileAccountsState, ProfileAccountSummary } from '@backend/contracts';
import type { CountryCode } from '@backend/contracts';
import type { ProfileSnapshot } from 'src/api/profileApi';
import { getProfileApi } from 'src/api/profileApi';
import { useVaccinationStore } from 'src/state/vaccination';
import { create } from 'zustand';

export const resolvePrimaryAccount = (
  accounts: readonly ProfileAccountSummary[],
): ProfileAccountSummary | null => accounts.find((account) => account.kind === 'primary') ?? null;

export const resolveSelectedAccount = (
  accounts: readonly ProfileAccountSummary[],
  selectedAccountId: number | null,
): ProfileAccountSummary | null => {
  if (selectedAccountId === null) {
    return null;
  }

  return accounts.find((account) => account.id === selectedAccountId) ?? null;
};

export const isProfileAccountComplete = (
  account: Pick<ProfileAccountSummary, 'birthYear' | 'name'> | null,
): boolean => {
  if (!account) {
    return false;
  }

  return Boolean(account.name?.trim()) && account.birthYear !== null;
};

interface AccountsStore {
  accounts: ProfileAccountSummary[];
  createFamilyAccount: (input: {
    birthYear: number;
    country: CountryCode | null;
    name: string;
  }) => Promise<boolean>;
  deleteFamilyAccount: (accountId: number) => Promise<boolean>;
  getPrimaryAccount: () => ProfileAccountSummary | null;
  getSelectedAccount: () => ProfileAccountSummary | null;
  replaceFromProfileSnapshot: (snapshot: ProfileSnapshot) => void;
  selectAccount: (accountId: number) => Promise<boolean>;
  selectedAccountId: number | null;
  setAccountsState: (accountsState: ProfileAccountsState) => void;
  updateAccount: (input: {
    accountId: number;
    birthYear: number;
    country: CountryCode | null;
    name: string;
  }) => Promise<boolean>;
  updateSelectedAccount: (input: {
    birthYear: number;
    country: CountryCode | null;
    name: string;
  }) => Promise<boolean>;
}

const applySnapshot = (
  set: (partial: Pick<AccountsStore, 'accounts' | 'selectedAccountId'>) => void,
  snapshot: ProfileSnapshot,
): void => {
  set({
    accounts: snapshot.accountsState.accounts,
    selectedAccountId: snapshot.accountsState.selectedAccountId,
  });
  useVaccinationStore.getState().setActiveAccountId(snapshot.accountsState.selectedAccountId);
  useVaccinationStore.getState().setVaccinationStoreState(snapshot.vaccinationState);
};

export const useAccountsStore = create<AccountsStore>((set, get) => ({
  accounts: [],
  createFamilyAccount: async (input) => {
    const api = getProfileApi();

    if (!api) {
      return false;
    }

    try {
      const snapshot = await api.createFamilyAccount(input);
      applySnapshot(set, snapshot);

      return true;
    } catch (error) {
      console.error('Unable to create family account.', error);

      return false;
    }
  },
  deleteFamilyAccount: async (accountId) => {
    const api = getProfileApi();

    if (!api) {
      return false;
    }

    try {
      const snapshot = await api.deleteFamilyAccount(accountId);
      applySnapshot(set, snapshot);

      return true;
    } catch (error) {
      console.error('Unable to delete family account.', error);

      return false;
    }
  },
  getPrimaryAccount: () => resolvePrimaryAccount(get().accounts),
  getSelectedAccount: () => resolveSelectedAccount(get().accounts, get().selectedAccountId),
  replaceFromProfileSnapshot: (snapshot) => {
    applySnapshot(set, snapshot);
  },
  selectAccount: async (accountId) => {
    const api = getProfileApi();

    if (!api) {
      return false;
    }

    try {
      const snapshot = await api.selectAccount(accountId);
      applySnapshot(set, snapshot);

      return true;
    } catch (error) {
      console.error('Unable to switch account.', error);

      return false;
    }
  },
  selectedAccountId: null,
  setAccountsState: ({ accounts, selectedAccountId }) => {
    set({ accounts, selectedAccountId });
  },
  updateAccount: async (input) => {
    const api = getProfileApi();

    if (!api) {
      return false;
    }

    try {
      const snapshot = await api.updateAccount(input);
      applySnapshot(set, snapshot);

      return true;
    } catch (error) {
      console.error('Unable to save account.', error);

      return false;
    }
  },
  updateSelectedAccount: async ({ birthYear, country, name }) => {
    const selectedAccountId = get().selectedAccountId;

    if (selectedAccountId === null) {
      return false;
    }

    return get().updateAccount({
      accountId: selectedAccountId,
      birthYear,
      country,
      name,
    });
  },
}));

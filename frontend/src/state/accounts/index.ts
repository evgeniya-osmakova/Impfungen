import type { ProfileAccountsState,ProfileAccountSummary } from '@backend/contracts';
import { useMainPageUiStore } from 'src/state/mainPageUi';
import { create } from 'zustand';

import type { ProfileSnapshot } from '../../api/profileApi';
import { getProfileApi } from '../../api/profileApi';
import type { CountryCode } from '../../interfaces/base';
import { useVaccinationStore } from '../vaccination';

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
  }) => Promise<void>;
  deleteFamilyAccount: (accountId: number) => Promise<void>;
  getPrimaryAccount: () => ProfileAccountSummary | null;
  getSelectedAccount: () => ProfileAccountSummary | null;
  replaceFromProfileSnapshot: (snapshot: ProfileSnapshot) => void;
  selectAccount: (accountId: number) => Promise<void>;
  selectedAccountId: number | null;
  setAccountsState: (accountsState: ProfileAccountsState) => void;
  updateAccount: (input: {
    accountId: number;
    birthYear: number;
    country: CountryCode | null;
    name: string;
  }) => Promise<void>;
  updateSelectedAccount: (input: {
    birthYear: number;
    country: CountryCode | null;
    name: string;
  }) => Promise<void>;
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
  useMainPageUiStore.getState().resetUi();
};

export const useAccountsStore = create<AccountsStore>((set, get) => ({
  accounts: [],
  createFamilyAccount: async (input) => {
    const api = getProfileApi();

    if (!api) {
      return;
    }

    const snapshot = await api.createFamilyAccount(input);
    applySnapshot(set, snapshot);
  },
  deleteFamilyAccount: async (accountId) => {
    const api = getProfileApi();

    if (!api) {
      return;
    }

    const snapshot = await api.deleteFamilyAccount(accountId);

    applySnapshot(set, snapshot);
  },
  getPrimaryAccount: () => resolvePrimaryAccount(get().accounts),
  getSelectedAccount: () => resolveSelectedAccount(get().accounts, get().selectedAccountId),
  replaceFromProfileSnapshot: (snapshot) => {
    applySnapshot(set, snapshot);
  },
  selectAccount: async (accountId) => {
    const api = getProfileApi();

    if (!api) {
      return;
    }

    const snapshot = await api.selectAccount(accountId);

    applySnapshot(set, snapshot);
  },
  selectedAccountId: null,
  setAccountsState: ({ accounts, selectedAccountId }) => {
    set({ accounts, selectedAccountId });
  },
  updateAccount: async (input) => {
    const api = getProfileApi();

    if (!api) {
      return;
    }

    const snapshot = await api.updateAccount(input);

    applySnapshot(set, snapshot);
  },
  updateSelectedAccount: async ({ birthYear, country, name }) => {
    const selectedAccountId = get().selectedAccountId;

    if (selectedAccountId === null) {
      return;
    }

    await get().updateAccount({
      accountId: selectedAccountId,
      birthYear,
      country,
      name,
    });
  },
}));

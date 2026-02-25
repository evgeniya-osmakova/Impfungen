import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type ProfileSnapshot, setProfileApi } from '../../api/profileApi';
import {
  VACCINATION_DEFAULT_CATEGORY_FILTER,
  VACCINATION_DEFAULT_SEARCH_QUERY,
} from '../../constants/vaccination';
import { useMainPageUiStore } from 'src/state/mainPageUi';
import { useVaccinationStore } from '../vaccination';

import { useAccountsStore } from './index';

const createSnapshot = (overrides?: Partial<ProfileSnapshot>): ProfileSnapshot => ({
  accountsState: {
    accounts: [
      {
        birthYear: 1990,
        country: 'RU',
        id: 1,
        kind: 'primary',
        name: 'Ivan',
      },
    ],
    selectedAccountId: 1,
  },
  language: 'ru',
  vaccinationState: {
    country: 'RU',
    records: [],
  },
  ...overrides,
});

const resetVaccinationState = () => {
  useVaccinationStore.setState({
    activeAccountId: null,
    categoryFilter: VACCINATION_DEFAULT_CATEGORY_FILTER,
    country: null,
    editingDiseaseId: null,
    records: [],
    searchQuery: VACCINATION_DEFAULT_SEARCH_QUERY,
  });
};

const createApiMock = (snapshot: ProfileSnapshot) => ({
  completeVaccinationDose: vi.fn(async () => ({
    ok: true as const,
    updatedAt: '2025-01-10T00:00:00.000Z',
  })),
  createFamilyAccount: vi.fn(async () => snapshot),
  deleteFamilyAccount: vi.fn(async () => snapshot),
  getProfile: vi.fn(async () => snapshot),
  removeVaccinationRecord: vi.fn(async () => undefined),
  selectAccount: vi.fn(async () => snapshot),
  setLanguage: vi.fn(async () => undefined),
  setVaccinationCountry: vi.fn(async () => undefined),
  submitVaccinationRecord: vi.fn(async () => ({
    ok: true as const,
    updatedAt: '2025-01-10T00:00:00.000Z',
  })),
  updateAccount: vi.fn(async () => snapshot),
});

describe('accountsStore', () => {
  beforeEach(() => {
    setProfileApi(null);
    useAccountsStore.setState({ accounts: [], selectedAccountId: null });
    resetVaccinationState();
    useMainPageUiStore.getState().resetUi();
  });

  it('replaces accounts and vaccination state from profile snapshot', () => {
    const snapshot = createSnapshot();

    useAccountsStore.getState().replaceFromProfileSnapshot(snapshot);

    expect(useAccountsStore.getState().selectedAccountId).toBe(1);
    expect(useAccountsStore.getState().accounts).toEqual(snapshot.accountsState.accounts);
    expect(useVaccinationStore.getState().country).toBe('RU');
  });

  it('selects account via api and resets modal ui', async () => {
    const snapshot = createSnapshot({
      accountsState: {
        accounts: [
          {
            birthYear: 1990,
            country: 'RU',
            id: 1,
            kind: 'primary',
            name: 'Ivan',
          },
          {
            birthYear: 2017,
            country: 'DE',
            id: 2,
            kind: 'family',
            name: 'Anna',
          },
        ],
        selectedAccountId: 2,
      },
      vaccinationState: {
        country: 'DE',
        records: [],
      },
    });
    const api = createApiMock(snapshot);

    setProfileApi(api);
    useMainPageUiStore.getState().openFormModal();

    await useAccountsStore.getState().selectAccount(2);

    expect(api.selectAccount).toHaveBeenCalledWith(2);
    expect(useAccountsStore.getState().selectedAccountId).toBe(2);
    expect(useVaccinationStore.getState().country).toBe('DE');
    expect(useMainPageUiStore.getState().isFormModalOpen).toBe(false);
  });

  it('deletes family account via api and applies returned snapshot', async () => {
    const snapshot = createSnapshot({
      accountsState: {
        accounts: [
          {
            birthYear: 1990,
            country: 'RU',
            id: 1,
            kind: 'primary',
            name: 'Ivan',
          },
        ],
        selectedAccountId: 1,
      },
      vaccinationState: {
        country: 'RU',
        records: [],
      },
    });
    const api = createApiMock(snapshot);

    setProfileApi(api);

    await useAccountsStore.getState().deleteFamilyAccount(2);

    expect(api.deleteFamilyAccount).toHaveBeenCalledWith(2);
    expect(useAccountsStore.getState().accounts).toEqual(snapshot.accountsState.accounts);
  });
});

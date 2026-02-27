import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type ProfileSnapshot, setProfileApi } from '../../api/profileApi';
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
    country: null,
    records: [],
  });
};

const createApiMock = (snapshot: ProfileSnapshot) => ({
  completeVaccinationDose: vi.fn(() => snapshot),
  createFamilyAccount: vi.fn(() => snapshot),
  deleteFamilyAccount: vi.fn(() => snapshot),
  getProfile: vi.fn(() => snapshot),
  removeVaccinationRecord: vi.fn(() => snapshot),
  selectAccount: vi.fn(() => snapshot),
  setLanguage: vi.fn(() => snapshot),
  setVaccinationCountry: vi.fn(() => snapshot),
  submitVaccinationRecord: vi.fn(() => snapshot),
  updateAccount: vi.fn(() => snapshot),
});

describe('accountsStore', () => {
  beforeEach(() => {
    setProfileApi(null);
    useAccountsStore.setState({ accounts: [], selectedAccountId: null });
    resetVaccinationState();
  });

  it('replaces accounts and vaccination state from profile snapshot', () => {
    const snapshot = createSnapshot();

    useAccountsStore.getState().replaceFromProfileSnapshot(snapshot);

    expect(useAccountsStore.getState().selectedAccountId).toBe(1);
    expect(useAccountsStore.getState().accounts).toEqual(snapshot.accountsState.accounts);
    expect(useVaccinationStore.getState().country).toBe('RU');
  });

  it('selects account via api and applies returned snapshot', async () => {
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

    await useAccountsStore.getState().selectAccount(2);

    expect(api.selectAccount).toHaveBeenCalledWith(2);
    expect(useAccountsStore.getState().selectedAccountId).toBe(2);
    expect(useVaccinationStore.getState().country).toBe('DE');
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

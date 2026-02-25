/* @vitest-environment jsdom */
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type ProfileSnapshot, setProfileApi } from '../../api/profileApi';
import i18n from '../../i18n';
import { useAccountsStore } from '../../state/accounts';
import { useVaccinationStore } from '../../state/vaccination';

import { Account } from './Account';

const createSnapshot = (overrides?: Partial<ProfileSnapshot>): ProfileSnapshot => ({
  accountsState: {
    accounts: [
      {
        birthYear: 1990,
        country: 'RU',
        id: 1,
        kind: 'primary',
        name: 'Иван',
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

const createApiMock = (responses?: {
  createFamilyAccount?: ProfileSnapshot;
  deleteFamilyAccount?: ProfileSnapshot;
  selectAccount?: ProfileSnapshot;
  updateAccount?: ProfileSnapshot;
}) => ({
  completeVaccinationDose: vi.fn(async () => createSnapshot()),
  createFamilyAccount: vi.fn(async () => responses?.createFamilyAccount ?? createSnapshot()),
  deleteFamilyAccount: vi.fn(async () => responses?.deleteFamilyAccount ?? createSnapshot()),
  getProfile: vi.fn(async () => createSnapshot()),
  removeVaccinationRecord: vi.fn(async () => createSnapshot()),
  selectAccount: vi.fn(async () => responses?.selectAccount ?? createSnapshot()),
  setLanguage: vi.fn(async () => createSnapshot()),
  setVaccinationCountry: vi.fn(async () => createSnapshot()),
  submitVaccinationRecord: vi.fn(async () => createSnapshot()),
  updateAccount: vi.fn(async () => responses?.updateAccount ?? createSnapshot()),
});

describe('Account page', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ru');
    setProfileApi(null);
    useAccountsStore.setState({ accounts: [], selectedAccountId: null });
    resetVaccinationState();
  });

  it('shows mandatory primary completion mode when primary account is incomplete', () => {
    useAccountsStore.setState({
      accounts: [
        {
          birthYear: null,
          country: null,
          id: 1,
          kind: 'primary',
          name: null,
        },
      ],
      selectedAccountId: 1,
    });

    const { getByText, queryByRole } = render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>,
    );

    expect(getByText('Заполните основной аккаунт')).toBeInTheDocument();
    expect(queryByRole('combobox', { name: 'Выбранный аккаунт' })).not.toBeInTheDocument();
    expect(queryByRole('button', { name: 'Добавить члена семьи' })).not.toBeInTheDocument();
  });

  it('adds family member and switches selected account', async () => {
    const user = userEvent.setup();
    const snapshotAfterCreate = createSnapshot({
      accountsState: {
        accounts: [
          {
            birthYear: 1990,
            country: 'RU',
            id: 1,
            kind: 'primary',
            name: 'Иван',
          },
          {
            birthYear: 2018,
            country: null,
            id: 2,
            kind: 'family',
            name: 'Анна',
          },
        ],
        selectedAccountId: 1,
      },
      vaccinationState: {
        country: 'RU',
        records: [],
      },
    });
    const snapshotAfterSelect = createSnapshot({
      accountsState: {
        ...snapshotAfterCreate.accountsState,
        selectedAccountId: 2,
      },
      vaccinationState: {
        country: null,
        records: [],
      },
    });
    const api = createApiMock({
      createFamilyAccount: snapshotAfterCreate,
      selectAccount: snapshotAfterSelect,
      updateAccount: snapshotAfterCreate,
    });

    setProfileApi(api);
    useAccountsStore.setState(snapshotAfterCreate.accountsState);
    useVaccinationStore.setState({
      activeAccountId: 1,
      country: 'RU',
      records: [],
    });

    const screen = render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Добавить члена семьи' }));

    const addDialog = screen.getByRole('dialog', { name: 'Добавить члена семьи' });
    const addQueries = within(addDialog);
    const nameInput = addQueries.getByLabelText('Имя') as HTMLInputElement;
    const birthYearInput = addQueries.getByLabelText('Год рождения') as HTMLInputElement;
    const countrySelect = addQueries.getByRole('combobox', { name: 'Страна прививочного календаря' });

    await user.clear(nameInput);
    await user.type(nameInput, 'Анна');
    await user.clear(birthYearInput);
    await user.type(birthYearInput, '2018');
    await user.selectOptions(countrySelect, 'DE');
    await user.click(addQueries.getByRole('button', { name: 'Добавить члена семьи' }));

    expect(api.createFamilyAccount).toHaveBeenCalledWith({ birthYear: 2018, country: 'DE', name: 'Анна' });
    expect(await screen.findByRole('option', { name: /Анна/i })).toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Выбранный аккаунт' }),
      '2',
    );

    expect(api.selectAccount).toHaveBeenCalledWith(2);
    expect(useAccountsStore.getState().selectedAccountId).toBe(2);
  });

  it('deletes selected family member from edit form', async () => {
    const user = userEvent.setup();
    const initialSnapshot = createSnapshot({
      accountsState: {
        accounts: [
          {
            birthYear: 1990,
            country: 'RU',
            id: 1,
            kind: 'primary',
            name: 'Иван',
          },
          {
            birthYear: 2014,
            country: 'DE',
            id: 2,
            kind: 'family',
            name: 'Данил',
          },
        ],
        selectedAccountId: 2,
      },
      vaccinationState: {
        country: 'DE',
        records: [],
      },
    });
    const snapshotAfterDelete = createSnapshot({
      accountsState: {
        accounts: [
          {
            birthYear: 1990,
            country: 'RU',
            id: 1,
            kind: 'primary',
            name: 'Иван',
          },
        ],
        selectedAccountId: 1,
      },
      vaccinationState: {
        country: 'RU',
        records: [],
      },
    });
    const api = createApiMock({
      deleteFamilyAccount: snapshotAfterDelete,
      updateAccount: initialSnapshot,
    });

    setProfileApi(api);
    useAccountsStore.setState(initialSnapshot.accountsState);
    useVaccinationStore.setState({
      activeAccountId: 2,
      country: 'DE',
      records: [],
    });

    const screen = render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Удалить члена семьи' }));
    await user.click(screen.getByRole('button', { name: 'Удалить' }));

    expect(api.deleteFamilyAccount).toHaveBeenCalledWith(2);
    expect(useAccountsStore.getState().selectedAccountId).toBe(1);
    expect(useVaccinationStore.getState().country).toBe('RU');
    expect(screen.queryByRole('option', { name: /Данил/i })).not.toBeInTheDocument();
  });
});

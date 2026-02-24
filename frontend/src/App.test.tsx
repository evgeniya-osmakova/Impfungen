import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { APP_ROUTE } from './constants/app-route';
import App from './App';
import i18n from './i18n';
import { useAccountsStore } from './state/accounts';
import { useLanguageStore } from './state/language';

describe('App', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ru');
    useLanguageStore.setState({ language: 'ru' });
    useAccountsStore.setState({
      accounts: [],
      selectedAccountId: null,
    });
  });

  it('renders internal page in Russian by default', () => {
    const { getByRole, queryByRole } = render(
      <MemoryRouter initialEntries={[APP_ROUTE.home]}>
        <App />
      </MemoryRouter>,
    );

    expect(getByRole('heading', { name: 'Журнал вакцинации' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Русский' })).toBeInTheDocument();
    expect(queryByRole('button', { name: 'Войти' })).not.toBeInTheDocument();
  });

  it('switches language to English from header', async () => {
    const user = userEvent.setup();

    const { findByRole, getByRole } = render(
      <MemoryRouter initialEntries={[APP_ROUTE.home]}>
        <App />
      </MemoryRouter>,
    );
    await user.click(getByRole('button', { name: 'English' }));

    expect(await findByRole('heading', { name: 'My vaccinations and upcoming dates' })).toBeInTheDocument();
  });

  it('redirects unknown routes to home route', () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/legacy']}>
        <App />
      </MemoryRouter>,
    );

    expect(getByRole('heading', { name: 'Журнал вакцинации' })).toBeInTheDocument();
  });

  it('renders account page route', () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={[APP_ROUTE.account]}>
        <App />
      </MemoryRouter>,
    );

    expect(getByRole('heading', { name: 'Аккаунт и семья' })).toBeInTheDocument();
  });

  it('redirects home to account when primary account is incomplete', () => {
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

    const { getByRole } = render(
      <MemoryRouter initialEntries={[APP_ROUTE.home]}>
        <App />
      </MemoryRouter>,
    );

    expect(getByRole('heading', { name: 'Аккаунт и семья' })).toBeInTheDocument();
  });

  it('redirects home to account when selected account country is missing', () => {
    useAccountsStore.setState({
      accounts: [
        {
          birthYear: 1990,
          country: null,
          id: 1,
          kind: 'primary',
          name: 'Иван',
        },
      ],
      selectedAccountId: 1,
    });

    const { getByRole } = render(
      <MemoryRouter initialEntries={[APP_ROUTE.home]}>
        <App />
      </MemoryRouter>,
    );

    expect(getByRole('heading', { name: 'Аккаунт и семья' })).toBeInTheDocument();
  });
});

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { APP_ROUTE } from './constants/app-route';
import { LANGUAGE_STORAGE_KEY } from './i18n/resources';
import { useAuthStore } from './store/authStore';
import App from './App';
import i18n from './i18n';

describe('App', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    useAuthStore.setState({
      authError: null,
      isAuthenticated: false,
      isInitialized: true,
      isInitializing: false,
      oauthConfigured: false,
      user: null,
    });
    await i18n.changeLanguage('ru');
  });

  it('renders landing page in Russian', () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={[APP_ROUTE.login]}>
        <App />
      </MemoryRouter>,
    );

    expect(getByRole('heading', { name: 'Держите прививки под контролем' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Войти' })).toBeInTheDocument();
  });

  it('switches language to English', async () => {
    const user = userEvent.setup();

    const { findByRole, getByRole } = render(
      <MemoryRouter initialEntries={[APP_ROUTE.login]}>
        <App />
      </MemoryRouter>,
    );
    await user.click(getByRole('button', { name: 'English' }));

    expect(await findByRole('heading', { name: 'Keep every vaccination on schedule' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });

  it('opens internal page after stub login', async () => {
    const user = userEvent.setup();
    const currentYear = String(new Date().getFullYear());

    const { findByText, getByRole } = render(
      <MemoryRouter initialEntries={[APP_ROUTE.login]}>
        <App />
      </MemoryRouter>,
    );
    await user.click(getByRole('button', { name: 'Войти' }));

    expect(await findByText('Demo User')).toBeInTheDocument();
    expect(await findByText('demo.user')).toBeInTheDocument();
    expect(await findByText('demo.user@example.com')).toBeInTheDocument();
    expect(await findByText(currentYear)).toBeInTheDocument();
  });
});

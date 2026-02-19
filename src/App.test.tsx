import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { APP_ROUTE } from './constants/app-route';
import { LANGUAGE_STORAGE_KEY } from './i18n/resources';
import { renderWithProviders } from './test/renderWithProviders';
import App from './App';
import i18n from './i18n';

describe('App', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await i18n.changeLanguage('ru');
  });

  it('renders internal page in Russian by default', () => {
    const { getByRole, queryByRole } = renderWithProviders(<App />, {
      router: { initialEntries: [APP_ROUTE.home] },
    });

    expect(getByRole('heading', { name: 'Журнал вакцинации' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Русский' })).toBeInTheDocument();
    expect(queryByRole('button', { name: 'Войти' })).not.toBeInTheDocument();
  });

  it('switches language to English from header', async () => {
    const user = userEvent.setup();

    const { findByRole, getByRole } = renderWithProviders(<App />, {
      router: { initialEntries: [APP_ROUTE.home] },
    });
    await user.click(getByRole('button', { name: 'English' }));

    expect(await findByRole('heading', { name: 'My vaccinations and upcoming dates' })).toBeInTheDocument();
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });

  it('redirects unknown routes to home route', () => {
    const { getByRole } = renderWithProviders(<App />, {
      router: { initialEntries: ['/legacy'] },
    });

    expect(getByRole('heading', { name: 'Журнал вакцинации' })).toBeInTheDocument();
  });
});

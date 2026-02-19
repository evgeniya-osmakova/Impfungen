import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { APP_ROUTE } from './constants/app-route';
import App from './App';
import i18n from './i18n';

describe('App', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ru');
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
});

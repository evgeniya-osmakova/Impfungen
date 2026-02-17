import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import i18n from './i18n';
import { LANGUAGE_STORAGE_KEY } from './i18n/resources';

describe('App', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await i18n.changeLanguage('ru');
  });

  it('renders landing page in Russian', () => {
    const { getByRole } = render(<App />);

    expect(getByRole('heading', { name: 'Держите прививки под контролем' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Войти' })).toBeInTheDocument();
  });

  it('switches language to English', async () => {
    const user = userEvent.setup();

    const { findByRole, getByRole } = render(<App />);
    await user.click(getByRole('button', { name: 'English' }));

    expect(await findByRole('heading', { name: 'Keep every vaccination on schedule' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });
});

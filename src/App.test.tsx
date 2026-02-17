import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import i18n from './i18n';
import { LANGUAGE_STORAGE_KEY } from './i18n/resources';
import { useCounterStore } from './store/counterStore';

describe('App', () => {
  beforeEach(async () => {
    useCounterStore.setState({ count: 0 });
    window.localStorage.clear();
    await i18n.changeLanguage('ru');
  });

  it('increments counter by click', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Увеличить' }));

    expect(screen.getByText('Текущее значение: 1')).toBeInTheDocument();
  });

  it('switches language to English', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Язык' }), 'en');

    expect(await screen.findByRole('button', { name: 'Increment' })).toBeInTheDocument();
    expect(screen.getByText('Current value: 0')).toBeInTheDocument();
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });
});

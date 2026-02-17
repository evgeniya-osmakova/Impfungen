import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { useCounterStore } from './store/counterStore';

describe('App', () => {
  beforeEach(() => {
    useCounterStore.setState({ count: 0 });
  });

  it('increments counter by click', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Увеличить' }));

    expect(screen.getByText('Текущее значение: 1')).toBeInTheDocument();
  });
});

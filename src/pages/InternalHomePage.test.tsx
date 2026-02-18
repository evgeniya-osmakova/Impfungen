import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import i18n from '../i18n';
import type { AuthUser } from '../interfaces/auth';
import { createVaccinationStoreDefaults, useVaccinationStore } from '../store/vaccinationStore';

import { InternalHomePage } from './InternalHomePage';

const USER_FIXTURE: AuthUser = {
  email: 'demo.user@example.com',
  login: 'demo.user',
  name: 'Demo User',
};

describe('InternalHomePage', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    useVaccinationStore.setState(createVaccinationStoreDefaults());
    await i18n.changeLanguage('ru');
  });

  it('supports onboarding, add/edit/delete flow, and hides timeline without next date', async () => {
    const user = userEvent.setup();

    const { findByRole, findByText, getByLabelText, getByRole, getByText, queryByText } = render(
      <InternalHomePage user={USER_FIXTURE} />,
    );

    expect(
      getByRole('heading', {
        name: 'Выберите страну рекомендаций',
      }),
    ).toBeInTheDocument();

    await user.click(getByText('Россия'));
    await user.click(getByRole('button', { name: 'Подтвердить страну' }));

    expect(await findByRole('heading', { name: 'Сводка по карте прививок' })).toBeInTheDocument();

    const diseaseSelect = getByLabelText('Заболевание');
    await user.selectOptions(diseaseSelect, 'measles');
    await user.type(getByLabelText('Дата сделанной прививки'), '2024-03-01');
    await user.click(getByRole('button', { name: 'Сохранить запись' }));

    expect(await findByRole('heading', { name: 'Корь' })).toBeInTheDocument();
    expect(queryByText('Линеечка до следующей прививки')).not.toBeInTheDocument();

    await user.click(getByRole('button', { name: 'Редактировать' }));
    await user.type(getByLabelText('Дата следующей прививки'), '2025-03-01');
    await user.click(getByRole('button', { name: 'Сохранить изменения' }));

    expect(await findByText('Линеечка до следующей прививки')).toBeInTheDocument();

    await user.clear(getByLabelText('Поиск по заболеванию'));
    await user.type(getByLabelText('Поиск по заболеванию'), 'столбняк');

    const catalogHeading = await findByRole('heading', { name: 'Что ещё можно сделать' });
    const catalogSection = catalogHeading.closest('section');

    if (!catalogSection) {
      throw new Error('Catalog section is not found.');
    }

    expect(within(catalogSection).getByText('Столбняк')).toBeInTheDocument();

    await user.click(getByRole('button', { name: 'Удалить' }));

    expect(
      await findByText('Записей пока нет. Добавьте первую прививку через форму слева.'),
    ).toBeInTheDocument();
  });

  it('shows disease names in selected language', async () => {
    const user = userEvent.setup();

    await i18n.changeLanguage('en');

    const { getByLabelText, getByRole, getByText } = render(<InternalHomePage user={USER_FIXTURE} />);

    await user.click(getByText('Russia'));
    await user.click(getByRole('button', { name: 'Confirm country' }));

    const diseaseSelect = getByLabelText('Disease');

    expect(within(diseaseSelect).getByRole('option', { name: 'Measles' })).toBeInTheDocument();
  });
});

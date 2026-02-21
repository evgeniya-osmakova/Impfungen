/* @vitest-environment jsdom */
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  VACCINATION_DEFAULT_CATEGORY_FILTER,
  VACCINATION_DEFAULT_SEARCH_QUERY,
} from '../../constants/vaccination';
import i18n from '../../i18n';
import { useInternalHomeUiStore } from '../../state/internalHomeUi';
import { useVaccinationStore } from '../../state/vaccination';
import { formatDateByLanguage } from '../../utils/date';

import { Main } from './Main';

const toIsoPart = (value: number) => String(value).padStart(2, '0');
const toIsoDateShiftedFromToday = (days: number) => {
  const now = new Date();
  const shifted = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + days));

  return `${shifted.getUTCFullYear()}-${toIsoPart(shifted.getUTCMonth() + 1)}-${toIsoPart(shifted.getUTCDate())}`;
};

const resetStores = () => {
  useVaccinationStore.setState({
    country: null,
    records: [],
    categoryFilter: VACCINATION_DEFAULT_CATEGORY_FILTER,
    editingDiseaseId: null,
    searchQuery: VACCINATION_DEFAULT_SEARCH_QUERY,
  });
  useInternalHomeUiStore.getState().resetUi();
};

describe('Main', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ru');
    resetStores();
  });

  it('supports onboarding and full flow with planned-to-completed and additional dose', async () => {
    const user = userEvent.setup();
    const plannedDueDate = toIsoDateShiftedFromToday(10);
    const completedFromPlannedDate = toIsoDateShiftedFromToday(0);
    const additionalCompletedDate = toIsoDateShiftedFromToday(-1);

    const {
      findAllByRole,
      findByLabelText,
      findByRole,
      findByText,
      getByLabelText,
      getByRole,
      getByText,
      queryAllByRole,
      queryByText,
    } = render(<Main />);

    expect(
      getByRole('heading', {
        name: 'Выберите страну рекомендаций',
      }),
    ).toBeInTheDocument();

    await user.click(getByText('Россия'));

    expect(await findByRole('heading', { name: 'Вакцинации на ближайший год' })).toBeInTheDocument();

    await user.click(getByRole('button', { name: 'Добавить выполненную вакцинацию' }));

    const diseaseSelect = await findByLabelText('Заболевание');
    await user.selectOptions(diseaseSelect, 'measles');
    await user.type(getByLabelText('Дата выполненной вакцинации'), '2024-03-01');
    await user.selectOptions(getByLabelText('Тип выполненной вакцинации'), 'nextDose');
    await user.click(getByRole('button', { name: 'Сохранить запись' }));

    expect(await findByRole('heading', { name: 'Корь' })).toBeInTheDocument();
    expect(queryByText('Следующая')).not.toBeInTheDocument();

    await user.click(getByRole('button', { name: 'Редактировать' }));
    await user.selectOptions(getByLabelText('Планирование следующих доз'), 'manual');
    await user.type(getByLabelText('Будущая дата 1'), plannedDueDate);
    await user.selectOptions(getByLabelText('Тип запланированной вакцинации'), 'nextDose');
    await user.click(getByRole('button', { name: 'Сохранить изменения' }));
    expect(queryByText(/Далее по графику:/)).not.toBeInTheDocument();
    expect(getByText('Дата вакцинации')).toBeInTheDocument();
    expect(getByText('Дата следующей вакцинации')).toBeInTheDocument();

    const markAsDoneButtons = await findAllByRole('button', { name: 'Отметить сделанной' });
    expect(markAsDoneButtons.length).toBeGreaterThan(0);

    await user.click(markAsDoneButtons[0]);
    await user.clear(getByLabelText('Дата выполненной вакцинации'));
    await user.type(getByLabelText('Дата выполненной вакцинации'), completedFromPlannedDate);
    await user.selectOptions(getByLabelText('Тип выполненной вакцинации'), 'revaccination');
    await user.click(getByRole('button', { name: 'Сохранить выполненную вакцинацию' }));

    expect(queryAllByRole('button', { name: 'Отметить сделанной' })).toHaveLength(0);
    expect(await findByRole('button', { name: 'Показать историю (2)' })).toBeInTheDocument();

    await user.click(getByRole('button', { name: 'Добавить дозу/ревакцинацию' }));
    await user.type(getByLabelText('Дата выполненной вакцинации'), additionalCompletedDate);
    await user.selectOptions(getByLabelText('Тип выполненной вакцинации'), 'revaccination');
    await user.click(getByRole('button', { name: 'Сохранить выполненную вакцинацию' }));

    expect(queryAllByRole('button', { name: 'Отметить сделанной' })).toHaveLength(0);

    const measlesHeading = await findByRole('heading', { name: 'Корь' });
    const measlesCard = measlesHeading.closest('article');

    if (!measlesCard) {
      throw new Error('Measles card is not found.');
    }

    const measlesCardQueries = within(measlesCard);

    expect(measlesCardQueries.getByRole('button', { name: 'Показать историю (3)' })).toBeInTheDocument();
    expect(measlesCardQueries.queryAllByRole('listitem')).toHaveLength(0);
    expect(measlesCardQueries.queryByText(/^Сделана$/i)).not.toBeInTheDocument();
    expect(measlesCardQueries.queryByText(/^Следующая$/i)).not.toBeInTheDocument();

    await user.click(measlesCardQueries.getByRole('button', { name: 'Показать историю (3)' }));
    expect(measlesCardQueries.getByRole('button', { name: 'Скрыть историю (3)' })).toBeInTheDocument();
    expect(measlesCardQueries.queryAllByRole('listitem')).toHaveLength(3);

    await user.clear(getByLabelText('Поиск по заболеванию'));
    await user.type(getByLabelText('Поиск по заболеванию'), 'столбняк');

    const catalogHeading = await findByRole('heading', { name: 'Что ещё можно сделать' });
    const catalogSection = catalogHeading.closest('section');

    if (!catalogSection) {
      throw new Error('Catalog section is not found.');
    }

    expect(within(catalogSection).getByText('Столбняк')).toBeInTheDocument();

    await user.click(getByRole('button', { name: 'Удалить' }));
    expect(await findByText('Это действие нельзя отменить.')).toBeInTheDocument();
    await user.click(getByRole('button', { name: 'Удалить запись' }));

    expect(await findByText('Записей пока нет.')).toBeInTheDocument();
  });

  it('shows future dates without duplicating the nearest one', async () => {
    const user = userEvent.setup();
    const nextDueDate = toIsoDateShiftedFromToday(5);
    const futureDueDate = toIsoDateShiftedFromToday(30);

    const { findByRole, getAllByLabelText, getByLabelText, getByRole, getByText } = render(<Main />);

    await user.click(getByText('Россия'));
    await user.click(getByRole('button', { name: 'Добавить выполненную вакцинацию' }));

    await user.selectOptions(getByLabelText('Заболевание'), 'tetanus');
    await user.type(getByLabelText('Дата выполненной вакцинации'), '2024-03-01');
    await user.selectOptions(getByLabelText('Тип выполненной вакцинации'), 'nextDose');
    await user.selectOptions(getByLabelText('Планирование следующих доз'), 'manual');
    await user.type(getByLabelText('Будущая дата 1'), nextDueDate);
    await user.selectOptions(getByLabelText('Тип запланированной вакцинации'), 'nextDose');
    await user.click(getByRole('button', { name: 'Добавить дату' }));
    await user.type(getByLabelText('Будущая дата 2'), futureDueDate);
    await user.selectOptions(getAllByLabelText('Тип запланированной вакцинации')[1], 'revaccination');
    await user.click(getByRole('button', { name: 'Сохранить запись' }));

    const recordsSectionHeading = await findByRole('heading', { name: 'Записи вакцинации' });
    const recordsSection = recordsSectionHeading.closest('section');

    if (!recordsSection) {
      throw new Error('Records section is not found.');
    }

    const tetanusHeading = within(recordsSection).getByRole('heading', { name: 'Столбняк' });
    const tetanusCard = tetanusHeading.closest('article');

    if (!tetanusCard) {
      throw new Error('Tetanus card is not found.');
    }

    const tetanusCardQueries = within(tetanusCard);
    const futureDatesBlock = tetanusCardQueries.getByText(/Далее по графику:/).closest('div');

    if (!futureDatesBlock) {
      throw new Error('Future dates block is not found.');
    }

    expect(tetanusCardQueries.getByText('Дата вакцинации')).toBeInTheDocument();
    expect(tetanusCardQueries.getByText('Дата следующей вакцинации')).toBeInTheDocument();
    expect(tetanusCardQueries.queryByRole('button', { name: /Показать историю/i })).not.toBeInTheDocument();
    expect(within(futureDatesBlock).getByText(formatDateByLanguage(futureDueDate, 'ru'))).toBeInTheDocument();
    expect(within(futureDatesBlock).queryByText(formatDateByLanguage(nextDueDate, 'ru'))).not.toBeInTheDocument();
  });

  it('shows disease names in selected language', async () => {
    const user = userEvent.setup();

    await i18n.changeLanguage('en');

    const { getByLabelText, getByRole, getByText } = render(<Main />);

    await user.click(getByText('Russia'));
    await user.click(getByRole('button', { name: 'Add completed vaccination' }));

    const diseaseSelect = getByLabelText('Disease');

    expect(within(diseaseSelect).getByRole('option', { name: 'Measles' })).toBeInTheDocument();
  });

  it('prefills disease field when catalog card is clicked', async () => {
    const user = userEvent.setup();

    const { findByLabelText, getByRole, getByText } = render(<Main />);

    await user.click(getByText('Россия'));

    await user.click(getByRole('button', { name: /столбняк/i }));

    const diseaseSelect = (await findByLabelText('Заболевание')) as HTMLSelectElement;

    expect(diseaseSelect.value).toBe('tetanus');
  });

  it('shows universal catalog without recommendation badges in "no recommendations" mode', async () => {
    const user = userEvent.setup();
    const { findByRole, getByText, queryByText } = render(<Main />);

    await user.click(getByText('Без рекомендаций'));

    expect(await findByRole('heading', { name: 'Что ещё можно сделать' })).toBeInTheDocument();
    expect(getByText('Корь')).toBeInTheDocument();
    expect(queryByText('Рекомендуемые')).not.toBeInTheDocument();
    expect(queryByText('Опциональные')).not.toBeInTheDocument();
    expect(queryByText('Рекомендуемая')).not.toBeInTheDocument();
    expect(queryByText('Опциональная')).not.toBeInTheDocument();
  });
});

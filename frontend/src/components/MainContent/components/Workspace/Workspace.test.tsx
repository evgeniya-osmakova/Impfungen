/* @vitest-environment jsdom */
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import i18n from 'src/i18n';
import { useAccountsStore } from 'src/state/accounts';
import { useLanguageStore } from 'src/state/language';
import { useVaccinationStore } from 'src/state/vaccination';

import { Workspace } from './Workspace';

vi.mock('src/helpers/vaccinationExportCsv.ts', () => ({
  downloadVaccinationCompletedCsv: vi.fn(),
}));

vi.mock('src/helpers/vaccinationExportPdf.ts', () => ({
  exportVaccinationCompletedPdf: vi.fn(async () => undefined),
}));

import { downloadVaccinationCompletedCsv } from 'src/helpers/vaccinationExportCsv.ts';
import { exportVaccinationCompletedPdf } from 'src/helpers/vaccinationExportPdf.ts';

const createVaccinationRecord = () => ({
  completedDoses: [{
    batchNumber: 'AA-01',
    completedAt: '2024-05-01',
    id: 'dose-1',
    kind: 'nextDose' as const,
    tradeName: 'TestVax',
  }],
  diseaseId: 'measles',
  futureDueDoses: [{
    dueAt: '2030-01-01',
    id: 'plan-1',
    kind: 'nextDose' as const,
  }],
  repeatEvery: null,
  updatedAt: '2025-01-02T10:00:00.000Z',
});

const resetStores = () => {
  useLanguageStore.setState({ language: 'ru' });
  useAccountsStore.setState({
    accounts: [{
      birthYear: 1990,
      country: 'RU',
      id: 1,
      kind: 'primary',
      name: 'Иван',
    }],
    selectedAccountId: 1,
  });
  useVaccinationStore.setState({
    activeAccountId: 1,
    country: 'RU',
    records: [],
  });
};

const workspaceUi = {
  openCompleteDoseModal: vi.fn(),
  openFormModal: vi.fn(),
};

const workspaceVaccinationUi = {
  cancelEdit: vi.fn(),
  editingDiseaseId: null,
  startEditRecord: vi.fn(),
};

describe('Workspace export actions', () => {
  beforeEach(async () => {
    resetStores();
    vi.clearAllMocks();
    await i18n.changeLanguage('ru');
  });

  it('renders export buttons and disables them when there are no completed doses', () => {
    const { getByRole } = render(<Workspace ui={workspaceUi} vaccinationUi={workspaceVaccinationUi} />);

    expect(getByRole('button', { name: 'Экспорт CSV' })).toBeDisabled();
    expect(getByRole('button', { name: 'Экспорт PDF' })).toBeDisabled();
  });

  it('enables export buttons after completed records appear and triggers CSV export', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Workspace ui={workspaceUi} vaccinationUi={workspaceVaccinationUi} />);

    act(() => {
      useVaccinationStore.setState({
        records: [createVaccinationRecord()],
      });
    });

    const csvButton = getByRole('button', { name: 'Экспорт CSV' });
    const pdfButton = getByRole('button', { name: 'Экспорт PDF' });

    await waitFor(() => {
      expect(csvButton).toBeEnabled();
      expect(pdfButton).toBeEnabled();
    });

    await user.click(csvButton);

    expect(downloadVaccinationCompletedCsv).toHaveBeenCalledTimes(1);
  });

  it('triggers PDF export and shows alert on export error', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(downloadVaccinationCompletedCsv).mockImplementationOnce(() => {
      throw new Error('csv failed');
    });
    vi.mocked(exportVaccinationCompletedPdf).mockResolvedValue(undefined);

    act(() => {
      useVaccinationStore.setState({
        records: [createVaccinationRecord()],
      });
    });

    const { findByRole, getByRole, queryByRole } = render(
      <Workspace ui={workspaceUi} vaccinationUi={workspaceVaccinationUi} />,
    );

    await user.click(getByRole('button', { name: 'Экспорт PDF' }));
    expect(exportVaccinationCompletedPdf).toHaveBeenCalledTimes(1);

    expect(queryByRole('alert')).not.toBeInTheDocument();

    await user.click(getByRole('button', { name: 'Экспорт CSV' }));
    expect(await findByRole('alert')).toHaveTextContent('Не удалось выгрузить файл. Попробуйте ещё раз.');

    consoleErrorSpy.mockRestore();
  });
});

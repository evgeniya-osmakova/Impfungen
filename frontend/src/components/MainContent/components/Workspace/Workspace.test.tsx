/* @vitest-environment jsdom */
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from 'src/i18n';
import type {
  VaccinationCompletedImportParseResult,
  VaccinationCompletedImportReport,
  VaccinationCompletedImportRow,
} from 'src/interfaces/vaccinationImport.ts';
import { useAccountsStore } from 'src/state/accounts';
import { useLanguageStore } from 'src/state/language';
import { useVaccinationStore } from 'src/state/vaccination';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Workspace } from './Workspace';

vi.mock('src/helpers/vaccinationExportCsv.ts', () => ({
  downloadVaccinationCompletedCsv: vi.fn(),
}));

vi.mock('src/helpers/vaccinationExportPdf.ts', () => ({
  exportVaccinationCompletedPdf: vi.fn(() => undefined),
}));

vi.mock('src/helpers/vaccinationImportCsv.ts', () => ({
  parseVaccinationCompletedImportCsv: vi.fn(),
}));

vi.mock('src/state/vaccination/importCompletedVaccinations.ts', () => ({
  importCompletedVaccinations: vi.fn(() => ({
    duplicateRows: 0,
    errors: [],
    importedRows: 0,
    invalidRows: 0,
    totalDataRows: 0,
  })),
}));

import { downloadVaccinationCompletedCsv } from 'src/helpers/vaccinationExportCsv.ts';
import { exportVaccinationCompletedPdf } from 'src/helpers/vaccinationExportPdf.ts';
import { parseVaccinationCompletedImportCsv } from 'src/helpers/vaccinationImportCsv.ts';
import { importCompletedVaccinations } from 'src/state/vaccination/importCompletedVaccinations.ts';

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

const createParsedImportRow = (overrides?: Partial<VaccinationCompletedImportRow>): VaccinationCompletedImportRow => ({
  batchNumber: 'A-1',
  completedAt: '2024-05-01',
  diseaseId: 'measles',
  kind: 'nextDose',
  rowNumber: 3,
  tradeName: 'MMR',
  ...overrides,
});

const createParseResult = (
  overrides?: Partial<VaccinationCompletedImportParseResult>,
): VaccinationCompletedImportParseResult => ({
  fileError: null,
  rowErrors: [],
  rows: [],
  totalDataRows: 0,
  ...overrides,
});

const createImportReport = (
  overrides?: Partial<VaccinationCompletedImportReport>,
): VaccinationCompletedImportReport => ({
  duplicateRows: 0,
  errors: [],
  importedRows: 0,
  invalidRows: 0,
  totalDataRows: 0,
  ...overrides,
});

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

describe('Workspace export actions', () => {
  beforeEach(async () => {
    resetStores();
    vi.clearAllMocks();
    await i18n.changeLanguage('ru');
    vi.mocked(parseVaccinationCompletedImportCsv).mockReturnValue(createParseResult());
    vi.mocked(importCompletedVaccinations).mockResolvedValue(createImportReport());
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

  it('renders CSV import button', () => {
    const { getByRole } = render(<Workspace ui={workspaceUi} vaccinationUi={workspaceVaccinationUi} />);

    expect(getByRole('button', { name: 'Импорт CSV' })).toBeInTheDocument();
  });

  it('opens file picker when import button is clicked', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByRole } = render(
      <Workspace ui={workspaceUi} vaccinationUi={workspaceVaccinationUi} />,
    );
    const fileInput = getByLabelText('CSV файл с выполненными прививками') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click');

    await user.click(getByRole('button', { name: 'Импорт CSV' }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('imports valid CSV and shows report summary', async () => {
    const user = userEvent.setup();
    vi.mocked(parseVaccinationCompletedImportCsv).mockReturnValue(createParseResult({
      rows: [createParsedImportRow()],
      totalDataRows: 1,
    }));
    vi.mocked(importCompletedVaccinations).mockResolvedValue(createImportReport({
      importedRows: 1,
      totalDataRows: 1,
    }));

    const { findByText, getByLabelText } = render(
      <Workspace ui={workspaceUi} vaccinationUi={workspaceVaccinationUi} />,
    );
    const fileInput = getByLabelText('CSV файл с выполненными прививками') as HTMLInputElement;

    await user.upload(fileInput, new File(['csv-data'], 'vaccinations.csv', { type: 'text/csv' }));

    expect(parseVaccinationCompletedImportCsv).toHaveBeenCalledWith('csv-data');
    expect(importCompletedVaccinations).toHaveBeenCalledWith({
      rows: [createParsedImportRow()],
    });
    expect(await findByText('Результат импорта CSV')).toBeInTheDocument();
    expect(await findByText('Импортировано: 1')).toBeInTheDocument();
    expect(await findByText('Строк в файле: 1')).toBeInTheDocument();
  });

  it('allows closing import report modal after import', async () => {
    const user = userEvent.setup();
    vi.mocked(parseVaccinationCompletedImportCsv).mockReturnValue(createParseResult({
      rows: [createParsedImportRow()],
      totalDataRows: 1,
    }));
    vi.mocked(importCompletedVaccinations).mockResolvedValue(createImportReport({
      importedRows: 1,
      totalDataRows: 1,
    }));

    const { findByText, getByLabelText, getByRole, queryByText } = render(
      <Workspace ui={workspaceUi} vaccinationUi={workspaceVaccinationUi} />,
    );

    await user.upload(
      getByLabelText('CSV файл с выполненными прививками') as HTMLInputElement,
      new File(['csv-data'], 'vaccinations.csv', { type: 'text/csv' }),
    );

    expect(await findByText('Результат импорта CSV')).toBeInTheDocument();

    await user.click(getByRole('button', { name: 'Закрыть' }));

    await waitFor(() => {
      expect(queryByText('Результат импорта CSV')).not.toBeInTheDocument();
    });
  });

  it('shows row-level errors for partial import', async () => {
    const user = userEvent.setup();
    vi.mocked(parseVaccinationCompletedImportCsv).mockReturnValue(createParseResult({
      rowErrors: [{
        code: 'unknown_disease',
        messageKey: 'internal.records.import.report.rowError.unknownDisease',
        rowNumber: 4,
      }],
      rows: [createParsedImportRow()],
      totalDataRows: 2,
    }));
    vi.mocked(importCompletedVaccinations).mockResolvedValue(createImportReport({
      importedRows: 1,
    }));

    const { findByText, getByLabelText } = render(
      <Workspace ui={workspaceUi} vaccinationUi={workspaceVaccinationUi} />,
    );

    await user.upload(
      getByLabelText('CSV файл с выполненными прививками') as HTMLInputElement,
      new File(['csv-data'], 'vaccinations.csv', { type: 'text/csv' }),
    );

    expect(await findByText('Строк с ошибками: 1')).toBeInTheDocument();
    expect(await findByText('Строка 4: Неизвестное заболевание.')).toBeInTheDocument();
  });

  it('shows fatal alert for unsupported CSV header and does not start import', async () => {
    const user = userEvent.setup();
    vi.mocked(parseVaccinationCompletedImportCsv).mockReturnValue(createParseResult({
      fileError: {
        code: 'unsupported_header',
        messageKey: 'internal.records.import.error.unsupportedHeader',
      },
    }));

    const { findByRole, getByLabelText } = render(
      <Workspace ui={workspaceUi} vaccinationUi={workspaceVaccinationUi} />,
    );

    await user.upload(
      getByLabelText('CSV файл с выполненными прививками') as HTMLInputElement,
      new File(['bad-csv'], 'vaccinations.csv', { type: 'text/csv' }),
    );

    expect(importCompletedVaccinations).not.toHaveBeenCalled();
    expect(await findByRole('alert')).toHaveTextContent(
      'Этот CSV не похож на выгрузку приложения (неверные заголовки).',
    );
  });

  it('disables import and export buttons while import is running', async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<VaccinationCompletedImportReport>();

    vi.mocked(parseVaccinationCompletedImportCsv).mockReturnValue(createParseResult({
      rows: [createParsedImportRow()],
      totalDataRows: 1,
    }));
    vi.mocked(importCompletedVaccinations).mockImplementationOnce(() => deferred.promise);

    const { getByLabelText, getByRole } = render(
      <Workspace ui={workspaceUi} vaccinationUi={workspaceVaccinationUi} />,
    );

    await user.upload(
      getByLabelText('CSV файл с выполненными прививками') as HTMLInputElement,
      new File(['csv-data'], 'vaccinations.csv', { type: 'text/csv' }),
    );

    await waitFor(() => {
      expect(getByRole('button', { name: 'Импорт CSV...' })).toBeDisabled();
      expect(getByRole('button', { name: 'Экспорт CSV' })).toBeDisabled();
      expect(getByRole('button', { name: 'Экспорт PDF' })).toBeDisabled();
    });

    deferred.resolve(createImportReport({
      importedRows: 1,
      totalDataRows: 1,
    }));

    await waitFor(() => {
      expect(getByRole('button', { hidden: true, name: 'Импорт CSV' })).toBeEnabled();
    });
  });

  it('allows importing the same file twice by resetting file input value', async () => {
    const user = userEvent.setup();
    vi.mocked(parseVaccinationCompletedImportCsv).mockReturnValue(createParseResult({
      rows: [createParsedImportRow()],
      totalDataRows: 1,
    }));
    vi.mocked(importCompletedVaccinations).mockResolvedValue(createImportReport({
      importedRows: 1,
      totalDataRows: 1,
    }));

    const { findByText, getByLabelText, getByRole, queryByText } = render(
      <Workspace ui={workspaceUi} vaccinationUi={workspaceVaccinationUi} />,
    );
    const fileInput = getByLabelText('CSV файл с выполненными прививками') as HTMLInputElement;
    const file = new File(['csv-data'], 'vaccinations.csv', { type: 'text/csv' });

    await user.upload(fileInput, file);
    expect(await findByText('Результат импорта CSV')).toBeInTheDocument();
    await user.click(getByRole('button', { name: 'Закрыть' }));
    await waitFor(() => {
      expect(queryByText('Результат импорта CSV')).not.toBeInTheDocument();
    });
    await user.upload(fileInput, file);

    expect(parseVaccinationCompletedImportCsv).toHaveBeenCalledTimes(2);
  });
});

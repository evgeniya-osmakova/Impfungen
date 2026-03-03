/* @vitest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from 'src/i18n';
import type { MainPageUi } from 'src/interfaces/mainPageUi.ts';
import type { VaccinationPageUi } from 'src/interfaces/vaccinationPageUi.ts';
import { useVaccinationStore } from 'src/state/vaccination';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Modals } from './Modals';

const commandMocks = vi.hoisted(() => ({
  submitCompletedDose: vi.fn(),
  submitRecord: vi.fn(),
  updateCompletedDose: vi.fn(),
}));

vi.mock('src/state/vaccination/commands', () => ({
  useVaccinationCommands: () => ({
    submitCompletedDose: commandMocks.submitCompletedDose,
    submitRecord: commandMocks.submitRecord,
    updateCompletedDose: commandMocks.updateCompletedDose,
  }),
}));

vi.mock('src/state/vaccination/selectors', () => ({
  selectModalsViewData: () => ({
    diseasesForForm: [],
    recordForEdit: null,
  }),
}));

const createUi = (overrides?: Partial<MainPageUi>): MainPageUi => ({
  closeCompleteDoseModal: vi.fn(),
  closeFormModal: vi.fn(),
  completeDoseDraft: {
    diseaseId: 'measles',
    editingDoseId: null,
    initialValues: {
      batchNumber: null,
      completedAt: '2024-05-01',
      kind: 'nextDose',
      plannedDoseId: null,
      tradeName: null,
    },
    isMarkPlannedFlow: false,
  },
  completeDoseErrorKey: null,
  formErrorKey: null,
  isCompleteDoseModalOpen: true,
  isFormModalOpen: false,
  openCompleteDoseModal: vi.fn(),
  openFormModal: vi.fn(),
  openFormModalWithPrefilledDisease: vi.fn(),
  prefilledDiseaseId: null,
  setCompleteDoseErrorKey: vi.fn(),
  setFormErrorKey: vi.fn(),
  ...overrides,
});

const vaccinationUi: VaccinationPageUi = {
  cancelEdit: vi.fn(),
  editingDiseaseId: null,
  searchQuery: '',
  categoryFilter: 'all',
  setCategoryFilter: vi.fn(),
  setSearchQuery: vi.fn(),
  startEditRecord: vi.fn(),
};

describe('Modals completed dose submit flow', () => {
  beforeEach(async () => {
    commandMocks.submitCompletedDose.mockReset();
    commandMocks.submitRecord.mockReset();
    commandMocks.updateCompletedDose.mockReset();
    commandMocks.submitCompletedDose.mockResolvedValue(null);
    commandMocks.submitRecord.mockResolvedValue(null);
    commandMocks.updateCompletedDose.mockResolvedValue(null);
    useVaccinationStore.setState({
      country: 'RU',
      records: [],
    });
    await i18n.changeLanguage('en');
  });

  it('calls updateCompletedDose when modal draft is in editing mode', async () => {
    const user = userEvent.setup();
    const ui = createUi({
      completeDoseDraft: {
        diseaseId: 'measles',
        editingDoseId: 'dose-1',
        initialValues: {
          batchNumber: null,
          completedAt: '2024-05-01',
          kind: 'nextDose',
          plannedDoseId: null,
          tradeName: null,
        },
        isMarkPlannedFlow: false,
      },
    });

    render(<Modals ui={ui} vaccinationUi={vaccinationUi} />);

    await user.click(screen.getByRole('button', { name: 'Save completed vaccination' }));

    await waitFor(() => {
      expect(commandMocks.updateCompletedDose).toHaveBeenCalledWith({
        batchNumber: null,
        completedAt: '2024-05-01',
        diseaseId: 'measles',
        doseId: 'dose-1',
        kind: 'nextDose',
        plannedDoseId: null,
        tradeName: null,
      });
    });
    expect(commandMocks.submitCompletedDose).not.toHaveBeenCalled();
  });

  it('calls submitCompletedDose when modal draft is in add mode', async () => {
    const user = userEvent.setup();
    const ui = createUi();

    render(<Modals ui={ui} vaccinationUi={vaccinationUi} />);

    await user.click(screen.getByRole('button', { name: 'Save completed vaccination' }));

    await waitFor(() => {
      expect(commandMocks.submitCompletedDose).toHaveBeenCalledWith({
        batchNumber: null,
        completedAt: '2024-05-01',
        diseaseId: 'measles',
        kind: 'nextDose',
        plannedDoseId: null,
        tradeName: null,
      });
    });
    expect(commandMocks.updateCompletedDose).not.toHaveBeenCalled();
  });
});

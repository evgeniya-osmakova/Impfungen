/* @vitest-environment jsdom */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from 'src/i18n';
import type { VaccinationRecordCardView } from 'src/interfaces/vaccinationViewData.ts';
import { useLanguageStore } from 'src/state/language';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VaccinationRecords } from './VaccinationRecords';

const createRecord = (
  doses: Array<{
    batchNumber: string | null;
    completedAt: string;
    id: string;
    kind: 'nextDose' | 'revaccination';
    tradeName: string | null;
  }>,
): VaccinationRecordCardView => {
  const completedDoses = [...doses].sort((left, right) =>
    left.completedAt.localeCompare(right.completedAt),
  );
  const completedDoseHistory = [...completedDoses].reverse();

  return {
    completedDoseHistory,
    completedDoses,
    diseaseId: 'measles',
    futureDueDoses: [],
    latestCompletedDose: completedDoseHistory[0] ?? null,
    nextDue: null,
    remainingFutureDueDoses: [],
    repeatEvery: null,
    updatedAt: '2025-01-10T00:00:00.000Z',
  };
};

describe('VaccinationRecords history actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    useLanguageStore.setState({ language: 'en' });
    await i18n.changeLanguage('en');
  });

  it('opens edit for a selected history dose', async () => {
    const user = userEvent.setup();
    const onEditDose = vi.fn();

    render(
      <VaccinationRecords
        onAddDose={vi.fn()}
        onDeleteDose={vi.fn(async () => true)}
        onDeleteRecord={vi.fn(async () => true)}
        onEditDose={onEditDose}
        onEditRecord={vi.fn()}
        onMarkPlannedDone={vi.fn()}
        records={[
          createRecord([
            {
              batchNumber: 'A-1',
              completedAt: '2023-05-11',
              id: 'dose-1',
              kind: 'nextDose',
              tradeName: 'Dose One',
            },
            {
              batchNumber: 'A-2',
              completedAt: '2023-07-20',
              id: 'dose-2',
              kind: 'revaccination',
              tradeName: 'Dose Two',
            },
          ]),
        ]}
        resolveDiseaseLabelById={() => 'Measles'}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show history (2)' }));

    const historyItem = screen.getByText(/Dose Two/).closest('li');

    if (!historyItem) {
      throw new Error('History item is missing.');
    }

    await user.click(within(historyItem).getByRole('button', { name: 'Edit' }));

    expect(onEditDose).toHaveBeenCalledWith('measles', 'dose-2');
  });

  it('deletes selected history dose via dose delete confirmation', async () => {
    const user = userEvent.setup();
    const onDeleteDose = vi.fn(async () => true);

    render(
      <VaccinationRecords
        onAddDose={vi.fn()}
        onDeleteDose={onDeleteDose}
        onDeleteRecord={vi.fn(async () => true)}
        onEditDose={vi.fn()}
        onEditRecord={vi.fn()}
        onMarkPlannedDone={vi.fn()}
        records={[
          createRecord([
            {
              batchNumber: 'A-1',
              completedAt: '2023-05-11',
              id: 'dose-1',
              kind: 'nextDose',
              tradeName: 'Dose One',
            },
            {
              batchNumber: 'A-2',
              completedAt: '2023-07-20',
              id: 'dose-2',
              kind: 'revaccination',
              tradeName: 'Dose Two',
            },
          ]),
        ]}
        resolveDiseaseLabelById={() => 'Measles'}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show history (2)' }));

    const historyItem = screen.getByText(/Dose One/).closest('li');

    if (!historyItem) {
      throw new Error('History item is missing.');
    }

    await user.click(within(historyItem).getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete dose' }));

    await waitFor(() => {
      expect(onDeleteDose).toHaveBeenCalledWith({ diseaseId: 'measles', doseId: 'dose-1' });
    });
  });

  it('keeps top-level delete flow for deleting whole record', async () => {
    const user = userEvent.setup();
    const onDeleteRecord = vi.fn(async () => true);

    render(
      <VaccinationRecords
        onAddDose={vi.fn()}
        onDeleteDose={vi.fn(async () => true)}
        onDeleteRecord={onDeleteRecord}
        onEditDose={vi.fn()}
        onEditRecord={vi.fn()}
        onMarkPlannedDone={vi.fn()}
        records={[
          createRecord([
            {
              batchNumber: 'A-1',
              completedAt: '2023-05-11',
              id: 'dose-1',
              kind: 'nextDose',
              tradeName: 'Dose One',
            },
            {
              batchNumber: 'A-2',
              completedAt: '2023-07-20',
              id: 'dose-2',
              kind: 'revaccination',
              tradeName: 'Dose Two',
            },
          ]),
        ]}
        resolveDiseaseLabelById={() => 'Measles'}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete record' }));

    await waitFor(() => {
      expect(onDeleteRecord).toHaveBeenCalledWith('measles');
    });
  });

  it('does not expose history delete for a record with one completed dose', () => {
    render(
      <VaccinationRecords
        onAddDose={vi.fn()}
        onDeleteDose={vi.fn(async () => true)}
        onDeleteRecord={vi.fn(async () => true)}
        onEditDose={vi.fn()}
        onEditRecord={vi.fn()}
        onMarkPlannedDone={vi.fn()}
        records={[
          createRecord([
            {
              batchNumber: 'A-1',
              completedAt: '2023-05-11',
              id: 'dose-1',
              kind: 'nextDose',
              tradeName: 'Dose One',
            },
          ]),
        ]}
        resolveDiseaseLabelById={() => 'Measles'}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Show history (1)' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(1);
  });
});

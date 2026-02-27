import { type ProfileSnapshot, setProfileApi } from 'src/api/profileApi.ts';
import type { VaccinationCompletedImportRow } from 'src/interfaces/vaccinationImport.ts';
import { useAccountsStore } from 'src/state/accounts';
import { getTodayIsoDate } from 'src/utils/date.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { importCompletedVaccinations } from './importCompletedVaccinations';
import { useVaccinationStore } from './index';

type ProfileApi = ReturnType<typeof import('src/api/profileApi.ts')['createProfileApi']>;
type SubmitVaccinationRecordInput = Parameters<ProfileApi['submitVaccinationRecord']>[0];

const createSnapshot = (overrides?: Partial<ProfileSnapshot>): ProfileSnapshot => ({
  accountsState: {
    accounts: [
      {
        birthYear: 1990,
        country: 'RU',
        id: 1,
        kind: 'primary',
        name: 'Ivan',
      },
    ],
    selectedAccountId: 1,
  },
  language: 'ru',
  vaccinationState: {
    country: 'RU',
    records: [],
  },
  ...overrides,
});

const createImportRow = (
  overrides?: Partial<VaccinationCompletedImportRow>,
): VaccinationCompletedImportRow => ({
  batchNumber: 'A-1',
  completedAt: '2024-05-01',
  diseaseId: 'measles',
  kind: 'nextDose',
  rowNumber: 3,
  tradeName: 'MMR',
  ...overrides,
});

const setBaseStores = () => {
  useAccountsStore.setState({
    accounts: [
      {
        birthYear: 1990,
        country: 'RU',
        id: 1,
        kind: 'primary',
        name: 'Ivan',
      },
    ],
    selectedAccountId: 1,
  });
  useVaccinationStore.setState({
    activeAccountId: 1,
    country: 'RU',
    records: [],
  });
};

const createApiMock = (snapshot: ProfileSnapshot) => ({
  completeVaccinationDose: vi.fn(() => Promise.resolve(snapshot)),
  createFamilyAccount: vi.fn(() => Promise.resolve(snapshot)),
  deleteFamilyAccount: vi.fn(() => Promise.resolve(snapshot)),
  getProfile: vi.fn(() => Promise.resolve(snapshot)),
  removeVaccinationRecord: vi.fn(() => Promise.resolve(snapshot)),
  selectAccount: vi.fn(() => Promise.resolve(snapshot)),
  setLanguage: vi.fn(() => Promise.resolve(snapshot)),
  setVaccinationCountry: vi.fn(() => Promise.resolve(snapshot)),
  submitVaccinationRecord: vi.fn((input: SubmitVaccinationRecordInput) => {
    void input;

    return Promise.resolve(snapshot);
  }),
  updateAccount: vi.fn(() => Promise.resolve(snapshot)),
});

describe('importCompletedVaccinations', () => {
  beforeEach(() => {
    setProfileApi(null);
    setBaseStores();
  });

  it('imports rows sequentially with local fallback, sorts by date, and skips in-file duplicates', async () => {
    const report = await importCompletedVaccinations({
      rows: [
        createImportRow({
          completedAt: '2024-05-02',
          kind: 'revaccination',
          rowNumber: 5,
        }),
        createImportRow({
          completedAt: '2024-05-01',
          kind: 'nextDose',
          rowNumber: 4,
        }),
        createImportRow({
          completedAt: '2024-05-01',
          kind: 'nextDose',
          rowNumber: 6,
        }),
      ],
    });

    expect(report).toMatchObject({
      duplicateRows: 1,
      importedRows: 2,
      invalidRows: 0,
      totalDataRows: 3,
    });
    expect(report.errors).toEqual([]);

    const records = useVaccinationStore.getState().records;

    expect(records).toHaveLength(1);
    expect(records[0]?.diseaseId).toBe('measles');
    expect(records[0]?.completedDoses).toHaveLength(2);
    expect(records[0]?.completedDoses.map((dose) => [dose.completedAt, dose.kind])).toEqual([
      ['2024-05-01', 'nextDose'],
      ['2024-05-02', 'revaccination'],
    ]);
  });

  it('skips duplicates that already exist in store by exact duplicate key', async () => {
    useVaccinationStore.setState({
      records: [
        {
          completedDoses: [
            {
              batchNumber: 'A-1',
              completedAt: '2024-05-01',
              id: 'dose-1',
              kind: 'nextDose',
              tradeName: 'MMR',
            },
          ],
          diseaseId: 'measles',
          futureDueDoses: [],
          repeatEvery: null,
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ],
    });

    const report = await importCompletedVaccinations({
      rows: [
        createImportRow({
          completedAt: '2024-05-01',
          kind: 'nextDose',
          rowNumber: 3,
        }),
        createImportRow({
          batchNumber: 'A-2',
          completedAt: '2024-05-01',
          kind: 'nextDose',
          rowNumber: 4,
        }),
      ],
    });

    expect(report).toMatchObject({
      duplicateRows: 1,
      importedRows: 1,
      invalidRows: 0,
    });
    expect(useVaccinationStore.getState().records[0]?.completedDoses).toHaveLength(2);
  });

  it('continues after row-level validation error and reports it', async () => {
    const tomorrow = new Date(`${getTodayIsoDate()}T00:00:00.000Z`);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const tomorrowIso = tomorrow.toISOString().slice(0, 10);

    const report = await importCompletedVaccinations({
      rows: [
        createImportRow({
          completedAt: tomorrowIso,
          rowNumber: 3,
        }),
        createImportRow({
          completedAt: '2024-05-01',
          diseaseId: 'tetanus',
          rowNumber: 4,
        }),
      ],
    });

    expect(report).toMatchObject({
      importedRows: 1,
      invalidRows: 1,
      duplicateRows: 0,
      totalDataRows: 2,
    });
    expect(report.errors).toHaveLength(1);
    expect(report.errors[0]).toMatchObject({
      code: 'completed_in_future',
      rowNumber: 3,
    });
    expect(useVaccinationStore.getState().records.map((record) => record.diseaseId)).toEqual([
      'tetanus',
    ]);
  });

  it('reports conflict as row error and continues with next rows when api is configured', async () => {
    const snapshot = createSnapshot();
    const api = createApiMock(snapshot);

    api.submitVaccinationRecord.mockImplementation((input: SubmitVaccinationRecordInput) => {
      if (input.diseaseId === 'measles') {
        const conflictError = Object.assign(new Error('Conflict'), {
          data: { code: 'CONFLICT' },
        });

        return Promise.reject(conflictError);
      }

      snapshot.vaccinationState.records.push({
        completedDoses: [
          {
            batchNumber: input.batchNumber,
            completedAt: input.completedAt,
            id: input.completedDoseId ?? 'dose-new',
            kind: input.completedDoseKind,
            tradeName: input.tradeName,
          },
        ],
        diseaseId: input.diseaseId,
        futureDueDoses: [],
        repeatEvery: null,
        updatedAt: '2025-01-10T00:00:00.000Z',
      });

      return Promise.resolve(snapshot);
    });

    setProfileApi(api);

    const report = await importCompletedVaccinations({
      rows: [
        createImportRow({
          diseaseId: 'measles',
          rowNumber: 3,
        }),
        createImportRow({
          diseaseId: 'tetanus',
          rowNumber: 4,
        }),
      ],
    });

    expect(report).toMatchObject({
      importedRows: 1,
      invalidRows: 1,
      duplicateRows: 0,
      totalDataRows: 2,
    });
    expect(report.errors[0]).toMatchObject({
      code: 'sync_conflict',
      rowNumber: 3,
    });
    expect(useVaccinationStore.getState().records.map((record) => record.diseaseId)).toEqual([
      'tetanus',
    ]);
    expect(api.submitVaccinationRecord).toHaveBeenCalledTimes(2);
  });
});

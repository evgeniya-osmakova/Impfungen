import { describe, expect, it, vi } from 'vitest';

import {
  OptimisticConcurrencyError,
  ProfilePrimaryAccountDeletionError,
} from '../modules/profile/profileRepository.js';
import type { ProfileRepository } from '../modules/profile/profileRepository.js';
import type { ProfileSnapshot } from '../modules/profile/profileTypes.js';

import { appRouter } from './router.js';
import { createTrpcContext } from './trpc.js';

const createSnapshot = (): ProfileSnapshot => ({
  accountsState: {
    accounts: [
      {
        birthYear: null,
        country: null,
        id: 1,
        kind: 'primary',
        name: null,
      },
    ],
    selectedAccountId: 1,
  },
  language: 'ru',
  vaccinationState: {
    country: null,
    records: [],
  },
});

const createMockRepository = (
  profileSnapshot: ProfileSnapshot,
): ProfileRepository => ({
  createFamilyAccount: vi.fn(async ({ birthYear, country, name }) => {
    const nextId = Math.max(...profileSnapshot.accountsState.accounts.map((account) => account.id), 0) + 1;

    profileSnapshot.accountsState.accounts.push({
      birthYear,
      country,
      id: nextId,
      kind: 'family',
      name,
    });

    return profileSnapshot;
  }),
  deleteFamilyAccount: vi.fn(async (accountId: number) => {
    const account = profileSnapshot.accountsState.accounts.find((current) => current.id === accountId);

    if (!account || account.kind === 'primary') {
      throw new ProfilePrimaryAccountDeletionError(accountId);
    }

    profileSnapshot.accountsState.accounts = profileSnapshot.accountsState.accounts.filter(
      (current) => current.id !== accountId,
    );

    if (profileSnapshot.accountsState.selectedAccountId === accountId) {
      profileSnapshot.accountsState.selectedAccountId = 1;
      const selectedPrimary = profileSnapshot.accountsState.accounts.find((current) => current.id === 1);
      profileSnapshot.vaccinationState.country = selectedPrimary?.country ?? null;
    }

    return profileSnapshot;
  }),
  ensureDefaultProfile: vi.fn(async () => undefined),
  getProfileSnapshot: vi.fn(async () => profileSnapshot),
  removeVaccinationRecord: vi.fn(async (_accountId: number, diseaseId: string) => {
    profileSnapshot.vaccinationState.records = profileSnapshot.vaccinationState.records.filter(
      (record) => record.diseaseId !== diseaseId,
    );
  }),
  setVaccinationCountry: vi.fn(async (accountId, country) => {
    profileSnapshot.vaccinationState.country = country;
    const selectedAccount = profileSnapshot.accountsState.accounts.find(
      (account) => account.id === accountId,
    );

    if (selectedAccount) {
      selectedAccount.country = country;
    }
  }),
  selectAccount: vi.fn(async (accountId: number) => {
    profileSnapshot.accountsState.selectedAccountId = accountId;

    return profileSnapshot;
  }),
  upsertVaccinationRecord: vi.fn(async (_accountId, record) => {
    const { expectedUpdatedAt: _expectedUpdatedAt, ...payload } = record;
    const persistedRecord = {
      ...payload,
      updatedAt: '2025-01-10T00:00:00.000Z',
    };
    const existingIndex = profileSnapshot.vaccinationState.records.findIndex(
      (current) => current.diseaseId === record.diseaseId,
    );

    if (existingIndex === -1) {
      profileSnapshot.vaccinationState.records.push(persistedRecord);
      return persistedRecord.updatedAt;
    }

    profileSnapshot.vaccinationState.records[existingIndex] = persistedRecord;

    return persistedRecord.updatedAt;
  }),
  setLanguage: vi.fn(async (language: ProfileSnapshot['language']) => {
    profileSnapshot.language = language;
  }),
  updateAccount: vi.fn(async ({ accountId, birthYear, country, name }) => {
    const account = profileSnapshot.accountsState.accounts.find((current) => current.id === accountId);

    if (account) {
      account.birthYear = birthYear;
      account.country = country;
      account.name = name;
    }

    if (profileSnapshot.accountsState.selectedAccountId === accountId) {
      profileSnapshot.vaccinationState.country = country;
    }

    return profileSnapshot;
  }),
});

describe('appRouter profile namespace', () => {
  it('supports get and partial vaccination updates', async () => {
    const snapshot = createSnapshot();
    const repository = createMockRepository(snapshot);
    const caller = appRouter.createCaller(createTrpcContext({
      profileRepository: repository,
      req: {} as never,
      res: {} as never,
    }));

    expect(await caller.profile.get()).toEqual(snapshot);

    expect(await caller.profile.setLanguage({ language: 'en' })).toEqual({ ok: true });
    expect(snapshot.language).toBe('en');

    const nextRecord = {
      completedDoses: [
        {
          batchNumber: null,
          completedAt: '2025-01-10',
          id: 'done-1',
          kind: 'nextDose' as const,
          tradeName: null,
        },
      ],
      diseaseId: 'measles',
      expectedUpdatedAt: null,
      futureDueDoses: [],
      repeatEvery: null,
    };
    const persistedRecord = {
      completedDoses: nextRecord.completedDoses,
      diseaseId: nextRecord.diseaseId,
      futureDueDoses: nextRecord.futureDueDoses,
      repeatEvery: nextRecord.repeatEvery,
      updatedAt: '2025-01-10T00:00:00.000Z',
    };

    expect(await caller.profile.setVaccinationCountry({ accountId: 1, country: 'RU' })).toEqual({ ok: true });
    expect(snapshot.vaccinationState.country).toBe('RU');

    expect(await caller.profile.upsertVaccinationRecord({
      accountId: 1,
      ...nextRecord,
    })).toEqual({
      ok: true,
      updatedAt: '2025-01-10T00:00:00.000Z',
    });
    expect(snapshot.vaccinationState.records).toEqual([persistedRecord]);

    expect(await caller.profile.removeVaccinationRecord({ accountId: 1, diseaseId: 'measles' })).toEqual({ ok: true });
    expect(snapshot.vaccinationState.records).toEqual([]);
  });

  it('returns conflict when vaccination record has stale expectedUpdatedAt', async () => {
    const snapshot = createSnapshot();
    const repository = createMockRepository(snapshot);

    repository.upsertVaccinationRecord = vi.fn(async () => {
      throw new OptimisticConcurrencyError('stale update');
    });

    const caller = appRouter.createCaller(createTrpcContext({
      profileRepository: repository,
      req: {} as never,
      res: {} as never,
    }));

    await expect(caller.profile.upsertVaccinationRecord({
      accountId: 1,
      completedDoses: [
        {
          batchNumber: null,
          completedAt: '2025-01-10',
          id: 'done-1',
          kind: 'nextDose',
          tradeName: null,
        },
      ],
      diseaseId: 'measles',
      expectedUpdatedAt: '2025-01-09T00:00:00.000Z',
      futureDueDoses: [],
      repeatEvery: null,
    })).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });

  it('supports family account create, update and selection', async () => {
    const snapshot = createSnapshot();
    const repository = createMockRepository(snapshot);
    const caller = appRouter.createCaller(createTrpcContext({
      profileRepository: repository,
      req: {} as never,
      res: {} as never,
    }));

    const created = await caller.profile.createFamilyAccount({
      birthYear: 2018,
      country: 'DE',
      name: 'Anna',
    });

    expect(created.accountsState.accounts).toHaveLength(2);
    const familyAccount = created.accountsState.accounts.find((account) => account.kind === 'family');

    expect(familyAccount).toMatchObject({
      birthYear: 2018,
      country: 'DE',
      name: 'Anna',
    });

    if (!familyAccount) {
      throw new Error('Expected family account to be created.');
    }

    const updated = await caller.profile.updateAccount({
      accountId: familyAccount.id,
      birthYear: 2019,
      country: 'DE',
      name: 'Anna Updated',
    });

    const updatedFamily = updated.accountsState.accounts.find((account) => account.id === familyAccount.id);

    expect(updatedFamily).toMatchObject({
      birthYear: 2019,
      country: 'DE',
      name: 'Anna Updated',
    });

    const selected = await caller.profile.selectAccount({ accountId: familyAccount.id });

    expect(selected.accountsState.selectedAccountId).toBe(familyAccount.id);

    const afterDelete = await caller.profile.deleteFamilyAccount({ accountId: familyAccount.id });

    expect(afterDelete.accountsState.accounts.some((account) => account.id === familyAccount.id)).toBe(false);
  });

  it('returns bad request when deleting primary account', async () => {
    const snapshot = createSnapshot();
    const repository = createMockRepository(snapshot);
    const caller = appRouter.createCaller(createTrpcContext({
      profileRepository: repository,
      req: {} as never,
      res: {} as never,
    }));

    await expect(caller.profile.deleteFamilyAccount({ accountId: 1 })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
  });
});

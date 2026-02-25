import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';

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

const createRepository = (
  snapshot: ProfileSnapshot,
): ProfileRepository => ({
  createFamilyAccount: async ({ birthYear, country, name }) => {
    const nextId = Math.max(...snapshot.accountsState.accounts.map((account) => account.id), 0) + 1;

    snapshot.accountsState.accounts.push({
      birthYear,
      country,
      id: nextId,
      kind: 'family',
      name,
    });

    return snapshot;
  },
  deleteFamilyAccount: async (accountId) => {
    snapshot.accountsState.accounts = snapshot.accountsState.accounts.filter(
      (account) => account.id !== accountId || account.kind === 'primary',
    );

    if (snapshot.accountsState.selectedAccountId === accountId) {
      snapshot.accountsState.selectedAccountId = 1;
      const selectedPrimary = snapshot.accountsState.accounts.find((account) => account.id === 1);
      snapshot.vaccinationState.country = selectedPrimary?.country ?? null;
    }

    return snapshot;
  },
  ensureDefaultProfile: async () => undefined,
  getProfileSnapshot: async () => snapshot,
  removeVaccinationRecord: async (_accountId, diseaseId) => {
    snapshot.vaccinationState.records = snapshot.vaccinationState.records.filter(
      (record) => record.diseaseId !== diseaseId,
    );
  },
  completeVaccinationDose: async () => '2025-01-10T00:00:00.000Z',
  setVaccinationCountry: async (accountId, country) => {
    snapshot.vaccinationState.country = country;
    const selectedAccount = snapshot.accountsState.accounts.find(
      (account) => account.id === accountId,
    );

    if (selectedAccount) {
      selectedAccount.country = country;
    }
  },
  selectAccount: async (accountId) => {
    snapshot.accountsState.selectedAccountId = accountId;

    return snapshot;
  },
  submitVaccinationRecord: async (_accountId, input) => {
    const persistedRecord = {
      completedDoses: [
        {
          batchNumber: input.batchNumber,
          completedAt: input.completedAt,
          id: input.completedDoseId ?? 'done-1',
          kind: input.completedDoseKind,
          tradeName: input.tradeName,
        },
      ],
      diseaseId: input.diseaseId,
      futureDueDoses: input.futureDueDoses,
      repeatEvery: input.repeatEvery,
      updatedAt: '2025-01-10T00:00:00.000Z',
    };
    const existingIndex = snapshot.vaccinationState.records.findIndex(
      (current) => current.diseaseId === input.diseaseId,
    );

    if (existingIndex === -1) {
      snapshot.vaccinationState.records.push(persistedRecord);
      return persistedRecord.updatedAt;
    }

    snapshot.vaccinationState.records[existingIndex] = persistedRecord;

    return persistedRecord.updatedAt;
  },
  setLanguage: async (language) => {
    snapshot.language = language;
  },
  updateAccount: async ({ accountId, birthYear, country, name }) => {
    const account = snapshot.accountsState.accounts.find((current) => current.id === accountId);

    if (account) {
      account.birthYear = birthYear;
      account.country = country;
      account.name = name;
    }

    if (snapshot.accountsState.selectedAccountId === accountId) {
      snapshot.vaccinationState.country = country;
    }

    return snapshot;
  },
});

describe('tRPC Fastify transport', () => {
  it('handles profile procedures over HTTP transport', async () => {
    const snapshot = createSnapshot();
    const profileRepository = createRepository(snapshot);
    const app = Fastify();

    await app.register(fastifyTRPCPlugin, {
      prefix: '/trpc',
      trpcOptions: {
        router: appRouter,
        createContext: ({ req, res }) => createTrpcContext({
          profileRepository,
          req,
          res,
        }),
      },
    });

    const getResponse = await app.inject({
      method: 'GET',
      url: '/trpc/profile.get',
    });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json()).toMatchObject({
      result: {
        data: {
          language: 'ru',
        },
      },
    });

    const setLanguageResponse = await app.inject({
      method: 'POST',
      url: '/trpc/profile.setLanguage',
      payload: {
        language: 'en',
      },
    });

    expect(setLanguageResponse.statusCode).toBe(200);
    expect(setLanguageResponse.json()).toMatchObject({
      result: {
        data: {
          ok: true,
        },
      },
    });
    expect(snapshot.language).toBe('en');

    const setCountryResponse = await app.inject({
      method: 'POST',
      url: '/trpc/profile.setVaccinationCountry',
      payload: {
        accountId: 1,
        country: 'RU',
      },
    });

    expect(setCountryResponse.statusCode).toBe(200);
    expect(snapshot.vaccinationState.country).toBe('RU');

    const nextRecord = {
      batchNumber: null,
      completedAt: '2025-01-10',
      completedDoseId: 'done-1',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      expectedUpdatedAt: null,
      futureDueDoses: [],
      repeatEvery: null,
      tradeName: null,
    };
    const persistedRecord = {
      completedDoses: [
        {
          batchNumber: null,
          completedAt: '2025-01-10',
          id: 'done-1',
          kind: 'nextDose',
          tradeName: null,
        },
      ],
      diseaseId: nextRecord.diseaseId,
      futureDueDoses: nextRecord.futureDueDoses,
      repeatEvery: nextRecord.repeatEvery,
      updatedAt: '2025-01-10T00:00:00.000Z',
    };
    const submitRecordResponse = await app.inject({
      method: 'POST',
      url: '/trpc/profile.submitVaccinationRecord',
      payload: {
        accountId: 1,
        ...nextRecord,
      },
    });

    expect(submitRecordResponse.statusCode).toBe(200);
    expect(submitRecordResponse.json()).toMatchObject({
      result: {
        data: {
          ok: true,
          updatedAt: '2025-01-10T00:00:00.000Z',
        },
      },
    });
    expect(snapshot.vaccinationState.records).toEqual([persistedRecord]);

    const removeRecordResponse = await app.inject({
      method: 'POST',
      url: '/trpc/profile.removeVaccinationRecord',
      payload: {
        accountId: 1,
        diseaseId: 'measles',
      },
    });

    expect(removeRecordResponse.statusCode).toBe(200);
    expect(snapshot.vaccinationState.records).toEqual([]);

    await app.close();
  });
});

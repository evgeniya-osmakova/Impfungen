import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import { LastCompletedDoseRemovalError } from '../modules/profile/profileRepository.js';
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

const createRepository = (snapshot: ProfileSnapshot): ProfileRepository => ({
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
  completeVaccinationDose: async (_accountId, input) => {
    const targetRecord = snapshot.vaccinationState.records.find(
      (record) => record.diseaseId === input.diseaseId,
    );

    if (targetRecord) {
      targetRecord.completedDoses.push({
        batchNumber: input.batchNumber,
        completedAt: input.completedAt,
        id: input.doseId,
        kind: input.kind,
        tradeName: input.tradeName,
      });
      targetRecord.updatedAt = '2025-01-10T00:00:00.000Z';
    }

    return '2025-01-10T00:00:00.000Z';
  },
  updateVaccinationDose: async (_accountId, input) => {
    const targetRecord = snapshot.vaccinationState.records.find(
      (record) => record.diseaseId === input.diseaseId,
    );
    const targetDose = targetRecord?.completedDoses.find((dose) => dose.id === input.doseId);

    if (targetRecord && targetDose) {
      targetDose.batchNumber = input.batchNumber;
      targetDose.completedAt = input.completedAt;
      targetDose.kind = input.kind;
      targetDose.tradeName = input.tradeName;
      targetRecord.updatedAt = '2025-01-10T00:00:00.000Z';
    }

    return '2025-01-10T00:00:00.000Z';
  },
  removeVaccinationDose: async (_accountId, input) => {
    const targetRecord = snapshot.vaccinationState.records.find(
      (record) => record.diseaseId === input.diseaseId,
    );

    if (targetRecord) {
      if (targetRecord.completedDoses.length <= 1) {
        throw new LastCompletedDoseRemovalError(input.diseaseId, input.doseId);
      }

      targetRecord.completedDoses = targetRecord.completedDoses.filter(
        (dose) => dose.id !== input.doseId,
      );
      targetRecord.updatedAt = '2025-01-10T00:00:00.000Z';
    }

    return '2025-01-10T00:00:00.000Z';
  },
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
        createContext: ({ req, res }) =>
          createTrpcContext({
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
          language: 'en',
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
          vaccinationState: {
            records: [
              {
                diseaseId: 'measles',
                updatedAt: '2025-01-10T00:00:00.000Z',
              },
            ],
          },
        },
      },
    });
    expect(snapshot.vaccinationState.records).toEqual([persistedRecord]);

    const completeDoseResponse = await app.inject({
      method: 'POST',
      url: '/trpc/profile.completeVaccinationDose',
      payload: {
        accountId: 1,
        batchNumber: null,
        completedAt: '2025-02-01',
        diseaseId: 'measles',
        doseId: 'done-2',
        expectedUpdatedAt: '2025-01-10T00:00:00.000Z',
        kind: 'revaccination',
        plannedDoseId: null,
        tradeName: null,
      },
    });

    expect(completeDoseResponse.statusCode).toBe(200);

    const updateDoseResponse = await app.inject({
      method: 'POST',
      url: '/trpc/profile.updateVaccinationDose',
      payload: {
        accountId: 1,
        batchNumber: 'B-2',
        completedAt: '2025-02-02',
        diseaseId: 'measles',
        doseId: 'done-2',
        expectedUpdatedAt: '2025-01-10T00:00:00.000Z',
        kind: 'revaccination',
        tradeName: 'MMR',
      },
    });

    expect(updateDoseResponse.statusCode).toBe(200);

    const removeDoseResponse = await app.inject({
      method: 'POST',
      url: '/trpc/profile.removeVaccinationDose',
      payload: {
        accountId: 1,
        diseaseId: 'measles',
        doseId: 'done-1',
        expectedUpdatedAt: '2025-01-10T00:00:00.000Z',
      },
    });

    expect(removeDoseResponse.statusCode).toBe(200);
    expect(snapshot.vaccinationState.records[0]?.completedDoses).toEqual([
      {
        batchNumber: 'B-2',
        completedAt: '2025-02-02',
        id: 'done-2',
        kind: 'revaccination',
        tradeName: 'MMR',
      },
    ]);

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

  it('returns bad request for removing the last completed dose', async () => {
    const snapshot = createSnapshot();
    snapshot.vaccinationState = {
      country: null,
      records: [
        {
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
          futureDueDoses: [],
          repeatEvery: null,
          updatedAt: '2025-01-10T00:00:00.000Z',
        },
      ],
    };
    const profileRepository = createRepository(snapshot);
    const app = Fastify();

    await app.register(fastifyTRPCPlugin, {
      prefix: '/trpc',
      trpcOptions: {
        router: appRouter,
        createContext: ({ req, res }) =>
          createTrpcContext({
            profileRepository,
            req,
            res,
          }),
      },
    });

    const removeDoseResponse = await app.inject({
      method: 'POST',
      url: '/trpc/profile.removeVaccinationDose',
      payload: {
        accountId: 1,
        diseaseId: 'measles',
        doseId: 'done-1',
        expectedUpdatedAt: '2025-01-10T00:00:00.000Z',
      },
    });

    expect(removeDoseResponse.statusCode).toBe(400);
    expect(removeDoseResponse.json()).toMatchObject({
      error: {
        message: 'Cannot remove the last completed dose from vaccination record.',
      },
    });

    await app.close();
  });
});

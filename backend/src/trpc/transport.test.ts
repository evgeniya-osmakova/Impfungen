import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import type { ProfileRepository } from '../modules/profile/profileRepository.js';
import type { ProfileSnapshot } from '../modules/profile/profileTypes.js';

import { appRouter } from './router.js';
import { createTrpcContext } from './trpc.js';

const createRepository = (
  snapshot: ProfileSnapshot,
): ProfileRepository => ({
  ensureDefaultProfile: async () => undefined,
  getProfileSnapshot: async () => snapshot,
  removeVaccinationRecord: async (diseaseId) => {
    snapshot.vaccinationState.records = snapshot.vaccinationState.records.filter(
      (record) => record.diseaseId !== diseaseId,
    );
  },
  setVaccinationCountry: async (country) => {
    snapshot.vaccinationState.country = country;
  },
  upsertVaccinationRecord: async (record) => {
    const existingIndex = snapshot.vaccinationState.records.findIndex(
      (current) => current.diseaseId === record.diseaseId,
    );

    if (existingIndex === -1) {
      snapshot.vaccinationState.records.push(record);
      return;
    }

    snapshot.vaccinationState.records[existingIndex] = record;
  },
  setLanguage: async (language) => {
    snapshot.language = language;
  },
});

describe('tRPC Fastify transport', () => {
  it('handles profile procedures over HTTP transport', async () => {
    const snapshot: ProfileSnapshot = {
      language: 'ru',
      vaccinationState: {
        country: null,
        records: [],
      },
    };
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
        country: 'RU',
      },
    });

    expect(setCountryResponse.statusCode).toBe(200);
    expect(snapshot.vaccinationState.country).toBe('RU');

    const nextRecord = {
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
    };
    const upsertRecordResponse = await app.inject({
      method: 'POST',
      url: '/trpc/profile.upsertVaccinationRecord',
      payload: nextRecord,
    });

    expect(upsertRecordResponse.statusCode).toBe(200);
    expect(snapshot.vaccinationState.records).toEqual([nextRecord]);

    const removeRecordResponse = await app.inject({
      method: 'POST',
      url: '/trpc/profile.removeVaccinationRecord',
      payload: {
        diseaseId: 'measles',
      },
    });

    expect(removeRecordResponse.statusCode).toBe(200);
    expect(snapshot.vaccinationState.records).toEqual([]);

    await app.close();
  });
});

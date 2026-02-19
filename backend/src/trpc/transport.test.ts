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
  replaceVaccinationState: async (state) => {
    snapshot.vaccinationState = state;
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
        isCountryConfirmed: false,
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

    const saveStateResponse = await app.inject({
      method: 'POST',
      url: '/trpc/profile.saveVaccinationState',
      payload: {
        country: 'RU',
        isCountryConfirmed: true,
        records: [],
      },
    });

    expect(saveStateResponse.statusCode).toBe(200);
    expect(snapshot.vaccinationState.country).toBe('RU');
    expect(snapshot.vaccinationState.isCountryConfirmed).toBe(true);

    await app.close();
  });
});

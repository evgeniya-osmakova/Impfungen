import { describe, expect, it, vi } from 'vitest';

import type { ProfileRepository } from '../modules/profile/profileRepository.js';
import type { ProfileSnapshot } from '../modules/profile/profileTypes.js';

import { appRouter } from './router.js';
import { createTrpcContext } from './trpc.js';

const createMockRepository = (
  profileSnapshot: ProfileSnapshot,
): ProfileRepository => ({
  ensureDefaultProfile: vi.fn(async () => undefined),
  getProfileSnapshot: vi.fn(async () => profileSnapshot),
  replaceVaccinationState: vi.fn(async (state: ProfileSnapshot['vaccinationState']) => {
    profileSnapshot.vaccinationState = state;
  }),
  setLanguage: vi.fn(async (language: ProfileSnapshot['language']) => {
    profileSnapshot.language = language;
  }),
});

describe('appRouter profile namespace', () => {
  it('supports get, setLanguage and saveVaccinationState', async () => {
    const snapshot: ProfileSnapshot = {
      language: 'ru',
      vaccinationState: {
        country: null,
        isCountryConfirmed: false,
        records: [],
      },
    };
    const repository = createMockRepository(snapshot);
    const caller = appRouter.createCaller(createTrpcContext({
      profileRepository: repository,
      req: {} as never,
      res: {} as never,
    }));

    expect(await caller.profile.get()).toEqual(snapshot);

    expect(await caller.profile.setLanguage({ language: 'en' })).toEqual({ ok: true });
    expect(snapshot.language).toBe('en');

    const nextState = {
      country: 'RU' as const,
      isCountryConfirmed: true,
      records: [
        {
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
          futureDueDoses: [],
          repeatEvery: null,
          updatedAt: '2025-01-10T00:00:00.000Z',
        },
      ],
    };

    expect(await caller.profile.saveVaccinationState(nextState)).toEqual({ ok: true });
    expect(snapshot.vaccinationState).toEqual(nextState);
  });
});

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
  removeVaccinationRecord: vi.fn(async (diseaseId: string) => {
    profileSnapshot.vaccinationState.records = profileSnapshot.vaccinationState.records.filter(
      (record) => record.diseaseId !== diseaseId,
    );
  }),
  setVaccinationCountry: vi.fn(async (country) => {
    profileSnapshot.vaccinationState.country = country;
  }),
  upsertVaccinationRecord: vi.fn(async (record) => {
    const existingIndex = profileSnapshot.vaccinationState.records.findIndex(
      (current) => current.diseaseId === record.diseaseId,
    );

    if (existingIndex === -1) {
      profileSnapshot.vaccinationState.records.push(record);
      return;
    }

    profileSnapshot.vaccinationState.records[existingIndex] = record;
  }),
  setLanguage: vi.fn(async (language: ProfileSnapshot['language']) => {
    profileSnapshot.language = language;
  }),
});

describe('appRouter profile namespace', () => {
  it('supports get and partial vaccination updates', async () => {
    const snapshot: ProfileSnapshot = {
      language: 'ru',
      vaccinationState: {
        country: null,
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
      futureDueDoses: [],
      repeatEvery: null,
      updatedAt: '2025-01-10T00:00:00.000Z',
    };

    expect(await caller.profile.setVaccinationCountry({ country: 'RU' })).toEqual({ ok: true });
    expect(snapshot.vaccinationState.country).toBe('RU');

    expect(await caller.profile.upsertVaccinationRecord(nextRecord)).toEqual({ ok: true });
    expect(snapshot.vaccinationState.records).toEqual([nextRecord]);

    expect(await caller.profile.removeVaccinationRecord({ diseaseId: 'measles' })).toEqual({ ok: true });
    expect(snapshot.vaccinationState.records).toEqual([]);
  });
});

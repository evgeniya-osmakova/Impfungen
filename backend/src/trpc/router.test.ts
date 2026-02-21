import { describe, expect, it, vi } from 'vitest';

import { OptimisticConcurrencyError } from '../modules/profile/profileRepository.js';
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

    expect(await caller.profile.setVaccinationCountry({ country: 'RU' })).toEqual({ ok: true });
    expect(snapshot.vaccinationState.country).toBe('RU');

    expect(await caller.profile.upsertVaccinationRecord(nextRecord)).toEqual({
      ok: true,
      updatedAt: '2025-01-10T00:00:00.000Z',
    });
    expect(snapshot.vaccinationState.records).toEqual([persistedRecord]);

    expect(await caller.profile.removeVaccinationRecord({ diseaseId: 'measles' })).toEqual({ ok: true });
    expect(snapshot.vaccinationState.records).toEqual([]);
  });

  it('returns conflict when vaccination record has stale expectedUpdatedAt', async () => {
    const snapshot: ProfileSnapshot = {
      language: 'ru',
      vaccinationState: {
        country: null,
        records: [],
      },
    };
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
});

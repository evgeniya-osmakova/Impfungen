import { beforeEach, describe, expect, it } from 'vitest';

import { VACCINATION_STORAGE_KEY, VACCINATION_STORAGE_VERSION } from '../constants/vaccination';
import { VACCINATION_VALIDATION_ERROR_CODE } from '../constants/vaccinationValidation';

import { createVaccinationStoreDefaults, useVaccinationStore } from './vaccinationStore';

describe('vaccinationStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useVaccinationStore.setState(createVaccinationStoreDefaults());
  });

  it('confirms country and persists data', () => {
    useVaccinationStore.getState().confirmCountry('RU');

    const state = useVaccinationStore.getState();
    const payloadValue = window.localStorage.getItem(VACCINATION_STORAGE_KEY);

    if (!payloadValue) {
      throw new Error('Vaccination payload is not persisted.');
    }

    const payload: unknown = JSON.parse(payloadValue);

    if (!payload || typeof payload !== 'object') {
      throw new Error('Persisted payload has invalid shape.');
    }

    const persistedPayload = payload as { country?: string; version?: number };

    expect(state.country).toBe('RU');
    expect(state.isCountryConfirmed).toBe(true);
    expect(persistedPayload.country).toBe('RU');
    expect(persistedPayload.version).toBe(VACCINATION_STORAGE_VERSION);
  });

  it('upserts disease record by disease id', () => {
    useVaccinationStore.getState().upsertRecord({
      batchNumber: 'A-1',
      completedAt: '2024-01-10',
      diseaseId: 'measles',
      futureDueDates: [],
      repeatEvery: null,
      tradeName: 'MMR',
    });

    useVaccinationStore.getState().upsertRecord({
      batchNumber: 'A-2',
      completedAt: '2024-01-10',
      diseaseId: 'measles',
      futureDueDates: ['2026-01-10'],
      repeatEvery: null,
      tradeName: 'MMR Updated',
    });

    const state = useVaccinationStore.getState();

    expect(state.records).toHaveLength(1);
    expect(state.records[0].futureDueDates).toEqual(['2026-01-10']);
    expect(state.records[0].tradeName).toBe('MMR Updated');
  });

  it('returns validation error from submitRecord and does not update records', () => {
    const errorCode = useVaccinationStore.getState().submitRecord({
      batchNumber: null,
      completedAt: '2024-01-10',
      diseaseId: 'measles',
      futureDueDates: ['2023-01-10'],
      repeatEvery: null,
      tradeName: null,
    });
    const state = useVaccinationStore.getState();

    expect(errorCode).toBe(VACCINATION_VALIDATION_ERROR_CODE.future_date_before_completed);
    expect(state.records).toHaveLength(0);
  });

  it('clears editing state after deleting record', () => {
    useVaccinationStore.getState().upsertRecord({
      batchNumber: null,
      completedAt: '2024-01-10',
      diseaseId: 'measles',
      futureDueDates: [],
      repeatEvery: { interval: 10, unit: 'years' },
      tradeName: null,
    });
    useVaccinationStore.getState().startEditRecord('measles');

    useVaccinationStore.getState().removeRecord('measles');

    const state = useVaccinationStore.getState();

    expect(state.records).toHaveLength(0);
    expect(state.editingDiseaseId).toBeNull();
  });

  it('hydrates safe defaults from malformed localStorage payload', () => {
    window.localStorage.setItem(VACCINATION_STORAGE_KEY, '{bad-json}');

    useVaccinationStore.setState({
      country: 'DE',
      isCountryConfirmed: true,
      records: [
        {
          batchNumber: 'B-77',
          completedAt: '2024-02-01',
          diseaseId: 'influenza',
          futureDueDates: ['2025-02-01'],
          repeatEvery: null,
          tradeName: 'Influvac',
          updatedAt: '2024-02-01T00:00:00.000Z',
        },
      ],
    });

    useVaccinationStore.getState().hydrate();

    const state = useVaccinationStore.getState();

    expect(state.country).toBeNull();
    expect(state.isCountryConfirmed).toBe(false);
    expect(state.records).toHaveLength(0);
  });
});

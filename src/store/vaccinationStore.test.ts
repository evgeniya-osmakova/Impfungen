import { beforeEach, describe, expect, it } from 'vitest';

import { VACCINATION_STORAGE_KEY, VACCINATION_STORAGE_VERSION } from '../constants/vaccination';
import { VACCINATION_VALIDATION_ERROR_CODE } from '../constants/vaccinationValidation';
import { getTodayIsoDate } from '../utils/date';
import { sortRecordsByNextDueDate } from '../utils/vaccinationSelectors';

import { createVaccinationStoreDefaults, useVaccinationStore } from './vaccinationStore';

describe('vaccinationStore', () => {
  const toTomorrowIsoDate = () => {
    const [year, month, day] = getTodayIsoDate().split('-').map((part) => Number.parseInt(part, 10));
    const tomorrowDate = new Date(Date.UTC(year, month - 1, day + 1));

    return tomorrowDate.toISOString().slice(0, 10);
  };

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
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [],
      repeatEvery: null,
      tradeName: 'MMR',
    });

    useVaccinationStore.getState().upsertRecord({
      batchNumber: 'A-2',
      completedAt: '2024-02-10',
      completedDoseKind: 'revaccination',
      diseaseId: 'measles',
      futureDueDoses: [{ dueAt: '2026-01-10', id: 'plan-1', kind: 'nextDose' }],
      repeatEvery: null,
      tradeName: 'MMR Updated',
    });

    const state = useVaccinationStore.getState();

    expect(state.records).toHaveLength(1);
    expect(state.records[0].futureDueDoses).toEqual([{ dueAt: '2026-01-10', id: 'plan-1', kind: 'nextDose' }]);
    expect(state.records[0].completedDoses).toHaveLength(1);
    expect(state.records[0].completedDoses[0].tradeName).toBe('MMR Updated');
    expect(state.records[0].completedDoses[0].kind).toBe('revaccination');
  });

  it('adds completed dose to history and removes matching planned dose', () => {
    useVaccinationStore.getState().upsertRecord({
      batchNumber: null,
      completedAt: '2024-01-10',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [{ dueAt: '2025-01-10', id: 'plan-1', kind: 'revaccination' }],
      repeatEvery: null,
      tradeName: null,
    });

    const errorCode = useVaccinationStore.getState().submitCompletedDose({
      batchNumber: 'NEW-BATCH',
      completedAt: '2025-01-11',
      diseaseId: 'measles',
      kind: 'revaccination',
      plannedDoseId: 'plan-1',
      tradeName: 'Updated',
    });

    const state = useVaccinationStore.getState();

    expect(errorCode).toBeNull();
    expect(state.records[0].completedDoses).toHaveLength(2);
    expect(state.records[0].futureDueDoses).toEqual([]);
  });

  it('recalculates repeat next due from factual completed date', () => {
    useVaccinationStore.getState().upsertRecord({
      batchNumber: null,
      completedAt: '2020-01-10',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [],
      repeatEvery: { interval: 10, kind: 'revaccination', unit: 'years' },
      tradeName: null,
    });

    useVaccinationStore.getState().submitCompletedDose({
      batchNumber: null,
      completedAt: '2026-01-10',
      diseaseId: 'measles',
      kind: 'revaccination',
      plannedDoseId: null,
      tradeName: null,
    });

    const [record] = sortRecordsByNextDueDate(useVaccinationStore.getState().records);

    expect(record.nextDue?.dueAt).toBe('2036-01-10');
    expect(record.nextDue?.kind).toBe('revaccination');
  });

  it('returns validation error from submitRecord and does not update records', () => {
    const errorCode = useVaccinationStore.getState().submitRecord({
      batchNumber: null,
      completedAt: '2024-01-10',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [{ dueAt: '2023-01-10', id: 'plan-1', kind: 'nextDose' }],
      repeatEvery: null,
      tradeName: null,
    });
    const state = useVaccinationStore.getState();

    expect(errorCode).toBe(VACCINATION_VALIDATION_ERROR_CODE.future_date_before_completed);
    expect(state.records).toHaveLength(0);
  });

  it('returns validation error when future dates are duplicated', () => {
    const errorCode = useVaccinationStore.getState().submitRecord({
      batchNumber: null,
      completedAt: '2024-01-10',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [
        { dueAt: '2025-01-10', id: 'plan-1', kind: 'nextDose' },
        { dueAt: '2025-01-10', id: 'plan-2', kind: 'revaccination' },
      ],
      repeatEvery: null,
      tradeName: null,
    });

    expect(errorCode).toBe(VACCINATION_VALIDATION_ERROR_CODE.future_dates_duplicate);
  });

  it('returns validation error from submitCompletedDose', () => {
    const errorCode = useVaccinationStore.getState().submitCompletedDose({
      batchNumber: null,
      completedAt: '',
      diseaseId: 'measles',
      kind: 'nextDose',
      plannedDoseId: null,
      tradeName: null,
    });

    expect(errorCode).toBe(VACCINATION_VALIDATION_ERROR_CODE.completed_required);
  });

  it('returns validation error when completed date is in the future', () => {
    const errorCode = useVaccinationStore.getState().submitRecord({
      batchNumber: null,
      completedAt: toTomorrowIsoDate(),
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [],
      repeatEvery: null,
      tradeName: null,
    });

    expect(errorCode).toBe(VACCINATION_VALIDATION_ERROR_CODE.completed_in_future);
  });

  it('clears editing state after deleting record', () => {
    useVaccinationStore.getState().upsertRecord({
      batchNumber: null,
      completedAt: '2024-01-10',
      completedDoseKind: 'nextDose',
      diseaseId: 'measles',
      futureDueDoses: [],
      repeatEvery: { interval: 10, kind: 'revaccination', unit: 'years' },
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
          completedDoses: [{
            batchNumber: 'B-77',
            completedAt: '2024-02-01',
            id: 'done-1',
            kind: 'nextDose',
            tradeName: 'Influvac',
          }],
          diseaseId: 'influenza',
          futureDueDoses: [{ dueAt: '2025-02-01', id: 'plan-1', kind: 'nextDose' }],
          repeatEvery: null,
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

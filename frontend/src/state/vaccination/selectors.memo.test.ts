import { describe, expect, it, vi } from 'vitest';

import type { ImmunizationSeries } from '../../interfaces/immunizationRecord';

import {
  createMemoizedVaccinationViewDataProjector,
  createVaccinationStoreSelectors,
  selectVaccinationViewData,
} from './selectors';

interface VaccinationStoreViewSource {
  country: 'RU' | 'DE' | 'NONE' | null;
  editingDiseaseId: string | null;
  records: readonly ImmunizationSeries[];
}

const createRecord = (
  diseaseId: string,
): ImmunizationSeries => ({
  completedDoses: [{
    batchNumber: null,
    completedAt: '2025-01-10',
    id: `done-${diseaseId}`,
    kind: 'nextDose',
    tradeName: null,
  }],
  diseaseId,
  futureDueDoses: [{
    dueAt: '2026-01-10',
    id: `planned-${diseaseId}`,
    kind: 'nextDose',
  }],
  repeatEvery: null,
  updatedAt: '2025-01-10T10:00:00.000Z',
});

describe('vaccination store selectors memoization', () => {
  it('returns cached value for the same input references', () => {
    const projector = createMemoizedVaccinationViewDataProjector();
    const records = [createRecord('measles')];
    const source: VaccinationStoreViewSource = {
      country: 'RU',
      editingDiseaseId: null,
      records,
    };

    const firstResult = projector(source);
    const secondResult = projector(source);

    expect(secondResult).toBe(firstResult);
  });

  it('recomputes when records reference changes', () => {
    const compute = vi.fn((source: VaccinationStoreViewSource) => selectVaccinationViewData(source));
    const projector = createMemoizedVaccinationViewDataProjector(compute);
    const records = [createRecord('measles')];

    const firstResult = projector({
      country: 'RU',
      editingDiseaseId: null,
      records,
    });
    const secondResult = projector({
      country: 'RU',
      editingDiseaseId: null,
      records: [...records],
    });

    expect(compute).toHaveBeenCalledTimes(2);
    expect(secondResult).not.toBe(firstResult);
  });

  it('recomputes when country changes', () => {
    const compute = vi.fn((source: VaccinationStoreViewSource) => selectVaccinationViewData(source));
    const projector = createMemoizedVaccinationViewDataProjector(compute);
    const source: VaccinationStoreViewSource = {
      country: 'RU',
      editingDiseaseId: null,
      records: [createRecord('measles')],
    };

    const firstResult = projector(source);
    const secondResult = projector({
      ...source,
      country: 'DE',
    });

    expect(compute).toHaveBeenCalledTimes(2);
    expect(secondResult).not.toBe(firstResult);
  });

  it('narrow selectors share one memoized projection for the same state', () => {
    const compute = vi.fn((source: VaccinationStoreViewSource) => selectVaccinationViewData(source));
    const selectors = createVaccinationStoreSelectors(
      createMemoizedVaccinationViewDataProjector(compute),
    );
    const state: VaccinationStoreViewSource = {
      country: 'RU',
      editingDiseaseId: null,
      records: [createRecord('measles')],
    };

    selectors.selectWorkspaceViewData(state);
    selectors.selectTopRowViewData(state);
    selectors.selectCatalogViewData(state);
    selectors.selectModalsViewData(state);
    selectors.selectVaccinationViewDataFromStore(state);

    expect(compute).toHaveBeenCalledTimes(1);
  });
});

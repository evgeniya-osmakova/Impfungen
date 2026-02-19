import { useContext } from 'react';

import type { VaccinationApplicationService } from './vaccinationApplicationService';
import type {
  VaccinationClock,
  VaccinationIdGenerator,
} from './vaccinationDependencies';
import type { VaccinationRepository } from './vaccinationRepository';

import type { VaccinationStore } from './createVaccinationStore';
import {
  createStoreWithDefaults,
  VaccinationServiceContext,
  VaccinationStoreContext,
  type VaccinationStoreHook,
} from './internal';

const useResolvedVaccinationStore = (): VaccinationStoreHook => {
  const store = useContext(VaccinationStoreContext);

  if (!store) {
    throw new Error('Vaccination store is not initialized. Wrap app with VaccinationStoreProvider.');
  }

  return store;
};

export const createVaccinationStoreForTests = ({
  clock,
  idGenerator,
  repository,
}: {
  clock?: VaccinationClock;
  idGenerator?: VaccinationIdGenerator;
  repository: VaccinationRepository;
}) => createStoreWithDefaults({ clock, idGenerator, repository });

export const useVaccinationStore = <T,>(
  selector: (state: VaccinationStore) => T,
): T => useResolvedVaccinationStore()(selector);

export const useVaccinationStoreApi = (): VaccinationStoreHook =>
  useResolvedVaccinationStore();

export const useVaccinationApplicationService = (): VaccinationApplicationService => {
  const service = useContext(VaccinationServiceContext);

  if (!service) {
    throw new Error('Vaccination service is not initialized. Wrap app with VaccinationStoreProvider.');
  }

  return service;
};

export { VaccinationStoreProvider } from './provider';
export type { VaccinationStoreHook };

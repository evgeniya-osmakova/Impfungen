import { createContext } from 'react';
import type { StoreApi, UseBoundStore } from 'zustand';

import {
  createVaccinationApplicationService,
  type VaccinationApplicationService,
} from './vaccinationApplicationService';
import type {
  VaccinationClock,
  VaccinationIdGenerator,
} from './vaccinationDependencies';
import type { VaccinationRepository } from './vaccinationRepository';
import { systemClock } from './systemClock';
import { systemIdGenerator } from './systemIdGenerator';

import { createVaccinationStore, type VaccinationStore } from './createVaccinationStore';

type VaccinationStoreHook = UseBoundStore<StoreApi<VaccinationStore>>;

const VaccinationStoreContext = createContext<VaccinationStoreHook | null>(null);
const VaccinationServiceContext = createContext<VaccinationApplicationService | null>(null);

const createStoreWithDefaults = ({
  clock = systemClock,
  idGenerator = systemIdGenerator,
  repository,
}: {
  clock?: VaccinationClock;
  idGenerator?: VaccinationIdGenerator;
  repository: VaccinationRepository;
}) => {
  const service = createVaccinationApplicationService({
    clock,
    idGenerator,
    repository,
  });
  const store = createVaccinationStore(service);

  return { service, store };
};

export {
  createStoreWithDefaults,
  VaccinationServiceContext,
  VaccinationStoreContext,
};
export type { VaccinationStoreHook };

import { type PropsWithChildren, useRef } from 'react';

import type { VaccinationApplicationService } from './vaccinationApplicationService';
import type {
  VaccinationClock,
  VaccinationIdGenerator,
} from './vaccinationDependencies';
import type { VaccinationRepository } from './vaccinationRepository';

import {
  createStoreWithDefaults,
  VaccinationServiceContext,
  VaccinationStoreContext,
  type VaccinationStoreHook,
} from './internal';

interface VaccinationStoreProviderProps extends PropsWithChildren {
  clock?: VaccinationClock;
  idGenerator?: VaccinationIdGenerator;
  repository: VaccinationRepository;
}

export const VaccinationStoreProvider = ({
  children,
  clock,
  idGenerator,
  repository,
}: VaccinationStoreProviderProps) => {
  const storeRef = useRef<VaccinationStoreHook | null>(null);
  const serviceRef = useRef<VaccinationApplicationService | null>(null);

  if (!storeRef.current || !serviceRef.current) {
    const { service, store } = createStoreWithDefaults({
      clock,
      idGenerator,
      repository,
    });

    serviceRef.current = service;
    storeRef.current = store;
  }

  return (
    <VaccinationServiceContext.Provider value={serviceRef.current}>
      <VaccinationStoreContext.Provider value={storeRef.current}>
        {children}
      </VaccinationStoreContext.Provider>
    </VaccinationServiceContext.Provider>
  );
};

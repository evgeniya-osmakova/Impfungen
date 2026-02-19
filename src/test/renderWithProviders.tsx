import { render } from '@testing-library/react';
import type { PropsWithChildren, ReactElement } from 'react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';

import { VaccinationStoreProvider } from '../state/vaccination';
import { vaccinationRepositoryLocal } from '../state/vaccination/vaccinationRepositoryLocal';

interface RenderWithProvidersOptions {
  router?: Pick<MemoryRouterProps, 'initialEntries' | 'initialIndex'>;
}

export const renderWithProviders = (
  ui: ReactElement,
  { router }: RenderWithProvidersOptions = {},
) => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <VaccinationStoreProvider repository={vaccinationRepositoryLocal}>
      <MemoryRouter {...router}>
        {children}
      </MemoryRouter>
    </VaccinationStoreProvider>
  );

  return render(ui, { wrapper: Wrapper });
};

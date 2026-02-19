import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { VaccinationStoreProvider } from './state/vaccination';
import { vaccinationRepositoryLocal } from './state/vaccination/vaccinationRepositoryLocal';
import App from './App.tsx';

import './i18n';

import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <VaccinationStoreProvider repository={vaccinationRepositoryLocal}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </VaccinationStoreProvider>
  </StrictMode>,
);

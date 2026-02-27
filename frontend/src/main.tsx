import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppInitializer } from 'src/components/AppInitializer/AppInitializer.tsx';
import { RootErrorBoundary } from 'src/components/RootErrorBoundary/RootErrorBoundary.tsx';

import App from './App.tsx';

import './index.css';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <RootErrorBoundary>
      <AppInitializer>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppInitializer>
    </RootErrorBoundary>
  </StrictMode>,
);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppInitializer } from 'src/components/AppInitializer/AppInitializer.tsx'

import App from './App.tsx';

import './index.css';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <AppInitializer>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppInitializer>
  </StrictMode>
);

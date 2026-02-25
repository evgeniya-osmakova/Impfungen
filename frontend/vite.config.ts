import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      include: '**/*.svg',
      svgrOptions: {
        exportType: 'default',
      },
    }),
  ],
  resolve: {
    alias: {
      '@backend/contracts': path.resolve('../backend/src/contracts.ts'),
      '@backend/router-types': path.resolve('../backend/src/trpc/routerTypes.ts'),
      src: path.resolve('src/'),
    },
  },
  server: {
    fs: {
      allow: [path.resolve('..')],
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});

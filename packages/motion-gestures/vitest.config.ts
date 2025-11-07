import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@cascade/motion-runtime': path.resolve(__dirname, '../motion-runtime/src'),
      '@cascade/compiler': path.resolve(__dirname, '../compiler/src'),
    },
  },
});


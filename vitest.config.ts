import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,ts,tsx}'],
    setupFiles: ['./packages/react/src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/scripts/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@cascade/core': path.resolve(__dirname, './packages/core/src'),
      '@cascade/react': path.resolve(__dirname, './packages/react/src'),
      '@cascade/compiler': path.resolve(__dirname, './packages/compiler/src'),
      '@cascade/motion-runtime': path.resolve(__dirname, './packages/motion-runtime/src'),
      '@cascade/motion-gestures': path.resolve(__dirname, './packages/motion-gestures/src'),
      '@cascade/tokens': path.resolve(__dirname, './packages/tokens/src'),
    },
  },
});


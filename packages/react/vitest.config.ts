import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            '@stylexjs/babel-plugin',
            {
              dev: true,
              test: false,
              runtimeInjection: false,
              genConditionalClasses: true,
              useRemForFontSize: false,
              unstable_moduleResolution: {
                type: 'commonJS',
                rootDir: path.resolve(__dirname, '../../'),
              },
            },
          ],
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@cascade/core': path.resolve(__dirname, '../core/src'),
      '@cascade/react': path.resolve(__dirname, './src'),
      '@cascade/tokens': path.resolve(__dirname, '../tokens/src'),
      '@cascade/motion-runtime': path.resolve(__dirname, '../motion-runtime/src'),
    },
  },
});


import { defineConfig } from 'vite';
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
        include: [
          /\.(jsx|tsx|js|ts)$/,
          path.resolve(__dirname, '../../packages/**/*.{jsx,tsx,js,ts}'),
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@cascade/core': path.resolve(__dirname, '../../packages/core/src'),
      '@cascade/react': path.resolve(__dirname, '../../packages/react/src'),
      '@cascade/compiler': path.resolve(__dirname, '../../packages/compiler/src'),
      '@cascade/motion-runtime': path.resolve(__dirname, '../../packages/motion-runtime/src'),
      '@cascade/tokens': path.resolve(__dirname, '../../packages/tokens/src'),
    },
  },
  server: {
    port: 3000,
  },
});


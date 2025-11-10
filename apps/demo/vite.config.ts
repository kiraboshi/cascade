import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { Plugin } from 'vite';
import { cascadeVitePlugin } from '../../packages/compiler/src/vite-plugin';

// Plugin to fix workspace package resolution during config loading
function workspacePackageResolver(): Plugin {
  const packagesPath = path.resolve(__dirname, '../../packages');
  
  return {
    name: 'workspace-package-resolver',
    enforce: 'pre',
    config(config) {
      // Ensure workspace packages are not externalized
      if (!config.optimizeDeps) {
        config.optimizeDeps = {};
      }
      if (!Array.isArray(config.optimizeDeps.exclude)) {
        config.optimizeDeps.exclude = [];
      }
      const exclude = config.optimizeDeps.exclude as string[];
      ['@cascade/tokens', '@cascade/core', '@cascade/compiler', '@cascade/react', '@cascade/motion-runtime', '@cascade/motion-gestures'].forEach(pkg => {
        if (!exclude.includes(pkg)) exclude.push(pkg);
      });
    },
    resolveId(id, importer) {
      // Resolve @cascade packages to source files
      if (id.startsWith('@cascade/')) {
        const packageName = id.replace('@cascade/', '');
        const packagePath = path.resolve(__dirname, `../../packages/${packageName}/src/index.ts`);
        const fs = require('fs');
        if (fs.existsSync(packagePath)) {
          return packagePath;
        }
      }
    },
    configureServer(server) {
      // Explicitly watch the packages directory to ensure HMR works
      server.watcher.add(packagesPath);
      
      // Watch for changes in package source files
      server.watcher.on('change', (file) => {
        // Normalize paths for cross-platform compatibility
        const normalizedFile = path.normalize(file);
        const normalizedPackagesPath = path.normalize(packagesPath);
        
        // If a package source file changes, invalidate modules that depend on it
        if (normalizedFile.startsWith(normalizedPackagesPath)) {
          const modules = Array.from(server.moduleGraph.urlToModuleMap.values());
          for (const mod of modules) {
            if (mod.url.includes('@cascade') || mod.url.includes('packages')) {
              server.moduleGraph.invalidateModule(mod);
            }
          }
        }
      });
    },
  };
}

export default defineConfig({
  // Base path for GitHub Pages deployment
  // Set via environment variable: VITE_BASE_PATH
  // For root deployment (username.github.io): use '/'
  // For subdirectory deployment: use '/repo-name/'
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    workspacePackageResolver(),
    cascadeVitePlugin({
      watchTokens: true,
      generateFoundationCSS: true,
    }),
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
    conditions: ['source', 'import', 'module', 'browser', 'default'],
    alias: [
      {
        find: '@cascade/core',
        replacement: path.resolve(__dirname, '../../packages/core/src'),
      },
      {
        find: '@cascade/react',
        replacement: path.resolve(__dirname, '../../packages/react/src'),
      },
      {
        find: '@cascade/compiler',
        replacement: path.resolve(__dirname, '../../packages/compiler/src'),
      },
      {
        find: '@cascade/motion-runtime',
        replacement: path.resolve(__dirname, '../../packages/motion-runtime/src'),
      },
      {
        find: '@cascade/motion-gestures',
        replacement: path.resolve(__dirname, '../../packages/motion-gestures/src'),
      },
      {
        find: '@cascade/tokens',
        replacement: path.resolve(__dirname, '../../packages/tokens/src'),
      },
    ],
  },
  optimizeDeps: {
    exclude: [
      '@cascade/core',
      '@cascade/react',
      '@cascade/compiler',
      '@cascade/motion-runtime',
      '@cascade/motion-gestures',
      '@cascade/tokens',
    ],
    // Don't cache excluded packages - process them fresh on each import
    // This ensures workspace package changes are immediately reflected
  },
  ssr: {
    noExternal: ['@cascade/core', '@cascade/tokens', '@cascade/compiler'],
  },
  server: {
    port: 3000,
    // Explicitly watch packages directory for changes
    watch: {
      // Watch the packages directory for source file changes
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
    // Enable HMR with proper configuration
    hmr: {
      overlay: true,
    },
  },
});


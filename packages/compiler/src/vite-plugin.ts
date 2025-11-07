/**
 * Vite plugin for token compilation and HMR
 */

import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

// Lazy load compileTokens to avoid resolution issues during config loading
let compileTokens: (() => any) | null = null;
async function getCompileTokens() {
  if (!compileTokens) {
    const tokenCompiler = await import('./token-compiler');
    compileTokens = tokenCompiler.compileTokens;
  }
  return compileTokens;
}

export interface CascadeVitePluginOptions {
  watchTokens?: boolean;
  generateFoundationCSS?: boolean;
}

/**
 * Vite plugin for Cascade token compilation
 */
export function cascadeVitePlugin(options: CascadeVitePluginOptions = {}): Plugin {
  const {
    watchTokens = true,
    generateFoundationCSS: generateCSS = true,
  } = options;
  
  let tokensPath: string | null = null;
  let foundationCSSPath: string | null = null;
  
  return {
    name: 'cascade-tokens',
    configResolved(config) {
      // Find token files
      const root = config.root;
      const tokensJsonPath = path.resolve(root, '../../packages/tokens/tokens.json');
      const tokensTsPath = path.resolve(root, '../../packages/tokens/tokens.ts');
      const foundationPath = path.resolve(root, '../../packages/core/src/foundation.css');
      
      if (fs.existsSync(tokensJsonPath)) {
        tokensPath = tokensJsonPath;
      }
      if (fs.existsSync(foundationPath)) {
        foundationCSSPath = foundationPath;
      }
    },
    // Token compilation is skipped during dev - it happens automatically when tokens are imported
    // in the application code, which will use Vite's proper resolution via aliases
    configureServer(server) {
      if (watchTokens && tokensPath) {
        // Watch token files for changes
        server.watcher.add(tokensPath);
        server.watcher.add(path.resolve(path.dirname(tokensPath), 'tokens.ts'));
        
        server.watcher.on('change', (file) => {
          if (file === tokensPath || file.endsWith('tokens.ts')) {
            // Trigger HMR for foundation CSS
            if (foundationCSSPath) {
              server.moduleGraph.invalidateModule(
                server.moduleGraph.getModuleById(foundationCSSPath) || 
                server.moduleGraph.createFileOnlyEntry(foundationCSSPath)
              );
            }
            
            // Invalidate all modules that import tokens
            const modules = Array.from(server.moduleGraph.urlToModuleMap.values());
            for (const mod of modules) {
              if (mod.url.includes('@cascade') || mod.url.includes('tokens')) {
                server.moduleGraph.invalidateModule(mod);
              }
            }
            
            console.log('[Cascade] Tokens changed, reloading...');
          }
        });
      }
    },
    handleHotUpdate(ctx) {
      // Handle HMR for token files
      if (ctx.file.includes('tokens.json') || ctx.file.includes('tokens.ts')) {
        return ctx.modules;
      }
      
      if (ctx.file.includes('foundation.css')) {
        return ctx.modules;
      }
    },
  };
}


/**
 * Token compiler: Compiles tokens to CSS + TypeScript
 * Supports both DTCG JSON and TypeScript formats
 */

import { resolveDTCGAliases, flattenDTCGTokens } from './dtcg-parser';
import { loadTSTokens, flattenTSTokens } from './ts-token-loader';
import path from 'path';

// Lazy load cascade packages to avoid resolution issues during config loading
// Use relative paths to source files to bypass package.json resolution
let dtcgTokens: any = null;
let generateTokenCSS: (() => string) | null = null;

async function loadCascadePackages() {
  if (!dtcgTokens || !generateTokenCSS) {
    // Use package imports - Vite's resolve will handle them via aliases
    // Retry logic to handle cases where Vite's resolve isn't ready yet
    let retries = 3;
    let lastError: Error | null = null;
    
    while (retries > 0) {
      try {
        const [tokensModule, coreModule] = await Promise.all([
          import('@cascade/tokens'),
          import('@cascade/core'),
        ]);
        
        // Check if we got actual exports (not stub files)
        if (tokensModule.dtcgTokens) {
          dtcgTokens = tokensModule.dtcgTokens;
        } else if (tokensModule.default?.dtcgTokens) {
          dtcgTokens = tokensModule.default.dtcgTokens;
        } else {
          // If we got an empty module, wait a bit and retry
          await new Promise(resolve => setTimeout(resolve, 100));
          retries--;
          continue;
        }
        
        if (coreModule.generateTokenCSS) {
          generateTokenCSS = coreModule.generateTokenCSS;
        } else if (coreModule.default?.generateTokenCSS) {
          generateTokenCSS = coreModule.default.generateTokenCSS;
        } else {
          await new Promise(resolve => setTimeout(resolve, 100));
          retries--;
          continue;
        }
        
        // Success - break out of retry loop
        break;
      } catch (error) {
        lastError = error as Error;
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
    
    if (!dtcgTokens || !generateTokenCSS) {
      // If still not loaded, return null - compilation will be skipped
      if (lastError) {
        console.warn('[Cascade] Failed to load packages after retries:', lastError.message);
      }
      return { dtcgTokens: null, generateTokenCSS: null };
    }
  }
  return { dtcgTokens, generateTokenCSS };
}

export interface CompiledTokens {
  css: string;
  ts: string;
  tokens: Map<string, { value: string | number | string[]; source: 'dtcg' | 'ts' }>;
}

/**
 * Compile tokens from both DTCG JSON and TypeScript formats
 */
export async function compileTokens(): Promise<CompiledTokens> {
  // Load cascade packages dynamically
  const { dtcgTokens: tokens, generateTokenCSS: generateCSS } = await loadCascadePackages();
  
  // If packages aren't loaded yet (e.g., during config loading), return empty result
  if (!tokens || !generateCSS) {
    return {
      css: '',
      ts: '',
      tokens: new Map(),
    };
  }
  
  // Validate tokens before processing
  if (typeof tokens !== 'object') {
    throw new Error('[Cascade] Invalid dtcgTokens: expected an object but got ' + typeof tokens);
  }
  
  // Load and resolve DTCG tokens
  const resolvedDTCG = resolveDTCGAliases(tokens);
  const dtcgFlat = flattenDTCGTokens(resolvedDTCG);
  
  // Load TypeScript tokens
  const tsTokens = await loadTSTokens();
  const tsFlat = flattenTSTokens(tsTokens);
  
  // Merge tokens (TypeScript takes precedence for conflicts)
  const mergedTokens = new Map<string, { value: string | number | string[]; source: 'dtcg' | 'ts' }>();
  
  // Add DTCG tokens
  for (const [key, token] of dtcgFlat) {
    mergedTokens.set(key, { value: token.$value, source: 'dtcg' });
  }
  
  // Override with TypeScript tokens (they take precedence)
  for (const [key, token] of tsFlat) {
    mergedTokens.set(key, { value: token.value, source: 'ts' });
  }
  
  // Generate CSS
  const css = generateCSS();
  
  // Generate TypeScript types
  const ts = generateTSTypes(mergedTokens);
  
  return {
    css,
    ts,
    tokens: mergedTokens,
  };
}

/**
 * Generate TypeScript type definitions from tokens
 */
function generateTSTypes(
  tokens: Map<string, { value: string | number | string[]; source: 'dtcg' | 'ts' }>
): string {
  const typeDefinitions: string[] = [];
  const categoryTypes: Record<string, string[]> = {};
  
  // Group tokens by category
  for (const [key, { value }] of tokens) {
    const [category, ...rest] = key.split('.');
    
    if (!categoryTypes[category]) {
      categoryTypes[category] = [];
    }
    
    const tokenName = rest.join('.');
    const valueType = typeof value === 'string' 
      ? `"${value}"` 
      : typeof value === 'number'
      ? value.toString()
      : `[${(value as string[]).map(v => `"${v}"`).join(', ')}]`;
    
    categoryTypes[category].push(`  ${tokenName}: ${valueType};`);
  }
  
  // Generate type definitions
  typeDefinitions.push('export interface CascadeTokens {');
  
  for (const [category, tokens] of Object.entries(categoryTypes)) {
    typeDefinitions.push(`  ${category}: {`);
    typeDefinitions.push(...tokens);
    typeDefinitions.push('  };');
  }
  
  typeDefinitions.push('}');
  
  // Generate token key types
  typeDefinitions.push('');
  typeDefinitions.push('export type TokenCategory = keyof CascadeTokens;');
  typeDefinitions.push('export type TokenKey<T extends TokenCategory> = keyof CascadeTokens[T];');
  
  return typeDefinitions.join('\n');
}

/**
 * Resolve a token value by key path
 */
export function resolveToken(keyPath: string): string | number | string[] {
  const compiled = compileTokens();
  const token = compiled.tokens.get(keyPath);
  
  if (!token) {
    throw new Error(`Token not found: ${keyPath}`);
  }
  
  return token.value;
}

/**
 * Compute clamp() for fluid typography/spacing values
 * Formula: clamp(min, preferred, max)
 * preferred = min + (max - min) * ((100vw - minViewport) / (maxViewport - minViewport))
 */
export function computeFluidValue(
  min: number,
  max: number,
  minViewport: number = 320,
  maxViewport: number = 1280
): string {
  const minRem = min / 16;
  const maxRem = max / 16;
  const viewportRange = maxViewport - minViewport;
  const valueRange = max - min;
  
  // Calculate the vw unit multiplier: (valueRange / viewportRange) * 100
  const vwMultiplier = (valueRange / viewportRange) * 100;
  
  // Calculate the rem offset: minRem - (vwMultiplier * minViewport / 100)
  const remOffset = minRem - (vwMultiplier * minViewport) / 100;
  
  // Build clamp formula: clamp(minRem, remOffset + vwMultiplier * 100vw / 100, maxRem)
  // Simplified: clamp(minRem, remOffset + vwMultiplier * 1vw, maxRem)
  return `clamp(${minRem.toFixed(4)}rem, ${remOffset.toFixed(4)}rem + ${vwMultiplier.toFixed(4)}vw, ${maxRem.toFixed(4)}rem)`;
}


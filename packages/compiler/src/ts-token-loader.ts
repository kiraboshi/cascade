/**
 * TypeScript token definition loader
 */

import path from 'path';

// Lazy load tokens to avoid resolution issues during config loading
// Use relative path to source file to bypass package.json resolution
let tokens: any = null;

async function loadTokens() {
  if (!tokens) {
    try {
      // Use package import - Vite's resolve will handle it
      const tokensModule = await import('@cascade/tokens');
      tokens = tokensModule.tokens;
      
      if (!tokens) {
        throw new Error('[Cascade] tokens not found in @cascade/tokens');
      }
    } catch (error) {
      // If import fails, return null - will retry later
      console.warn('[Cascade] Failed to load tokens, will retry:', error);
      return null;
    }
  }
  return tokens;
}

export interface TSTokenValue {
  value: string | number | string[];
  type?: string;
}

export interface TSTokenTree {
  [key: string]: TSTokenValue | TSTokenTree;
}

/**
 * Load TypeScript tokens and convert to a structured format
 */
export async function loadTSTokens(): Promise<TSTokenTree> {
  const tokensData = await loadTokens();
  
  // If tokens aren't loaded yet, return empty tree
  if (!tokensData) {
    return {};
  }
  
  // Convert the tokens object to a structured format
  const convertValue = (value: unknown): TSTokenValue | TSTokenTree => {
    if (typeof value === 'string' || typeof value === 'number') {
      return { value, type: typeof value === 'string' ? 'string' : 'number' };
    }
    
    if (Array.isArray(value)) {
      return { value, type: 'array' };
    }
    
    if (value && typeof value === 'object') {
      const tree: TSTokenTree = {};
      for (const [key, val] of Object.entries(value)) {
        tree[key] = convertValue(val);
      }
      return tree;
    }
    
    return { value: String(value), type: 'string' };
  };
  
  return convertValue(tokensData) as TSTokenTree;
}

/**
 * Flatten TypeScript tokens to a map
 */
export function flattenTSTokens(
  tokenTree: TSTokenTree,
  prefix: string = ''
): Map<string, TSTokenValue> {
  const flat = new Map<string, TSTokenValue>();
  
  for (const [key, value] of Object.entries(tokenTree)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && 'value' in value && !('value' in (value as any).value)) {
      flat.set(fullKey, value as TSTokenValue);
    } else if (value && typeof value === 'object') {
      const nested = flattenTSTokens(value as TSTokenTree, fullKey);
      for (const [nestedKey, nestedValue] of nested) {
        flat.set(nestedKey, nestedValue);
      }
    }
  }
  
  return flat;
}



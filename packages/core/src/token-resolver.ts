/**
 * Resolves tokens to CSS custom properties
 */

import { tokens, dtcgTokens } from '@cascade/tokens';

export interface TokenResolverOptions {
  prefix?: string;
  format?: 'oklch' | 'hex' | 'rgb';
}

/**
 * Resolve a token value to CSS custom property format
 */
export function resolveTokenValue(
  value: string | number,
  options: TokenResolverOptions = {}
): string {
  const { prefix = '--cascade' } = options;
  
  // Handle token references like {color.blue.500}
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    const path = value.slice(1, -1).split('.');
    let resolved: unknown = dtcgTokens;
    
    for (const key of path) {
      if (resolved && typeof resolved === 'object' && key in resolved) {
        const next = (resolved as Record<string, unknown>)[key];
        if (next && typeof next === 'object' && '$value' in next) {
          return String(next.$value);
        }
        resolved = next;
      }
    }
  }
  
  return String(value);
}

/**
 * Generate CSS custom properties from tokens
 */
export function generateTokenCSS(options: TokenResolverOptions = {}): string {
  const { prefix = '--cascade' } = options;
  const cssVars: string[] = [];
  
  // Generate from TypeScript tokens
  const processCategory = (category: string, values: Record<string, unknown>, parentPath: string[] = []) => {
    for (const [key, value] of Object.entries(values)) {
      const varName = [...parentPath, category, key].join('-');
      
      if (typeof value === 'string') {
        cssVars.push(`  ${prefix}-${varName}: ${resolveTokenValue(value, options)};`);
      } else if (typeof value === 'number') {
        cssVars.push(`  ${prefix}-${varName}: ${value};`);
      } else if (Array.isArray(value)) {
        cssVars.push(`  ${prefix}-${varName}: ${value.join(', ')};`);
      } else if (value && typeof value === 'object') {
        processCategory(key, value as Record<string, unknown>, [...parentPath, category]);
      }
    }
  };
  
  for (const [category, values] of Object.entries(tokens)) {
    if (values && typeof values === 'object') {
      processCategory(category, values as Record<string, unknown>);
    }
  }
  
  return cssVars.join('\n');
}

/**
 * Hardware acceleration property classification
 */
export const ACCELERATED_PROPERTIES = new Set([
  'opacity',
  'transform',
  'filter',
  'will-change',
]);

export const LAYOUT_TRIGGERING_PROPERTIES = new Set([
  'width',
  'height',
  'top',
  'left',
  'right',
  'bottom',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border',
  'border-width',
]);

/**
 * Check if a property triggers layout
 */
export function isLayoutTriggering(property: string): boolean {
  return LAYOUT_TRIGGERING_PROPERTIES.has(property) ||
    property.startsWith('margin-') ||
    property.startsWith('padding-') ||
    property.startsWith('border-');
}

/**
 * Check if a property is hardware accelerated
 */
export function isAccelerated(property: string): boolean {
  return ACCELERATED_PROPERTIES.has(property);
}


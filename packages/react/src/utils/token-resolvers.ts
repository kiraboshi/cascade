/**
 * Token resolution utilities
 * Shared functions for resolving design tokens to CSS values
 */

import { tokens, type SpaceToken } from '@cascade/tokens';

/**
 * Resolve spacing token or array to CSS value
 * 
 * @param spacing - Single token or [vertical, horizontal] array
 * @returns CSS value string (e.g., "1rem" or "1rem 2rem")
 * 
 * @example
 * resolveSpacing('md') // "1rem"
 * resolveSpacing(['sm', 'lg']) // "0.5rem 1.5rem"
 * resolveSpacing(undefined) // "0"
 */
export function resolveSpacing(spacing: SpaceToken | SpaceToken[] | undefined): string {
  if (!spacing) return '0';
  
  if (Array.isArray(spacing)) {
    const [vertical, horizontal] = spacing;
    const verticalValue = tokens.space[vertical];
    const horizontalValue = tokens.space[horizontal];
    return `${verticalValue} ${horizontalValue}`;
  }
  
  return tokens.space[spacing];
}

/**
 * Resolve gap token or array to CSS value
 * 
 * @param gap - Single token or [row, column] array for 2D gap
 * @returns CSS value string (e.g., "1rem" or "1rem 2rem")
 * 
 * @example
 * resolveGap('md') // "1rem"
 * resolveGap(['sm', 'lg']) // "0.5rem 1.5rem"
 * resolveGap(undefined) // "0"
 */
export function resolveGap(gap: SpaceToken | SpaceToken[] | undefined): string {
  if (!gap) return '0';
  
  if (Array.isArray(gap)) {
    const [row, column] = gap;
    const rowValue = tokens.space[row];
    const columnValue = tokens.space[column];
    return `${rowValue} ${columnValue}`;
  }
  
  return tokens.space[gap];
}

/**
 * Resolve border radius token or string to CSS value
 * 
 * @param radius - Token key or CSS value string
 * @returns CSS value string
 * 
 * @example
 * resolveBorderRadius('md') // "1rem"
 * resolveBorderRadius('4px') // "4px"
 * resolveBorderRadius(undefined) // "0"
 */
export function resolveBorderRadius(radius: SpaceToken | string | undefined): string {
  if (!radius) return '0';
  
  // If it's a token, resolve it
  const spaceKeys: SpaceToken[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  if (spaceKeys.includes(radius as SpaceToken)) {
    return tokens.space[radius as SpaceToken];
  }
  
  // Otherwise, use as-is (string)
  return radius;
}


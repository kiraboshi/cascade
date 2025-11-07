/**
 * @cascade/tokens
 * 
 * Unified export supporting both DTCG JSON and TypeScript formats
 */

import tokensJson from '../tokens.json';
import { tokens, type TokenKey, type ColorToken, type SpaceToken, type MotionDurationToken } from '../tokens';

// Re-export TypeScript tokens
export { tokens, type TokenKey, type ColorToken, type SpaceToken, type MotionDurationToken };

// Export DTCG JSON for tooling compatibility
export const dtcgTokens = tokensJson;

/**
 * Resolve a token value from either format
 */
export function resolveToken(category: string, key: string): string {
  // Try TypeScript format first
  const tsCategory = category as keyof typeof tokens;
  if (tokens[tsCategory]) {
    const tsValue = (tokens[tsCategory] as Record<string, unknown>)[key];
    if (typeof tsValue === 'string') {
      return tsValue;
    }
  }
  
  // Fallback to DTCG JSON format
  const dtcgCategory = dtcgTokens[category as keyof typeof dtcgTokens];
  if (dtcgCategory && typeof dtcgCategory === 'object') {
    const dtcgValue = dtcgCategory[key as keyof typeof dtcgCategory];
    if (dtcgValue && typeof dtcgValue === 'object' && '$value' in dtcgValue) {
      return String(dtcgValue.$value);
    }
  }
  
  throw new Error(`Token not found: ${category}.${key}`);
}

/**
 * Get all tokens for a category
 */
export function getTokens<T extends keyof typeof tokens>(category: T): typeof tokens[T] {
  return tokens[category];
}


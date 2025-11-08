/**
 * @cascade/tokens
 *
 * Unified export supporting both DTCG JSON and TypeScript formats
 */
import tokensJson from '../tokens.json' with { type: 'json' };
import { tokens } from '../tokens.js';
// Re-export TypeScript tokens
export { tokens };
// Export DTCG JSON for tooling compatibility
export const dtcgTokens = tokensJson;
/**
 * Resolve a token value from either format
 */
export function resolveToken(category, key) {
    // Try TypeScript format first
    const tsCategory = category;
    if (tokens[tsCategory]) {
        const tsValue = tokens[tsCategory][key];
        if (typeof tsValue === 'string') {
            return tsValue;
        }
    }
    // Fallback to DTCG JSON format
    const dtcgCategory = dtcgTokens[category];
    if (dtcgCategory && typeof dtcgCategory === 'object') {
        const dtcgValue = dtcgCategory[key];
        if (dtcgValue && typeof dtcgValue === 'object' && dtcgValue !== null && '$value' in dtcgValue) {
            return String(dtcgValue.$value);
        }
    }
    throw new Error(`Token not found: ${category}.${key}`);
}
/**
 * Get all tokens for a category
 */
export function getTokens(category) {
    return tokens[category];
}
//# sourceMappingURL=index.js.map
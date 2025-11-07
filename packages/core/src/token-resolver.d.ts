/**
 * Resolves tokens to CSS custom properties
 */
export interface TokenResolverOptions {
    prefix?: string;
    format?: 'oklch' | 'hex' | 'rgb';
}
/**
 * Resolve a token value to CSS custom property format
 */
export declare function resolveTokenValue(value: string | number, options?: TokenResolverOptions): string;
/**
 * Generate CSS custom properties from tokens
 */
export declare function generateTokenCSS(options?: TokenResolverOptions): string;
/**
 * Hardware acceleration property classification
 */
export declare const ACCELERATED_PROPERTIES: Set<string>;
export declare const LAYOUT_TRIGGERING_PROPERTIES: Set<string>;
/**
 * Check if a property triggers layout
 */
export declare function isLayoutTriggering(property: string): boolean;
/**
 * Check if a property is hardware accelerated
 */
export declare function isAccelerated(property: string): boolean;
//# sourceMappingURL=token-resolver.d.ts.map
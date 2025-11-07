/**
 * CSS @layer definitions and ordering
 * Layers are applied in priority order (reset → overrides)
 */
export declare const LAYER_ORDER: readonly ["reset", "tokens", "base", "layouts", "components", "utilities", "motion", "overrides"];
export type LayerName = typeof LAYER_ORDER[number];
/**
 * Generate @layer declarations
 */
export declare function generateLayerDeclarations(): string;
/**
 * Wrap CSS content in a layer
 */
export declare function wrapInLayer(layer: LayerName, content: string): string;
//# sourceMappingURL=layers.d.ts.map
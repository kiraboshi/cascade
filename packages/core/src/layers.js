/**
 * CSS @layer definitions and ordering
 * Layers are applied in priority order (reset → overrides)
 */
export const LAYER_ORDER = [
    'reset',
    'tokens',
    'base',
    'layouts',
    'components',
    'utilities',
    'motion',
    'overrides',
];
/**
 * Generate @layer declarations
 */
export function generateLayerDeclarations() {
    return `@layer ${LAYER_ORDER.join(', ')};`;
}
/**
 * Wrap CSS content in a layer
 */
export function wrapInLayer(layer, content) {
    return `@layer ${layer} {\n${content}\n}`;
}
//# sourceMappingURL=layers.js.map
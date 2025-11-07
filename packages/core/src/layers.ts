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
] as const;

export type LayerName = typeof LAYER_ORDER[number];

/**
 * Generate @layer declarations
 */
export function generateLayerDeclarations(): string {
  return `@layer ${LAYER_ORDER.join(', ')};`;
}

/**
 * Wrap CSS content in a layer
 */
export function wrapInLayer(layer: LayerName, content: string): string {
  return `@layer ${layer} {\n${content}\n}`;
}


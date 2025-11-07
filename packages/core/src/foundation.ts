/**
 * Foundation CSS generator
 * Generates CSS with @layer architecture
 */

import { generateLayerDeclarations, wrapInLayer } from './layers';
import { generateTokenCSS } from './token-resolver';

/**
 * Generate reset layer CSS
 */
function generateResetLayer(): string {
  return `
    *, *::before, *::after {
      box-sizing: border-box;
    }
    
    * {
      margin: 0;
    }
    
    html, body {
      height: 100%;
    }
    
    body {
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    
    img, picture, video, canvas, svg {
      display: block;
      max-width: 100%;
    }
    
    input, button, textarea, select {
      font: inherit;
    }
    
    p, h1, h2, h3, h4, h5, h6 {
      overflow-wrap: break-word;
    }
  `;
}

/**
 * Generate base layer CSS
 */
function generateBaseLayer(): string {
  return `
    :root {
      font-family: var(--cascade-typography-font-family-sans);
    }
    
    body {
      font-size: var(--cascade-typography-font-size-base);
    }
  `;
}

/**
 * Generate layout primitives CSS
 */
function generateLayoutsLayer(): string {
  return `
    .stack {
      display: flex;
      flex-direction: column;
      gap: var(--stack-gap, 0);
      align-items: var(--stack-align, stretch);
    }
    
    .cluster {
      display: flex;
      flex-wrap: wrap;
      gap: var(--cluster-gap, var(--cascade-space-md));
      justify-content: var(--cluster-justify, flex-start);
    }
    
    .cluster[data-wrapping="true"] {
      justify-content: space-between;
    }
    
    .frame {
      position: relative;
      aspect-ratio: var(--frame-ratio);
    }
    
    .frame > * {
      position: absolute;
      inset: 0;
      object-fit: var(--frame-object-fit, cover);
    }
  `;
}

/**
 * Generate utilities layer CSS
 */
function generateUtilitiesLayer(): string {
  return `
    .stack-align-start { align-items: flex-start; }
    .stack-align-center { align-items: center; }
    .stack-align-end { align-items: flex-end; }
    .stack-align-stretch { align-items: stretch; }
    
    .stack-justify-start { justify-content: flex-start; }
    .stack-justify-center { justify-content: center; }
    .stack-justify-end { justify-content: flex-end; }
    .stack-justify-between { justify-content: space-between; }
    
    /* Responsive overrides via data-attributes */
    @media (width >= 40rem) {
      [data-responsive*="sm:spacing-xs"] { --stack-gap: var(--cascade-space-xs); }
      [data-responsive*="sm:spacing-sm"] { --stack-gap: var(--cascade-space-sm); }
      [data-responsive*="sm:spacing-md"] { --stack-gap: var(--cascade-space-md); }
      [data-responsive*="sm:spacing-lg"] { --stack-gap: var(--cascade-space-lg); }
      [data-responsive*="sm:spacing-xl"] { --stack-gap: var(--cascade-space-xl); }
      [data-responsive*="sm:align-start"] { align-items: flex-start; }
      [data-responsive*="sm:align-center"] { align-items: center; }
      [data-responsive*="sm:align-end"] { align-items: flex-end; }
      [data-responsive*="sm:align-stretch"] { align-items: stretch; }
      [data-responsive*="sm:justify-start"] { justify-content: flex-start; }
      [data-responsive*="sm:justify-center"] { justify-content: center; }
      [data-responsive*="sm:justify-end"] { justify-content: flex-end; }
      [data-responsive*="sm:justify-between"] { justify-content: space-between; }
    }
    
    @media (width >= 64rem) {
      [data-responsive*="md:spacing-xs"] { --stack-gap: var(--cascade-space-xs); }
      [data-responsive*="md:spacing-sm"] { --stack-gap: var(--cascade-space-sm); }
      [data-responsive*="md:spacing-md"] { --stack-gap: var(--cascade-space-md); }
      [data-responsive*="md:spacing-lg"] { --stack-gap: var(--cascade-space-lg); }
      [data-responsive*="md:spacing-xl"] { --stack-gap: var(--cascade-space-xl); }
      [data-responsive*="md:align-start"] { align-items: flex-start; }
      [data-responsive*="md:align-center"] { align-items: center; }
      [data-responsive*="md:align-end"] { align-items: flex-end; }
      [data-responsive*="md:align-stretch"] { align-items: stretch; }
      [data-responsive*="md:justify-start"] { justify-content: flex-start; }
      [data-responsive*="md:justify-center"] { justify-content: center; }
      [data-responsive*="md:justify-end"] { justify-content: flex-end; }
      [data-responsive*="md:justify-between"] { justify-content: space-between; }
    }
    
    @media (width >= 80rem) {
      [data-responsive*="lg:spacing-xs"] { --stack-gap: var(--cascade-space-xs); }
      [data-responsive*="lg:spacing-sm"] { --stack-gap: var(--cascade-space-sm); }
      [data-responsive*="lg:spacing-md"] { --stack-gap: var(--cascade-space-md); }
      [data-responsive*="lg:spacing-lg"] { --stack-gap: var(--cascade-space-lg); }
      [data-responsive*="lg:spacing-xl"] { --stack-gap: var(--cascade-space-xl); }
      [data-responsive*="lg:align-start"] { align-items: flex-start; }
      [data-responsive*="lg:align-center"] { align-items: center; }
      [data-responsive*="lg:align-end"] { align-items: flex-end; }
      [data-responsive*="lg:align-stretch"] { align-items: stretch; }
      [data-responsive*="lg:justify-start"] { justify-content: flex-start; }
      [data-responsive*="lg:justify-center"] { justify-content: center; }
      [data-responsive*="lg:justify-end"] { justify-content: flex-end; }
      [data-responsive*="lg:justify-between"] { justify-content: space-between; }
    }
  `;
}

/**
 * Generate complete foundation CSS
 */
export function generateFoundationCSS(): string {
  const layers = [
    { name: 'reset', content: generateResetLayer() },
    { name: 'tokens', content: `:root {\n${generateTokenCSS()}\n}` },
    { name: 'base', content: generateBaseLayer() },
    { name: 'layouts', content: generateLayoutsLayer() },
    { name: 'utilities', content: generateUtilitiesLayer() },
    { name: 'motion', content: '/* Motion keyframes will be generated by compiler */' },
    { name: 'overrides', content: '/* User overrides */' },
  ];
  
  const layerDeclarations = generateLayerDeclarations();
  const layerContent = layers
    .map(({ name, content }) => wrapInLayer(name, content))
    .join('\n\n');
  
  return `${layerDeclarations}\n\n${layerContent}`;
}


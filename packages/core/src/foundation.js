/**
 * Foundation CSS generator
 * Generates CSS with @layer architecture
 */
import { generateLayerDeclarations, wrapInLayer } from './layers';
import { generateTokenCSS } from './token-resolver';
/**
 * Generate reset layer CSS
 */
function generateResetLayer() {
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
function generateBaseLayer() {
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
function generateLayoutsLayer() {
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
    
    .box {
      padding: var(--box-padding, 0);
      margin: var(--box-margin, 0);
      background: var(--box-background, transparent);
      border: var(--box-border, none);
      border-radius: var(--box-border-radius, 0);
      width: var(--box-width, auto);
      height: var(--box-height, auto);
      max-width: var(--box-max-width, none);
      max-height: var(--box-max-height, none);
      min-width: var(--box-min-width, 0);
      min-height: var(--box-min-height, 0);
    }
    
    .grid {
      display: grid;
      gap: var(--grid-gap, 0);
      grid-template-columns: var(--grid-columns, repeat(3, 1fr));
      grid-template-rows: var(--grid-rows, none);
      align-items: var(--grid-align-items, stretch);
      justify-items: var(--grid-justify-items, stretch);
      align-content: var(--grid-align-content, start);
      justify-content: var(--grid-justify-content, start);
    }
    
    .center {
      margin-left: auto;
      margin-right: auto;
      max-width: var(--center-max-width, 100%);
      min-height: var(--center-min-height, auto);
      padding: var(--center-padding, 0);
      text-align: var(--center-text-align, inherit);
      display: var(--center-display, block);
      align-items: var(--center-align-items, center);
      justify-content: var(--center-justify-content, center);
    }
    
    .sidebar {
      display: grid;
      grid-template-columns: var(--sidebar-template-columns);
      gap: var(--sidebar-gap, 0);
      align-items: var(--sidebar-align-items, stretch);
    }
    
    .sidebar[data-side="right"] {
      grid-template-columns: var(--sidebar-template-columns);
    }
    
    .split {
      display: grid;
      grid-template-columns: var(--split-template-columns);
      gap: var(--split-gap, 0);
      align-items: var(--split-align, stretch);
    }
    
    .split[data-switch-to="stack"] {
      grid-template-columns: 1fr;
    }
    
    @media (max-width: 768px) {
      .split[data-switch-to="stack"] {
        grid-template-columns: 1fr;
      }
    }
    
    .flex {
      display: flex;
      gap: var(--flex-gap, 0);
      flex-direction: var(--flex-direction, row);
      flex-wrap: var(--flex-wrap, nowrap);
      align-items: var(--flex-align-items, stretch);
      justify-content: var(--flex-justify-content, flex-start);
      align-content: var(--flex-align-content, stretch);
    }
  `;
}
/**
 * Generate utilities layer CSS
 */
function generateUtilitiesLayer() {
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
export function generateFoundationCSS() {
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
//# sourceMappingURL=foundation.js.map
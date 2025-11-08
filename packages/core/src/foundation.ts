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
      color: oklch(0.20 0 0);
      --cascade-color-text: oklch(0.20 0 0);
      --cascade-color-background: oklch(1 0 0);
    }
    
    body {
      font-size: var(--cascade-typography-font-size-base);
      color: inherit;
      background: var(--cascade-color-background);
    }
    
    /* Enhanced focus indicators for accessibility */
    :focus-visible {
      outline: 2px solid var(--cascade-color-primary, oklch(0.637 0.237 25.331));
      outline-offset: 2px;
      border-radius: 2px;
    }
    
    /* Focus indicators for layout primitives */
    .grid:focus-visible,
    .sidebar:focus-visible,
    .split:focus-visible,
    .stack:focus-visible,
    .cluster:focus-visible,
    .box:focus-visible,
    .center:focus-visible,
    .flex:focus-visible,
    .switcher:focus-visible,
    .reel:focus-visible,
    .cover:focus-visible,
    .imposter:focus-visible,
    .frame:focus-visible {
      outline: 2px solid var(--cascade-color-primary, oklch(0.637 0.237 25.331));
      outline-offset: 2px;
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      :focus-visible {
        outline: 3px solid;
        outline-offset: 3px;
      }
      
      .grid:focus-visible,
      .sidebar:focus-visible,
      .split:focus-visible,
      .stack:focus-visible,
      .cluster:focus-visible,
      .box:focus-visible,
      .center:focus-visible,
      .flex:focus-visible,
      .switcher:focus-visible,
      .reel:focus-visible,
      .cover:focus-visible,
      .imposter:focus-visible,
      .frame:focus-visible {
        outline: 3px solid;
        outline-offset: 3px;
      }
      
      /* High contrast borders for layout primitives */
      .grid,
      .sidebar,
      .split,
      .stack,
      .cluster,
      .box,
      .center,
      .flex,
      .switcher,
      .reel,
      .cover,
      .imposter,
      .frame {
        border: 2px solid currentColor;
      }
    }
    
    /* Screen reader only class for live regions */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
    
    /* Skip link support */
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--cascade-color-primary, oklch(0.637 0.237 25.331));
      color: white;
      padding: 8px 16px;
      z-index: 100;
      text-decoration: none;
      border-radius: 0 0 4px 0;
    }
    
    .skip-link:focus {
      top: 0;
    }
  `;
}

/**
 * Generate container query CSS rules for common breakpoints
 * Uses pure CSS container queries - no data attributes needed
 * 
 * How it works:
 * 1. Component sets CSS variables like --grid-columns-30rem inline when props specify that breakpoint
 * 2. Container query checks container size and uses the appropriate variable
 * 3. For min-width queries: check current breakpoint var, then smaller breakpoint vars, then base
 * 4. This ensures larger breakpoints don't override smaller ones when the larger var isn't set
 */
function generateContainerQueryCSS(componentName: string, propertyName: string, breakpoints: string[]): string {
  // Sort breakpoints numerically (smallest to largest)
  const sortedBreakpoints = [...breakpoints].sort((a, b) => {
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    return aNum - bNum;
  });
  
  return sortedBreakpoints.map((width, index) => {
    const normalizedWidth = width.replace(/\s+/g, '-');
    
    // Build fallback chain: check current breakpoint var, then smaller breakpoints, then base
    // This ensures that if a larger breakpoint query fires but its var isn't set,
    // it falls back to smaller breakpoint vars that might be set
    // Use --${propertyName}-base for the base fallback to avoid conflicts with inline --${propertyName}
    // NOTE: Don't include var(--${propertyName}) in the fallback chain as it creates a circular reference
    // The base rule already sets --${propertyName} from --${propertyName}-base
    let fallbackChain = `var(--${propertyName}-base)`; // Base fallback - no circular reference
    for (let i = index - 1; i >= 0; i--) {
      const smallerWidth = sortedBreakpoints[i].replace(/\s+/g, '-');
      fallbackChain = `var(--${propertyName}-${smallerWidth}, ${fallbackChain})`;
    }
    
    return `
    @container (min-width: ${width}) {
      .${componentName} {
        --${propertyName}: var(--${propertyName}-${normalizedWidth}, ${fallbackChain});
      }
    }`;
  }).join('\n');
}

/**
 * Generate layout primitives CSS
 */
function generateLayoutsLayer(): string {
  // Common container query breakpoints (sorted for proper cascading)
  // These are the breakpoints that will have CSS container query rules generated
  const containerBreakpoints = ['20rem', '30rem', '40rem', '50rem', '60rem', '70rem'];
  
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
      /* NOTE: container-type removed - parent elements should be containers, not Grid itself
         Container queries check the nearest ancestor container, so Grid queries its parent's size */
      gap: var(--grid-gap, 0);
      grid-template-columns: var(--grid-columns, repeat(3, 1fr));
      grid-template-rows: var(--grid-rows, none);
      align-items: var(--grid-align-items, stretch);
      justify-items: var(--grid-justify-items, stretch);
      align-content: var(--grid-align-content, start);
      justify-content: var(--grid-justify-content, start);
    }
    
    /* Set initial --grid-columns from --grid-columns-base when base is set.
       This handles containers smaller than the smallest breakpoint.
       Container queries will override this when they fire.
       If --grid-columns-base is not set, this rule does nothing (--grid-columns keeps its default). */
    .grid {
      --grid-columns: var(--grid-columns-base);
    }
    
    ${generateContainerQueryCSS('grid', 'grid-columns', containerBreakpoints)}
    ${generateContainerQueryCSS('grid', 'grid-gap', containerBreakpoints)}
    
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
      container-type: inline-size;
      grid-template-columns: var(--sidebar-template-columns);
      gap: var(--sidebar-gap, 0);
      align-items: var(--sidebar-align-items, stretch);
    }
    
    .sidebar[data-side="right"] {
      grid-template-columns: var(--sidebar-template-columns);
    }
    
    ${generateContainerQueryCSS('sidebar', 'sidebar-template-columns', containerBreakpoints)}
    ${generateContainerQueryCSS('sidebar', 'sidebar-gap', containerBreakpoints)}
    
    .split {
      display: grid;
      container-type: inline-size;
      grid-template-columns: var(--split-template-columns);
      gap: var(--split-gap, 0);
      align-items: var(--split-align, stretch);
    }
    
    .split[data-switch-to="stack"] {
      grid-template-columns: 1fr;
    }
    
    ${generateContainerQueryCSS('split', 'split-template-columns', containerBreakpoints)}
    ${generateContainerQueryCSS('split', 'split-gap', containerBreakpoints)}
    
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
    
    .switcher {
      display: flex;
      flex-wrap: wrap;
      gap: var(--switcher-gap, var(--cascade-space-md));
      justify-content: var(--switcher-justify, flex-start);
      flex-direction: row;
    }
    
    /* Switcher: When container is wider than threshold, items stay horizontal (row) */
    /* When narrower than threshold, items switch to vertical (column) */
    .switcher[data-below-threshold="true"] {
      flex-direction: column;
    }
    
    .switcher > * {
      flex-basis: var(--switcher-item-basis, auto);
      min-width: 0;
    }
    
    /* Switcher with limit: Items will be sized via inline styles */
    
    .reel {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      gap: var(--reel-gap, var(--cascade-space-md));
      scroll-snap-type: var(--reel-snap-type, none);
      scroll-padding: var(--reel-scroll-padding, 0);
    }
    
    .reel > * {
      flex-shrink: 0 !important;
      flex-grow: 0;
    }
    
    .reel[data-snap="true"] > * {
      scroll-snap-align: var(--reel-snap-align, start);
    }
    
    .cover {
      display: flex;
      flex-direction: column;
      min-height: var(--cover-min-height, 100vh);
      padding: var(--cover-padding, 0);
    }
    
    .cover > [data-cover-header] {
      flex-shrink: 0;
    }
    
    .cover > [data-cover-centered] {
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .cover > [data-cover-footer] {
      flex-shrink: 0;
    }
    
    .imposter {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      margin: var(--imposter-margin, 0);
      max-width: var(--imposter-max-width, 100%);
      max-height: var(--imposter-max-height, 100%);
      overflow: auto;
    }
    
    .imposter[data-breakout="true"] {
      position: fixed;
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

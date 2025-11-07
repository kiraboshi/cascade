/**
 * CSS @keyframes generator from spring physics
 */

import { solveSpring, type SpringConfig } from './spring-solver';

export interface KeyframeValue {
  [property: string]: string | number;
}

export interface KeyframeConfig {
  from: KeyframeValue;
  to: KeyframeValue;
  duration?: number;
  easing?: string;
}

export interface SpringKeyframeConfig extends SpringConfig {
  properties: Record<string, { from: number; to: number }>;
  duration?: number;
  easing?: string;
}

/**
 * Generate CSS @keyframes from keyframe config
 */
export function generateKeyframes(
  name: string,
  config: KeyframeConfig
): { css: string; className: string } {
  const { from, to, duration = '300ms', easing = 'ease' } = config;
  
  const css = `
@keyframes ${name} {
  from {
    ${Object.entries(from).map(([prop, value]) => 
      `${prop}: ${value};`
    ).join('\n    ')}
  }
  to {
    ${Object.entries(to).map(([prop, value]) => 
      `${prop}: ${value};`
    ).join('\n    ')}
  }
}

.${name} {
  animation: ${name} ${duration} ${easing};
}
  `.trim();
  
  return { css, className: name };
}

/**
 * Generate CSS @keyframes from spring physics
 */
export function generateSpringKeyframes(
  name: string,
  config: SpringKeyframeConfig
): { css: string; className: string; jsConfig?: object } {
  const { properties, duration = 300, easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)' } = config;
  
  // Solve spring for each property
  const keyframes: Array<{ percentage: number; values: Record<string, number> }> = [];
  const steps = 60;
  const solvedProperties: Record<string, number[]> = {};
  
  for (const [prop, { from, to }] of Object.entries(properties)) {
    const springConfig: SpringConfig = {
      ...config,
      from,
      to,
    };
    solvedProperties[prop] = solveSpring(springConfig, duration, steps);
  }
  
  // Generate keyframes at percentage intervals
  for (let i = 0; i <= steps; i++) {
    const percentage = (i / steps) * 100;
    const values: Record<string, number> = {};
    
    for (const [prop, solved] of Object.entries(solvedProperties)) {
      values[prop] = solved[i];
    }
    
    keyframes.push({ percentage, values });
  }
  
  // Generate CSS
  const keyframeRules = keyframes
    .map(({ percentage, values }) => {
      const props = Object.entries(values)
        .map(([prop, value]) => {
          // Format transform values specially
          if (prop === 'transform') {
            return `transform: translateY(${value}px);`;
          }
          return `${prop}: ${value};`;
        })
        .join('\n    ');
      return `  ${percentage}% {\n    ${props}\n  }`;
    })
    .join('\n');
  
  const css = `
@keyframes ${name} {
${keyframeRules}
}

.${name} {
  animation: ${name} ${duration}ms ${easing};
}
  `.trim();
  
  return { css, className: name };
}


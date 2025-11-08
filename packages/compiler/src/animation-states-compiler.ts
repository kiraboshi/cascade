/**
 * Animation States Compiler
 * Defines reusable animation state sets (variants-like functionality)
 */

import { tokens } from '@cascade/tokens';

/**
 * Transition configuration
 */
export interface TransitionConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  type?: 'spring' | 'tween' | 'keyframes';
  // Spring-specific
  stiffness?: number;
  damping?: number;
  mass?: number;
  // Keyframes-specific
  times?: number[];
  // Orchestration hints
  staggerChildren?: number;
  delayChildren?: number;
}

/**
 * Property value with optional transition
 */
export type PropertyValue = 
  | string 
  | number 
  | (() => string | number) // Runtime function
  | {
      value: string | number;
      transition?: TransitionConfig;
    };

/**
 * Animation state definition
 */
export interface AnimationStateDefinition {
  [property: string]: PropertyValue | TransitionConfig;
}

/**
 * Animation states configuration
 */
export interface AnimationStatesConfig {
  [stateName: string]: AnimationStateDefinition;
}

/**
 * Options for defineAnimationStates
 */
export interface DefineAnimationStatesOptions {
  /**
   * Parent state set for inheritance
   */
  parent?: AnimationStateSet;
  
  /**
   * Enable transition inheritance from parent
   */
  inheritTransitions?: boolean;
  
  /**
   * Force all states to compile-time or runtime
   */
  mode?: 'compile-time' | 'runtime' | 'auto';
}

/**
 * State metadata
 */
export interface StateMetadata {
  /**
   * State names that are compile-time optimized
   */
  compileTime: string[];
  
  /**
   * State names that require runtime
   */
  runtime: string[];
  
  /**
   * Performance metrics
   */
  performance: {
    stateCount: number;
    totalProperties: number;
    cssSize: number; // bytes
    compileTimeStates: number;
    runtimeStates: number;
  };
}

/**
 * Animation State Set
 */
export interface AnimationStateSet {
  /**
   * Unique identifier for this state set
   */
  readonly id: string;
  
  /**
   * CSS classes for each state (for compile-time animations)
   */
  readonly classes: Record<string, string>;
  
  /**
   * Combined CSS for all states
   */
  readonly css: string;
  
  /**
   * State definitions (for runtime use)
   */
  readonly states: Record<string, AnimationStateDefinition>;
  
  /**
   * Metadata about states
   */
  readonly metadata: StateMetadata;
}

/**
 * Semantic state names that get special handling
 */
const SEMANTIC_STATE_NAMES = new Set([
  'initial',
  'animate',
  'hover',
  'tap',
  'focus',
  'exit',
]);

/**
 * Check if a value is a runtime value (needs runtime evaluation)
 */
function isRuntimeValue(value: PropertyValue): boolean {
  if (typeof value === 'function') {
    return true; // Function values are always runtime
  }
  
  if (typeof value === 'string') {
    // CSS custom property references are runtime
    if (value.startsWith('var(') || value.startsWith('--')) {
      return true;
    }
    // Dynamic expressions
    if (value.includes('calc(') || value.includes('${')) {
      return true;
    }
  }
  
  if (typeof value === 'object' && value !== null) {
    // Check if it's a property value object
    if ('value' in value) {
      return isRuntimeValue(value.value);
    }
  }
  
  return false;
}

/**
 * Resolve token references in values
 * Supports tokens.motion.duration.medium, tokens.space.lg, etc.
 */
function resolveTokenValue(value: string | number): string | number {
  if (typeof value === 'number') {
    return value;
  }
  
  // Check if it's a token reference (e.g., "tokens.motion.duration.medium")
  if (typeof value === 'string' && value.startsWith('tokens.')) {
    try {
      // Resolve token path (e.g., "tokens.motion.duration.medium")
      const path = value.replace('tokens.', '').split('.');
      let resolved: any = tokens;
      
      for (const key of path) {
        if (resolved && typeof resolved === 'object' && key in resolved) {
          resolved = resolved[key];
        } else {
          // Token not found, return original value
          return value;
        }
      }
      
      // Return resolved token value
      if (typeof resolved === 'string' || typeof resolved === 'number') {
        return resolved;
      }
      
      // If token has $value property (DTCG format)
      if (resolved && typeof resolved === 'object' && '$value' in resolved) {
        return resolved.$value as string | number;
      }
    } catch (e) {
      // If resolution fails, return original value
      return value;
    }
  }
  
  return value;
}

/**
 * Extract property value from PropertyValue type
 */
function extractPropertyValue(propValue: PropertyValue): {
  value: string | number;
  isRuntime: boolean;
} {
  if (typeof propValue === 'string' || typeof propValue === 'number') {
    const resolvedValue = resolveTokenValue(propValue);
    return {
      value: resolvedValue,
      isRuntime: isRuntimeValue(resolvedValue),
    };
  }
  
  if (typeof propValue === 'function') {
    return {
      value: '', // Will be evaluated at runtime
      isRuntime: true,
    };
  }
  
  if (typeof propValue === 'object' && propValue !== null && 'value' in propValue) {
    const resolvedValue = resolveTokenValue(propValue.value);
    return {
      value: resolvedValue,
      isRuntime: isRuntimeValue(resolvedValue),
    };
  }
  
  return {
    value: '',
    isRuntime: false,
  };
}

/**
 * Resolve token references in transition config
 */
function resolveTransitionTokens(transition: TransitionConfig): TransitionConfig {
  if (!transition) {
    return transition;
  }
  
  const resolved: TransitionConfig = { ...transition };
  
  // Resolve duration if it's a token reference
  if (typeof transition.duration === 'string' && transition.duration.startsWith('tokens.')) {
    const resolvedDuration = resolveTokenValue(transition.duration);
    if (typeof resolvedDuration === 'number') {
      resolved.duration = resolvedDuration;
    }
  }
  
  // Resolve easing if it's a token reference
  if (typeof transition.easing === 'string' && transition.easing.startsWith('tokens.')) {
    const resolvedEasing = resolveTokenValue(transition.easing);
    if (typeof resolvedEasing === 'string') {
      resolved.easing = resolvedEasing;
    }
  }
  
  return resolved;
}

/**
 * Check if a state is compile-time or runtime
 */
function detectStateMode(
  state: AnimationStateDefinition,
  options: DefineAnimationStatesOptions = {}
): 'compile-time' | 'runtime' {
  // Explicit mode override
  if (options.mode === 'compile-time' || options.mode === 'runtime') {
    return options.mode;
  }
  
  // Check for explicit _mode property
  if ('_mode' in state) {
    const mode = state._mode;
    if (mode === 'compile-time' || mode === 'runtime') {
      return mode;
    }
  }
  
  // Auto-detect: check all properties
  for (const [prop, propValue] of Object.entries(state)) {
    // Skip special properties
    if (prop === '_mode' || prop === 'transition') {
      continue;
    }
    
    const { isRuntime } = extractPropertyValue(propValue as PropertyValue);
    if (isRuntime) {
      return 'runtime';
    }
  }
  
  return 'compile-time';
}

/**
 * Extract transition config from state definition
 */
function extractTransition(state: AnimationStateDefinition): TransitionConfig | undefined {
  if ('transition' in state && typeof state.transition === 'object') {
    return state.transition as TransitionConfig;
  }
  return undefined;
}

/**
 * Validate state definition
 */
function validateState(
  stateName: string,
  state: AnimationStateDefinition,
  isDev: boolean
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if state is an object
  if (typeof state !== 'object' || state === null || Array.isArray(state)) {
    errors.push(`State "${stateName}" must be an object`);
    return { errors, warnings };
  }
  
  // Validate transition config if present
  if ('transition' in state) {
    const transition = state.transition;
    if (typeof transition === 'object' && transition !== null) {
      if ('duration' in transition && typeof transition.duration !== 'number') {
        errors.push(`State "${stateName}": transition.duration must be a number`);
      }
      if ('delay' in transition && typeof transition.delay !== 'number') {
        errors.push(`State "${stateName}": transition.delay must be a number`);
      }
      if ('easing' in transition && typeof transition.easing !== 'string') {
        errors.push(`State "${stateName}": transition.easing must be a string`);
      }
    }
  }
  
  // Performance warnings (dev mode only)
  if (isDev) {
    const propertyCount = Object.keys(state).filter(
      key => key !== 'transition' && key !== '_mode'
    ).length;
    
    if (propertyCount > 10) {
      warnings.push(
        `State "${stateName}" has ${propertyCount} properties. Consider splitting into multiple states.`
      );
    }
    
    // Check for layout-triggering properties
    const layoutTriggeringProps = ['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'padding'];
    for (const prop of Object.keys(state)) {
      if (layoutTriggeringProps.includes(prop)) {
        warnings.push(
          `State "${stateName}": Property "${prop}" triggers layout. Consider using transform instead.`
        );
      }
    }
  }
  
  return { errors, warnings };
}

/**
 * Generate CSS for a compile-time state
 */
function generateStateCSS(
  stateName: string,
  stateId: string,
  state: AnimationStateDefinition
): { css: string; className: string } {
  const rawTransition = extractTransition(state);
  const transition = rawTransition ? resolveTransitionTokens(rawTransition) : undefined;
  const properties: Record<string, string | number> = {};
  
  // Extract properties (excluding transition and _mode)
  for (const [prop, propValue] of Object.entries(state)) {
    if (prop === 'transition' || prop === '_mode') {
      continue;
    }
    
    const { value } = extractPropertyValue(propValue as PropertyValue);
    properties[prop] = value;
  }
  
  // Generate CSS class with properties
  const className = `${stateId}-${stateName}`;
  const propertyRules = Object.entries(properties)
    .map(([prop, value]) => {
      // Handle transform specially
      if (prop === 'transform') {
        return `  transform: ${value};`;
      }
      return `  ${prop}: ${value};`;
    })
    .join('\n');
  
  let css = `.${className} {\n${propertyRules}\n}`;
  
  // Add transition if specified
  if (transition) {
    const duration = transition.duration || 300;
    const easing = transition.easing || tokens.motion.easing.easeOut;
    const delay = transition.delay ? ` ${transition.delay}ms` : '';
    
    css += `\n\n.${className} {\n  transition: all ${duration}ms ${easing}${delay};\n}`;
  }
  
  return { css, className };
}

/**
 * Generate CSS for a runtime state (CSS custom properties)
 */
function generateRuntimeStateCSS(
  stateName: string,
  stateId: string,
  state: AnimationStateDefinition
): { css: string; className: string } {
  const className = `${stateId}-${stateName}`;
  const cssVars: string[] = [];
  const propertyRules: string[] = [];
  
  // Extract properties and generate CSS variables
  for (const [prop, propValue] of Object.entries(state)) {
    if (prop === 'transition' || prop === '_mode') {
      continue;
    }
    
    const { value, isRuntime } = extractPropertyValue(propValue as PropertyValue);
    
    if (isRuntime) {
      // Generate CSS variable
      const varName = `--${stateId}-${stateName}-${prop}`;
      cssVars.push(`  ${varName}: ${typeof value === 'string' ? value : `${value}px`};`);
      propertyRules.push(`  ${prop}: var(${varName});`);
    } else {
      // Static value
      propertyRules.push(`  ${prop}: ${value};`);
    }
  }
  
  // Add transition if specified
  const transition = extractTransition(state);
  if (transition) {
    const duration = transition.duration || 300;
    const easing = transition.easing || tokens.motion.easing.easeOut;
    const delay = transition.delay ? ` ${transition.delay}ms` : '';
    propertyRules.push(`  transition: all ${duration}ms ${easing}${delay};`);
  }
  
  const css = cssVars.length > 0
    ? `:root {\n${cssVars.join('\n')}\n}\n\n.${className} {\n${propertyRules.join('\n')}\n}`
    : `.${className} {\n${propertyRules.join('\n')}\n}`;
  
  return { css, className };
}

/**
 * Define animation states (variants-like functionality)
 */
export function defineAnimationStates(
  config: AnimationStatesConfig,
  options: DefineAnimationStatesOptions = {}
): AnimationStateSet {
  const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';
  
  // Generate unique ID for this state set
  const stateId = `states-${Math.random().toString(36).substr(2, 9)}`;
  
  // Validate all states
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  for (const [stateName, state] of Object.entries(config)) {
    const { errors, warnings } = validateState(stateName, state, isDev);
    allErrors.push(...errors);
    allWarnings.push(...warnings);
  }
  
  // Throw errors
  if (allErrors.length > 0) {
    throw new Error(
      `[Cascade] Invalid animation state definitions:\n${allErrors.map(e => `  - ${e}`).join('\n')}\n` +
      `See: https://cascade.docs/animations/state-definitions`
    );
  }
  
  // Log warnings in dev mode
  if (isDev && allWarnings.length > 0) {
    console.warn(
      `[Cascade] Animation state warnings:\n${allWarnings.map(w => `  - ${w}`).join('\n')}`
    );
  }
  
  // Detect compile-time vs runtime states
  const compileTimeStates: string[] = [];
  const runtimeStates: string[] = [];
  const classes: Record<string, string> = {};
  const cssParts: string[] = [];
  
  for (const [stateName, state] of Object.entries(config)) {
    const mode = detectStateMode(state, options);
    
    if (mode === 'compile-time') {
      compileTimeStates.push(stateName);
      const { css, className } = generateStateCSS(stateName, stateId, state);
      classes[stateName] = className;
      cssParts.push(css);
    } else {
      runtimeStates.push(stateName);
      const { css, className } = generateRuntimeStateCSS(stateName, stateId, state);
      classes[stateName] = className;
      cssParts.push(css);
    }
  }
  
  // Calculate performance metrics
  const totalProperties = Object.values(config).reduce((sum, state) => {
    return sum + Object.keys(state).filter(
      key => key !== 'transition' && key !== '_mode'
    ).length;
  }, 0);
  
  const cssSize = cssParts.join('\n\n').length;
  
  const metadata: StateMetadata = {
    compileTime: compileTimeStates,
    runtime: runtimeStates,
    performance: {
      stateCount: Object.keys(config).length,
      totalProperties,
      cssSize,
      compileTimeStates: compileTimeStates.length,
      runtimeStates: runtimeStates.length,
    },
  };
  
  // Performance warnings (dev mode only)
  if (isDev) {
    if (metadata.performance.stateCount > 20) {
      console.warn(
        `[Cascade] Animation state set has ${metadata.performance.stateCount} states. ` +
        `Recommended limit is 20 states.`
      );
    }
    
    if (metadata.performance.cssSize > 50 * 1024) {
      console.warn(
        `[Cascade] Animation state set generates ${Math.round(metadata.performance.cssSize / 1024)}KB of CSS. ` +
        `Recommended limit is 50KB.`
      );
    }
  }
  
  return {
    id: stateId,
    classes,
    css: cssParts.join('\n\n'),
    states: config,
    metadata,
  };
}

/**
 * Generate TypeScript types for state names
 */
export function generateStateTypes(stateSet: AnimationStateSet): string {
  const stateNames = Object.keys(stateSet.states);
  const stateNamesUnion = stateNames.map(name => `'${name}'`).join(' | ');
  
  return `
export type ${stateSet.id}StateName = ${stateNamesUnion};

export interface ${stateSet.id}States {
${stateNames.map(name => `  ${name}: AnimationStateDefinition;`).join('\n')}
}
  `.trim();
}


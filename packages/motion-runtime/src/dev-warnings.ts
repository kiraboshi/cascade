/**
 * Development-mode warnings for common mistakes
 * Only active in development mode, zero overhead in production
 */

const __DEV__ = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

// Global configuration to disable warnings
let warningsEnabled = true;

/**
 * Configure whether warnings are enabled
 * @param enabled - Whether to enable warnings (default: true)
 */
export function setWarningsEnabled(enabled: boolean): void {
  warningsEnabled = enabled;
}

/**
 * Check if warnings are enabled
 */
export function areWarningsEnabled(): boolean {
  return __DEV__ && warningsEnabled;
}

/**
 * Warn about duplicate animation class application
 */
export function warnDuplicateClass(className: string, element: HTMLElement | null): void {
  if (!areWarningsEnabled()) return;
  
  if (element && element.classList.contains(className)) {
    console.warn(
      `[Cascade Motion] Warning: Animation class '${className}' is being applied twice to the same element.\n` +
      `This may cause animations to run multiple times.\n` +
      `Element:`, element,
      `\n` +
      `To fix this:\n` +
      `- Ensure the class is only applied once\n` +
      `- Check if MotionStage is applying the class automatically\n` +
      `- Remove any manual class application if using MotionStage\n` +
      `See: https://cascade.docs/how-to/inject-animation-css`
    );
  }
}

/**
 * Warn about missing CSS for animation class
 */
export function warnMissingCSS(className: string, element: HTMLElement | null): void {
  if (!areWarningsEnabled()) return;
  
  // Check if CSS is injected by looking for style element
  const styleId = `motion-style-${className}`;
  const styleElement = document.getElementById(styleId);
  
  if (!styleElement && element) {
    console.warn(
      `[Cascade Motion] Warning: Animation class '${className}' is applied but CSS is not injected.\n` +
      `The animation will not work without the CSS.\n` +
      `Element:`, element,
      `\n` +
      `To fix this:\n` +
      `- If using MotionStage, ensure you pass both className and css: animation={{ className, css }}\n` +
      `- If using className directly, call useMotionStyles([animation]) to inject CSS\n` +
      `- Check that defineMotion() was called correctly\n` +
      `See: https://cascade.docs/how-to/inject-animation-css`
    );
  }
}

/**
 * Warn about conflicting transform properties
 */
export function warnConflictingTransform(
  element: HTMLElement | null,
  existingTransform: string | null,
  newTransform: string
): void {
  if (!areWarningsEnabled()) return;
  
  if (existingTransform && existingTransform !== 'none' && existingTransform !== newTransform) {
    console.warn(
      `[Cascade Motion] Warning: Conflicting transform properties detected.\n` +
      `Existing transform: ${existingTransform}\n` +
      `New transform: ${newTransform}\n` +
      `Element:`, element,
      `\n` +
      `To fix this:\n` +
      `- Use a single motion value for transforms (e.g., useTranslateX, useTranslateY)\n` +
      `- Combine transforms into a single transform string\n` +
      `- Avoid mixing CSS animations with motion value transforms\n` +
      `See: https://cascade.docs/how-to/animation-timing-considerations`
    );
  }
}

/**
 * Warn about invalid animation configuration
 */
export function warnInvalidAnimationConfig(
  config: unknown,
  reason: string
): void {
  if (!areWarningsEnabled()) return;
  
  console.warn(
    `[Cascade Motion] Warning: Invalid animation configuration.\n` +
    `Reason: ${reason}\n` +
    `Config:`, config,
    `\n` +
    `To fix this:\n` +
    `- Check that all required properties are provided\n` +
    `- Ensure property values are valid (e.g., duration is a number or string)\n` +
    `- Verify easing functions are valid\n` +
    `See: https://cascade.docs/reference/sequences`
  );
}

/**
 * Warn about motion value misuse
 */
export function warnMotionValueMisuse(
  hookName: string,
  context: string,
  suggestion?: string
): void {
  if (!areWarningsEnabled()) return;
  
  const message = `[Cascade Motion] Warning: ${hookName} may be misused.\n` +
    `Context: ${context}`;
  
  const suggestionText = suggestion 
    ? `\n\nTo fix this:\n${suggestion}`
    : '';
  
  console.warn(message + suggestionText);
}

/**
 * Warn about animation class applied without MotionStage
 */
export function warnDirectClassUsage(className: string, element: HTMLElement | null): void {
  if (!areWarningsEnabled()) return;
  
  console.warn(
    `[Cascade Motion] Warning: Animation class '${className}' is applied directly without MotionStage.\n` +
    `Element:`, element,
    `\n` +
    `Considerations:\n` +
    `- Ensure CSS is injected using useMotionStyles()\n` +
    `- Consider using MotionStage for automatic CSS injection\n` +
    `- Direct class usage requires manual CSS injection\n` +
    `See: https://cascade.docs/how-to/inject-animation-css`
  );
}

/**
 * Warn about potential performance issue
 */
export function warnPerformanceIssue(
  issue: string,
  suggestion: string
): void {
  if (!areWarningsEnabled()) return;
  
  console.warn(
    `[Cascade Motion] Performance Warning: ${issue}\n` +
    `\n` +
    `Suggestion: ${suggestion}\n` +
    `See: https://cascade.docs/how-to/optimize-performance`
  );
}


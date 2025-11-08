/**
 * Context-aware error messages with actionable guidance
 * Provides helpful error messages with links to documentation
 */

const DOCS_BASE_URL = 'https://cascade.docs';

/**
 * Error codes for searchability
 */
export enum ErrorCode {
  INVALID_HOOK_CALL = 'CASCADE_MOTION_001',
  HOOK_CALLED_IN_CALLBACK = 'CASCADE_MOTION_002',
  HOOK_CALLED_CONDITIONALLY = 'CASCADE_MOTION_003',
  INVALID_MOTION_VALUE = 'CASCADE_MOTION_004',
  INVALID_ANIMATION_CONFIG = 'CASCADE_MOTION_005',
  MISSING_REQUIRED_PROP = 'CASCADE_MOTION_006',
  INVALID_PROP_TYPE = 'CASCADE_MOTION_007',
  ANIMATION_NOT_FOUND = 'CASCADE_MOTION_008',
}

/**
 * Create a formatted error message with context and guidance
 */
function createError(
  code: ErrorCode,
  message: string,
  context?: string,
  guidance?: string,
  docsLink?: string
): Error {
  let errorMessage = `[Cascade Motion] Error ${code}: ${message}`;
  
  if (context) {
    errorMessage += `\n\nContext: ${context}`;
  }
  
  if (guidance) {
    errorMessage += `\n\nTo fix this:\n${guidance}`;
  }
  
  if (docsLink) {
    errorMessage += `\n\nSee: ${DOCS_BASE_URL}${docsLink}`;
  }
  
  const error = new Error(errorMessage);
  (error as any).code = code;
  return error;
}

/**
 * Invalid hook call error
 */
export function createInvalidHookCallError(
  hookName: string,
  location: string
): Error {
  return createError(
    ErrorCode.INVALID_HOOK_CALL,
    `Invalid hook call: ${hookName} called ${location}`,
    `Hooks must be called at the top level of a function component, not inside loops, conditions, or nested functions.`,
    `- Move ${hookName} to the top level of your component\n` +
    `- Ensure it's not inside useEffect, useCallback, or other hooks\n` +
    `- Don't call hooks conditionally (e.g., inside if statements)\n` +
    `- Don't call hooks inside loops or event handlers`,
    '/guides/hooks-rules'
  );
}

/**
 * Hook called in callback error
 */
export function createHookInCallbackError(
  hookName: string,
  callbackName: string
): Error {
  return createError(
    ErrorCode.HOOK_CALLED_IN_CALLBACK,
    `${hookName} called inside ${callbackName}`,
    `Hooks cannot be called inside callbacks, event handlers, or other functions.`,
    `- Move ${hookName} to the top level of your component\n` +
    `- Use the hook's return value in your callback instead\n` +
    `- Consider using useCallback to memoize callbacks that use hook values`,
    '/guides/hooks-rules'
  );
}

/**
 * Hook called conditionally error
 */
export function createHookConditionalError(
  hookName: string
): Error {
  return createError(
    ErrorCode.HOOK_CALLED_CONDITIONALLY,
    `${hookName} called conditionally`,
    `Hooks must be called in the same order on every render.`,
    `- Move ${hookName} outside of any conditional statements\n` +
    `- Use conditional logic inside the hook or its return value instead\n` +
    `- Ensure all hooks are called in the same order every render`,
    '/guides/hooks-rules'
  );
}

/**
 * Invalid motion value error
 */
export function createInvalidMotionValueError(
  value: unknown,
  expectedType: string
): Error {
  return createError(
    ErrorCode.INVALID_MOTION_VALUE,
    `Invalid motion value: expected ${expectedType}, got ${typeof value}`,
    `Motion values must be of the correct type for the property being animated.`,
    `- Check that the value type matches the property (number for opacity, string for colors, etc.)\n` +
    `- Ensure the value is not null or undefined\n` +
    `- Verify the motion value was created correctly`,
    '/reference/motion-values'
  );
}

/**
 * Invalid animation config error
 */
export function createInvalidAnimationConfigError(
  config: unknown,
  reason: string
): Error {
  return createError(
    ErrorCode.INVALID_ANIMATION_CONFIG,
    `Invalid animation configuration: ${reason}`,
    `Animation configurations must follow the correct format.`,
    `- Check that all required properties are provided\n` +
    `- Ensure property values are valid (e.g., duration is a number or string)\n` +
    `- Verify easing functions are valid CSS easing values\n` +
    `- Check that from/to values are valid for the property type`,
    '/reference/sequences'
  );
}

/**
 * Missing required property error
 */
export function createMissingPropertyError(
  property: string,
  context: string
): Error {
  return createError(
    ErrorCode.MISSING_REQUIRED_PROP,
    `Missing required property: ${property}`,
    `The ${property} property is required in this context.`,
    `- Provide the ${property} property\n` +
    `- Check the API documentation for required properties\n` +
    `- Ensure all required props are passed correctly`,
    context ? `/reference/${context}` : '/reference'
  );
}

/**
 * Invalid property type error
 */
export function createInvalidPropertyTypeError(
  property: string,
  expectedType: string,
  actualType: string
): Error {
  return createError(
    ErrorCode.INVALID_PROP_TYPE,
    `Invalid type for property ${property}: expected ${expectedType}, got ${actualType}`,
    `The ${property} property must be of type ${expectedType}.`,
    `- Check the type of the ${property} value\n` +
    `- Ensure it matches the expected type\n` +
    `- Convert the value to the correct type if needed`,
    '/reference/types'
  );
}

/**
 * Animation not found error
 */
export function createAnimationNotFoundError(
  className: string
): Error {
  return createError(
    ErrorCode.ANIMATION_NOT_FOUND,
    `Animation with class name '${className}' not found`,
    `The animation CSS may not be injected, or the class name is incorrect.`,
    `- Ensure CSS is injected using useMotionStyles() or MotionStage\n` +
    `- Check that the animation was created with defineMotion()\n` +
    `- Verify the className matches the animation definition\n` +
    `- Check that the CSS is injected before the class is applied`,
    '/how-to/inject-animation-css'
  );
}

/**
 * Helper to get error code from error
 */
export function getErrorCode(error: Error): ErrorCode | undefined {
  return (error as any).code;
}

/**
 * Helper to check if error is a Cascade Motion error
 */
export function isCascadeMotionError(error: Error): boolean {
  return error.message.includes('[Cascade Motion]') || getErrorCode(error) !== undefined;
}


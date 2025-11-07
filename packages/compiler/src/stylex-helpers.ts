/**
 * StyleX integration helpers
 * Re-export StyleX utilities for use in components
 * 
 * Note: stylex.create() must be called at the top level of modules,
 * not inside functions, for the Babel plugin to work correctly.
 */

import * as stylex from '@stylexjs/stylex';
import { isLayoutTriggering } from '@cascade/core';

/**
 * Re-export StyleX utilities
 * Components should use stylex.create() directly at the module level
 */
export { stylex };
export const props = stylex.props;
export type StyleXStyles = stylex.StyleXStyles;

/**
 * Helper to check if a property triggers layout (for warnings)
 * This can be called at runtime to warn developers
 */
export function checkLayoutTriggering(property: string): boolean {
  return isLayoutTriggering(property);
}


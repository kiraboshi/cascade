/**
 * Debug utility for gating console output
 * Only logs in development mode
 * Supports granular control of debug categories
 */

const __DEV__ = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

// Debug category flags
const debugCategories: Record<string, boolean> = {
  motionValue: false,        // Motion value operations (set, animateTo, etc.)
  animationTimeline: false,  // Animation timeline operations
  animatePresence: false,    // AnimatePresence operations
  viewportAnimation: false,  // Viewport animation operations
  layoutTransition: false,   // Layout transition operations
  default: false,            // Default/uncategorized logs
};

/**
 * Enable debug logging for specific categories
 * @param categories - Category names to enable (or 'all' for everything)
 */
export function enableDebugLogging(categories: string | string[] = 'all'): void {
  if (!__DEV__) return;
  
  const cats = Array.isArray(categories) ? categories : [categories];
  
  if (cats.includes('all')) {
    Object.keys(debugCategories).forEach(key => {
      debugCategories[key] = true;
    });
  } else {
    cats.forEach(cat => {
      if (cat in debugCategories) {
        debugCategories[cat] = true;
      }
    });
  }
}

/**
 * Disable debug logging for specific categories
 * @param categories - Category names to disable (or 'all' for everything)
 */
export function disableDebugLogging(categories: string | string[] = 'all'): void {
  if (!__DEV__) return;
  
  const cats = Array.isArray(categories) ? categories : [categories];
  
  if (cats.includes('all')) {
    Object.keys(debugCategories).forEach(key => {
      debugCategories[key] = false;
    });
  } else {
    cats.forEach(cat => {
      if (cat in debugCategories) {
        debugCategories[cat] = false;
      }
    });
  }
}

/**
 * Check if a debug category is enabled
 */
export function isDebugCategoryEnabled(category: string): boolean {
  return __DEV__ && (debugCategories[category] || debugCategories.default);
}

/**
 * Get all enabled debug categories
 */
export function getEnabledDebugCategories(): string[] {
  return Object.entries(debugCategories)
    .filter(([_, enabled]) => enabled)
    .map(([category]) => category);
}

/**
 * Log debug message with category
 */
export function debugLog(prefix: string, category: string = 'default', ...args: unknown[]): void {
  if (isDebugCategoryEnabled(category)) {
    console.log(`[${prefix}]`, ...args);
  }
}

/**
 * Warn debug message with category
 */
export function debugWarn(prefix: string, category: string = 'default', ...args: unknown[]): void {
  if (isDebugCategoryEnabled(category)) {
    console.warn(`[${prefix}]`, ...args);
  }
}

/**
 * Error debug message (always shown in dev mode)
 */
export function debugError(prefix: string, ...args: unknown[]): void {
  if (__DEV__) {
    console.error(`[${prefix}]`, ...args);
  }
}


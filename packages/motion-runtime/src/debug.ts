/**
 * Debug utility for gating console output
 * Only logs in development mode
 */

const DEBUG = process.env.NODE_ENV === 'development';

export function debugLog(prefix: string, ...args: unknown[]): void {
  if (DEBUG) {
    console.log(`[${prefix}]`, ...args);
  }
}

export function debugWarn(prefix: string, ...args: unknown[]): void {
  if (DEBUG) {
    console.warn(`[${prefix}]`, ...args);
  }
}


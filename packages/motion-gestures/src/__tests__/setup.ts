/**
 * Test setup for motion-gestures package
 */

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Polyfill PointerEvent for jsdom
if (typeof PointerEvent === 'undefined') {
  global.PointerEvent = class PointerEvent extends MouseEvent {
    pointerId: number;
    constructor(type: string, init?: PointerEventInit) {
      super(type, init as MouseEventInit);
      this.pointerId = init?.pointerId ?? 0;
    }
  } as any;
}

// Polyfill setPointerCapture and related methods for jsdom
HTMLElement.prototype.setPointerCapture = function(pointerId: number) {
  // Mock implementation for testing
  (this as any)._pointerCapture = pointerId;
};

HTMLElement.prototype.releasePointerCapture = function(pointerId: number) {
  // Mock implementation for testing
  delete (this as any)._pointerCapture;
};

HTMLElement.prototype.hasPointerCapture = function(pointerId: number): boolean {
  // Mock implementation for testing
  return (this as any)._pointerCapture === pointerId;
};

// Cleanup after each test
afterEach(() => {
  cleanup();
});


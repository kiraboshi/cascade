/**
 * Test setup for motion-runtime
 */

import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Setup jsdom environment for DOM testing

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  return setTimeout(callback, 16);
}) as any;

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
}) as any;

// Mock window.scrollX and window.scrollY
Object.defineProperty(window, 'scrollX', {
  writable: true,
  value: 0,
});

Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
});

Object.defineProperty(window, 'pageXOffset', {
  writable: true,
  value: 0,
});

Object.defineProperty(window, 'pageYOffset', {
  writable: true,
  value: 0,
});

// Mock window.matchMedia for prefers-reduced-motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock AnimationEvent for jsdom
if (typeof AnimationEvent === 'undefined') {
  (global as any).AnimationEvent = class AnimationEvent extends Event {
    animationName: string;
    elapsedTime: number;
    pseudoElement: string;
    
    constructor(type: string, eventInitDict?: AnimationEventInit) {
      super(type, eventInitDict);
      this.animationName = eventInitDict?.animationName || '';
      this.elapsedTime = eventInitDict?.elapsedTime || 0;
      this.pseudoElement = eventInitDict?.pseudoElement || '';
    }
  };
}

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});


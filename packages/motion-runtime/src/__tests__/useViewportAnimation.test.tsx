/**
 * Unit tests for useViewportAnimation hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useViewportAnimationWithRef } from '../useViewportAnimation';
import { useMotionValue } from '../useMotionValue';
import { useInView } from '../useInView';

// Mock IntersectionObserver (reuse from useInView.test.tsx)
class MockIntersectionObserver implements IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  
  private callback: IntersectionObserverCallback;
  private observedElements: Element[] = [];
  
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.root = options?.root || null;
    this.rootMargin = options?.rootMargin || '0px';
    this.thresholds = Array.isArray(options?.threshold) 
      ? options.threshold 
      : [options?.threshold ?? 0];
  }
  
  observe(element: Element): void {
    this.observedElements.push(element);
  }
  
  unobserve(element: Element): void {
    const index = this.observedElements.indexOf(element);
    if (index > -1) {
      this.observedElements.splice(index, 1);
    }
  }
  
  disconnect(): void {
    this.observedElements = [];
  }
  
  simulateIntersection(element: Element, isIntersecting: boolean, intersectionRatio: number = 1): void {
    if (!this.observedElements.includes(element)) return;
    
    const entry: IntersectionObserverEntry = {
      boundingClientRect: element.getBoundingClientRect(),
      intersectionRatio,
      intersectionRect: element.getBoundingClientRect(),
      isIntersecting,
      rootBounds: this.root?.getBoundingClientRect() || null,
      target: element,
      time: Date.now(),
    };
    
    this.callback([entry], this);
  }
  
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

describe('useViewportAnimationWithRef Hook', () => {
  let mockObserver: MockIntersectionObserver | null = null;
  
  beforeEach(() => {
    vi.useFakeTimers();
    global.IntersectionObserver = MockIntersectionObserver as any;
    mockObserver = null;
    
    const originalObserver = MockIntersectionObserver;
    global.IntersectionObserver = class extends originalObserver {
      constructor(...args: any[]) {
        super(...args);
        mockObserver = this as any;
      }
    } as any;
  });
  
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });
  
  it('should set initial value', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    const ref = { current: element };
    
    const { result: motionValueResult } = renderHook(() => useMotionValue(1));
    const opacity = motionValueResult.current;
    
    renderHook(() => useViewportAnimationWithRef(ref, opacity, {
      initial: 0,
      onEnter: { target: 1 },
    }));
    
    // Initial value should be set
    expect(opacity.get()).toBe(0);
    
    document.body.removeChild(element);
  });
  
  it('should animate on enter', async () => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    const ref = { current: element };
    
    const { result: motionValueResult } = renderHook(() => useMotionValue(0));
    const opacity = motionValueResult.current;
    
    const animateToSpy = vi.spyOn(opacity, 'animateTo');
    
    renderHook(() => useViewportAnimationWithRef(ref, opacity, {
      initial: 0,
      onEnter: {
        target: 1,
        config: { duration: 300 },
      },
    }));
    
    // Simulate element entering viewport
    act(() => {
      if (mockObserver) {
        mockObserver.simulateIntersection(element, true);
      }
    });
    
    // Wait for effects to run
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    
    expect(animateToSpy).toHaveBeenCalledWith(1, { duration: 300 });
    
    document.body.removeChild(element);
  });
  
  it('should animate on exit when onExit is provided', async () => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    const ref = { current: element };
    
    const { result: motionValueResult } = renderHook(() => useMotionValue(1));
    const opacity = motionValueResult.current;
    
    const animateToSpy = vi.spyOn(opacity, 'animateTo');
    
    renderHook(() => useViewportAnimationWithRef(ref, opacity, {
      initial: 1,
      onEnter: { target: 1 },
      onExit: {
        target: 0,
        config: { duration: 200 },
      },
    }));
    
    // First enter viewport
    act(() => {
      if (mockObserver) {
        mockObserver.simulateIntersection(element, true);
      }
    });
    
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    
    // Then leave viewport
    act(() => {
      if (mockObserver) {
        mockObserver.simulateIntersection(element, false);
      }
    });
    
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    
    expect(animateToSpy).toHaveBeenCalledWith(0, { duration: 200 });
    
    document.body.removeChild(element);
  });
  
  it('should respect once option', async () => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    const ref = { current: element };
    
    const { result: motionValueResult } = renderHook(() => useMotionValue(0));
    const opacity = motionValueResult.current;
    
    const animateToSpy = vi.spyOn(opacity, 'animateTo');
    
    renderHook(() => useViewportAnimationWithRef(ref, opacity, {
      initial: 0,
      once: true,
      onEnter: {
        target: 1,
        config: { duration: 300 },
      },
    }));
    
    // Enter viewport first time
    act(() => {
      if (mockObserver) {
        mockObserver.simulateIntersection(element, true);
      }
    });
    
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    
    const firstCallCount = animateToSpy.mock.calls.length;
    
    // Leave and re-enter
    act(() => {
      if (mockObserver) {
        mockObserver.simulateIntersection(element, false);
      }
    });
    
    act(() => {
      if (mockObserver) {
        mockObserver.simulateIntersection(element, true);
      }
    });
    
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    
    // Should not animate again with once: true
    expect(animateToSpy.mock.calls.length).toBe(firstCallCount);
    
    document.body.removeChild(element);
  });
  
  it('should allow re-animation when once is false', async () => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    const ref = { current: element };
    
    const { result: motionValueResult } = renderHook(() => useMotionValue(0));
    const opacity = motionValueResult.current;
    
    const animateToSpy = vi.spyOn(opacity, 'animateTo');
    
    renderHook(() => useViewportAnimationWithRef(ref, opacity, {
      initial: 0,
      once: false,
      onEnter: {
        target: 1,
        config: { duration: 300 },
      },
    }));
    
    // Enter viewport first time
    act(() => {
      if (mockObserver) {
        mockObserver.simulateIntersection(element, true);
      }
    });
    
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    
    const firstCallCount = animateToSpy.mock.calls.length;
    
    // Leave and re-enter
    act(() => {
      if (mockObserver) {
        mockObserver.simulateIntersection(element, false);
      }
    });
    
    act(() => {
      if (mockObserver) {
        mockObserver.simulateIntersection(element, true);
      }
    });
    
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    
    // Should animate again with once: false
    expect(animateToSpy.mock.calls.length).toBeGreaterThan(firstCallCount);
    
    document.body.removeChild(element);
  });
  
  it('should handle null element ref gracefully', () => {
    const ref = { current: null };
    const { result: motionValueResult } = renderHook(() => useMotionValue(0));
    const opacity = motionValueResult.current;
    
    expect(() => {
      renderHook(() => useViewportAnimationWithRef(ref, opacity, {
        initial: 0,
        onEnter: { target: 1 },
      }));
    }).not.toThrow();
  });
});


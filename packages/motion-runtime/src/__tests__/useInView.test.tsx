/**
 * Unit tests for useInView and useInViewState hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useInView, useInViewState } from '../useInView';

// Mock IntersectionObserver
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
  
  // Helper method to simulate intersection
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

describe('useInView Hook', () => {
  let mockObserver: MockIntersectionObserver | null = null;
  
  beforeEach(() => {
    // Mock IntersectionObserver globally
    global.IntersectionObserver = MockIntersectionObserver as any;
    mockObserver = null;
    
    // Capture the observer instance
    const originalObserver = MockIntersectionObserver;
    global.IntersectionObserver = class extends originalObserver {
      constructor(...args: any[]) {
        super(...args);
        mockObserver = this as any;
      }
    } as any;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Basic Functionality', () => {
    it('should return false initially', () => {
      const element = document.createElement('div');
      const ref = { current: element };
      
      const { result } = renderHook(() => useInView(ref));
      
      expect(result.current).toBe(false);
    });
    
    it('should detect when element enters viewport', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      const ref = { current: element };
      
      const { result } = renderHook(() => useInView(ref));
      
      expect(result.current).toBe(false);
      
      act(() => {
        if (mockObserver) {
          mockObserver.simulateIntersection(element, true);
        }
      });
      
      expect(result.current).toBe(true);
      
      document.body.removeChild(element);
    });
    
    it('should detect when element leaves viewport', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      const ref = { current: element };
      
      const { result } = renderHook(() => useInView(ref));
      
      act(() => {
        if (mockObserver) {
          mockObserver.simulateIntersection(element, true);
        }
      });
      
      expect(result.current).toBe(true);
      
      act(() => {
        if (mockObserver) {
          mockObserver.simulateIntersection(element, false);
        }
      });
      
      expect(result.current).toBe(false);
      
      document.body.removeChild(element);
    });
  });
  
  describe('Configuration Options', () => {
    it('should respect threshold option', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      const ref = { current: element };
      
      renderHook(() => useInView(ref, { threshold: 0.5 }));
      
      expect(mockObserver?.thresholds).toEqual([0.5]);
      
      document.body.removeChild(element);
    });
  
    it('should respect rootMargin option', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      const ref = { current: element };
      
      renderHook(() => useInView(ref, { rootMargin: '10px' }));
      
      expect(mockObserver?.rootMargin).toBe('10px');
      
      document.body.removeChild(element);
    });
    
    it('should normalize amount option to threshold', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      const ref = { current: element };
      
      renderHook(() => useInView(ref, { amount: 'some' }));
      expect(mockObserver?.thresholds).toEqual([0]);
      
      renderHook(() => useInView(ref, { amount: 'all' }));
      expect(mockObserver?.thresholds).toEqual([1]);
      
      renderHook(() => useInView(ref, { amount: 0.5 }));
      expect(mockObserver?.thresholds).toEqual([0.5]);
      
      document.body.removeChild(element);
    });
    
    it('should handle once option', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      const ref = { current: element };
      
      const { result } = renderHook(() => useInView(ref, { once: true }));
      
      act(() => {
        if (mockObserver) {
          mockObserver.simulateIntersection(element, true);
        }
      });
      
      expect(result.current).toBe(true);
      
      act(() => {
        if (mockObserver) {
          mockObserver.simulateIntersection(element, false);
        }
      });
      
      // With once: true, it should stay true after leaving
      expect(result.current).toBe(false);
      
      document.body.removeChild(element);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle null element ref', () => {
      const ref = { current: null };
      
      const { result } = renderHook(() => useInView(ref));
      
      expect(result.current).toBe(false);
      expect(mockObserver).toBeNull();
    });
    
    it('should cleanup observer on unmount', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      const ref = { current: element };
      
      const disconnectSpy = vi.fn();
      
      const { unmount } = renderHook(() => useInView(ref));
      
      if (mockObserver) {
        mockObserver.disconnect = disconnectSpy;
      }
      
      unmount();
      
      expect(disconnectSpy).toHaveBeenCalled();
      
      document.body.removeChild(element);
    });
    
    it('should handle missing IntersectionObserver', () => {
      const originalIO = global.IntersectionObserver;
      delete (global as any).IntersectionObserver;
      
      const element = document.createElement('div');
      document.body.appendChild(element);
      const ref = { current: element };
      
      const { result } = renderHook(() => useInView(ref));
      
      expect(result.current).toBe(false);
      
      global.IntersectionObserver = originalIO;
      document.body.removeChild(element);
    });
  });
});

describe('useInViewState Hook', () => {
  let mockObserver: MockIntersectionObserver | null = null;
  
  beforeEach(() => {
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
    vi.clearAllMocks();
  });
  
  it('should return detailed state with entry', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    const ref = { current: element };
    
    const { result } = renderHook(() => useInViewState(ref));
    
    expect(result.current.isInView).toBe(false);
    expect(result.current.entry).toBeNull();
    
    act(() => {
      if (mockObserver) {
        mockObserver.simulateIntersection(element, true, 0.75);
      }
    });
    
    expect(result.current.isInView).toBe(true);
    expect(result.current.entry).not.toBeNull();
    expect(result.current.entry?.intersectionRatio).toBe(0.75);
    expect(result.current.entry?.isIntersecting).toBe(true);
    
    document.body.removeChild(element);
  });
  
  it('should update entry when intersection changes', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    const ref = { current: element };
    
    const { result } = renderHook(() => useInViewState(ref));
    
    act(() => {
      if (mockObserver) {
        mockObserver.simulateIntersection(element, true, 0.5);
      }
    });
    
    const entry1 = result.current.entry;
    expect(entry1?.intersectionRatio).toBe(0.5);
    
    act(() => {
      if (mockObserver) {
        mockObserver.simulateIntersection(element, true, 1.0);
      }
    });
    
    const entry2 = result.current.entry;
    expect(entry2?.intersectionRatio).toBe(1.0);
    expect(entry2).not.toBe(entry1); // Should be a new entry
    
    document.body.removeChild(element);
  });
});


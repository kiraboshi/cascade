/**
 * Integration tests for MotionValue Phase 2 features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createMotionValue } from '../motion-value';
import { useMotionValue } from '../useMotionValue';
import { useTranslateX, useTranslateY } from '../useMotionValueHelpers';

describe('MotionValue Integration Tests', () => {
  let container: HTMLElement;
  let element1: HTMLElement;
  let element2: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element1 = document.createElement('div');
    element1.id = 'element1';
    container.appendChild(element1);

    element2 = document.createElement('div');
    element2.id = 'element2';
    container.appendChild(element2);
  });

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    vi.clearAllMocks();
  });

  describe('CSS Variable Updates', () => {
    it('should update CSS variables in DOM', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element: element1 });
      
      act(() => {
        x.set(100);
      });

      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          const cssVar = element1.style.getPropertyValue(x.cssVarName);
          expect(cssVar).toBe('translateX(100px)');
          resolve();
        });
      });
    });

    it('should update global CSS variables when no element specified', () => {
      const opacity = createMotionValue({ initialValue: 1, property: 'opacity' });
      
      act(() => {
        opacity.set(0.5);
      });

      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          const cssVar = getComputedStyle(document.documentElement).getPropertyValue(opacity.cssVarName);
          expect(cssVar.trim()).toBe('0.5');
          resolve();
        });
      });
    });
  });

  describe('Multiple Transform Values', () => {
    it('should combine multiple transform values on same element', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element: element1 });
      const y = createMotionValue({ initialValue: 0, property: 'y', unit: 'px', element: element1 });
      const rotate = createMotionValue({ initialValue: 0, property: 'rotate', unit: 'deg', element: element1 });

      act(() => {
        x.set(100);
        y.set(50);
        rotate.set(45);
      });

      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const transformVar = element1.style.getPropertyValue(
              '--motion-transform-' + element1.dataset.motionElementId
            );
            expect(transformVar).toContain('translate3d(100px, 50px, 0px)');
            expect(transformVar).toContain('rotate(45deg)');
            resolve();
          });
        });
      });
    });

    it('should handle transform values on different elements independently', () => {
      const x1 = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element: element1 });
      const x2 = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element: element2 });

      act(() => {
        x1.set(100);
        x2.set(200);
      });

      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const var1 = element1.style.getPropertyValue('--motion-transform-' + element1.dataset.motionElementId);
            const var2 = element2.style.getPropertyValue('--motion-transform-' + element2.dataset.motionElementId);
            
            expect(var1).toContain('100px');
            expect(var2).toContain('200px');
            resolve();
          });
        });
      });
    });
  });

  describe('React Hook Integration', () => {
    it('should work with React hooks and update DOM', () => {
      const { result } = renderHook(() => {
        const element = document.createElement('div');
        container.appendChild(element);
        return useTranslateX(0, { element });
      });

      act(() => {
        result.current.set(150);
      });

      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          const cssVar = container.lastElementChild?.getAttribute('style');
          expect(cssVar).toBeTruthy();
          resolve();
        });
      });
    });

    it('should batch updates from multiple hooks', () => {
      const { result: result1 } = renderHook(() => useTranslateX(0));
      const { result: result2 } = renderHook(() => useTranslateY(0));

      act(() => {
        result1.current.set(100);
        result2.current.set(50);
      });

      expect(result1.current.get()).toBe(100);
      expect(result2.current.get()).toBe(50);
    });
  });

  describe('Spring Animation Integration', () => {
    it('should animate with spring physics', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element: element1 });
      
      await act(async () => {
        await x.animateTo(100, {
          stiffness: 300,
          damping: 20,
          mass: 1,
          from: 0,
          to: 100,
          duration: 100,
        });
      });

      // Should be close to target (within 1px)
      expect(x.get()).toBeGreaterThan(99);
      expect(x.get()).toBeLessThanOrEqual(100);
    });

    it('should set will-change during animation', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element: element1 });
      
      const animationPromise = x.animateTo(100, {
        stiffness: 300,
        damping: 20,
        mass: 1,
        from: 0,
        to: 100,
        duration: 100,
      });

      // Check will-change is set
      expect(element1.style.willChange).toBe('transform, opacity');

      await act(async () => {
        await animationPromise;
      });

      // Will-change should be cleaned up after delay
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(element1.style.willChange).toBe('');
          resolve();
        }, 1100);
      });
    });
  });

  describe('Performance with Rapid Updates', () => {
    it('should handle rapid updates efficiently', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      
      // Rapid updates
      for (let i = 0; i < 100; i++) {
        x.set(i);
      }

      // Should eventually reach final value
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(x.get()).toBe(99);
    });

    it('should batch CSS variable updates', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element: element1 });
      const setPropertySpy = vi.spyOn(element1.style, 'setProperty');

      // Multiple rapid updates
      x.set(10);
      x.set(20);
      x.set(30);

      // Should batch updates
      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          // Should have been called, but batched
          expect(setPropertySpy).toHaveBeenCalled();
          resolve();
        });
      });
    });
  });

  describe('Combined Transform CSS Variable Usage', () => {
    it('should generate usable CSS variable for transform', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element: element1 });
      const y = createMotionValue({ initialValue: 0, property: 'y', unit: 'px', element: element1 });

      act(() => {
        x.set(100);
        y.set(50);
      });

      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const transformVarName = '--motion-transform-' + element1.dataset.motionElementId;
            const transformValue = element1.style.getPropertyValue(transformVarName);
            
            // Should be a valid transform string
            expect(transformValue).toContain('translate3d');
            expect(transformValue).toMatch(/translate3d\(100px,\s*50px,\s*0px\)/);
            resolve();
          });
        });
      });
    });
  });
});


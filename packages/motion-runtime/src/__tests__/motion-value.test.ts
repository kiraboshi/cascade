/**
 * Unit tests for MotionValue API (Phase 2 features)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMotionValue, type MotionValue, type MotionValueConfig } from '../motion-value';

describe('MotionValue - Phase 2 Features', () => {
  let container: HTMLElement;
  let element: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('div');
    container.appendChild(element);
  });

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    vi.clearAllMocks();
  });

  describe('GPU Acceleration Detection', () => {
    it('should detect GPU-accelerated properties', () => {
      const opacity = createMotionValue({ initialValue: 1, property: 'opacity' });
      expect(opacity.isGPUAccelerated).toBe(true);
      expect(opacity.triggersLayout).toBe(false);
    });

    it('should detect layout-triggering properties', () => {
      const width = createMotionValue({ initialValue: 100, property: 'width', unit: 'px' });
      expect(width.triggersLayout).toBe(true);
    });

    it('should warn for layout-triggering properties in dev mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      createMotionValue({ initialValue: 100, property: 'width', unit: 'px' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[MotionValue] Property "width" triggers layout')
      );

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should not warn when warnOnLayoutTrigger is false', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      createMotionValue({
        initialValue: 100,
        property: 'width',
        unit: 'px',
        warnOnLayoutTrigger: false,
      });

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Transform Helpers for Position Properties', () => {
    it('should format x property as translateX transform', () => {
      const x = createMotionValue({ initialValue: 100, property: 'x', unit: 'px' });
      expect(x.getTransformValue()).toBe('translateX(100px)');
    });

    it('should format y property as translateY transform', () => {
      const y = createMotionValue({ initialValue: 50, property: 'y', unit: 'px' });
      expect(y.getTransformValue()).toBe('translateY(50px)');
    });

    it('should format rotate property as rotate transform', () => {
      const rotate = createMotionValue({ initialValue: 45, property: 'rotate', unit: 'deg' });
      expect(rotate.getTransformValue()).toBe('rotate(45deg)');
    });

    it('should format scale property as scale transform', () => {
      const scale = createMotionValue({ initialValue: 1.5, property: 'scale' });
      expect(scale.getTransformValue()).toBe('scale(1.5)');
    });

    it('should use default unit when unit not specified', () => {
      const x = createMotionValue({ initialValue: 100, property: 'x' });
      expect(x.getTransformValue()).toBe('translateX(100px)');
    });

    it('should write transform function to CSS variable', () => {
      const x = createMotionValue({ initialValue: 100, property: 'x', unit: 'px', element });
      
      const cssVar = element.style.getPropertyValue(x.cssVarName);
      expect(cssVar).toBe('translateX(100px)');
    });

    it('should respect transformMode: transform', () => {
      const x = createMotionValue({
        initialValue: 100,
        property: 'x',
        unit: 'px',
        transformMode: 'transform',
      });
      expect(x.getTransformValue()).toBe('translateX(100px)');
    });

    it('should respect transformMode: position', () => {
      const left = createMotionValue({
        initialValue: 100,
        property: 'left',
        unit: 'px',
        transformMode: 'position',
      });
      expect(left.getTransformValue()).toBe('100px');
    });

    it('should handle non-transform properties', () => {
      const opacity = createMotionValue({ initialValue: 0.5, property: 'opacity' });
      expect(opacity.getTransformValue()).toBe('0.5');
    });
  });

  describe('Multi-Transform Support', () => {
    it('should combine multiple transform values on same element', () => {
      const x = createMotionValue({ initialValue: 100, property: 'x', unit: 'px', element });
      const y = createMotionValue({ initialValue: 50, property: 'y', unit: 'px', element });
      const rotate = createMotionValue({ initialValue: 45, property: 'rotate', unit: 'deg', element });

      // Trigger updates
      x.set(200);
      y.set(100);
      rotate.set(90);

      // Wait for RAF to process
      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          const transformVar = element.style.getPropertyValue('--motion-transform-' + element.dataset.motionElementId);
          expect(transformVar).toContain('translate3d');
          expect(transformVar).toContain('rotate');
          resolve();
        });
      });
    });

    it('should create separate transform variables for different elements', () => {
      const element2 = document.createElement('div');
      container.appendChild(element2);

      const x1 = createMotionValue({ initialValue: 100, property: 'x', unit: 'px', element });
      const x2 = createMotionValue({ initialValue: 200, property: 'x', unit: 'px', element: element2 });

      x1.set(150);
      x2.set(250);

      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          const var1 = element.style.getPropertyValue('--motion-transform-' + element.dataset.motionElementId);
          const var2 = element2.style.getPropertyValue('--motion-transform-' + element2.dataset.motionElementId);
          
          expect(var1).toBeTruthy();
          expect(var2).toBeTruthy();
          expect(var1).not.toBe(var2);
          resolve();
        });
      });
    });

    it('should update combined transform when individual values change', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });
      const y = createMotionValue({ initialValue: 0, property: 'y', unit: 'px', element });

      x.set(100);
      y.set(50);

      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          const transformVar = element.style.getPropertyValue('--motion-transform-' + element.dataset.motionElementId);
          expect(transformVar).toContain('100px');
          expect(transformVar).toContain('50px');
          resolve();
        });
      });
    });

    it('should handle scale properties in combined transform', () => {
      const scale = createMotionValue({ initialValue: 1, property: 'scale', element });
      scale.set(1.5);

      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          const transformVar = element.style.getPropertyValue('--motion-transform-' + element.dataset.motionElementId);
          expect(transformVar).toContain('scale(1.5)');
          resolve();
        });
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should debounce rapid non-animated updates', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      const setSpy = vi.spyOn(x, 'set');

      // Rapid updates
      x.set(10);
      x.set(20);
      x.set(30);
      x.set(40);

      // Should batch updates
      await new Promise((resolve) => setTimeout(resolve, 20));
      
      // Verify final value
      expect(x.get()).toBe(40);
    });

    it('should set will-change for GPU-accelerated properties during animation', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });
      
      const animationPromise = x.animateTo(100, {
        stiffness: 300,
        damping: 20,
        mass: 1,
        from: 0,
        to: 100,
        duration: 100,
      });

      expect(element.style.willChange).toBe('transform, opacity');

      return animationPromise.then(() => {
        // will-change should be cleaned up after delay
        return new Promise((resolve) => {
          setTimeout(() => {
            expect(element.style.willChange).toBe('');
            resolve(undefined);
          }, 1100);
        });
      });
    });

    it('should not set will-change for non-GPU-accelerated properties', () => {
      const width = createMotionValue({ initialValue: 100, property: 'width', unit: 'px', element });
      
      width.animateTo(200, {
        stiffness: 300,
        damping: 20,
        mass: 1,
        from: 100,
        to: 200,
        duration: 100,
      });

      expect(element.style.willChange).toBe('');
    });
  });

  describe('Destroy Method', () => {
    it('should clean up transform registry on destroy', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });
      const y = createMotionValue({ initialValue: 0, property: 'y', unit: 'px', element });

      expect(element.dataset.motionElementId).toBeTruthy();

      x.destroy();

      // After destroy, combined transform should update
      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          // y should still work
          y.set(50);
          requestAnimationFrame(() => {
            const transformVar = element.style.getPropertyValue('--motion-transform-' + element.dataset.motionElementId);
            // Should only contain y transform now
            expect(transformVar).not.toContain('100px'); // x value
            resolve();
          });
        });
      });
    });

    it('should stop animations on destroy', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      const stopSpy = vi.spyOn(x, 'stop');

      x.animateTo(100, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 100 });
      x.destroy();

      expect(stopSpy).toHaveBeenCalled();
    });

    it('should clear onChange callbacks on destroy', () => {
      const x = createMotionValue({ initialValue: 0 });
      const callback = vi.fn();
      
      x.onChange(callback);
      x.destroy();
      x.set(100);

      // Callback should not be called after destroy
      expect(callback).not.toHaveBeenCalled();
    });

    it('should clean up will-change on destroy', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });
      
      x.animateTo(100, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 100, duration: 100 });
      x.destroy();

      expect(element.style.willChange).toBe('');
    });
  });

  describe('Basic Functionality (with Phase 2 enhancements)', () => {
    it('should get initial value', () => {
      const mv = createMotionValue({ initialValue: 42 });
      expect(mv.get()).toBe(42);
    });

    it('should set value', () => {
      const mv = createMotionValue({ initialValue: 0 });
      mv.set(100);
      expect(mv.get()).toBe(100);
    });

    it('should create CSS variable', () => {
      const mv = createMotionValue({ initialValue: 0 });
      const varValue = getComputedStyle(document.documentElement).getPropertyValue(mv.cssVarName);
      expect(varValue.trim()).toBe('0');
    });

    it('should fire onChange callbacks', () => {
      const mv = createMotionValue({ initialValue: 0 });
      const callback = vi.fn();
      mv.onChange(callback);

      mv.set(100);

      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          expect(callback).toHaveBeenCalledWith(100);
          resolve();
        });
      });
    });

    it('should handle element-scoped CSS variables', () => {
      const mv = createMotionValue({ initialValue: 50, element });
      const varValue = element.style.getPropertyValue(mv.cssVarName);
      expect(varValue).toBe('50');
    });
  });
});


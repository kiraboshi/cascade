/**
 * Unit tests for MotionValue helper functions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createTranslateX,
  createTranslateY,
  createRotate,
  createScale,
} from '../motion-value-helpers';

describe('MotionValue Helpers', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  describe('createTranslateX', () => {
    it('should create motion value with x property', () => {
      const x = createTranslateX(0);
      expect(x.get()).toBe(0);
      expect(x.getTransformValue()).toBe('translateX(0px)');
    });

    it('should use default initial value of 0', () => {
      const x = createTranslateX();
      expect(x.get()).toBe(0);
    });

    it('should accept config options', () => {
      const element = document.createElement('div');
      container.appendChild(element);
      const x = createTranslateX(100, { element });
      expect(x.get()).toBe(100);
      expect(element.style.getPropertyValue(x.cssVarName)).toBe('translateX(100px)');
    });

    it('should allow setting values', () => {
      const x = createTranslateX(0);
      x.set(200);
      expect(x.get()).toBe(200);
      expect(x.getTransformValue()).toBe('translateX(200px)');
    });
  });

  describe('createTranslateY', () => {
    it('should create motion value with y property', () => {
      const y = createTranslateY(0);
      expect(y.get()).toBe(0);
      expect(y.getTransformValue()).toBe('translateY(0px)');
    });

    it('should use default initial value of 0', () => {
      const y = createTranslateY();
      expect(y.get()).toBe(0);
    });

    it('should accept config options', () => {
      const element = document.createElement('div');
      container.appendChild(element);
      const y = createTranslateY(50, { element });
      expect(y.get()).toBe(50);
      expect(element.style.getPropertyValue(y.cssVarName)).toBe('translateY(50px)');
    });
  });

  describe('createRotate', () => {
    it('should create motion value with rotate property', () => {
      const rotate = createRotate(0);
      expect(rotate.get()).toBe(0);
      expect(rotate.getTransformValue()).toBe('rotate(0deg)');
    });

    it('should use default initial value of 0', () => {
      const rotate = createRotate();
      expect(rotate.get()).toBe(0);
    });

    it('should accept config options', () => {
      const element = document.createElement('div');
      container.appendChild(element);
      const rotate = createRotate(45, { element });
      expect(rotate.get()).toBe(45);
      expect(element.style.getPropertyValue(rotate.cssVarName)).toBe('rotate(45deg)');
    });

    it('should handle rotation values', () => {
      const rotate = createRotate(90);
      rotate.set(180);
      expect(rotate.get()).toBe(180);
      expect(rotate.getTransformValue()).toBe('rotate(180deg)');
    });
  });

  describe('createScale', () => {
    it('should create motion value with scale property', () => {
      const scale = createScale(1);
      expect(scale.get()).toBe(1);
      expect(scale.getTransformValue()).toBe('scale(1)');
    });

    it('should use default initial value of 1', () => {
      const scale = createScale();
      expect(scale.get()).toBe(1);
    });

    it('should accept config options', () => {
      const element = document.createElement('div');
      container.appendChild(element);
      const scale = createScale(1.5, { element });
      expect(scale.get()).toBe(1.5);
      expect(element.style.getPropertyValue(scale.cssVarName)).toBe('scale(1.5)');
    });

    it('should handle scale values without unit', () => {
      const scale = createScale(1);
      scale.set(2);
      expect(scale.get()).toBe(2);
      expect(scale.getTransformValue()).toBe('scale(2)');
    });
  });

  describe('Helper Integration', () => {
    it('should work together for combined transforms', () => {
      const element = document.createElement('div');
      container.appendChild(element);

      const x = createTranslateX(0, { element });
      const y = createTranslateY(0, { element });
      const rotate = createRotate(0, { element });
      const scale = createScale(1, { element });

      x.set(100);
      y.set(50);
      rotate.set(45);
      scale.set(1.5);

      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          const transformVar = element.style.getPropertyValue(
            '--motion-transform-' + element.dataset.motionElementId
          );
          expect(transformVar).toContain('translate3d');
          expect(transformVar).toContain('rotate');
          expect(transformVar).toContain('scale');
          resolve();
        });
      });
    });
  });
});


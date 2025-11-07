/**
 * Unit tests for useMotionValue React hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMotionValue } from '../useMotionValue';
import {
  useTranslateX,
  useTranslateY,
  useRotate,
  useScale,
} from '../useMotionValueHelpers';

describe('useMotionValue Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should create stable reference across renders', () => {
      const { result, rerender } = renderHook(() => useMotionValue(0));
      const mv1 = result.current;
      
      rerender();
      const mv2 = result.current;
      
      expect(mv1).toBe(mv2);
    });

    it('should initialize with initial value', () => {
      const { result } = renderHook(() => useMotionValue(42));
      expect(result.current.get()).toBe(42);
    });

    it('should allow setting values', () => {
      const { result } = renderHook(() => useMotionValue(0));
      
      act(() => {
        result.current.set(100);
      });
      
      expect(result.current.get()).toBe(100);
    });

    it('should cleanup on unmount', () => {
      const { result, unmount } = renderHook(() => useMotionValue(0));
      const destroySpy = vi.spyOn(result.current, 'destroy');
      
      unmount();
      
      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('useTranslateX', () => {
    it('should create translateX motion value', () => {
      const { result } = renderHook(() => useTranslateX(0));
      expect(result.current.get()).toBe(0);
      expect(result.current.getTransformValue()).toBe('translateX(0px)');
    });

    it('should use default initial value of 0', () => {
      const { result } = renderHook(() => useTranslateX());
      expect(result.current.get()).toBe(0);
    });

    it('should accept config options', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      const { result } = renderHook(() => useTranslateX(100, { element }));
      expect(result.current.get()).toBe(100);
      
      document.body.removeChild(element);
    });
  });

  describe('useTranslateY', () => {
    it('should create translateY motion value', () => {
      const { result } = renderHook(() => useTranslateY(0));
      expect(result.current.get()).toBe(0);
      expect(result.current.getTransformValue()).toBe('translateY(0px)');
    });

    it('should use default initial value of 0', () => {
      const { result } = renderHook(() => useTranslateY());
      expect(result.current.get()).toBe(0);
    });
  });

  describe('useRotate', () => {
    it('should create rotate motion value', () => {
      const { result } = renderHook(() => useRotate(0));
      expect(result.current.get()).toBe(0);
      expect(result.current.getTransformValue()).toBe('rotate(0deg)');
    });

    it('should use default initial value of 0', () => {
      const { result } = renderHook(() => useRotate());
      expect(result.current.get()).toBe(0);
    });
  });

  describe('useScale', () => {
    it('should create scale motion value', () => {
      const { result } = renderHook(() => useScale(1));
      expect(result.current.get()).toBe(1);
      expect(result.current.getTransformValue()).toBe('scale(1)');
    });

    it('should use default initial value of 1', () => {
      const { result } = renderHook(() => useScale());
      expect(result.current.get()).toBe(1);
    });
  });

  describe('Hook Integration', () => {
    it('should work with onChange subscriptions', () => {
      const { result } = renderHook(() => useMotionValue(0));
      const callback = vi.fn();
      
      act(() => {
        result.current.onChange(callback);
        result.current.set(100);
      });

      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          expect(callback).toHaveBeenCalledWith(100);
          resolve();
        });
      });
    });

    it('should handle multiple hooks independently', () => {
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
});


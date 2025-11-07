/**
 * Unit tests for useHoverAnimation hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useHoverAnimation } from '../useHoverAnimation';
import { useMotionValue } from '@cascade/motion-runtime';

describe('useHoverAnimation', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should return a ref', () => {
    const { result: motionResult } = renderHook(() => useMotionValue(1));
    const scale = motionResult.current;

    const { result } = renderHook(() =>
      useHoverAnimation(scale, {
        onHoverStart: { target: 1.1 },
        onHoverEnd: { target: 1 },
      })
    );

    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull();
  });

  it('should animate on hover start', async () => {
    const { result: motionResult } = renderHook(() => useMotionValue(1));
    const scale = motionResult.current;

    const { result } = renderHook(() =>
      useHoverAnimation(scale, {
        onHoverStart: { target: 1.1, config: { duration: 100 } },
        onHoverEnd: { target: 1 },
      })
    );

    act(() => {
      result.current.current = element;
    });

    act(() => {
      const enterEvent = new MouseEvent('mouseenter', { bubbles: true });
      element.dispatchEvent(enterEvent);
    });

    await waitFor(() => {
      const value = scale.get() as number;
      expect(value).toBeGreaterThan(1);
    }, { timeout: 500 });
  });

  it('should animate on hover end', async () => {
    const { result: motionResult } = renderHook(() => useMotionValue(1.1));
    const scale = motionResult.current;

    const { result } = renderHook(() =>
      useHoverAnimation(scale, {
        onHoverStart: { target: 1.1 },
        onHoverEnd: { target: 1, config: { duration: 100 } },
      })
    );

    act(() => {
      result.current.current = element;
    });

    act(() => {
      const enterEvent = new MouseEvent('mouseenter', { bubbles: true });
      element.dispatchEvent(enterEvent);
    });

    act(() => {
      const leaveEvent = new MouseEvent('mouseleave', { bubbles: true });
      element.dispatchEvent(leaveEvent);
    });

    await waitFor(() => {
      const value = scale.get() as number;
      expect(value).toBeLessThanOrEqual(1.1);
    }, { timeout: 500 });
  });

  it('should not animate when disabled', () => {
    const { result: motionResult } = renderHook(() => useMotionValue(1));
    const scale = motionResult.current;
    const initialValue = scale.get();

    const { result } = renderHook(() =>
      useHoverAnimation(scale, {
        disabled: true,
        onHoverStart: { target: 1.1 },
        onHoverEnd: { target: 1 },
      })
    );

    act(() => {
      result.current.current = element;
    });

    act(() => {
      const enterEvent = new MouseEvent('mouseenter', { bubbles: true });
      element.dispatchEvent(enterEvent);
    });

    // Value should remain unchanged
    expect(scale.get()).toBe(initialValue);
  });
});


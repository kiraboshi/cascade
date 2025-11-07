/**
 * Unit tests for useFocusAnimation hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFocusAnimation } from '../useFocusAnimation';
import { useMotionValue } from '@cascade/motion-runtime';

describe('useFocusAnimation', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('input');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should return a ref', () => {
    const { result: motionResult } = renderHook(() => useMotionValue(1));
    const scale = motionResult.current;

    const { result } = renderHook(() =>
      useFocusAnimation(scale, {
        onFocusStart: { target: 1.05 },
        onFocusEnd: { target: 1 },
      })
    );

    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull();
  });

  it('should animate on focus start', async () => {
    const { result: motionResult } = renderHook(() => useMotionValue(1));
    const scale = motionResult.current;

    const { result } = renderHook(() =>
      useFocusAnimation(scale, {
        onFocusStart: { target: 1.05, config: { duration: 100 } },
        onFocusEnd: { target: 1 },
      })
    );

    act(() => {
      result.current.current = element;
    });

    act(() => {
      const focusEvent = new FocusEvent('focus', { bubbles: true });
      element.dispatchEvent(focusEvent);
    });

    await waitFor(() => {
      const value = scale.get() as number;
      expect(value).toBeGreaterThan(1);
    }, { timeout: 500 });
  });

  it('should animate on focus end', async () => {
    const { result: motionResult } = renderHook(() => useMotionValue(1.05));
    const scale = motionResult.current;

    const { result } = renderHook(() =>
      useFocusAnimation(scale, {
        onFocusStart: { target: 1.05 },
        onFocusEnd: { target: 1, config: { duration: 100 } },
      })
    );

    act(() => {
      result.current.current = element;
    });

    act(() => {
      const focusEvent = new FocusEvent('focus', { bubbles: true });
      element.dispatchEvent(focusEvent);
    });

    act(() => {
      const blurEvent = new FocusEvent('blur', { bubbles: true });
      element.dispatchEvent(blurEvent);
    });

    await waitFor(() => {
      const value = scale.get() as number;
      expect(value).toBeLessThanOrEqual(1.05);
    }, { timeout: 500 });
  });

  it('should not animate when disabled', () => {
    const { result: motionResult } = renderHook(() => useMotionValue(1));
    const scale = motionResult.current;
    const initialValue = scale.get();

    const { result } = renderHook(() =>
      useFocusAnimation(scale, {
        disabled: true,
        onFocusStart: { target: 1.05 },
        onFocusEnd: { target: 1 },
      })
    );

    act(() => {
      result.current.current = element;
    });

    act(() => {
      const focusEvent = new FocusEvent('focus', { bubbles: true });
      element.dispatchEvent(focusEvent);
    });

    // Value should remain unchanged
    expect(scale.get()).toBe(initialValue);
  });
});


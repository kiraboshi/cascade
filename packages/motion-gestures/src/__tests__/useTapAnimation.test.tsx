/**
 * Unit tests for useTapAnimation hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTapAnimation } from '../useTapAnimation';
import { useMotionValue } from '@cascade/motion-runtime';

describe('useTapAnimation', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('button');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should return a ref', () => {
    const { result: motionResult } = renderHook(() => useMotionValue(1));
    const scale = motionResult.current;

    const { result } = renderHook(() =>
      useTapAnimation(scale, {
        onTapStart: { target: 0.9 },
        onTapEnd: { target: 1 },
      })
    );

    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull();
  });

  it('should animate on tap start', async () => {
    const { result: motionResult } = renderHook(() => useMotionValue(1));
    const scale = motionResult.current;

    const { result } = renderHook(() =>
      useTapAnimation(scale, {
        onTapStart: { target: 0.9, config: { duration: 100 } },
        onTapEnd: { target: 1 },
      })
    );

    act(() => {
      result.current.current = element;
    });

    act(() => {
      const downEvent = new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      });
      element.dispatchEvent(downEvent);
    });

    await waitFor(() => {
      const value = scale.get() as number;
      expect(value).toBeLessThan(1);
    }, { timeout: 500 });
  });

  it('should animate on tap end', async () => {
    const { result: motionResult } = renderHook(() => useMotionValue(0.9));
    const scale = motionResult.current;

    const { result } = renderHook(() =>
      useTapAnimation(scale, {
        onTapStart: { target: 0.9 },
        onTapEnd: { target: 1, config: { duration: 100 } },
      })
    );

    act(() => {
      result.current.current = element;
    });

    act(() => {
      const downEvent = new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      });
      element.dispatchEvent(downEvent);
    });

    act(() => {
      const upEvent = new MouseEvent('mouseup', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      });
      element.dispatchEvent(upEvent);
    });

    await waitFor(() => {
      const value = scale.get() as number;
      expect(value).toBeGreaterThan(0.9);
    }, { timeout: 500 });
  });

  it('should call onTap callback', async () => {
    const { result: motionResult } = renderHook(() => useMotionValue(1));
    const scale = motionResult.current;
    const onTap = vi.fn();

    const { result } = renderHook(() =>
      useTapAnimation(scale, {
        onTapStart: { target: 0.9 },
        onTapEnd: { target: 1 },
        onTap,
      })
    );

    act(() => {
      result.current.current = element;
    });

    act(() => {
      const downEvent = new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      });
      element.dispatchEvent(downEvent);
    });

    act(() => {
      const upEvent = new MouseEvent('mouseup', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      });
      element.dispatchEvent(upEvent);
    });

    await waitFor(() => {
      expect(onTap).toHaveBeenCalledTimes(1);
    });
  });
});


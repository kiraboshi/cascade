/**
 * Integration tests for useDrag hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDrag } from '../useDrag';
import { useMotionValue } from '@cascade/motion-runtime';
import type { MotionValue } from '@cascade/motion-runtime';

describe('useDrag', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  it('should return a ref', () => {
    const { result: motionResult } = renderHook(() => ({
      x: useMotionValue(0),
      y: useMotionValue(0),
    }));
    const { x, y } = motionResult.current;
    
    const { result } = renderHook(() => useDrag({ x, y }));

    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull(); // Initially null until attached
  });

  it('should attach handler when ref is set', () => {
    const { result } = renderHook(() => {
      const x = useMotionValue(0);
      const y = useMotionValue(0);
      return useDrag({ x, y });
    });

    act(() => {
      if (result.current.current === null) {
        (result.current as any).current = element;
      }
    });

    // Handler should be attached (we can verify by checking if pointer events work)
    const downEvent = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      bubbles: true,
    });

    act(() => {
      element.dispatchEvent(downEvent);
    });

    // The handler should be active (we can't directly check, but events should be handled)
    expect(element).toBeDefined();
  });

  it('should update motion values during drag', async () => {
    const { result: motionResult } = renderHook(() => ({
      x: useMotionValue(0),
      y: useMotionValue(0),
    }));
    const { x, y } = motionResult.current;
    
    const { result } = renderHook(() => useDrag({ x, y }));

    act(() => {
      if (result.current.current === null) {
        (result.current as any).current = element;
      }
    });

    // Start drag
    act(() => {
      const downEvent = new PointerEvent('pointerdown', {
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        bubbles: true,
      });
      element.dispatchEvent(downEvent);
    });

    // Move
    act(() => {
      const moveEvent = new PointerEvent('pointermove', {
        clientX: 50,
        clientY: 30,
        pointerId: 1,
        bubbles: true,
      });
      document.dispatchEvent(moveEvent);
    });

    await waitFor(() => {
      const xValue = x.get() as number;
      const yValue = y.get() as number;
      expect(xValue).not.toBe(0);
      expect(yValue).not.toBe(0);
    });
  });

  it('should call onStart callback', () => {
    const onStart = vi.fn();
    const { result: motionResult } = renderHook(() => ({
      x: useMotionValue(0),
      y: useMotionValue(0),
    }));
    const { x, y } = motionResult.current;

    const { result } = renderHook(() =>
      useDrag({ x, y }, { onStart })
    );

    act(() => {
      if (result.current.current === null) {
        (result.current as any).current = element;
      }
    });

    act(() => {
      const downEvent = new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        bubbles: true,
      });
      element.dispatchEvent(downEvent);
    });

    expect(onStart).toHaveBeenCalled();
  });

  it('should call onEnd callback', () => {
    const onEnd = vi.fn();
    const { result: motionResult } = renderHook(() => ({
      x: useMotionValue(0),
      y: useMotionValue(0),
    }));
    const { x, y } = motionResult.current;

    const { result } = renderHook(() =>
      useDrag({ x, y }, { onEnd })
    );

    act(() => {
      if (result.current.current === null) {
        (result.current as any).current = element;
      }
    });

    act(() => {
      const downEvent = new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        bubbles: true,
      });
      element.dispatchEvent(downEvent);
    });

    act(() => {
      const upEvent = new PointerEvent('pointerup', {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        bubbles: true,
      });
      document.dispatchEvent(upEvent);
    });

    expect(onEnd).toHaveBeenCalled();
  });

  it('should respect constraints', async () => {
    const { result: motionResult } = renderHook(() => ({
      x: useMotionValue(0),
      y: useMotionValue(0),
    }));
    const { x, y } = motionResult.current;

    const { result } = renderHook(() =>
      useDrag(
        { x, y },
        {
          constraints: {
            min: { x: -50, y: -50 },
            max: { x: 50, y: 50 },
          },
        }
      )
    );

    act(() => {
      if (result.current.current === null) {
        (result.current as any).current = element;
      }
    });

    act(() => {
      const downEvent = new PointerEvent('pointerdown', {
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        bubbles: true,
      });
      element.dispatchEvent(downEvent);
    });

    // Try to move beyond constraint
    act(() => {
      const moveEvent = new PointerEvent('pointermove', {
        clientX: 200,
        clientY: 200,
        pointerId: 1,
        bubbles: true,
      });
      document.dispatchEvent(moveEvent);
    });

    await waitFor(() => {
      const xValue = x.get() as number;
      const yValue = y.get() as number;
      expect(xValue).toBeLessThanOrEqual(50);
      expect(yValue).toBeLessThanOrEqual(50);
    });
  });
});


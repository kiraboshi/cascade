/**
 * Unit tests for useTap hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTap, useTapState } from '../useTap';

describe('useTap', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should return a ref', () => {
    const { result } = renderHook(() => useTap());

    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull();
  });

  it('should detect tap on mouse click', async () => {
    const onTap = vi.fn();
    const { result } = renderHook(() => useTap({ onTap }));

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

  it('should call onTapStart callback', async () => {
    const onTapStart = vi.fn();
    const { result } = renderHook(() => useTap({ onTapStart }));

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
      expect(onTapStart).toHaveBeenCalledTimes(1);
    });
  });

  it('should cancel tap if moved too far', async () => {
    const onTap = vi.fn();
    const onTapCancel = vi.fn();
    const { result } = renderHook(() => useTap({ onTap, onTapCancel, tapThreshold: 10 }));

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
      const moveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 120, // Moved 20px, exceeds threshold
        clientY: 100,
      });
      element.dispatchEvent(moveEvent);
    });

    act(() => {
      const upEvent = new MouseEvent('mouseup', {
        bubbles: true,
        clientX: 120,
        clientY: 100,
      });
      element.dispatchEvent(upEvent);
    });

    await waitFor(() => {
      expect(onTap).not.toHaveBeenCalled();
      expect(onTapCancel).toHaveBeenCalledTimes(1);
    });
  });

  it('should detect tap on touch', async () => {
    const onTap = vi.fn();
    const { result } = renderHook(() => useTap({ onTap }));

    act(() => {
      result.current.current = element;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [new Touch({ identifier: 1, target: element, clientX: 100, clientY: 100 } as any)],
      });
      element.dispatchEvent(touchStart);
    });

    act(() => {
      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [new Touch({ identifier: 1, target: element, clientX: 100, clientY: 100 } as any)],
      });
      element.dispatchEvent(touchEnd);
    });

    await waitFor(() => {
      expect(onTap).toHaveBeenCalledTimes(1);
    });
  });

  it('should not attach listeners when disabled', () => {
    const onTap = vi.fn();
    const { result } = renderHook(() => useTap({ disabled: true, onTap }));

    act(() => {
      result.current.current = element;
    });

    act(() => {
      const downEvent = new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 });
      element.dispatchEvent(downEvent);
    });

    act(() => {
      const upEvent = new MouseEvent('mouseup', { bubbles: true, clientX: 100, clientY: 100 });
      element.dispatchEvent(upEvent);
    });

    expect(onTap).not.toHaveBeenCalled();
  });
});

describe('useTapState', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should return a ref and initial state', () => {
    const { result } = renderHook(() => useTapState());

    expect(result.current).toBeDefined();
    expect(result.current[0]).toBeDefined(); // ref
    expect(result.current[1]).toEqual({ isTapping: false, tapCount: 0 });
  });

  it('should update state when tapping', async () => {
    const { result } = renderHook(() => useTapState());

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const downEvent = new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 });
      element.dispatchEvent(downEvent);
    });

    await waitFor(() => {
      expect(result.current[1].isTapping).toBe(true);
    });

    act(() => {
      const upEvent = new MouseEvent('mouseup', { bubbles: true, clientX: 100, clientY: 100 });
      element.dispatchEvent(upEvent);
    });

    await waitFor(() => {
      expect(result.current[1].isTapping).toBe(false);
      expect(result.current[1].tapCount).toBe(1);
    });
  });

  it('should increment tap count on multiple taps', async () => {
    const { result } = renderHook(() => useTapState());

    act(() => {
      result.current[0].current = element;
    });

    // First tap
    act(() => {
      const downEvent = new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 });
      element.dispatchEvent(downEvent);
    });

    act(() => {
      const upEvent = new MouseEvent('mouseup', { bubbles: true, clientX: 100, clientY: 100 });
      element.dispatchEvent(upEvent);
    });

    await waitFor(() => {
      expect(result.current[1].tapCount).toBe(1);
    });

    // Second tap
    act(() => {
      const downEvent = new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 });
      element.dispatchEvent(downEvent);
    });

    act(() => {
      const upEvent = new MouseEvent('mouseup', { bubbles: true, clientX: 100, clientY: 100 });
      element.dispatchEvent(upEvent);
    });

    await waitFor(() => {
      expect(result.current[1].tapCount).toBe(2);
    });
  });
});


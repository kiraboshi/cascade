/**
 * Unit tests for useHover hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHover, useHoverState } from '../useHover';

describe('useHover', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should return a ref and initial hover state', () => {
    const { result } = renderHook(() => useHover());

    expect(result.current).toBeDefined();
    expect(result.current[0]).toBeDefined(); // ref
    expect(result.current[1]).toBe(false); // isHovering
  });

  it('should detect hover when mouse enters', () => {
    const { result } = renderHook(() => useHover());

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const enterEvent = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(enterEvent);
    });

    expect(result.current[1]).toBe(true);
  });

  it('should detect hover end when mouse leaves', () => {
    const { result } = renderHook(() => useHover());

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const enterEvent = new MouseEvent('mouseenter', { bubbles: true });
      element.dispatchEvent(enterEvent);
    });

    expect(result.current[1]).toBe(true);

    act(() => {
      const leaveEvent = new MouseEvent('mouseleave', { bubbles: true });
      element.dispatchEvent(leaveEvent);
    });

    expect(result.current[1]).toBe(false);
  });

  it('should call onHoverStart callback', () => {
    const onHoverStart = vi.fn();
    const { result } = renderHook(() => useHover({ onHoverStart }));

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const enterEvent = new MouseEvent('mouseenter', { bubbles: true });
      element.dispatchEvent(enterEvent);
    });

    expect(onHoverStart).toHaveBeenCalledTimes(1);
  });

  it('should call onHoverEnd callback', () => {
    const onHoverEnd = vi.fn();
    const { result } = renderHook(() => useHover({ onHoverEnd }));

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const enterEvent = new MouseEvent('mouseenter', { bubbles: true });
      element.dispatchEvent(enterEvent);
    });

    act(() => {
      const leaveEvent = new MouseEvent('mouseleave', { bubbles: true });
      element.dispatchEvent(leaveEvent);
    });

    expect(onHoverEnd).toHaveBeenCalledTimes(1);
  });

  it('should call onHoverChange callback', () => {
    const onHoverChange = vi.fn();
    const { result } = renderHook(() => useHover({ onHoverChange }));

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const enterEvent = new MouseEvent('mouseenter', { bubbles: true });
      element.dispatchEvent(enterEvent);
    });

    expect(onHoverChange).toHaveBeenCalledWith(true);

    act(() => {
      const leaveEvent = new MouseEvent('mouseleave', { bubbles: true });
      element.dispatchEvent(leaveEvent);
    });

    expect(onHoverChange).toHaveBeenCalledWith(false);
  });

  it('should not attach listeners when disabled', () => {
    const onHoverStart = vi.fn();
    const { result } = renderHook(() => useHover({ disabled: true, onHoverStart }));

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const enterEvent = new MouseEvent('mouseenter', { bubbles: true });
      element.dispatchEvent(enterEvent);
    });

    expect(onHoverStart).not.toHaveBeenCalled();
  });
});

describe('useHoverState', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should return a ref and initial state', () => {
    const { result } = renderHook(() => useHoverState());

    expect(result.current).toBeDefined();
    expect(result.current[0]).toBeDefined(); // ref
    expect(result.current[1]).toEqual({ isHovering: false });
  });

  it('should update state when hovering', () => {
    const { result } = renderHook(() => useHoverState());

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const enterEvent = new MouseEvent('mouseenter', { bubbles: true });
      element.dispatchEvent(enterEvent);
    });

    expect(result.current[1].isHovering).toBe(true);
  });

  it('should call callbacks', () => {
    const onHoverStart = vi.fn();
    const onHoverChange = vi.fn();
    const { result } = renderHook(() => useHoverState({ onHoverStart, onHoverChange }));

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const enterEvent = new MouseEvent('mouseenter', { bubbles: true });
      element.dispatchEvent(enterEvent);
    });

    expect(onHoverStart).toHaveBeenCalledTimes(1);
    expect(onHoverChange).toHaveBeenCalledWith(true);
  });
});


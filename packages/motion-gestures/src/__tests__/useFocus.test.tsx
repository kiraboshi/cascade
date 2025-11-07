/**
 * Unit tests for useFocus hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFocus, useFocusState } from '../useFocus';

describe('useFocus', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('input');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should return a ref and initial focus state', () => {
    const { result } = renderHook(() => useFocus());

    expect(result.current).toBeDefined();
    expect(result.current[0]).toBeDefined(); // ref
    expect(result.current[1]).toBe(false); // isFocused
  });

  it('should detect focus when element is focused', () => {
    const { result } = renderHook(() => useFocus());

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const focusEvent = new FocusEvent('focus', {
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(focusEvent);
    });

    expect(result.current[1]).toBe(true);
  });

  it('should detect blur when element loses focus', () => {
    const { result } = renderHook(() => useFocus());

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const focusEvent = new FocusEvent('focus', { bubbles: true });
      element.dispatchEvent(focusEvent);
    });

    expect(result.current[1]).toBe(true);

    act(() => {
      const blurEvent = new FocusEvent('blur', { bubbles: true });
      element.dispatchEvent(blurEvent);
    });

    expect(result.current[1]).toBe(false);
  });

  it('should call onFocusStart callback', () => {
    const onFocusStart = vi.fn();
    const { result } = renderHook(() => useFocus({ onFocusStart }));

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const focusEvent = new FocusEvent('focus', { bubbles: true });
      element.dispatchEvent(focusEvent);
    });

    expect(onFocusStart).toHaveBeenCalledTimes(1);
  });

  it('should call onFocusEnd callback', () => {
    const onFocusEnd = vi.fn();
    const { result } = renderHook(() => useFocus({ onFocusEnd }));

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const focusEvent = new FocusEvent('focus', { bubbles: true });
      element.dispatchEvent(focusEvent);
    });

    act(() => {
      const blurEvent = new FocusEvent('blur', { bubbles: true });
      element.dispatchEvent(blurEvent);
    });

    expect(onFocusEnd).toHaveBeenCalledTimes(1);
  });

  it('should call onFocusChange callback', () => {
    const onFocusChange = vi.fn();
    const { result } = renderHook(() => useFocus({ onFocusChange }));

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const focusEvent = new FocusEvent('focus', { bubbles: true });
      element.dispatchEvent(focusEvent);
    });

    expect(onFocusChange).toHaveBeenCalledWith(true);

    act(() => {
      const blurEvent = new FocusEvent('blur', { bubbles: true });
      element.dispatchEvent(blurEvent);
    });

    expect(onFocusChange).toHaveBeenCalledWith(false);
  });

  it('should not attach listeners when disabled', () => {
    const onFocusStart = vi.fn();
    const { result } = renderHook(() => useFocus({ disabled: true, onFocusStart }));

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const focusEvent = new FocusEvent('focus', { bubbles: true });
      element.dispatchEvent(focusEvent);
    });

    expect(onFocusStart).not.toHaveBeenCalled();
  });
});

describe('useFocusState', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('input');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should return a ref and initial state', () => {
    const { result } = renderHook(() => useFocusState());

    expect(result.current).toBeDefined();
    expect(result.current[0]).toBeDefined(); // ref
    expect(result.current[1]).toEqual({ isFocused: false });
  });

  it('should update state when focused', () => {
    const { result } = renderHook(() => useFocusState());

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const focusEvent = new FocusEvent('focus', { bubbles: true });
      element.dispatchEvent(focusEvent);
    });

    expect(result.current[1].isFocused).toBe(true);
  });

  it('should call callbacks', () => {
    const onFocusStart = vi.fn();
    const onFocusChange = vi.fn();
    const { result } = renderHook(() => useFocusState({ onFocusStart, onFocusChange }));

    act(() => {
      result.current[0].current = element;
    });

    act(() => {
      const focusEvent = new FocusEvent('focus', { bubbles: true });
      element.dispatchEvent(focusEvent);
    });

    expect(onFocusStart).toHaveBeenCalledTimes(1);
    expect(onFocusChange).toHaveBeenCalledWith(true);
  });
});


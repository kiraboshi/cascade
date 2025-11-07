/**
 * Integration tests for useScrollMotion hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollMotion } from '../useScroll';
import { useMotionValue } from '@cascade/motion-runtime';

describe('useScrollMotion', () => {
  beforeEach(() => {
    // Reset scroll position
    window.scrollX = 0;
    window.scrollY = 0;
  });

  it('should update motion value on scroll', async () => {
    const { result: scrollResult } = renderHook(() => useMotionValue(0));
    const scrollY = scrollResult.current;
    
    renderHook(() => useScrollMotion(scrollY, { axis: 'y', multiplier: 1 }));

    // Simulate scroll
    act(() => {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 100,
      });
      window.dispatchEvent(new Event('scroll'));
    });

    // Wait for value to update
    await new Promise((resolve) => setTimeout(resolve, 10));

    const value = scrollY.get() as number;
    expect(value).toBe(100);
  });

  it('should apply multiplier', async () => {
    const { result: scrollResult } = renderHook(() => useMotionValue(0));
    const scrollY = scrollResult.current;
    
    renderHook(() => useScrollMotion(scrollY, { axis: 'y', multiplier: 0.5 }));

    act(() => {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 200,
      });
      window.dispatchEvent(new Event('scroll'));
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const value = scrollY.get() as number;
    expect(value).toBe(100); // 200 * 0.5
  });

  it('should handle x axis', async () => {
    const { result: scrollResult } = renderHook(() => useMotionValue(0));
    const scrollX = scrollResult.current;
    
    renderHook(() => useScrollMotion(scrollX, { axis: 'x', multiplier: 1 }));

    act(() => {
      Object.defineProperty(window, 'scrollX', {
        writable: true,
        value: 150,
      });
      window.dispatchEvent(new Event('scroll'));
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const value = scrollX.get() as number;
    expect(value).toBe(150);
  });

  it('should set initial scroll value', () => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 50,
    });

    const { result: scrollResult } = renderHook(() => useMotionValue(0));
    const scrollY = scrollResult.current;
    
    renderHook(() => useScrollMotion(scrollY, { axis: 'y', multiplier: 1 }));

    // Initial value should be set
    const value = scrollY.get() as number;
    expect(value).toBe(50);
  });
});


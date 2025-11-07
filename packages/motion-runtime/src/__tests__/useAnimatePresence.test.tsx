/**
 * Unit tests for useAnimatePresence hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { useAnimatePresence } from '../useAnimatePresence';

describe('useAnimatePresence', () => {
  let container: HTMLElement;
  let element: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    
    container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '500px';
    container.style.height = '500px';
    document.body.appendChild(container);

    element = document.createElement('div');
    element.style.width = '100px';
    element.style.height = '100px';
    container.appendChild(element);
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clean up injected styles
    const styles = document.querySelectorAll('style[id^="flip-style-"]');
    styles.forEach(style => style.remove());
    
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  it('should return ref, isExiting, isEntering, and shouldRender', () => {
    const { result } = renderHook(() => useAnimatePresence(true));
    
    expect(result.current).toHaveProperty('ref');
    expect(result.current).toHaveProperty('isExiting');
    expect(result.current).toHaveProperty('isEntering');
    expect(result.current).toHaveProperty('shouldRender');
    expect(typeof result.current.ref).toBe('function');
    expect(typeof result.current.isExiting).toBe('boolean');
    expect(typeof result.current.isEntering).toBe('boolean');
    expect(typeof result.current.shouldRender).toBe('boolean');
  });

  it('should set shouldRender to true when isPresent is true', () => {
    const { result } = renderHook(() => useAnimatePresence(true));
    
    expect(result.current.shouldRender).toBe(true);
  });

  it('should set shouldRender to false when isPresent is false and no exit config', async () => {
    const { result, rerender } = renderHook(
      ({ isPresent }) => useAnimatePresence(isPresent),
      { initialProps: { isPresent: true } }
    );
    
    expect(result.current.shouldRender).toBe(true);
    
    rerender({ isPresent: false });
    
    await vi.runAllTimersAsync();
    
    await waitFor(() => {
      expect(result.current.shouldRender).toBe(false);
    });
  });

  it('should set isExiting to true when isPresent becomes false with exit config', async () => {
    const { result, rerender } = renderHook(
      ({ isPresent }) => useAnimatePresence(isPresent, {
        exit: {
          opacity: 0,
          config: { duration: 100 },
        },
      }),
      { initialProps: { isPresent: true } }
    );
    
    expect(result.current.isExiting).toBe(false);
    
    rerender({ isPresent: false });
    
    await vi.runAllTimersAsync();
    
    await waitFor(() => {
      expect(result.current.isExiting).toBe(true);
    });
  });

  it('should handle exit animation', async () => {
    const { result, rerender } = renderHook(
      ({ isPresent }) => {
        const hookResult = useAnimatePresence(isPresent, {
          exit: {
            opacity: 0,
            config: { duration: 100 },
          },
        });
        
        // Set ref
        if (hookResult.shouldRender && !element.parentNode) {
          container.appendChild(element);
        }
        hookResult.ref(element);
        
        return hookResult;
      },
      { initialProps: { isPresent: true } }
    );
    
    expect(result.current.shouldRender).toBe(true);
    expect(result.current.isExiting).toBe(false);
    
    rerender({ isPresent: false });
    
    // Should be exiting
    await waitFor(() => {
      expect(result.current.isExiting).toBe(true);
    });
    
    // Wait for animation
    await vi.advanceTimersByTimeAsync(150);
    
    // Should be removed after animation
    await waitFor(() => {
      expect(result.current.shouldRender).toBe(false);
    });
  });

  it('should handle enter animation', async () => {
    const { result, rerender } = renderHook(
      ({ isPresent }) => {
        const hookResult = useAnimatePresence(isPresent, {
          enter: {
            opacity: 0,
            config: { duration: 100 },
          },
          initial: false,
        });
        
        // Set ref
        if (hookResult.shouldRender && !element.parentNode) {
          container.appendChild(element);
        }
        hookResult.ref(element);
        
        return hookResult;
      },
      { initialProps: { isPresent: false } }
    );
    
    expect(result.current.shouldRender).toBe(false);
    
    rerender({ isPresent: true });
    
    // Should render and enter
    await waitFor(() => {
      expect(result.current.shouldRender).toBe(true);
      expect(result.current.isEntering).toBe(true);
    });
    
    // Wait for animation
    await vi.advanceTimersByTimeAsync(150);
    
    // Should complete enter
    await waitFor(() => {
      expect(result.current.isEntering).toBe(false);
    });
  });

  it('should skip initial animation when initial={true}', async () => {
    const { result } = renderHook(() => {
      const hookResult = useAnimatePresence(true, {
        enter: {
          opacity: 0,
          config: { duration: 100 },
        },
        initial: true,
      });
      
      // Set ref
      if (hookResult.shouldRender && !element.parentNode) {
        container.appendChild(element);
      }
      hookResult.ref(element);
      
      return hookResult;
    });
    
    // Should render but not be entering (initial animation skipped)
    expect(result.current.shouldRender).toBe(true);
    expect(result.current.isEntering).toBe(false);
    
    await vi.runAllTimersAsync();
    
    // Should still not be entering
    expect(result.current.isEntering).toBe(false);
  });

  it('should handle wait mode', async () => {
    const { result, rerender } = renderHook(
      ({ isPresent }) => useAnimatePresence(isPresent, {
        mode: 'wait',
        exit: {
          opacity: 0,
          config: { duration: 100 },
        },
        enter: {
          opacity: 0,
          config: { duration: 100 },
        },
      }),
      { initialProps: { isPresent: true } }
    );
    
    expect(result.current.shouldRender).toBe(true);
    
    // Start exit
    rerender({ isPresent: false });
    
    await waitFor(() => {
      expect(result.current.isExiting).toBe(true);
    });
    
    // While exiting, should still render
    expect(result.current.shouldRender).toBe(true);
    
    // Wait for exit to complete
    await vi.advanceTimersByTimeAsync(150);
    
    await waitFor(() => {
      expect(result.current.shouldRender).toBe(false);
    });
    
    // Now enter
    rerender({ isPresent: true });
    
    // Should wait before entering in wait mode
    // (This is harder to test without more detailed state tracking)
    await vi.advanceTimersByTimeAsync(50);
    
    await waitFor(() => {
      expect(result.current.shouldRender).toBe(true);
    });
  });
});


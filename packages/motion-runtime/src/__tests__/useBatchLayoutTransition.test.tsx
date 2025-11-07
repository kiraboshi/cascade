/**
 * Integration tests for useBatchLayoutTransition hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React, { useRef } from 'react';
import { useBatchLayoutTransition } from '../useBatchLayoutTransition';

describe('useBatchLayoutTransition', () => {
  let container: HTMLElement;
  let elements: HTMLElement[];

  beforeEach(() => {
    vi.useFakeTimers();
    
    container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '500px';
    container.style.height = '500px';
    document.body.appendChild(container);

    elements = [];
    for (let i = 0; i < 3; i++) {
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.left = `${i * 100}px`;
      el.style.top = '0px';
      el.style.width = '80px';
      el.style.height = '80px';
      el.textContent = `Item ${i + 1}`;
      container.appendChild(el);
      elements.push(el);
    }
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

  it('should not animate on initial mount', async () => {
    const { result } = renderHook(() => {
      const refs = elements.map(() => useRef<HTMLDivElement>(null));
      useBatchLayoutTransition(refs, { duration: 300 });
      return refs;
    });

    // Set refs
    result.current.forEach((ref, i) => {
      ref.current = elements[i];
    });

    // Advance timers to allow initialization
    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();

    // Should not have animation classes on first render
    elements.forEach(el => {
      expect(Array.from(el.classList).some(cls => cls.startsWith('flip-'))).toBe(false);
    });
  });

  it('should animate multiple elements when reordered', async () => {
    // Mock getBoundingClientRect for each element
    const positions = [
      { left: 0, top: 0 },
      { left: 100, top: 0 },
      { left: 200, top: 0 },
    ];
    
    elements.forEach((el, i) => {
      vi.spyOn(el, 'getBoundingClientRect').mockImplementation(() => ({
        left: positions[i].left,
        top: positions[i].top,
        width: 80,
        height: 80,
        right: positions[i].left + 80,
        bottom: positions[i].top + 80,
        x: positions[i].left,
        y: positions[i].top,
        toJSON: () => {},
      }) as DOMRect);
    });
    
    const { result, rerender } = renderHook(
      ({ order }) => {
        const refs = order.map((idx: number) => {
          const ref = useRef<HTMLDivElement>(null);
          ref.current = elements[idx];
          return ref;
        });
        useBatchLayoutTransition(refs, { duration: 300 });
        return refs;
      },
      {
        initialProps: { order: [0, 1, 2] },
      }
    );

    // Wait for initialization (triple RAF)
    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();

    // Reorder elements - update positions
    positions[2] = { left: 0, top: 0 };
    positions[0] = { left: 100, top: 0 };
    positions[1] = { left: 200, top: 0 };
    elements[2].style.left = '0px';
    elements[0].style.left = '100px';
    elements[1].style.left = '200px';

    rerender({ order: [2, 0, 1] });

    // Wait for layout detection and animation
    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();

    // Should have animations applied
    await waitFor(() => {
      const animatedElements = elements.filter(el => 
        Array.from(el.classList).some(cls => cls.startsWith('flip-'))
      );
      expect(animatedElements.length).toBeGreaterThan(0);
    }, { timeout: 1000 });
  });

  it('should respect enabled flag', () => {
    const { result } = renderHook(() => {
      const refs = elements.map(() => useRef<HTMLDivElement>(null));
      useBatchLayoutTransition(refs, { enabled: false });
      return refs;
    });

    result.current.forEach((ref, i) => {
      ref.current = elements[i];
    });

    // Move elements
    elements[0].style.left = '200px';
    vi.advanceTimersByTime(100);

    // Should not animate when disabled
    elements.forEach(el => {
      expect(Array.from(el.classList).some(cls => cls.startsWith('flip-'))).toBe(false);
    });
  });

  it('should handle empty refs array', () => {
    const { result } = renderHook(() => {
      const refs: ReturnType<typeof useRef<HTMLDivElement>>[] = [];
      useBatchLayoutTransition(refs, { duration: 300 });
      return refs;
    });

    // Should not crash
    expect(result.current).toHaveLength(0);
  });

  it('should handle elements being removed', async () => {
    const { result, rerender } = renderHook(
      ({ count }) => {
        const refs = elements.slice(0, count).map((_, i) => {
          const ref = useRef<HTMLDivElement>(null);
          ref.current = elements[i];
          return ref;
        });
        useBatchLayoutTransition(refs, { duration: 300 });
        return refs;
      },
      {
        initialProps: { count: 3 },
      }
    );

    // Wait for initialization
    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();

    // Remove one element
    rerender({ count: 2 });

    // Should not crash
    expect(result.current).toHaveLength(2);
  });
});


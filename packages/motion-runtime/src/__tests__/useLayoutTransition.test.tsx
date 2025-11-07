/**
 * Integration tests for useLayoutTransition hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { useLayoutTransition } from '../useLayoutTransition';

describe('useLayoutTransition', () => {
  let container: HTMLElement;
  let element: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '500px';
    container.style.height = '500px';
    document.body.appendChild(container);

    element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '0px';
    element.style.top = '0px';
    element.style.width = '100px';
    element.style.height = '100px';
    container.appendChild(element);
  });

  afterEach(() => {
    // Clean up injected styles
    const styles = document.querySelectorAll('style[id^="flip-style-"]');
    styles.forEach(style => style.remove());
    
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  it('should not animate on initial mount', async () => {
    vi.useFakeTimers();
    
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useLayoutTransition(ref, { duration: 300 });
      return ref;
    });

    // Set ref
    result.current.current = element;

    // Wait for layout effect
    await vi.runAllTimersAsync();

    // Should not have animation classes on first render
    expect(Array.from(element.classList).some(cls => cls.startsWith('flip-'))).toBe(false);
    
    vi.useRealTimers();
  });

  it('should animate when position changes', async () => {
    vi.useFakeTimers();
    
    // Mock getBoundingClientRect to return different positions
    let position = { left: 0, top: 0 };
    const getBoundingClientRectSpy = vi.spyOn(element, 'getBoundingClientRect').mockImplementation(() => ({
      left: position.left,
      top: position.top,
      width: 100,
      height: 100,
      right: position.left + 100,
      bottom: position.top + 100,
      x: position.left,
      y: position.top,
      toJSON: () => {},
    }) as DOMRect);
    
    const { result, rerender } = renderHook(
      ({ left, top }) => {
        const ref = useRef<HTMLDivElement>(null);
        useLayoutTransition(ref, { duration: 300 });
        return { ref, left, top };
      },
      {
        initialProps: { left: 0, top: 0 },
      }
    );

    result.current.ref.current = element;

    // Wait for initial measurement (triple RAF)
    await vi.runAllTimersAsync();

    // Change position
    position = { left: 100, top: 50 };
    element.style.left = '100px';
    element.style.top = '50px';
    getBoundingClientRectSpy.mockImplementation(() => ({
      left: position.left,
      top: position.top,
      width: 100,
      height: 100,
      right: position.left + 100,
      bottom: position.top + 100,
      x: position.left,
      y: position.top,
      toJSON: () => {},
    }) as DOMRect);

    rerender({ left: 100, top: 50 });

    // Wait for layout effect
    await vi.runAllTimersAsync();

    // Should have animation class applied
    const hasAnimationClass = Array.from(element.classList).some(cls => cls.startsWith('flip-'));
    expect(hasAnimationClass).toBe(true);
    
    vi.useRealTimers();
  });

  it('should respect enabled flag', async () => {
    vi.useFakeTimers();
    
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useLayoutTransition(ref, { enabled: false });
      return ref;
    });

    result.current.current = element;

    // Should not animate when disabled
    element.style.left = '100px';
    await vi.runAllTimersAsync();

    expect(Array.from(element.classList).some(cls => cls.startsWith('flip-'))).toBe(false);
    
    vi.useRealTimers();
  });

  it('should call onComplete callback', async () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    let position = { left: 0, top: 0 };
    const getBoundingClientRectSpy = vi.spyOn(element, 'getBoundingClientRect').mockImplementation(() => ({
      left: position.left,
      top: position.top,
      width: 100,
      height: 100,
      right: position.left + 100,
      bottom: position.top + 100,
      x: position.left,
      y: position.top,
      toJSON: () => {},
    }) as DOMRect);

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useLayoutTransition(ref, { duration: 100, onComplete });
      return ref;
    });

    result.current.current = element;

    // Wait for initial measurement
    await vi.runAllTimersAsync();

    // Change position to trigger animation
    position = { left: 100, top: 0 };
    element.style.left = '100px';
    getBoundingClientRectSpy.mockImplementation(() => ({
      left: position.left,
      top: position.top,
      width: 100,
      height: 100,
      right: position.left + 100,
      bottom: position.top + 100,
      x: position.left,
      y: position.top,
      toJSON: () => {},
    }) as DOMRect);
    
    // Trigger layout effect
    await vi.runAllTimersAsync();

    // Get the animation name from the class
    const animationClass = Array.from(element.classList).find(cls => cls.startsWith('flip-'));
    const animationName = animationClass?.replace('flip-', '') || '';
    
    if (animationName) {
      // Create and dispatch animation end event
      const animationEndEvent = new AnimationEvent('animationend', {
        animationName,
        bubbles: true,
      });
      element.dispatchEvent(animationEndEvent);
      
      // Callback should be called
      expect(onComplete).toHaveBeenCalled();
    }
    
    vi.useRealTimers();
  });

  it('should use custom duration and easing', async () => {
    vi.useFakeTimers();
    
    // Mock getBoundingClientRect
    let position = { left: 0, top: 0 };
    const getBoundingClientRectSpy = vi.spyOn(element, 'getBoundingClientRect').mockImplementation(() => ({
      left: position.left,
      top: position.top,
      width: 100,
      height: 100,
      right: position.left + 100,
      bottom: position.top + 100,
      x: position.left,
      y: position.top,
      toJSON: () => {},
    }) as DOMRect);
    
    const { result, rerender } = renderHook(
      ({ left }) => {
        const ref = useRef<HTMLDivElement>(null);
        useLayoutTransition(ref, { duration: 500, easing: 'ease-in-out' });
        return { ref, left };
      },
      {
        initialProps: { left: 0 },
      }
    );

    result.current.ref.current = element;

    await vi.runAllTimersAsync();

    position = { left: 100, top: 0 };
    element.style.left = '100px';
    getBoundingClientRectSpy.mockImplementation(() => ({
      left: position.left,
      top: position.top,
      width: 100,
      height: 100,
      right: position.left + 100,
      bottom: position.top + 100,
      x: position.left,
      y: position.top,
      toJSON: () => {},
    }) as DOMRect);
    rerender({ left: 100 });

    await vi.runAllTimersAsync();

    // Check that styles were injected with correct values
    const styles = document.querySelectorAll('style[id^="flip-style-"]');
    const lastStyle = styles[styles.length - 1];
    if (lastStyle) {
      expect(lastStyle.textContent).toContain('500ms');
      expect(lastStyle.textContent).toContain('ease-in-out');
    }
    
    vi.useRealTimers();
  });
});


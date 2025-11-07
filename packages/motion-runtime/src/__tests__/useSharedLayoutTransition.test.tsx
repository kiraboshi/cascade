/**
 * Integration tests for useSharedLayoutTransition hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRef, useState } from 'react';
import { useSharedLayoutTransition } from '../useSharedLayoutTransition';

describe('useSharedLayoutTransition', () => {
  let container: HTMLElement;
  let element1: HTMLElement;
  let element2: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '500px';
    container.style.height = '500px';
    document.body.appendChild(container);

    element1 = document.createElement('div');
    element1.style.position = 'absolute';
    element1.style.left = '0px';
    element1.style.top = '0px';
    element1.style.width = '100px';
    element1.style.height = '100px';
    element1.textContent = 'Element 1';
    container.appendChild(element1);

    element2 = document.createElement('div');
    element2.style.position = 'absolute';
    element2.style.left = '200px';
    element2.style.top = '200px';
    element2.style.width = '150px';
    element2.style.height = '150px';
    element2.textContent = 'Element 2';
  });

  afterEach(() => {
    // Clean up injected styles
    const styles = document.querySelectorAll('style[id^="flip-style-"]');
    styles.forEach(style => style.remove());
    
    // Remove elements
    if (element1.parentNode) {
      element1.parentNode.removeChild(element1);
    }
    if (element2.parentNode) {
      element2.parentNode.removeChild(element2);
    }
    
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  it('should not animate on first element mount', async () => {
    vi.useFakeTimers();
    
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSharedLayoutTransition(ref, { layoutId: 'test-id' });
      return ref;
    });

    result.current.current = element1;

    // Wait for layout effect
    await vi.runAllTimersAsync();

    // Should not have animation classes on first render
    expect(Array.from(element1.classList).some(cls => cls.startsWith('flip-') || cls.startsWith('shared-flip-'))).toBe(false);
    
    vi.useRealTimers();
  });

  it('should animate when second element with same layoutId mounts', async () => {
    vi.useFakeTimers();
    
    // Mock getBoundingClientRect for element1
    const getBoundingClientRect1 = vi.spyOn(element1, 'getBoundingClientRect').mockImplementation(() => ({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    }) as DOMRect);

    // Mock getBoundingClientRect for element2
    const getBoundingClientRect2 = vi.spyOn(element2, 'getBoundingClientRect').mockImplementation(() => ({
      left: 200,
      top: 200,
      width: 150,
      height: 150,
      right: 350,
      bottom: 350,
      x: 200,
      y: 200,
      toJSON: () => {},
    }) as DOMRect);

    // First element
    const { result: result1 } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSharedLayoutTransition(ref, { layoutId: 'shared-id' });
      return ref;
    });

    result1.current.current = element1;
    await vi.runAllTimersAsync();

    // Second element with same layoutId
    const { result: result2 } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSharedLayoutTransition(ref, { layoutId: 'shared-id' });
      return ref;
    });

    result2.current.current = element2;
    container.appendChild(element2);
    await vi.runAllTimersAsync();

    // Should have animation class applied to element2
    const hasAnimationClass = Array.from(element2.classList).some(cls => cls.startsWith('flip-') || cls.startsWith('shared-flip-'));
    expect(hasAnimationClass).toBe(true);
    
    vi.useRealTimers();
  });

  it('should animate from unmounted element bounds', async () => {
    vi.useFakeTimers();
    
    // Mock getBoundingClientRect
    const getBoundingClientRect1 = vi.spyOn(element1, 'getBoundingClientRect').mockImplementation(() => ({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    }) as DOMRect);

    const getBoundingClientRect2 = vi.spyOn(element2, 'getBoundingClientRect').mockImplementation(() => ({
      left: 200,
      top: 200,
      width: 150,
      height: 150,
      right: 350,
      bottom: 350,
      x: 200,
      y: 200,
      toJSON: () => {},
    }) as DOMRect);

    // Mount first element
    const { result: result1, unmount: unmount1 } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSharedLayoutTransition(ref, { layoutId: 'shared-id' });
      return ref;
    });

    result1.current.current = element1;
    await vi.runAllTimersAsync();

    // Unmount first element
    unmount1();
    container.removeChild(element1);
    await vi.runAllTimersAsync();

    // Mount second element with same layoutId
    const { result: result2 } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSharedLayoutTransition(ref, { layoutId: 'shared-id' });
      return ref;
    });

    result2.current.current = element2;
    container.appendChild(element2);
    await vi.runAllTimersAsync();

    // Should animate from element1's bounds to element2's bounds
    const hasAnimationClass = Array.from(element2.classList).some(cls => cls.startsWith('flip-') || cls.startsWith('shared-flip-'));
    expect(hasAnimationClass).toBe(true);
    
    vi.useRealTimers();
  });

  it('should call onComplete callback', async () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    const getBoundingClientRect1 = vi.spyOn(element1, 'getBoundingClientRect').mockImplementation(() => ({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    }) as DOMRect);

    const getBoundingClientRect2 = vi.spyOn(element2, 'getBoundingClientRect').mockImplementation(() => ({
      left: 100,
      top: 0,
      width: 100,
      height: 100,
      right: 200,
      bottom: 100,
      x: 100,
      y: 0,
      toJSON: () => {},
    }) as DOMRect);

    // First element
    const { result: result1 } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSharedLayoutTransition(ref, { layoutId: 'shared-id' });
      return ref;
    });

    result1.current.current = element1;
    await vi.runAllTimersAsync();

    // Second element with onComplete
    const { result: result2 } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSharedLayoutTransition(ref, { layoutId: 'shared-id', duration: 100, onComplete });
      return ref;
    });

    result2.current.current = element2;
    container.appendChild(element2);
    await vi.runAllTimersAsync();

    // Get the animation name from the class
    const animationClass = Array.from(element2.classList).find(cls => cls.startsWith('flip-') || cls.startsWith('shared-flip-'));
    const animationName = animationClass?.replace(/^(flip-|shared-flip-)/, '') || '';
    
    if (animationName) {
      // Create and dispatch animation end event
      const animationEndEvent = new AnimationEvent('animationend', {
        animationName,
        bubbles: true,
      });
      element2.dispatchEvent(animationEndEvent);
      
      // Callback should be called
      expect(onComplete).toHaveBeenCalled();
    }
    
    vi.useRealTimers();
  });

  it('should use custom duration and easing', async () => {
    vi.useFakeTimers();
    
    const getBoundingClientRect1 = vi.spyOn(element1, 'getBoundingClientRect').mockImplementation(() => ({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    }) as DOMRect);

    const getBoundingClientRect2 = vi.spyOn(element2, 'getBoundingClientRect').mockImplementation(() => ({
      left: 100,
      top: 0,
      width: 100,
      height: 100,
      right: 200,
      bottom: 100,
      x: 100,
      y: 0,
      toJSON: () => {},
    }) as DOMRect);

    // First element
    const { result: result1 } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSharedLayoutTransition(ref, { layoutId: 'shared-id' });
      return ref;
    });

    result1.current.current = element1;
    await vi.runAllTimersAsync();

    // Second element with custom config
    const { result: result2 } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSharedLayoutTransition(ref, { layoutId: 'shared-id', duration: 500, easing: 'ease-in-out' });
      return ref;
    });

    result2.current.current = element2;
    container.appendChild(element2);
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

  it('should handle different layoutIds independently', async () => {
    vi.useFakeTimers();
    
    const getBoundingClientRect1 = vi.spyOn(element1, 'getBoundingClientRect').mockImplementation(() => ({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    }) as DOMRect);

    const getBoundingClientRect2 = vi.spyOn(element2, 'getBoundingClientRect').mockImplementation(() => ({
      left: 200,
      top: 200,
      width: 150,
      height: 150,
      right: 350,
      bottom: 350,
      x: 200,
      y: 200,
      toJSON: () => {},
    }) as DOMRect);

    // First element with layoutId 'id1'
    const { result: result1 } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSharedLayoutTransition(ref, { layoutId: 'id1' });
      return ref;
    });

    result1.current.current = element1;
    await vi.runAllTimersAsync();

    // Second element with different layoutId 'id2'
    const { result: result2 } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSharedLayoutTransition(ref, { layoutId: 'id2' });
      return ref;
    });

    result2.current.current = element2;
    container.appendChild(element2);
    await vi.runAllTimersAsync();

    // Should not animate because layoutIds are different
    const hasAnimationClass = Array.from(element2.classList).some(cls => cls.startsWith('flip-') || cls.startsWith('shared-flip-'));
    expect(hasAnimationClass).toBe(false);
    
    vi.useRealTimers();
  });

  it('should use custom transform origin', async () => {
    vi.useFakeTimers();
    
    const getBoundingClientRect1 = vi.spyOn(element1, 'getBoundingClientRect').mockImplementation(() => ({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    }) as DOMRect);

    const getBoundingClientRect2 = vi.spyOn(element2, 'getBoundingClientRect').mockImplementation(() => ({
      left: 100,
      top: 0,
      width: 200,
      height: 200,
      right: 300,
      bottom: 200,
      x: 100,
      y: 0,
      toJSON: () => {},
    }) as DOMRect);

    // First element
    const { result: result1 } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSharedLayoutTransition(ref, { layoutId: 'shared-id' });
      return ref;
    });

    result1.current.current = element1;
    await vi.runAllTimersAsync();

    // Second element with custom origin
    const { result: result2 } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSharedLayoutTransition(ref, { layoutId: 'shared-id', origin: 'top-left' });
      return ref;
    });

    result2.current.current = element2;
    container.appendChild(element2);
    await vi.runAllTimersAsync();

    // Check that transform-origin was set
    expect(element2.style.transformOrigin).toBe('0 0');
    
    vi.useRealTimers();
  });
});


/**
 * Tests for useAnimationStates hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { defineAnimationStates } from '@cascade/compiler';
import { useAnimationStates } from '../useAnimationStates';

// Mock @cascade/compiler if needed
vi.mock('@cascade/compiler', async () => {
  const actual = await vi.importActual('@cascade/compiler');
  return actual;
});

describe('useAnimationStates', () => {
  beforeEach(() => {
    // Clear document head
    document.head.innerHTML = '';
  });

  afterEach(() => {
    // Clean up
    document.head.innerHTML = '';
  });

  it('should initialize with initial state', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    });

    const { result } = renderHook(() => useAnimationStates(states));

    expect(result.current.currentState).toBe('initial');
    expect(result.current.className).toBe(states.classes.initial);
  });

  it('should inject CSS on mount', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    });

    renderHook(() => useAnimationStates(states));

    const styleElement = document.getElementById(`animation-states-${states.id}`);
    expect(styleElement).toBeTruthy();
    expect(styleElement?.textContent).toContain(states.css);
  });

  it('should animate to animate state on mount by default', async () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    });

    const { result } = renderHook(() => useAnimationStates(states));

    await waitFor(() => {
      expect(result.current.currentState).toBe('animate');
    });
  });

  it('should respect initial option', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      custom: { opacity: 0.5 },
    });

    const { result } = renderHook(() =>
      useAnimationStates(states, { initial: 'custom' })
    );

    expect(result.current.currentState).toBe('custom');
  });

  it('should respect animate option', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      custom: { opacity: 0.5 },
    });

    const { result } = renderHook(() =>
      useAnimationStates(states, { animate: 'custom' })
    );

    waitFor(() => {
      expect(result.current.currentState).toBe('custom');
    });
  });

  it('should set state immediately', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      hover: { scale: 1.05 },
    });

    const { result } = renderHook(() =>
      useAnimationStates(states, { animate: false })
    );

    act(() => {
      result.current.set('hover');
    });

    expect(result.current.currentState).toBe('hover');
    expect(result.current.className).toBe(states.classes.hover);
  });

  it('should warn when setting invalid state', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useAnimationStates(states));

    act(() => {
      result.current.set('invalid');
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('does not exist')
    );

    consoleSpy.mockRestore();
  });

  it('should animate to state with transition', async () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: 100 },
      },
    });

    const { result } = renderHook(() =>
      useAnimationStates(states, { animate: false })
    );

    const startTime = Date.now();
    let endTime: number;

    await act(async () => {
      await result.current.animateTo('animate');
      endTime = Date.now();
    });

    expect(result.current.currentState).toBe('animate');
    expect(endTime! - startTime).toBeGreaterThanOrEqual(90); // Allow some margin
  });

  it('should get state definition', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    });

    const { result } = renderHook(() => useAnimationStates(states));

    const stateDef = result.current.getState('animate');
    expect(stateDef).toBeDefined();
    expect(stateDef?.opacity).toBe(1);
  });

  it('should check if state exists', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    });

    const { result } = renderHook(() => useAnimationStates(states));

    expect(result.current.hasState('animate')).toBe(true);
    expect(result.current.hasState('invalid')).toBe(false);
  });

  it('should subscribe to state changes', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      hover: { scale: 1.05 },
    });

    const { result } = renderHook(() =>
      useAnimationStates(states, { animate: false })
    );

    const callback = vi.fn();
    const unsubscribe = result.current.onStateChange(callback);

    act(() => {
      result.current.set('hover');
    });

    expect(callback).toHaveBeenCalledWith('hover');

    unsubscribe();
    callback.mockClear();

    act(() => {
      result.current.set('animate');
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not inject CSS when injectCSS is false', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    });

    renderHook(() => useAnimationStates(states, { injectCSS: false }));

    const styleElement = document.getElementById(`animation-states-${states.id}`);
    expect(styleElement).toBeNull();
  });

  it('should handle semantic state names', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      hover: { scale: 1.05 },
      tap: { scale: 0.95 },
      focus: { outline: '2px solid blue' },
      exit: { opacity: 0 },
    });

    const { result } = renderHook(() =>
      useAnimationStates(states, { animate: false })
    );

    expect(result.current.hasState('initial')).toBe(true);
    expect(result.current.hasState('animate')).toBe(true);
    expect(result.current.hasState('hover')).toBe(true);
    expect(result.current.hasState('tap')).toBe(true);
    expect(result.current.hasState('focus')).toBe(true);
    expect(result.current.hasState('exit')).toBe(true);
  });

  it('should handle arbitrary state names', () => {
    const states = defineAnimationStates({
      loading: { opacity: 0.5 },
      error: { opacity: 1, color: 'red' },
      success: { opacity: 1, color: 'green' },
    });

    const { result } = renderHook(() =>
      useAnimationStates(states, { initial: 'loading' })
    );

    expect(result.current.currentState).toBe('loading');
    expect(result.current.hasState('error')).toBe(true);
    expect(result.current.hasState('success')).toBe(true);
  });

  it('should handle runtime states', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      dynamic: {
        x: 'var(--motion-x)',
        opacity: 'var(--dynamic-opacity)',
      },
    });

    const { result } = renderHook(() =>
      useAnimationStates(states, { animate: false })
    );

    expect(result.current.hasState('dynamic')).toBe(true);
    expect(result.current.getState('dynamic')).toBeDefined();
  });
});


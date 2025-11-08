/**
 * Tests for useAnimationStatesWithGestures hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { defineAnimationStates } from '@cascade/compiler';
import { useAnimationStatesWithGestures } from '../useAnimationStatesWithGestures';

// Mock gesture hooks
vi.mock('@cascade/motion-gestures', () => ({
  useHover: vi.fn(() => [vi.fn(() => ({ current: null })), false]),
  useTap: vi.fn(() => vi.fn(() => ({ current: null }))),
  useFocus: vi.fn(() => [vi.fn(() => ({ current: null })), false]),
}));

describe('useAnimationStatesWithGestures', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('should integrate hover state', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      hover: { scale: 1.05 },
    });

    const { result } = renderHook(() =>
      useAnimationStatesWithGestures(states, {
        hover: true,
        animate: false,
      })
    );

    expect(result.current.ref).toBeDefined();
    expect(result.current.hasState('hover')).toBe(true);
  });

  it('should integrate tap state', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      tap: { scale: 0.95 },
    });

    const { result } = renderHook(() =>
      useAnimationStatesWithGestures(states, {
        tap: true,
        animate: false,
      })
    );

    expect(result.current.ref).toBeDefined();
    expect(result.current.hasState('tap')).toBe(true);
  });

  it('should integrate focus state', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      focus: { outline: '2px solid blue' },
    });

    const { result } = renderHook(() =>
      useAnimationStatesWithGestures(states, {
        focus: true,
        animate: false,
      })
    );

    expect(result.current.ref).toBeDefined();
    expect(result.current.hasState('focus')).toBe(true);
  });

  it('should integrate all gesture states', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      hover: { scale: 1.05 },
      tap: { scale: 0.95 },
      focus: { outline: '2px solid blue' },
    });

    const { result } = renderHook(() =>
      useAnimationStatesWithGestures(states, {
        hover: true,
        tap: true,
        focus: true,
        animate: false,
      })
    );

    expect(result.current.hasState('hover')).toBe(true);
    expect(result.current.hasState('tap')).toBe(true);
    expect(result.current.hasState('focus')).toBe(true);
  });

  it('should allow disabling gestures', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      hover: { scale: 1.05 },
    });

    const { result } = renderHook(() =>
      useAnimationStatesWithGestures(states, {
        hover: false,
        animate: false,
      })
    );

    // Gesture should be disabled but hook should still work
    expect(result.current.hasState('hover')).toBe(true);
  });
});


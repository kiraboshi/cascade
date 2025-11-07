/**
 * Integration tests for Animation Controls
 * Tests animation controls with real animations and DOM elements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { createMotionValue } from '../motion-value';
import { useMotionValue } from '../useMotionValue';

describe('Animation Controls Integration', () => {
  let container: HTMLElement;
  let element: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('div');
    element.id = 'test-element';
    container.appendChild(element);
  });

  afterEach(() => {
    vi.useRealTimers();
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    vi.clearAllMocks();
  });

  describe('Basic Controls with Keyframe Animation', () => {
    it('should play, pause, and resume animation', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      // Start animation
      const animatePromise = x.animateTo(400, { duration: 1000 });
      
      // Advance time by 300ms
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const valueAt300ms = x.get();
      expect(valueAt300ms).toBeGreaterThan(0);
      expect(valueAt300ms).toBeLessThan(400);

      // Pause animation
      act(() => {
        x.pause();
      });

      const valueAfterPause = x.get();
      
      // Advance time more - value should not change
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(x.get()).toBe(valueAfterPause);

      // Resume animation
      act(() => {
        x.play();
      });

      // Advance time to complete
      act(() => {
        vi.advanceTimersByTime(800);
      });

      await waitFor(() => {
        expect(x.get()).toBeCloseTo(400, 1);
      });
    });

    it('should reverse animation direction', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      // Start animation
      x.animateTo(400, { duration: 1000 });
      
      // Advance time by 500ms (halfway)
      act(() => {
        vi.advanceTimersByTime(500);
      });

      const halfwayValue = x.get();
      expect(halfwayValue).toBeGreaterThan(0);
      expect(halfwayValue).toBeLessThan(400);

      // Reverse animation
      act(() => {
        x.reverse();
      });

      // Advance time more - should go back towards start
      act(() => {
        vi.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(x.get()).toBeLessThan(halfwayValue);
      });
    });

    it('should seek to specific progress', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      // Start animation
      x.animateTo(400, { duration: 1000 });

      // Seek to 50%
      act(() => {
        x.seek(0.5);
      });

      await waitFor(() => {
        expect(x.get()).toBeCloseTo(200, 1);
      });

      // Seek to 75%
      act(() => {
        x.seek(0.75);
      });

      await waitFor(() => {
        expect(x.get()).toBeCloseTo(300, 1);
      });
    });

    it('should seek by time', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      // Start animation
      x.animateTo(400, { duration: 1000 });

      // Seek to 250ms (25% of 1000ms)
      act(() => {
        x.seek({ time: 250 });
      });

      await waitFor(() => {
        expect(x.get()).toBeCloseTo(100, 1);
      });
    });

    it('should reset animation', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      // Start animation
      x.animateTo(400, { duration: 1000 });
      
      // Advance time
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(x.get()).toBeGreaterThan(0);

      // Reset
      act(() => {
        x.getTimeline()?.reset();
      });

      await waitFor(() => {
        expect(x.get()).toBeCloseTo(0, 1);
      });
    });
  });

  describe('Spring Animation Controls', () => {
    it('should play, pause, and resume spring animation', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      // Start spring animation
      const animatePromise = x.animateTo(400, {
        stiffness: 300,
        damping: 20,
        mass: 1,
        duration: 2000,
      });

      // Advance time by 500ms
      act(() => {
        vi.advanceTimersByTime(500);
      });

      const valueAt500ms = x.get();
      expect(valueAt500ms).toBeGreaterThan(0);
      expect(valueAt500ms).toBeLessThan(400);

      // Pause
      act(() => {
        x.pause();
      });

      const valueAfterPause = x.get();

      // Advance time more - value should not change
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(x.get()).toBe(valueAfterPause);

      // Resume
      act(() => {
        x.play();
      });

      // Advance time to complete
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(x.get()).toBeCloseTo(400, 10);
      });
    });

    it('should seek spring animation', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      // Start spring animation
      x.animateTo(400, {
        stiffness: 300,
        damping: 20,
        mass: 1,
        duration: 2000,
      });

      // Seek to 50%
      act(() => {
        x.seek(0.5);
      });

      const valueAt50 = x.get();
      expect(valueAt50).toBeGreaterThan(0);
      expect(valueAt50).toBeLessThan(400);

      // Seek to 100%
      act(() => {
        x.seek(1.0);
      });

      await waitFor(() => {
        expect(x.get()).toBeCloseTo(400, 10);
      });
    });

    it('should reverse spring animation', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      // Start spring animation
      x.animateTo(400, {
        stiffness: 300,
        damping: 20,
        mass: 1,
        duration: 2000,
      });

      // Advance time
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const valueBeforeReverse = x.get();
      expect(valueBeforeReverse).toBeGreaterThan(0);

      // Reverse
      act(() => {
        x.reverse();
      });

      // Advance time - should go back
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(x.get()).toBeLessThan(valueBeforeReverse);
      });
    });
  });

  describe('Timeline State Management', () => {
    it('should track animation state changes', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      const stateChanges: Array<{ isPlaying: boolean; isPaused: boolean; isCompleted: boolean }> = [];

      // Start animation
      x.animateTo(400, { duration: 1000 });

      const timeline = x.getTimeline();
      expect(timeline).not.toBeNull();

      if (timeline) {
        const unsubscribe = timeline.onStateChange((state) => {
          stateChanges.push({
            isPlaying: state.isPlaying,
            isPaused: state.isPaused,
            isCompleted: state.isCompleted,
          });
        });

        // Advance time
        act(() => {
          vi.advanceTimersByTime(500);
        });

        // Pause
        act(() => {
          x.pause();
        });

        // Resume
        act(() => {
          x.play();
        });

        // Complete
        act(() => {
          vi.advanceTimersByTime(600);
        });

        await waitFor(() => {
          expect(stateChanges.length).toBeGreaterThan(0);
          expect(stateChanges.some(s => s.isPaused)).toBe(true);
          expect(stateChanges.some(s => s.isCompleted)).toBe(true);
        });

        unsubscribe();
      }
    });

    it('should track progress updates', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      const progressValues: number[] = [];

      // Start animation
      x.animateTo(400, { duration: 1000 });

      const timeline = x.getTimeline();
      expect(timeline).not.toBeNull();

      if (timeline) {
        const unsubscribe = timeline.onProgress((progress) => {
          progressValues.push(progress);
        });

        // Advance time
        act(() => {
          vi.advanceTimersByTime(100);
        });
        act(() => {
          vi.advanceTimersByTime(100);
        });
        act(() => {
          vi.advanceTimersByTime(100);
        });

        await waitFor(() => {
          expect(progressValues.length).toBeGreaterThan(0);
          expect(progressValues.some(p => p > 0 && p < 1)).toBe(true);
        });

        unsubscribe();
      }
    });
  });

  describe('Multiple Motion Values', () => {
    it('should control multiple animations independently', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });
      const y = createMotionValue({ initialValue: 0, property: 'y', unit: 'px', element });

      // Start both animations
      x.animateTo(400, { duration: 1000 });
      y.animateTo(300, { duration: 1500 });

      // Advance time
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Pause only x
      act(() => {
        x.pause();
      });

      const xValueAfterPause = x.get();
      const yValueAfterPause = y.get();

      // Advance time more
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // x should not change, y should continue
      expect(x.get()).toBe(xValueAfterPause);
      expect(y.get()).toBeGreaterThan(yValueAfterPause);

      // Resume x
      act(() => {
        x.play();
      });

      // Complete both
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(x.get()).toBeCloseTo(400, 1);
        expect(y.get()).toBeCloseTo(300, 1);
      });
    });
  });

  describe('React Hook Integration', () => {
    it('should work with useMotionValue hook', async () => {
      const { result } = renderHook(() => useMotionValue(0, { property: 'x', unit: 'px', element }));

      act(() => {
        // Note: useMotionValue already creates a motion value, we just need to animate
        result.current.animateTo(400, { duration: 1000 });
      });

      // Advance time
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.get()).toBeGreaterThan(0);

      // Pause
      act(() => {
        result.current.pause();
      });

      const pausedValue = result.current.get();

      // Advance time - should not change
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.get()).toBe(pausedValue);

      // Resume and complete
      act(() => {
        result.current.play();
        vi.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(result.current.get()).toBeCloseTo(400, 1);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle seek when no animation is active', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      // Seek without animation - should not throw
      expect(() => {
        x.seek(0.5);
      }).not.toThrow();
    });

    it('should handle play/pause when no animation is active', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      // Play/pause without animation - should not throw
      expect(() => {
        x.play();
        x.pause();
      }).not.toThrow();
    });

    it('should handle reverse when no animation is active', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      // Reverse without animation - should not throw
      expect(() => {
        x.reverse();
      }).not.toThrow();
    });

    it('should handle multiple seeks rapidly', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      x.animateTo(400, { duration: 1000 });

      act(() => {
        x.seek(0.1);
        x.seek(0.3);
        x.seek(0.5);
        x.seek(0.7);
        x.seek(0.9);
      });

      await waitFor(() => {
        expect(x.get()).toBeCloseTo(360, 1); // 90% of 400
      });
    });

    it('should handle animation cancellation', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px', element });

      x.animateTo(400, { duration: 1000 });

      // Advance time
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const valueBeforeCancel = x.get();
      expect(valueBeforeCancel).toBeGreaterThan(0);

      // Cancel animation
      act(() => {
        x.getTimeline()?.cancel();
      });

      // Advance time - should not change
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(x.get()).toBe(valueBeforeCancel);
    });
  });
});


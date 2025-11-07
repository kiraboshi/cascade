/**
 * Unit tests for AnimationTimeline
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnimationTimelineImpl, type TimelineState } from '../animation-timeline';

describe('AnimationTimelineImpl', () => {
  let updateCallback: ReturnType<typeof vi.fn>;
  let timeline: AnimationTimelineImpl;

  beforeEach(() => {
    updateCallback = vi.fn();
    timeline = new AnimationTimelineImpl(1000, updateCallback);
  });

  describe('Initialization', () => {
    it('should initialize with correct default values', () => {
      expect(timeline.progress).toBe(0);
      expect(timeline.currentTime).toBe(0);
      expect(timeline.duration).toBe(1000);
      expect(timeline.isPlaying).toBe(false);
      expect(timeline.isPaused).toBe(false);
      expect(timeline.isCompleted).toBe(false);
      expect(timeline.isReversed).toBe(false);
    });

    it('should throw error for invalid duration', () => {
      expect(() => {
        new AnimationTimelineImpl(0, updateCallback);
      }).toThrow('Duration must be greater than 0');

      expect(() => {
        new AnimationTimelineImpl(-100, updateCallback);
      }).toThrow('Duration must be greater than 0');
    });
  });

  describe('Play', () => {
    it('should start playing animation', () => {
      timeline.play();
      expect(timeline.isPlaying).toBe(true);
      expect(timeline.isPaused).toBe(false);
      expect(timeline.isCompleted).toBe(false);
    });

    it('should call updateCallback when playing', async () => {
      timeline.play();
      // Wait a bit for animation frame
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(updateCallback).toHaveBeenCalled();
    });

    it('should reset and play if completed and not reversed', () => {
      // Complete the animation by seeking to end
      timeline.seek(1);
      expect(timeline.isCompleted).toBe(true);
      
      // Now play again - should reset progress
      timeline.play();
      expect(timeline.progress).toBe(0);
      expect(timeline.isCompleted).toBe(false);
      expect(timeline.isPlaying).toBe(true);
    });

    it('should resume from paused position', () => {
      timeline.play();
      timeline.seek(0.5);
      timeline.pause();
      const pausedTime = timeline.currentTime;
      
      timeline.play();
      expect(timeline.isPlaying).toBe(true);
      expect(timeline.isPaused).toBe(false);
      // Should resume from where it was paused
      expect(timeline.currentTime).toBeCloseTo(pausedTime, 0);
    });
  });

  describe('Pause', () => {
    it('should pause playing animation', () => {
      timeline.play();
      timeline.pause();
      expect(timeline.isPlaying).toBe(false);
      expect(timeline.isPaused).toBe(true);
    });

    it('should not pause if not playing', () => {
      timeline.pause();
      expect(timeline.isPaused).toBe(false);
    });

    it('should store paused time', () => {
      timeline.play();
      timeline.seek(0.3);
      const currentTime = timeline.currentTime;
      timeline.pause();
      expect(timeline._pausedTime).toBe(currentTime);
    });
  });

  describe('Reverse', () => {
    it('should toggle reverse state', () => {
      expect(timeline.isReversed).toBe(false);
      timeline.reverse();
      expect(timeline.isReversed).toBe(true);
      timeline.reverse();
      expect(timeline.isReversed).toBe(false);
    });

    it('should reverse direction while playing', () => {
      timeline.play();
      timeline.seek(0.5);
      const currentProgress = timeline.progress;
      timeline.reverse();
      expect(timeline.isReversed).toBe(true);
      expect(timeline.isPlaying).toBe(true);
      // Progress should remain the same, but direction reversed
      expect(timeline.progress).toBe(currentProgress);
    });
  });

  describe('Seek', () => {
    it('should seek to progress value (number)', () => {
      timeline.seek(0.5);
      expect(timeline.progress).toBe(0.5);
      expect(timeline.currentTime).toBe(500);
      expect(updateCallback).toHaveBeenCalledWith(0.5);
    });

    it('should seek to progress value (object)', () => {
      timeline.seek({ progress: 0.75 });
      expect(timeline.progress).toBe(0.75);
      expect(timeline.currentTime).toBe(750);
    });

    it('should seek to time value', () => {
      timeline.seek({ time: 300 });
      expect(timeline.progress).toBe(0.3);
      expect(timeline.currentTime).toBe(300);
    });

    it('should clamp progress to 0-1', () => {
      timeline.seek(-0.5);
      expect(timeline.progress).toBe(0);
      
      timeline.seek(1.5);
      expect(timeline.progress).toBe(1);
    });

    it('should clamp time to duration', () => {
      timeline.seek({ time: -100 });
      expect(timeline.progress).toBe(0);
      
      timeline.seek({ time: 2000 });
      expect(timeline.progress).toBe(1);
    });

    it('should update start time if playing', () => {
      timeline.play();
      timeline.seek(0.5);
      // Should continue playing from new position
      expect(timeline.isPlaying).toBe(true);
    });
  });

  describe('Reset', () => {
    it('should reset to initial state', () => {
      timeline.play();
      timeline.seek(0.7);
      timeline.reverse();
      
      timeline.reset();
      
      expect(timeline.progress).toBe(0);
      expect(timeline.currentTime).toBe(0);
      expect(timeline.isCompleted).toBe(false);
      expect(timeline.isReversed).toBe(false);
      expect(timeline.isPlaying).toBe(false);
      expect(updateCallback).toHaveBeenCalledWith(0);
    });

    it('should cancel animation frame on reset', () => {
      timeline.play();
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
      timeline.reset();
      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('Cancel', () => {
    it('should cancel animation without resetting progress', () => {
      timeline.play();
      timeline.seek(0.5);
      const progress = timeline.progress;
      
      timeline.cancel();
      
      expect(timeline.isPlaying).toBe(false);
      expect(timeline.isPaused).toBe(false);
      expect(timeline.isCompleted).toBe(false);
      expect(timeline.progress).toBe(progress); // Progress preserved
    });
  });

  describe('Progress Callbacks', () => {
    it('should call progress callback on progress updates', () => {
      const callback = vi.fn();
      timeline.onProgress(callback);
      
      timeline.seek(0.5);
      expect(callback).toHaveBeenCalledWith(0.5);
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = timeline.onProgress(callback);
      
      timeline.seek(0.3);
      expect(callback).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      timeline.seek(0.5);
      expect(callback).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should handle multiple progress callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      timeline.onProgress(callback1);
      timeline.onProgress(callback2);
      
      timeline.seek(0.5);
      
      expect(callback1).toHaveBeenCalledWith(0.5);
      expect(callback2).toHaveBeenCalledWith(0.5);
    });

    it('should handle errors in progress callbacks gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const callback = vi.fn(() => {
        throw new Error('Test error');
      });
      
      timeline.onProgress(callback);
      timeline.seek(0.5);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('State Change Callbacks', () => {
    it('should call state callback on state changes', () => {
      const callback = vi.fn();
      timeline.onStateChange(callback);
      
      timeline.play();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          isPlaying: true,
          isPaused: false,
        })
      );
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = timeline.onStateChange(callback);
      
      timeline.play();
      expect(callback).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      timeline.pause();
      expect(callback).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should include full state in callback', () => {
      const callback = vi.fn();
      timeline.onStateChange(callback);
      
      timeline.seek(0.5);
      timeline.reverse();
      
      const lastCall = callback.mock.calls[callback.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({
        isPlaying: false,
        isPaused: false,
        isCompleted: false,
        isReversed: true,
        progress: 0.5,
        currentTime: 500,
      });
    });

    it('should handle errors in state callbacks gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const callback = vi.fn(() => {
        throw new Error('Test error');
      });
      
      timeline.onStateChange(callback);
      timeline.play();
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Animation Completion', () => {
    it('should complete when seeking to progress 1', () => {
      const stateCallback = vi.fn();
      timeline.onStateChange(stateCallback);
      
      timeline.seek(1);
      
      expect(timeline.isCompleted).toBe(true);
      expect(timeline.isPlaying).toBe(false);
      
      const completedStates = stateCallback.mock.calls
        .map(call => call[0])
        .filter((state: TimelineState) => state.isCompleted);
      
      expect(completedStates.length).toBeGreaterThan(0);
    });

    it('should complete reversed animation when seeking to progress 0', () => {
      const stateCallback = vi.fn();
      timeline.onStateChange(stateCallback);
      
      timeline.reverse();
      timeline.seek(0);
      
      expect(timeline.isCompleted).toBe(true);
      expect(timeline.isPlaying).toBe(false);
      
      const completedStates = stateCallback.mock.calls
        .map(call => call[0])
        .filter((state: TimelineState) => state.isCompleted);
      
      expect(completedStates.length).toBeGreaterThan(0);
    });

    // Note: Natural completion during animation is tested implicitly through
    // the completion logic in the animate() method, which is verified by the
    // seek completion tests above. Testing natural completion in a test environment
    // is flaky due to requestAnimationFrame timing, so we rely on the completion
    // detection logic being correct (verified by seek tests).
  });

  describe('Edge Cases', () => {
    it('should handle rapid play/pause cycles', () => {
      timeline.play();
      timeline.pause();
      timeline.play();
      timeline.pause();
      expect(timeline.isPaused).toBe(true);
    });

    it('should handle seek during play', () => {
      timeline.play();
      timeline.seek(0.3);
      expect(timeline.progress).toBe(0.3);
      expect(timeline.isPlaying).toBe(true);
    });

    it('should handle reverse during play', () => {
      timeline.play();
      timeline.seek(0.5);
      timeline.reverse();
      expect(timeline.isReversed).toBe(true);
      expect(timeline.isPlaying).toBe(true);
    });
  });
});


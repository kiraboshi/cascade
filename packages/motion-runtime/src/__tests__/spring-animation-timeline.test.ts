/**
 * Unit tests for SpringAnimationTimeline
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SpringAnimationTimeline } from '../animation-timeline';
import type { SpringConfig } from '@cascade/compiler';

describe('SpringAnimationTimeline', () => {
  let updateCallback: ReturnType<typeof vi.fn>;
  let springConfig: SpringConfig;
  
  beforeEach(() => {
    updateCallback = vi.fn();
    springConfig = {
      stiffness: 300,
      damping: 20,
      mass: 1,
      from: 0,
      to: 100,
    };
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Initialization', () => {
    it('should create timeline with spring config', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      expect(timeline.duration).toBeGreaterThan(0);
      expect(timeline.progress).toBe(0);
      expect(timeline.currentTime).toBe(0);
      expect(timeline.isPlaying).toBe(false);
      expect(timeline.isPaused).toBe(false);
      expect(timeline.isCompleted).toBe(false);
      expect(timeline.isReversed).toBe(false);
    });
    
    it('should use provided estimated duration', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback,
        3000
      );
      
      expect(timeline.duration).toBe(3000);
    });
    
    it('should pre-solve spring values', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      // Timeline should have solved values (we can't directly access them, but seek should work)
      timeline.seek(0.5);
      expect(updateCallback).toHaveBeenCalled();
      const calls = updateCallback.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const lastCall = calls[calls.length - 1];
      expect(lastCall).toBeDefined();
      expect(lastCall.length).toBeGreaterThan(0);
      const calledValue = lastCall[0];
      expect(typeof calledValue).toBe('number');
      expect(isNaN(calledValue)).toBe(false);
      expect(calledValue).toBeGreaterThanOrEqual(0);
      expect(calledValue).toBeLessThanOrEqual(100);
    });
  });
  
  describe('Play', () => {
    it('should start animation', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      timeline.play();
      
      expect(timeline.isPlaying).toBe(true);
      expect(timeline.isPaused).toBe(false);
      expect(timeline.isCompleted).toBe(false);
    });
    
    it('should reset and play if completed and not reversed', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      timeline.seek(1);
      expect(timeline.isCompleted).toBe(true);
      
      timeline.play();
      
      expect(timeline.isCompleted).toBe(false);
      expect(timeline.isPlaying).toBe(true);
      expect(timeline.progress).toBeLessThanOrEqual(1);
    });
  });
  
  describe('Pause', () => {
    it('should pause playing animation', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      timeline.play();
      expect(timeline.isPlaying).toBe(true);
      
      timeline.pause();
      
      expect(timeline.isPlaying).toBe(false);
      expect(timeline.isPaused).toBe(true);
    });
    
    it('should not pause if not playing', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      timeline.pause();
      
      expect(timeline.isPaused).toBe(false);
    });
  });
  
  describe('Reverse', () => {
    it('should reverse animation direction', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      expect(timeline.isReversed).toBe(false);
      
      timeline.reverse();
      
      expect(timeline.isReversed).toBe(true);
      
      timeline.reverse();
      
      expect(timeline.isReversed).toBe(false);
    });
    
    it('should maintain playing state when reversing', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      timeline.play();
      expect(timeline.isPlaying).toBe(true);
      
      timeline.reverse();
      
      expect(timeline.isPlaying).toBe(true);
      expect(timeline.isReversed).toBe(true);
    });
  });
  
  describe('Seek', () => {
    it('should seek to progress value', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      timeline.seek(0.5);
      
      expect(timeline.progress).toBe(0.5);
      expect(updateCallback).toHaveBeenCalled();
    });
    
    it('should seek to time value', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback,
        2000
      );
      
      timeline.seek({ time: 1000 });
      
      expect(timeline.progress).toBe(0.5);
      expect(timeline.currentTime).toBe(1000);
    });
    
    it('should seek to progress object', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      timeline.seek({ progress: 0.75 });
      
      expect(timeline.progress).toBe(0.75);
    });
    
    it('should clamp progress to 0-1', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      timeline.seek(-0.5);
      expect(timeline.progress).toBe(0);
      
      timeline.seek(1.5);
      expect(timeline.progress).toBe(1);
    });
    
    it('should complete animation when seeking to end', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      timeline.seek(1);
      
      expect(timeline.isCompleted).toBe(true);
      expect(timeline.isPlaying).toBe(false);
    });
    
    it('should complete reversed animation when seeking to start', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      timeline.reverse();
      timeline.seek(0);
      
      expect(timeline.isCompleted).toBe(true);
    });
  });
  
  describe('Reset', () => {
    it('should reset to initial state', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      timeline.play();
      timeline.seek(0.5);
      timeline.reverse();
      
      timeline.reset();
      
      expect(timeline.progress).toBe(0);
      expect(timeline.currentTime).toBe(0);
      expect(timeline.isPlaying).toBe(false);
      expect(timeline.isPaused).toBe(false);
      expect(timeline.isCompleted).toBe(false);
      expect(timeline.isReversed).toBe(false);
      expect(updateCallback).toHaveBeenCalledWith(0);
    });
  });
  
  describe('Cancel', () => {
    it('should cancel animation', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      timeline.play();
      expect(timeline.isPlaying).toBe(true);
      
      timeline.cancel();
      
      expect(timeline.isPlaying).toBe(false);
      expect(timeline.isPaused).toBe(false);
      expect(timeline.isCompleted).toBe(false);
    });
  });
  
  describe('Progress Callbacks', () => {
    it('should call progress callback on seek', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      const progressCallback = vi.fn();
      timeline.onProgress(progressCallback);
      
      timeline.seek(0.5);
      
      expect(progressCallback).toHaveBeenCalledWith(0.5);
    });
    
    it('should unsubscribe from progress callback', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      const progressCallback = vi.fn();
      const unsubscribe = timeline.onProgress(progressCallback);
      
      timeline.seek(0.5);
      expect(progressCallback).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      timeline.seek(0.75);
      
      expect(progressCallback).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('State Change Callbacks', () => {
    it('should call state callback on play', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      const stateCallback = vi.fn();
      timeline.onStateChange(stateCallback);
      
      timeline.play();
      
      expect(stateCallback).toHaveBeenCalled();
      const state = stateCallback.mock.calls[stateCallback.mock.calls.length - 1][0];
      expect(state.isPlaying).toBe(true);
    });
    
    it('should unsubscribe from state callback', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      const stateCallback = vi.fn();
      const unsubscribe = timeline.onStateChange(stateCallback);
      
      timeline.play();
      expect(stateCallback).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      timeline.pause();
      
      expect(stateCallback).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Animation Completion', () => {
    it('should complete forward animation at progress 1', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      timeline.seek(1);
      
      expect(timeline.isCompleted).toBe(true);
      expect(timeline.isPlaying).toBe(false);
    });
    
    it('should complete reversed animation at progress 0', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback
      );
      
      timeline.reverse();
      timeline.seek(0);
      
      expect(timeline.isCompleted).toBe(true);
      expect(timeline.isPlaying).toBe(false);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle spring config without initialVelocity', () => {
      const configWithoutVelocity: SpringConfig = {
        stiffness: 300,
        damping: 20,
        mass: 1,
        from: 0,
        to: 100,
      };
      
      const timeline = new SpringAnimationTimeline(
        configWithoutVelocity,
        0,
        100,
        updateCallback
      );
      
      expect(timeline).toBeDefined();
      timeline.play();
      expect(timeline.isPlaying).toBe(true);
    });
    
    it('should handle very short duration', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback,
        100
      );
      
      expect(timeline.duration).toBe(100);
      timeline.seek(0.5);
      expect(timeline.progress).toBe(0.5);
    });
    
    it('should handle very long duration', () => {
      const timeline = new SpringAnimationTimeline(
        springConfig,
        0,
        100,
        updateCallback,
        10000
      );
      
      expect(timeline.duration).toBe(10000);
      timeline.seek(0.5);
      expect(timeline.progress).toBe(0.5);
    });
  });
});


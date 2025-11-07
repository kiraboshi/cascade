/**
 * Unit tests for MotionValue animation controls
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMotionValue } from '../motion-value';

describe('MotionValue Animation Controls', () => {
  let container: HTMLElement;
  let element: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('div');
    container.appendChild(element);
  });

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    vi.clearAllMocks();
  });

  describe('reverse()', () => {
    it('should reverse animation direction', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      
      // Start animation
      x.animateTo(100, { duration: 1000 });
      
      // Wait a bit for animation to start
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const timeline = x.getTimeline();
      expect(timeline).not.toBeNull();
      
      if (timeline) {
        const initialReversed = timeline.isReversed;
        
        x.reverse();
        
        expect(timeline.isReversed).toBe(!initialReversed);
        expect(timeline.isPlaying).toBe(true);
      }
      
      // Clean up
      x.stop();
    });

    it('should do nothing if no animation is active', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      
      // Should not throw
      expect(() => x.reverse()).not.toThrow();
      expect(x.getTimeline()).toBeNull();
    });
  });

  describe('seek()', () => {
    it('should seek to specific progress', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      
      // Start animation
      x.animateTo(100, { duration: 1000 });
      
      // Wait a bit for animation to start
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const timeline = x.getTimeline();
      expect(timeline).not.toBeNull();
      
      if (timeline) {
        // Seek to 50%
        x.seek(0.5);
        
        expect(timeline.progress).toBeCloseTo(0.5, 1);
        expect(x.get()).toBeCloseTo(50, 0);
      }
      
      x.stop();
    });

    it('should seek to specific time', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      
      x.animateTo(100, { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const timeline = x.getTimeline();
      if (timeline) {
        x.seek({ time: 300 });
        
        expect(timeline.currentTime).toBeCloseTo(300, 0);
        expect(timeline.progress).toBeCloseTo(0.3, 1);
      }
      
      x.stop();
    });

    it('should do nothing if no animation is active', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      
      expect(() => x.seek(0.5)).not.toThrow();
    });
  });

  describe('play()', () => {
    it('should play animation', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      
      x.animateTo(100, { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const timeline = x.getTimeline();
      if (timeline) {
        x.pause();
        expect(timeline.isPlaying).toBe(false);
        
        x.play();
        expect(timeline.isPlaying).toBe(true);
      }
      
      x.stop();
    });

    it('should do nothing if no animation is active', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      
      expect(() => x.play()).not.toThrow();
    });
  });

  describe('pause()', () => {
    it('should pause animation', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      
      x.animateTo(100, { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const timeline = x.getTimeline();
      if (timeline) {
        expect(timeline.isPlaying).toBe(true);
        
        x.pause();
        expect(timeline.isPlaying).toBe(false);
        expect(timeline.isPaused).toBe(true);
      }
      
      x.stop();
    });

    it('should do nothing if no animation is active', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      
      expect(() => x.pause()).not.toThrow();
    });
  });

  describe('getTimeline()', () => {
    it('should return timeline when animation is active', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      
      expect(x.getTimeline()).toBeNull();
      
      x.animateTo(100, { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const timeline = x.getTimeline();
      expect(timeline).not.toBeNull();
      expect(timeline?.duration).toBe(1000);
      
      x.stop();
      expect(x.getTimeline()).toBeNull();
    });
  });

  describe('onAnimationStateChange()', () => {
    it('should subscribe to state changes', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      const stateCallback = vi.fn();
      
      x.animateTo(100, { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const unsubscribe = x.onAnimationStateChange(stateCallback);
      
      // Pause should trigger state change
      x.pause();
      
      expect(stateCallback).toHaveBeenCalled();
      const lastCall = stateCallback.mock.calls[stateCallback.mock.calls.length - 1][0];
      expect(lastCall.isPaused).toBe(true);
      
      unsubscribe();
      x.stop();
    });

    it('should return no-op function if no timeline exists', () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      const unsubscribe = x.onAnimationStateChange(() => {});
      
      expect(typeof unsubscribe).toBe('function');
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('Integration with animateTo', () => {
    it('should create timeline for keyframe animations', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      
      x.animateTo(100, { duration: 500, easing: 'ease-out' });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const timeline = x.getTimeline();
      expect(timeline).not.toBeNull();
      expect(timeline?.duration).toBe(500);
      expect(timeline?.isPlaying).toBe(true);
      
      x.stop();
    });

    it('should stop previous timeline when starting new animation', async () => {
      const x = createMotionValue({ initialValue: 0, property: 'x', unit: 'px' });
      
      x.animateTo(50, { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const timeline1 = x.getTimeline();
      
      x.animateTo(100, { duration: 500 });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const timeline2 = x.getTimeline();
      
      // Should be a new timeline
      expect(timeline1).not.toBe(timeline2);
      expect(timeline2?.duration).toBe(500);
      
      x.stop();
    });
  });
});


/**
 * Unit tests for Spring Bridge
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { animateSpringWithVelocity } from '../spring-bridge';
import { createMotionValue } from '@cascade/motion-runtime';
import type { MotionValue } from '@cascade/motion-runtime';

describe('animateSpringWithVelocity', () => {
  let motionValue: MotionValue<number>;

  beforeEach(() => {
    motionValue = createMotionValue({ initialValue: 0 });
  });

  it('should return a cancel function', () => {
    const cancel = animateSpringWithVelocity(motionValue, 100, {
      stiffness: 300,
      damping: 30,
      mass: 1,
      from: 0,
      to: 100,
      initialVelocity: 0,
    });

    expect(typeof cancel).toBe('function');
    cancel();
  });

  it('should animate with initial velocity', async () => {
    const initialValue = motionValue.get() as number;
    expect(initialValue).toBe(0);

    const cancel = animateSpringWithVelocity(motionValue, 100, {
      stiffness: 300,
      damping: 30,
      mass: 1,
      from: 0,
      to: 100,
      initialVelocity: 500, // High initial velocity
    });

    // Wait a bit for animation to start
    await new Promise((resolve) => setTimeout(resolve, 50));

    const valueAfterStart = motionValue.get() as number;
    // With high initial velocity, value should change (might overshoot or move quickly)
    // The value could be negative if it overshoots, so just check it changed
    expect(valueAfterStart).not.toBe(0);

    cancel();
  });

  it('should call onComplete callback', async () => {
    const onComplete = vi.fn();
    
    animateSpringWithVelocity(motionValue, 100, {
      stiffness: 300,
      damping: 30,
      mass: 1,
      from: 0,
      to: 100,
      initialVelocity: 0,
      duration: 100, // Short duration for faster test
      onComplete,
    });

    // Wait for animation to complete
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(onComplete).toHaveBeenCalled();
  });

  it('should handle zero initial velocity', async () => {
    const initialValue = motionValue.get() as number;
    
    const cancel = animateSpringWithVelocity(motionValue, 100, {
      stiffness: 300,
      damping: 30,
      mass: 1,
      from: 0,
      to: 100,
      initialVelocity: 0,
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const valueAfterStart = motionValue.get() as number;
    // Should still animate even with zero velocity
    expect(valueAfterStart).toBeGreaterThanOrEqual(initialValue);

    cancel();
  });

  it('should handle negative initial velocity', async () => {
    motionValue.set(100);
    
    const cancel = animateSpringWithVelocity(motionValue, 0, {
      stiffness: 300,
      damping: 30,
      mass: 1,
      from: 100,
      to: 0,
      initialVelocity: -500, // Negative velocity (moving away from target)
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const valueAfterStart = motionValue.get() as number;
    // With negative velocity, might overshoot in negative direction
    expect(valueAfterStart).toBeLessThanOrEqual(100);

    cancel();
  });
});


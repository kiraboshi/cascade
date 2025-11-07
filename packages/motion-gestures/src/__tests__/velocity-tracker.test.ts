/**
 * Unit tests for VelocityTracker
 */

import { describe, it, expect } from 'vitest';
import { VelocityTracker } from '../velocity-tracker';

describe('VelocityTracker', () => {
  it('should initialize with empty points', () => {
    const tracker = new VelocityTracker();
    const velocity = tracker.getVelocity();
    expect(velocity).toEqual({ x: 0, y: 0 });
  });

  it('should calculate velocity from two points', () => {
    const tracker = new VelocityTracker();
    
    const now = Date.now();
    // Add first point
    tracker.addPoint({ x: 0, y: 0, timestamp: now });
    
    // Add second point 100ms later, 100px to the right
    tracker.addPoint({ x: 100, y: 0, timestamp: now + 100 });
    
    const velocity = tracker.getVelocity();
    // Velocity = 100px / 0.1s = 1000 px/s
    expect(velocity.x).toBeCloseTo(1000, -1); // Within 10 px/s
    expect(velocity.y).toBe(0);
  });

  it('should calculate velocity in both directions', () => {
    const tracker = new VelocityTracker();
    
    const now = Date.now();
    tracker.addPoint({ x: 0, y: 0, timestamp: now });
    tracker.addPoint({ x: 50, y: 75, timestamp: now + 100 });
    
    const velocity = tracker.getVelocity();
    expect(velocity.x).toBeCloseTo(500, -1); // 50px / 0.1s
    expect(velocity.y).toBeCloseTo(750, -1); // 75px / 0.1s
  });

  it('should return zero velocity with less than 2 points', () => {
    const tracker = new VelocityTracker();
    
    tracker.addPoint({ x: 100, y: 100, timestamp: 0 });
    
    const velocity = tracker.getVelocity();
    expect(velocity).toEqual({ x: 0, y: 0 });
  });

  it('should filter old points outside time window', () => {
    const tracker = new VelocityTracker();
    
    // Add old point (outside 100ms window)
    tracker.addPoint({ x: 0, y: 0, timestamp: 0 });
    
    // Add recent point
    tracker.addPoint({ x: 100, y: 0, timestamp: 200 }); // 200ms later
    
    // Add another recent point
    tracker.addPoint({ x: 150, y: 0, timestamp: 250 }); // 250ms later
    
    const velocity = tracker.getVelocity();
    // Should calculate from points at 200ms and 250ms (50px in 50ms = 1000 px/s)
    expect(velocity.x).toBeCloseTo(1000, 0);
  });

  it('should limit to max points', () => {
    const tracker = new VelocityTracker();
    
    // Add more than 10 points
    for (let i = 0; i < 15; i++) {
      tracker.addPoint({ x: i * 10, y: 0, timestamp: i * 10 });
    }
    
    // Should only keep the last 10 points
    const velocity = tracker.getVelocity();
    // Should calculate from points 5-14 (90px difference over 90ms = 1000 px/s)
    expect(velocity.x).toBeCloseTo(1000, 0);
  });

  it('should reset and clear all points', () => {
    const tracker = new VelocityTracker();
    
    tracker.addPoint({ x: 0, y: 0, timestamp: 0 });
    tracker.addPoint({ x: 100, y: 100, timestamp: 100 });
    
    tracker.reset();
    
    const velocity = tracker.getVelocity();
    expect(velocity).toEqual({ x: 0, y: 0 });
  });

  it('should handle zero time delta', () => {
    const tracker = new VelocityTracker();
    
    tracker.addPoint({ x: 0, y: 0, timestamp: 100 });
    tracker.addPoint({ x: 100, y: 100, timestamp: 100 }); // Same timestamp
    
    const velocity = tracker.getVelocity();
    expect(velocity).toEqual({ x: 0, y: 0 });
  });
});


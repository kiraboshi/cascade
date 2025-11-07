/**
 * Unit tests for GestureHandler
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createGestureHandler, type GestureHandler } from '../gesture-handler';
import { createMotionValue } from '@cascade/motion-runtime';
import type { MotionValue } from '@cascade/motion-runtime';

describe('GestureHandler', () => {
  let element: HTMLElement;
  let motionValues: { x: MotionValue<number>; y: MotionValue<number> };

  beforeEach(() => {
    // Create a test element
    element = document.createElement('div');
    document.body.appendChild(element);

    // Create motion values
    motionValues = {
      x: createMotionValue({ initialValue: 0 }),
      y: createMotionValue({ initialValue: 0 }),
    };
  });

  it('should create a gesture handler', () => {
    const handler = createGestureHandler(element, motionValues);
    expect(handler).toBeDefined();
    expect(typeof handler.start).toBe('function');
    expect(typeof handler.stop).toBe('function');
    expect(typeof handler.isActive).toBe('function');
    expect(typeof handler.getState).toBe('function');
  });

  it('should not be active initially', () => {
    const handler = createGestureHandler(element, motionValues);
    handler.start();
    expect(handler.isActive()).toBe(false);
  });

  it('should activate on pointer down', () => {
    const handler = createGestureHandler(element, motionValues);
    handler.start();

    const event = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      bubbles: true,
    });

    element.dispatchEvent(event);
    expect(handler.isActive()).toBe(true);
    
    handler.stop();
  });

  it('should update motion values on pointer move', () => {
    const handler = createGestureHandler(element, motionValues);
    handler.start();

    // Start gesture
    const downEvent = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      bubbles: true,
    });
    element.dispatchEvent(downEvent);

    // Move pointer
    const moveEvent = new PointerEvent('pointermove', {
      clientX: 150,
      clientY: 120,
      pointerId: 1,
      bubbles: true,
    });
    document.dispatchEvent(moveEvent);

    // Check that motion values were updated
    const state = handler.getState();
    expect(state.delta.x).toBe(50); // 150 - 100
    expect(state.delta.y).toBe(20); // 120 - 100

    handler.stop();
  });

  it('should apply axis constraints', () => {
    const handler = createGestureHandler(element, motionValues, {
      axis: 'x',
    });
    handler.start();

    const downEvent = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      bubbles: true,
    });
    element.dispatchEvent(downEvent);

    const moveEvent = new PointerEvent('pointermove', {
      clientX: 150,
      clientY: 150,
      pointerId: 1,
      bubbles: true,
    });
    document.dispatchEvent(moveEvent);

    const state = handler.getState();
    expect(state.delta.x).toBe(50);
    expect(state.delta.y).toBe(0); // Should be 0 due to axis constraint

    handler.stop();
  });

  it('should apply min/max constraints', () => {
    const handler = createGestureHandler(element, motionValues, {
      constraints: {
        min: { x: -50, y: -50 },
        max: { x: 50, y: 50 },
      },
    });
    handler.start();

    const downEvent = new PointerEvent('pointerdown', {
      clientX: 0,
      clientY: 0,
      pointerId: 1,
      bubbles: true,
    });
    element.dispatchEvent(downEvent);

    // Try to move beyond max constraint
    const moveEvent = new PointerEvent('pointermove', {
      clientX: 200,
      clientY: 200,
      pointerId: 1,
      bubbles: true,
    });
    document.dispatchEvent(moveEvent);

    // Motion values should be clamped
    const xValue = motionValues.x.get() as number;
    const yValue = motionValues.y.get() as number;
    expect(xValue).toBeLessThanOrEqual(50);
    expect(yValue).toBeLessThanOrEqual(50);

    handler.stop();
  });

  it('should calculate velocity', () => {
    const handler = createGestureHandler(element, motionValues);
    handler.start();

    const downEvent = new PointerEvent('pointerdown', {
      clientX: 0,
      clientY: 0,
      pointerId: 1,
      bubbles: true,
      timeStamp: 0,
    });
    element.dispatchEvent(downEvent);

    // Move quickly
    const moveEvent = new PointerEvent('pointermove', {
      clientX: 100,
      clientY: 0,
      pointerId: 1,
      bubbles: true,
      timeStamp: 100,
    });
    document.dispatchEvent(moveEvent);

    const upEvent = new PointerEvent('pointerup', {
      clientX: 100,
      clientY: 0,
      pointerId: 1,
      bubbles: true,
    });
    document.dispatchEvent(upEvent);

    const state = handler.getState();
    expect(state.velocity.x).toBeGreaterThan(0);
    expect(state.isActive).toBe(false);

    handler.stop();
  });

  it('should call onStart callback', () => {
    const onStart = vi.fn();
    const handler = createGestureHandler(element, motionValues, {
      onStart,
    });
    handler.start();

    const downEvent = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      bubbles: true,
    });
    element.dispatchEvent(downEvent);

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        isActive: true,
        startPoint: { x: 100, y: 100 },
      }),
      expect.any(PointerEvent)
    );

    handler.stop();
  });

  it('should call onEnd callback', () => {
    const onEnd = vi.fn();
    const handler = createGestureHandler(element, motionValues, {
      onEnd,
    });
    handler.start();

    const downEvent = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      bubbles: true,
    });
    element.dispatchEvent(downEvent);

    const upEvent = new PointerEvent('pointerup', {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      bubbles: true,
    });
    document.dispatchEvent(upEvent);

    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        isActive: false,
      })
    );

    handler.stop();
  });

  it('should stop and clean up', () => {
    const handler = createGestureHandler(element, motionValues);
    handler.start();

    const downEvent = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      bubbles: true,
    });
    element.dispatchEvent(downEvent);

    expect(handler.isActive()).toBe(true);

    handler.stop();

    // After stop, new pointer events should not activate
    const newDownEvent = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
      pointerId: 2,
      bubbles: true,
    });
    element.dispatchEvent(newDownEvent);

    expect(handler.isActive()).toBe(false);
  });
});


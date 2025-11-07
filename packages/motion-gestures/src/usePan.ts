/**
 * usePan Hook
 * React hook for pan gestures (similar to drag but optimized for touch)
 */

import { useDrag } from './useDrag';
import type { GestureConfig } from './gesture-handler';
import type { MotionValue } from '@cascade/motion-runtime';
import type { RefObject } from 'react';

/**
 * React hook for pan gestures
 * Similar to useDrag but optimized for touch/pointer pan gestures
 */
export function usePan(
  motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
  },
  config?: GestureConfig
): RefObject<HTMLElement> {
  // For now, pan is the same as drag but with lower threshold
  return useDrag(motionValues, {
    ...config,
    threshold: config?.threshold ?? 5, // Lower threshold for pan
  });
}


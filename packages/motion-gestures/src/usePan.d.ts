/**
 * usePan Hook
 * React hook for pan gestures (similar to drag but optimized for touch)
 */
import type { GestureConfig } from './gesture-handler';
import type { MotionValue } from '@cascade/motion-runtime';
import type { RefObject } from 'react';
/**
 * React hook for pan gestures
 * Similar to useDrag but optimized for touch/pointer pan gestures
 */
export declare function usePan(motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
}, config?: GestureConfig): RefObject<HTMLElement>;
//# sourceMappingURL=usePan.d.ts.map
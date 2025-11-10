/**
 * useDrag Hook
 * React hook for drag gestures
 */
import { type RefObject } from 'react';
import type { MotionValue } from '@cascade/motion-runtime';
import type { GestureConfig } from './gesture-handler';
/**
 * React hook for drag gestures
 * Returns a ref that should be attached to the draggable element
 */
export declare function useDrag(motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
}, config?: GestureConfig): RefObject<HTMLElement>;
//# sourceMappingURL=useDrag.d.ts.map
/**
 * useWheel Hook
 * React hook for wheel/scroll wheel gestures
 */
import { type RefObject } from 'react';
import type { MotionValue } from '@cascade/motion-runtime';
import type { SpringConfig } from '@cascade/compiler';
export interface WheelConfig {
    axis?: 'x' | 'y' | 'both';
    multiplier?: number;
    spring?: SpringConfig;
}
/**
 * React hook for wheel gestures
 * Returns a ref that should be attached to the element
 */
export declare function useWheel(motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
}, config?: WheelConfig): RefObject<HTMLElement>;
//# sourceMappingURL=useWheel.d.ts.map
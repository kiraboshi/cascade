/**
 * Tap Animation Hook
 * Animate motion values based on tap gestures
 */
import { type RefObject } from 'react';
import type { MotionValue } from '@cascade/motion-runtime';
import type { SpringConfig } from '@cascade/compiler';
import type { MotionValueKeyframeConfig } from '@cascade/motion-runtime';
export interface TapAnimationConfig {
    /**
     * Animation when tap starts
     */
    onTapStart?: {
        target: number | string;
        config?: SpringConfig | MotionValueKeyframeConfig;
    };
    /**
     * Animation when tap ends
     */
    onTapEnd?: {
        target: number | string;
        config?: SpringConfig | MotionValueKeyframeConfig;
    };
    /**
     * Callback when tap completes (for side effects, not animation)
     */
    onTap?: (event: MouseEvent | TouchEvent) => void;
    /**
     * Disable tap detection
     */
    disabled?: boolean;
    /**
     * Maximum distance (in px) for a tap
     */
    tapThreshold?: number;
    /**
     * Maximum time (in ms) for a tap
     */
    tapTimeout?: number;
}
/**
 * Hook to animate motion values on tap
 * Returns a ref that should be attached to the tappable element
 */
export declare function useTapAnimation(motionValue: MotionValue<number | string>, config: TapAnimationConfig): RefObject<HTMLElement>;
//# sourceMappingURL=useTapAnimation.d.ts.map
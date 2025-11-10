/**
 * Hover Animation Hook
 * Animate motion values based on hover state
 */
import { type RefObject } from 'react';
import type { MotionValue } from '@cascade/motion-runtime';
import type { SpringConfig } from '@cascade/compiler';
import type { MotionValueKeyframeConfig } from '@cascade/motion-runtime';
export interface HoverAnimationConfig {
    /**
     * Animation when hover starts
     */
    onHoverStart?: {
        target: number | string;
        config?: SpringConfig | MotionValueKeyframeConfig;
    };
    /**
     * Animation when hover ends
     */
    onHoverEnd?: {
        target: number | string;
        config?: SpringConfig | MotionValueKeyframeConfig;
    };
    /**
     * Disable hover detection
     */
    disabled?: boolean;
}
/**
 * Hook to animate motion values on hover
 * Returns a ref that should be attached to the hoverable element
 */
export declare function useHoverAnimation(motionValue: MotionValue<number | string>, config: HoverAnimationConfig): RefObject<HTMLElement>;
//# sourceMappingURL=useHoverAnimation.d.ts.map
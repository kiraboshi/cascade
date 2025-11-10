/**
 * Focus Animation Hook
 * Animate motion values based on focus state
 */
import { type RefObject } from 'react';
import type { MotionValue } from '@cascade/motion-runtime';
import type { SpringConfig } from '@cascade/compiler';
import type { MotionValueKeyframeConfig } from '@cascade/motion-runtime';
export interface FocusAnimationConfig {
    /**
     * Animation when focus starts
     */
    onFocusStart?: {
        target: number | string;
        config?: SpringConfig | MotionValueKeyframeConfig;
    };
    /**
     * Animation when focus ends
     */
    onFocusEnd?: {
        target: number | string;
        config?: SpringConfig | MotionValueKeyframeConfig;
    };
    /**
     * Disable focus detection
     */
    disabled?: boolean;
}
/**
 * Hook to animate motion values on focus
 * Returns a ref that should be attached to the focusable element
 */
export declare function useFocusAnimation(motionValue: MotionValue<number | string>, config: FocusAnimationConfig): RefObject<HTMLElement>;
//# sourceMappingURL=useFocusAnimation.d.ts.map
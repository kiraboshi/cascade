/**
 * useScroll Hook
 * React hook for scroll-driven animations
 */
import type { MotionValue } from '@cascade/motion-runtime';
import type { SpringConfig } from '@cascade/compiler';
export interface ScrollConfig {
    axis?: 'x' | 'y' | 'both';
    multiplier?: number;
    spring?: SpringConfig;
    container?: HTMLElement | Window;
}
/**
 * React hook for scroll-driven motion values
 */
export declare function useScrollMotion(motionValue: MotionValue<number>, config?: ScrollConfig): void;
//# sourceMappingURL=useScroll.d.ts.map
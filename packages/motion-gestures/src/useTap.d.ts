/**
 * Tap Gesture Hooks
 * Detect tap/click gestures on elements
 */
import { type RefObject } from 'react';
export interface TapConfig {
    /**
     * Callback when tap starts
     */
    onTapStart?: (event: MouseEvent | TouchEvent) => void;
    /**
     * Callback when tap completes
     */
    onTap?: (event: MouseEvent | TouchEvent) => void;
    /**
     * Callback when tap is cancelled (e.g., drag starts)
     */
    onTapCancel?: (event: MouseEvent | TouchEvent) => void;
    /**
     * Maximum distance (in px) for a tap (prevents tap on drag)
     */
    tapThreshold?: number;
    /**
     * Maximum time (in ms) for a tap
     */
    tapTimeout?: number;
    /**
     * Disable tap detection
     */
    disabled?: boolean;
}
export interface TapState {
    isTapping: boolean;
    tapCount: number;
}
/**
 * Hook to detect tap gestures on an element
 * Returns a ref that should be attached to the tappable element
 */
export declare function useTap(config?: TapConfig): RefObject<HTMLElement>;
/**
 * Hook that returns detailed tap state
 * Useful when you need access to tap count and tapping state
 */
export declare function useTapState(config?: TapConfig): [RefObject<HTMLElement>, TapState];
//# sourceMappingURL=useTap.d.ts.map
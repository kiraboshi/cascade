/**
 * Hover Gesture Hooks
 * Detect hover state on elements
 */
import { type RefObject } from 'react';
export interface HoverConfig {
    /**
     * Callback when hover starts
     */
    onHoverStart?: (event: MouseEvent) => void;
    /**
     * Callback when hover ends
     */
    onHoverEnd?: (event: MouseEvent) => void;
    /**
     * Callback when hover state changes
     */
    onHoverChange?: (isHovering: boolean) => void;
    /**
     * Disable hover detection
     */
    disabled?: boolean;
}
export interface HoverState {
    isHovering: boolean;
}
/**
 * Hook to detect hover state on an element
 * Returns a ref and boolean indicating hover state
 */
export declare function useHover(config?: HoverConfig): [RefObject<HTMLElement>, boolean];
/**
 * Hook that returns detailed hover state
 * Useful when you need access to the state object
 */
export declare function useHoverState(config?: HoverConfig): [RefObject<HTMLElement>, HoverState];
//# sourceMappingURL=useHover.d.ts.map
/**
 * Focus Gesture Hooks
 * Detect focus state on elements
 */
import { type RefObject } from 'react';
export interface FocusConfig {
    /**
     * Callback when focus starts
     */
    onFocusStart?: (event: FocusEvent) => void;
    /**
     * Callback when focus ends
     */
    onFocusEnd?: (event: FocusEvent) => void;
    /**
     * Callback when focus state changes
     */
    onFocusChange?: (isFocused: boolean) => void;
    /**
     * Disable focus detection
     */
    disabled?: boolean;
}
export interface FocusState {
    isFocused: boolean;
}
/**
 * Hook to detect focus state on an element
 * Returns a ref and boolean indicating focus state
 */
export declare function useFocus(config?: FocusConfig): [RefObject<HTMLElement>, boolean];
/**
 * Hook that returns detailed focus state
 * Useful when you need access to the state object
 */
export declare function useFocusState(config?: FocusConfig): [RefObject<HTMLElement>, FocusState];
//# sourceMappingURL=useFocus.d.ts.map
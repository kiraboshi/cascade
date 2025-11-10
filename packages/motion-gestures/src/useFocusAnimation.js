/**
 * Focus Animation Hook
 * Animate motion values based on focus state
 */
import { useRef } from 'react';
import { useFocus } from './useFocus';
/**
 * Hook to animate motion values on focus
 * Returns a ref that should be attached to the focusable element
 */
export function useFocusAnimation(motionValue, config) {
    const configRef = useRef(config);
    configRef.current = config;
    const [focusRef, isFocused] = useFocus({
        disabled: config.disabled,
        onFocusChange: (focused) => {
            const currentConfig = configRef.current;
            if (focused && currentConfig.onFocusStart) {
                motionValue.animateTo(currentConfig.onFocusStart.target, currentConfig.onFocusStart.config).catch((err) => {
                    console.error('Focus animation error:', err);
                });
            }
            else if (!focused && currentConfig.onFocusEnd) {
                motionValue.animateTo(currentConfig.onFocusEnd.target, currentConfig.onFocusEnd.config).catch((err) => {
                    console.error('Focus animation error:', err);
                });
            }
        },
    });
    return focusRef;
}
//# sourceMappingURL=useFocusAnimation.js.map
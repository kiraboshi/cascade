/**
 * Tap Animation Hook
 * Animate motion values based on tap gestures
 */
import { useRef } from 'react';
import { useTap } from './useTap';
/**
 * Hook to animate motion values on tap
 * Returns a ref that should be attached to the tappable element
 */
export function useTapAnimation(motionValue, config) {
    const configRef = useRef(config);
    configRef.current = config;
    const tapRef = useTap({
        disabled: config.disabled,
        tapThreshold: config.tapThreshold,
        tapTimeout: config.tapTimeout,
        onTapStart: (event) => {
            const currentConfig = configRef.current;
            if (currentConfig.onTapStart) {
                motionValue.animateTo(currentConfig.onTapStart.target, currentConfig.onTapStart.config).catch((err) => {
                    console.error('Tap animation error:', err);
                });
            }
        },
        onTap: (event) => {
            const currentConfig = configRef.current;
            if (currentConfig.onTapEnd) {
                motionValue.animateTo(currentConfig.onTapEnd.target, currentConfig.onTapEnd.config).catch((err) => {
                    console.error('Tap animation error:', err);
                });
            }
            currentConfig.onTap?.(event);
        },
        onTapCancel: (event) => {
            const currentConfig = configRef.current;
            if (currentConfig.onTapEnd) {
                motionValue.animateTo(currentConfig.onTapEnd.target, currentConfig.onTapEnd.config).catch((err) => {
                    console.error('Tap animation error:', err);
                });
            }
        },
    });
    return tapRef;
}
//# sourceMappingURL=useTapAnimation.js.map
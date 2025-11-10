/**
 * Hover Animation Hook
 * Animate motion values based on hover state
 */
import { useRef } from 'react';
import { useHover } from './useHover';
/**
 * Hook to animate motion values on hover
 * Returns a ref that should be attached to the hoverable element
 */
export function useHoverAnimation(motionValue, config) {
    const configRef = useRef(config);
    configRef.current = config;
    const [hoverRef, isHovering] = useHover({
        disabled: config.disabled,
        onHoverChange: (hovering) => {
            const currentConfig = configRef.current;
            if (hovering && currentConfig.onHoverStart) {
                motionValue.animateTo(currentConfig.onHoverStart.target, currentConfig.onHoverStart.config).catch((err) => {
                    console.error('Hover animation error:', err);
                });
            }
            else if (!hovering && currentConfig.onHoverEnd) {
                motionValue.animateTo(currentConfig.onHoverEnd.target, currentConfig.onHoverEnd.config).catch((err) => {
                    console.error('Hover animation error:', err);
                });
            }
        },
    });
    return hoverRef;
}
//# sourceMappingURL=useHoverAnimation.js.map
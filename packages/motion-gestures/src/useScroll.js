/**
 * useScroll Hook
 * React hook for scroll-driven animations
 */
import { useEffect, useRef } from 'react';
/**
 * React hook for scroll-driven motion values
 */
export function useScrollMotion(motionValue, config) {
    const motionValueRef = useRef(motionValue);
    const configRef = useRef(config);
    // Keep refs in sync
    motionValueRef.current = motionValue;
    configRef.current = config;
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        const container = configRef.current?.container || window;
        const axis = configRef.current?.axis || 'y';
        const multiplier = configRef.current?.multiplier || 1;
        const handleScroll = () => {
            let scrollValue = 0;
            if (container === window || container === document || container === document.documentElement) {
                scrollValue = axis === 'x' ? window.scrollX : window.scrollY;
            }
            else {
                const element = container;
                scrollValue = axis === 'x' ? element.scrollLeft : element.scrollTop;
            }
            const newValue = scrollValue * multiplier;
            motionValueRef.current.set(newValue);
        };
        // Set initial scroll value
        handleScroll();
        // Attach scroll listener
        // For window scrolling, listen on window
        const scrollTarget = container === window ? window : container;
        scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            scrollTarget.removeEventListener('scroll', handleScroll);
        };
    }, []); // Empty deps - we use refs to access latest values
}
//# sourceMappingURL=useScroll.js.map
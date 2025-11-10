/**
 * Spring Bridge for Gestures
 * Bridges gesture velocity to spring animations
 */
import { animateSpringRuntime } from '@cascade/motion-runtime';
/**
 * Animate a motion value using spring physics with initial velocity
 * This bridges gesture velocity to spring animations, creating natural
 * momentum-based spring effects when gestures end.
 */
export function animateSpringWithVelocity(motionValue, target, config) {
    const currentValue = motionValue.get();
    const initialVelocity = config.initialVelocity || 0;
    // Create spring config with initial velocity support
    const springConfig = {
        stiffness: config.stiffness,
        damping: config.damping,
        mass: config.mass || 1,
        from: currentValue,
        to: target,
        initialVelocity,
        duration: config.duration || 1000,
    };
    // Run animation with velocity consideration
    // The runtime spring animator now supports initial velocity
    return animateSpringRuntime(motionValue, springConfig, config.onComplete, (error) => {
        console.error('Spring animation error:', error);
        config.onComplete?.();
    });
}
//# sourceMappingURL=spring-bridge.js.map
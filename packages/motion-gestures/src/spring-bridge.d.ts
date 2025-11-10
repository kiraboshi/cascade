/**
 * Spring Bridge for Gestures
 * Bridges gesture velocity to spring animations
 */
import type { MotionValue } from '@cascade/motion-runtime';
import type { SpringConfig } from '@cascade/compiler';
export interface GestureSpringConfig extends SpringConfig {
    initialVelocity?: number;
    onUpdate?: (value: number) => void;
    onComplete?: () => void;
}
/**
 * Animate a motion value using spring physics with initial velocity
 * This bridges gesture velocity to spring animations, creating natural
 * momentum-based spring effects when gestures end.
 */
export declare function animateSpringWithVelocity(motionValue: MotionValue<number>, target: number, config: GestureSpringConfig): () => void;
//# sourceMappingURL=spring-bridge.d.ts.map
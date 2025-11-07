/**
 * Spring Bridge for Gestures
 * Bridges gesture velocity to spring animations
 */

import type { MotionValue } from '@cascade/motion-runtime';
import type { SpringConfig } from '@cascade/compiler';
import { animateSpringRuntime } from '@cascade/motion-runtime';

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
export function animateSpringWithVelocity(
  motionValue: MotionValue<number>,
  target: number,
  config: GestureSpringConfig
): () => void {
  const currentValue = motionValue.get() as number;
  const initialVelocity = config.initialVelocity || 0;
  
  // Create spring config with initial velocity support
  const springConfig: SpringConfig & { duration?: number; initialVelocity?: number } = {
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
  return animateSpringRuntime(
    motionValue,
    springConfig,
    config.onComplete,
    (error) => {
      console.error('Spring animation error:', error);
      config.onComplete?.();
    }
  );
}


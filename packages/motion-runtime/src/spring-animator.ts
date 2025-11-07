/**
 * Runtime Spring Animator
 * Runs spring physics at runtime using RK4 solver
 */

import { solveSpring, type SpringConfig } from '@cascade/compiler';
import type { MotionValue } from './motion-value';

export interface RuntimeSpringConfig extends SpringConfig {
  duration?: number;
  initialVelocity?: number;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

/**
 * Animate a motion value using spring physics at runtime
 */
export function animateSpringRuntime(
  motionValue: MotionValue<number>,
  config: SpringConfig & { duration?: number },
  onComplete?: () => void,
  onError?: (error: Error) => void
): () => void {
  // Duration is a maximum timeout, not a hard limit
  // Spring should settle naturally based on physics
  const maxDuration = (config as RuntimeSpringConfig).duration || 10000; // 10s default max
  const shouldPrecompute = maxDuration < 300;
  
  let keyframeValues: number[] = [];
  
  // Extract initial velocity if provided
  const initialVelocity = (config as RuntimeSpringConfig).initialVelocity || 0;
  const springConfigWithVelocity: SpringConfig = {
    ...config,
    initialVelocity,
  };
  
  if (shouldPrecompute) {
    // Use compile-time solver to pre-compute values for very short animations
    try {
      keyframeValues = solveSpring(springConfigWithVelocity, maxDuration, 60);
    } catch (error) {
      onError?.(error as Error);
      return () => {};
    }
  }
  
  let startTime: number | null = null;
  let animationFrameId: number | null = null;
  let isCancelled = false;
  let currentValue: number = config.from;
  let currentVelocity: number = initialVelocity;
  let lastFrameTime: number | null = null;
  
  // Calculate optimal step size for RK4 solver
  const naturalFreq = Math.sqrt(springConfigWithVelocity.stiffness / (springConfigWithVelocity.mass || 1));
  const optimalStepSize = 1 / (60 * naturalFreq); // ~60 steps per oscillation period
  
  const animate = (timestamp: number): void => {
    if (isCancelled) return;
    
    try {
      if (startTime === null) {
        startTime = timestamp;
        lastFrameTime = timestamp;
      }
      
      const elapsedMs = timestamp - startTime;
      const elapsedSeconds = elapsedMs / 1000;
      const frameDelta = timestamp - (lastFrameTime || timestamp);
      const frameDeltaSeconds = frameDelta / 1000;
      lastFrameTime = timestamp;
      
      let value: number;
      let velocity: number;
      
      if (shouldPrecompute && keyframeValues.length > 0) {
        // Use pre-computed values for short animations
        const progress = Math.min(elapsedMs / maxDuration, 1);
        const index = Math.min(
          Math.floor(progress * (keyframeValues.length - 1)),
          keyframeValues.length - 1
        );
        value = keyframeValues[index];
        // Estimate velocity from adjacent values (for settling check)
        if (index < keyframeValues.length - 1) {
          const nextValue = keyframeValues[index + 1];
          const timeStep = maxDuration / (keyframeValues.length - 1);
          velocity = (nextValue - value) / (timeStep / 1000); // Actual velocity
        } else {
          velocity = 0;
        }
      } else {
        // Use RK4 solver incrementally - step forward from current state
        // This is more efficient than recalculating from start each frame
        const steps = Math.max(1, Math.ceil(frameDeltaSeconds / optimalStepSize));
        const dt = frameDeltaSeconds / steps;
        
        value = currentValue;
        velocity = currentVelocity;
        
        // Step forward using RK4
        for (let i = 0; i < steps; i++) {
          [value, velocity] = rk4(
            value,
            velocity,
            springConfigWithVelocity.stiffness,
            springConfigWithVelocity.damping,
            springConfigWithVelocity.mass || 1,
            springConfigWithVelocity.to,
            dt
          );
        }
        
        // Update state for next frame
        currentValue = value;
        currentVelocity = velocity;
      }
      
      // Update motion value
      motionValue.set(value);
      (config as RuntimeSpringConfig).onUpdate?.(value);
      
      // Check if spring has settled or max duration exceeded
      const settled = isSpringSettled(value, velocity, config.to);
      const exceededMaxDuration = elapsedMs >= maxDuration;
      
      if (settled || exceededMaxDuration) {
        // Ensure final value is set exactly to target
        motionValue.set(config.to);
        (config as RuntimeSpringConfig).onUpdate?.(config.to);
        
        // Clean up animation frame
        animationFrameId = null;
        
        // Call callbacks
        (config as RuntimeSpringConfig).onComplete?.();
        onComplete?.();
      } else {
        // Continue animation
        animationFrameId = requestAnimationFrame(animate);
      }
    } catch (error) {
      isCancelled = true;
      onError?.(error as Error);
    }
  };
  
  animationFrameId = requestAnimationFrame(animate);
  
  // Return cancel function
  return () => {
    isCancelled = true;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };
}

/**
 * RK4 solver for runtime spring physics
 * Ported from compiler's solveSpring for accurate runtime calculations
 */
function rk4(
  y: number,
  v: number,
  stiffness: number,
  damping: number,
  mass: number,
  target: number,
  dt: number
): [number, number] {
  // Spring force: F = -k * (y - target)
  // Damping force: F_d = -c * v
  // Total force: F_total = -k * (y - target) - c * v
  // Acceleration: a = F_total / m
  
  const k1y = v;
  const k1v = (-stiffness * (y - target) - damping * v) / mass;
  
  const k2y = v + k1v * dt / 2;
  const k2v = (-stiffness * (y + k1y * dt / 2 - target) - damping * (v + k1v * dt / 2)) / mass;
  
  const k3y = v + k2v * dt / 2;
  const k3v = (-stiffness * (y + k2y * dt / 2 - target) - damping * (v + k2v * dt / 2)) / mass;
  
  const k4y = v + k3v * dt;
  const k4v = (-stiffness * (y + k3y * dt - target) - damping * (v + k3v * dt)) / mass;
  
  const newY = y + (k1y + 2 * k2y + 2 * k3y + k4y) * dt / 6;
  const newV = v + (k1v + 2 * k2v + 2 * k3v + k4v) * dt / 6;
  
  return [newY, newV];
}

/**
 * Check if spring has settled (velocity and position are close to target)
 */
function isSpringSettled(
  value: number,
  velocity: number,
  target: number,
  threshold: number = 0.001
): boolean {
  const positionDiff = Math.abs(value - target);
  const velocityMagnitude = Math.abs(velocity);
  return positionDiff < threshold && velocityMagnitude < threshold;
}


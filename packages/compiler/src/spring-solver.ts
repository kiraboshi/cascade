/**
 * RK4 spring solver for build-time keyframe generation
 */

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass?: number;
  from: number;
  to: number;
  initialVelocity?: number;
}

/**
 * Clamp a value to prevent NaN/Infinity and keep it within reasonable bounds
 * For spring animations, values should stay relatively close to the target
 */
function clampValue(value: number, target: number, range: number = 1000): number {
  if (!isFinite(value)) {
    return target; // Return target if value is NaN/Infinity
  }
  const min = target - range;
  const max = target + range;
  return Math.max(min, Math.min(max, value));
}

/**
 * Runge-Kutta 4th order method for spring physics
 * Includes validation to prevent NaN/Infinity values
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
  // Validate inputs
  if (!isFinite(y) || !isFinite(v) || !isFinite(stiffness) || !isFinite(damping) || !isFinite(mass) || !isFinite(target) || !isFinite(dt)) {
    // Return target position and zero velocity if inputs are invalid
    return [clampValue(y, target), 0];
  }
  
  // Ensure mass is positive and not too small to avoid division issues
  const safeMass = Math.max(mass, 1e-10);
  
  // Calculate RK4 coefficients
  const k1v = (-stiffness * (y - target) - damping * v) / safeMass;
  const k1y = v;
  
  // Validate intermediate values
  if (!isFinite(k1v) || !isFinite(k1y)) {
    return [clampValue(y, target), 0];
  }
  
  const k2v = (-stiffness * (y + k1y * dt / 2 - target) - damping * (v + k1v * dt / 2)) / safeMass;
  const k2y = v + k1v * dt / 2;
  
  if (!isFinite(k2v) || !isFinite(k2y)) {
    return [clampValue(y, target), 0];
  }
  
  const k3v = (-stiffness * (y + k2y * dt / 2 - target) - damping * (v + k2v * dt / 2)) / safeMass;
  const k3y = v + k2v * dt / 2;
  
  if (!isFinite(k3v) || !isFinite(k3y)) {
    return [clampValue(y, target), 0];
  }
  
  const k4v = (-stiffness * (y + k3y * dt - target) - damping * (v + k3v * dt)) / safeMass;
  const k4y = v + k3v * dt;
  
  if (!isFinite(k4v) || !isFinite(k4y)) {
    return [clampValue(y, target), 0];
  }
  
  const newY = y + (k1y + 2 * k2y + 2 * k3y + k4y) * dt / 6;
  const newV = v + (k1v + 2 * k2v + 2 * k3v + k4v) * dt / 6;
  
  // Clamp final values to prevent overflow (use reasonable range based on distance to target)
  const distanceToTarget = Math.abs(target - y);
  const maxRange = Math.max(1000, distanceToTarget * 10); // At least 1000, or 10x current distance
  const clampedY = clampValue(newY, target, maxRange);
  const clampedV = clampValue(newV, 0, Math.max(1000, Math.abs(v) * 10)); // Clamp velocity around 0
  
  return [clampedY, clampedV];
}

/**
 * Calculate optimal step size based on spring parameters
 * Ensures numerical stability by keeping step size small relative to spring period
 */
function calculateOptimalStepSize(
  stiffness: number,
  damping: number,
  mass: number,
  requestedDt: number
): number {
  // Natural frequency of undamped spring
  const naturalFreq = Math.sqrt(stiffness / mass);
  
  // Critical damping coefficient
  const criticalDamping = 2 * Math.sqrt(stiffness * mass);
  
  // Damping ratio
  const dampingRatio = damping / criticalDamping;
  
  // For stability, we want at least 20-30 steps per oscillation period
  // For overdamped systems, use a smaller step size
  const minStepsPerPeriod = dampingRatio >= 1 ? 30 : 20;
  const maxDt = (2 * Math.PI / naturalFreq) / minStepsPerPeriod;
  
  // Use the smaller of requested step size or stability-limited step size
  // But don't make it too small (minimum 0.1ms)
  return Math.max(0.1, Math.min(requestedDt, maxDt));
}

/**
 * Check if spring has settled (reached target with low velocity)
 */
function hasSettled(
  y: number,
  v: number,
  target: number,
  tolerance: number = 0.001
): boolean {
  const distance = Math.abs(y - target);
  const velocity = Math.abs(v);
  return distance < tolerance && velocity < tolerance;
}

/**
 * Solve spring animation and return keyframe values
 * Includes adaptive step sizing and early termination for stability
 */
export function solveSpring(
  config: SpringConfig,
  duration: number = 1000,
  steps: number = 60
): number[] {
  const { stiffness, damping, mass = 1, from, to, initialVelocity = 0 } = config;
  
  // Validate inputs
  if (!isFinite(stiffness) || stiffness <= 0) {
    throw new Error(`Invalid stiffness: ${stiffness}`);
  }
  if (!isFinite(damping) || damping < 0) {
    throw new Error(`Invalid damping: ${damping}`);
  }
  if (!isFinite(mass) || mass <= 0) {
    throw new Error(`Invalid mass: ${mass}`);
  }
  if (!isFinite(from) || !isFinite(to)) {
    throw new Error(`Invalid from/to values: from=${from}, to=${to}`);
  }
  if (!isFinite(duration) || duration <= 0) {
    throw new Error(`Invalid duration: ${duration}`);
  }
  if (!isFinite(steps) || steps <= 0) {
    throw new Error(`Invalid steps: ${steps}`);
  }
  
  const requestedDt = duration / steps;
  const optimalDt = calculateOptimalStepSize(stiffness, damping, mass, requestedDt);
  
  // Use optimal step size if it's significantly different from requested
  // Otherwise use requested step size for consistency
  const dt = optimalDt < requestedDt * 0.5 ? optimalDt : requestedDt;
  
  // Calculate actual number of steps needed
  const actualSteps = Math.ceil(duration / dt);
  const values: number[] = [from];
  
  let y = from;
  let v = initialVelocity;
  let lastValidY = from;
  let lastValidV = initialVelocity;
  let settledCount = 0;
  const settleThreshold = 5; // Number of consecutive settled steps before early termination
  
  for (let i = 0; i < actualSteps; i++) {
    [y, v] = rk4(y, v, stiffness, damping, mass, to, dt);
    
    // Validate result
    if (!isFinite(y) || !isFinite(v)) {
      // If we get NaN/Infinity, try to recover by using smaller step size with last valid state
      const smallerDt = dt * 0.5;
      [y, v] = rk4(lastValidY, lastValidV, stiffness, damping, mass, to, smallerDt);
      
      // If still invalid, use last valid value and break
      if (!isFinite(y) || !isFinite(v)) {
        console.warn(`[solveSpring] Numerical instability at step ${i}, using last valid value`);
        y = lastValidY;
        v = lastValidV;
        break;
      }
    }
    
    // Update last valid state
    lastValidY = y;
    lastValidV = v;
    values.push(y);
    
    // Early termination if spring has settled
    if (hasSettled(y, v, to)) {
      settledCount++;
      if (settledCount >= settleThreshold) {
        // Fill remaining steps with target value
        while (values.length <= steps) {
          values.push(to);
        }
        break;
      }
    } else {
      settledCount = 0;
    }
  }
  
  // Ensure we have at least the requested number of steps
  while (values.length <= steps) {
    values.push(to);
  }
  
  // Trim to requested length if we exceeded it
  if (values.length > steps + 1) {
    return values.slice(0, steps + 1);
  }
  
  return values;
}

/**
 * Check if spring animation should be pre-computed (duration < 300ms)
 */
export function shouldPrecompute(duration: number): boolean {
  return duration < 300;
}


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
 * Runge-Kutta 4th order method for spring physics
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
  const k1v = (-stiffness * (y - target) - damping * v) / mass;
  const k1y = v;
  
  const k2v = (-stiffness * (y + k1y * dt / 2 - target) - damping * (v + k1v * dt / 2)) / mass;
  const k2y = v + k1v * dt / 2;
  
  const k3v = (-stiffness * (y + k2y * dt / 2 - target) - damping * (v + k2v * dt / 2)) / mass;
  const k3y = v + k2v * dt / 2;
  
  const k4v = (-stiffness * (y + k3y * dt - target) - damping * (v + k3v * dt)) / mass;
  const k4y = v + k3v * dt;
  
  const newY = y + (k1y + 2 * k2y + 2 * k3y + k4y) * dt / 6;
  const newV = v + (k1v + 2 * k2v + 2 * k3v + k4v) * dt / 6;
  
  return [newY, newV];
}

/**
 * Solve spring animation and return keyframe values
 */
export function solveSpring(
  config: SpringConfig,
  duration: number = 1000,
  steps: number = 60
): number[] {
  const { stiffness, damping, mass = 1, from, to, initialVelocity = 0 } = config;
  const dt = duration / steps;
  const values: number[] = [from];
  
  let y = from;
  let v = initialVelocity;
  
  for (let i = 0; i < steps; i++) {
    [y, v] = rk4(y, v, stiffness, damping, mass, to, dt);
    values.push(y);
  }
  
  return values;
}

/**
 * Check if spring animation should be pre-computed (duration < 300ms)
 */
export function shouldPrecompute(duration: number): boolean {
  return duration < 300;
}


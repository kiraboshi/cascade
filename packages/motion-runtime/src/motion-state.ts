/**
 * Animation state management
 */

export type AnimationState = 'idle' | 'running' | 'paused' | 'completed';

export interface MotionStageState {
  name: string;
  state: AnimationState;
  startTime: number | null;
  progress: number; // 0-1
}

export interface SequenceState {
  stages: MotionStageState[];
  currentStageIndex: number;
  state: AnimationState;
  respectReducedMotion: boolean;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}


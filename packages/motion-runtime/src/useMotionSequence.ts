/**
 * Hook for programmatic sequence control
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { SequenceState, AnimationState } from './motion-state';
import { prefersReducedMotion } from './motion-state';

export interface UseMotionSequenceOptions {
  autoStart?: boolean;
  respectReducedMotion?: boolean;
  onComplete?: () => void;
}

export interface MotionSequenceControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  goToStage: (index: number) => void;
  state: SequenceState;
}

/**
 * Hook for managing animation sequences
 */
export function useMotionSequence(
  stageCount: number,
  options: UseMotionSequenceOptions = {}
): MotionSequenceControls {
  const { autoStart = false, respectReducedMotion: respectMotion = true, onComplete } = options;
  
  const [state, setState] = useState<SequenceState>({
    stages: Array.from({ length: stageCount }, (_, i) => ({
      name: `stage-${i}`,
      state: 'idle',
      startTime: null,
      progress: 0,
    })),
    currentStageIndex: 0,
    state: 'idle',
    respectReducedMotion: respectMotion && prefersReducedMotion(),
  });
  
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  const start = useCallback(() => {
    if (state.respectReducedMotion) {
      // Skip animations if user prefers reduced motion
      if (onComplete) {
        onComplete();
      }
      return;
    }
    
    setState((prev) => ({
      ...prev,
      state: 'running',
      currentStageIndex: 0,
      stages: prev.stages.map((stage, i) => ({
        ...stage,
        state: i === 0 ? 'running' : 'idle',
        startTime: i === 0 ? Date.now() : null,
        progress: 0,
      })),
    }));
    
    startTimeRef.current = Date.now();
  }, [state.respectReducedMotion, onComplete]);
  
  const pause = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setState((prev) => ({
      ...prev,
      state: 'paused',
    }));
  }, []);
  
  const resume = useCallback(() => {
    setState((prev) => ({
      ...prev,
      state: 'running',
    }));
  }, []);
  
  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setState((prev) => ({
      ...prev,
      state: 'idle',
      currentStageIndex: 0,
      stages: prev.stages.map((stage) => ({
        ...stage,
        state: 'idle',
        startTime: null,
        progress: 0,
      })),
    }));
    
    startTimeRef.current = null;
  }, []);
  
  const goToStage = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      currentStageIndex: index,
      stages: prev.stages.map((stage, i) => ({
        ...stage,
        state: i === index ? 'running' : i < index ? 'completed' : 'idle',
        startTime: i === index ? Date.now() : stage.startTime,
      })),
    }));
  }, []);
  
  useEffect(() => {
    if (autoStart && state.state === 'idle') {
      start();
    }
  }, [autoStart, state.state, start]);
  
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  return {
    start,
    pause,
    resume,
    reset,
    goToStage,
    state,
  };
}


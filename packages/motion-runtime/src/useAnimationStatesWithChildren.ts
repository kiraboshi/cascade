/**
 * Parent-child orchestration for animation states
 * Handles staggerChildren and delayChildren for coordinated animations
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAnimationStates, type AnimationStatesControls, type UseAnimationStatesOptions } from './useAnimationStates';
import type { AnimationStateSet, TransitionConfig } from '@cascade/compiler';

/**
 * Options for useAnimationStatesWithChildren
 */
export interface UseAnimationStatesWithChildrenOptions extends UseAnimationStatesOptions {
  /**
   * Child animation state sets to orchestrate
   */
  children?: Array<{
    stateSet: AnimationStateSet;
    options?: UseAnimationStatesOptions;
  }>;
  
  /**
   * Whether to automatically orchestrate children when parent state changes
   */
  autoOrchestrate?: boolean;
}

/**
 * Controls for parent-child animation states
 */
export interface AnimationStatesWithChildrenControls extends AnimationStatesControls {
  /**
   * Register a child animation state control
   */
  registerChild(id: string, controls: AnimationStatesControls): void;
  
  /**
   * Unregister a child animation state control
   */
  unregisterChild(id: string): void;
  
  /**
   * Animate all children to a specific state with stagger/delay
   */
  animateChildrenTo(state: string, config?: TransitionConfig): Promise<void>;
  
  /**
   * Set all children to a specific state immediately
   */
  setChildren(state: string): void;
}

/**
 * Extract orchestration config from transition
 */
function extractOrchestrationConfig(
  stateDef: any
): { staggerChildren?: number; delayChildren?: number } {
  if (!stateDef || typeof stateDef !== 'object') {
    return {};
  }
  
  const transition = 'transition' in stateDef ? stateDef.transition : undefined;
  if (!transition || typeof transition !== 'object') {
    return {};
  }
  
  return {
    staggerChildren: transition.staggerChildren,
    delayChildren: transition.delayChildren,
  };
}

/**
 * Hook for managing animation states with child orchestration
 */
export function useAnimationStatesWithChildren(
  stateSet: AnimationStateSet,
  options: UseAnimationStatesWithChildrenOptions = {}
): AnimationStatesWithChildrenControls {
  const {
    children: childConfigs,
    autoOrchestrate = true,
    ...parentOptions
  } = options;
  
  const parent = useAnimationStates(stateSet, parentOptions);
  const childrenRef = useRef<Map<string, AnimationStatesControls>>(new Map());
  
  // Register/unregister children
  const registerChild = useCallback((id: string, controls: AnimationStatesControls) => {
    childrenRef.current.set(id, controls);
  }, []);
  
  const unregisterChild = useCallback((id: string) => {
    childrenRef.current.delete(id);
  }, []);
  
  // Animate children with stagger/delay
  const animateChildrenTo = useCallback(async (
    state: string,
    config?: TransitionConfig
  ): Promise<void> => {
    const children = Array.from(childrenRef.current.values());
    if (children.length === 0) {
      return Promise.resolve();
    }
    
    // Get orchestration config from current parent state or provided config
    const currentStateDef = parent.getState(parent.currentState);
    const orchestration = config 
      ? { staggerChildren: config.staggerChildren, delayChildren: config.delayChildren }
      : extractOrchestrationConfig(currentStateDef);
    
    const { staggerChildren, delayChildren } = orchestration;
    const baseDelay = delayChildren || 0;
    
    // Animate children with stagger
    const promises = children.map((child, index) => {
      const delay = baseDelay + (staggerChildren ? index * staggerChildren : 0);
      
      if (delay > 0) {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            child.animateTo(state, config).then(resolve);
          }, delay);
        });
      } else {
        return child.animateTo(state, config);
      }
    });
    
    await Promise.all(promises);
  }, [parent]);
  
  // Set children immediately
  const setChildren = useCallback((state: string) => {
    const children = Array.from(childrenRef.current.values());
    children.forEach(child => {
      child.set(state);
    });
  }, []);
  
  // Auto-orchestrate children when parent state changes
  useEffect(() => {
    if (!autoOrchestrate) {
      return;
    }
    
    const currentStateDef = parent.getState(parent.currentState);
    const orchestration = extractOrchestrationConfig(currentStateDef);
    
    if (orchestration.staggerChildren !== undefined || orchestration.delayChildren !== undefined) {
      // Animate children to the same state as parent with orchestration
      animateChildrenTo(parent.currentState);
    }
  }, [parent.currentState, autoOrchestrate, animateChildrenTo, parent]);
  
  return {
    ...parent,
    registerChild,
    unregisterChild,
    animateChildrenTo,
    setChildren,
  };
}


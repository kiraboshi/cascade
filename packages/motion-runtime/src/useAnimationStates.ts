/**
 * React hook for managing animation states
 * Provides variants-like functionality with hook-based API
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { AnimationStateSet, AnimationStateDefinition, TransitionConfig } from '@cascade/compiler';

/**
 * Options for useAnimationStates hook
 */
export interface UseAnimationStatesOptions {
  /**
   * Initial state name
   */
  initial?: string;
  
  /**
   * State to animate to on mount
   */
  animate?: string | boolean;
  
  /**
   * Auto-inject CSS (default: true)
   */
  injectCSS?: boolean;
  
  /**
   * Element reference for runtime states
   */
  element?: HTMLElement;
}

/**
 * Controls for animation states
 */
export interface AnimationStatesControls {
  /**
   * Current state name
   */
  currentState: string;
  
  /**
   * Combined className for current state
   */
  className: string;
  
  /**
   * Set a specific state (immediate)
   */
  set(state: string): void;
  
  /**
   * Animate to a specific state (with transition)
   */
  animateTo(state: string, config?: TransitionConfig): Promise<void>;
  
  /**
   * Get state definition
   */
  getState(state: string): AnimationStateDefinition | undefined;
  
  /**
   * Check if state exists
   */
  hasState(state: string): boolean;
  
  /**
   * Subscribe to state changes
   */
  onStateChange(callback: (state: string) => void): () => void;
}

/**
 * Inject CSS into document head
 */
function injectCSS(css: string, styleId: string): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  // Check if already injected
  if (document.getElementById(styleId)) {
    return;
  }
  
  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = css;
  document.head.appendChild(styleElement);
}

/**
 * Extract transition config from state definition
 */
function extractTransition(state: AnimationStateDefinition): TransitionConfig | undefined {
  if ('transition' in state && typeof state.transition === 'object') {
    return state.transition as TransitionConfig;
  }
  return undefined;
}

/**
 * React hook for managing animation states
 */
export function useAnimationStates(
  stateSet: AnimationStateSet,
  options: UseAnimationStatesOptions = {}
): AnimationStatesControls {
  const {
    initial,
    animate = true,
    injectCSS: shouldInjectCSS = true,
    element,
  } = options;
  
  // Determine initial state
  const initialState = initial || (stateSet.states.initial ? 'initial' : Object.keys(stateSet.states)[0]);
  const [currentState, setCurrentState] = useState<string>(initialState);
  
  // State change callbacks
  const callbacksRef = useRef<Set<(state: string) => void>>(new Set());
  
  // Inject CSS
  useEffect(() => {
    if (shouldInjectCSS && stateSet.css) {
      const styleId = `animation-states-${stateSet.id}`;
      injectCSS(stateSet.css, styleId);
    }
  }, [stateSet.css, stateSet.id, shouldInjectCSS]);
  
  // Handle initial animate
  useEffect(() => {
    if (animate && animate !== false) {
      const targetState = typeof animate === 'string' ? animate : 'animate';
      if (stateSet.states[targetState] && targetState !== initialState) {
        // Small delay to ensure CSS is injected
        const timeoutId = setTimeout(() => {
          setCurrentState(targetState);
        }, 0);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [animate, initialState, stateSet.states]);
  
  // Get current state definition
  const currentStateDef = useMemo(() => {
    return stateSet.states[currentState];
  }, [stateSet.states, currentState]);
  
  // For runtime states, CSS custom properties are already generated
  // The className will apply the CSS class which uses those custom properties
  // Runtime values are handled via CSS variables in the generated CSS
  
  // Get className for current state
  const className = useMemo(() => {
    return stateSet.classes[currentState] || '';
  }, [stateSet.classes, currentState]);
  
  // Set state immediately
  const set = useCallback((state: string) => {
    if (!stateSet.states[state]) {
      console.warn(`[Cascade] State "${state}" does not exist in state set`);
      return;
    }
    
    setCurrentState(state);
    
    // Notify callbacks
    callbacksRef.current.forEach(callback => callback(state));
  }, [stateSet.states]);
  
  // Animate to state with transition
  const animateTo = useCallback(async (state: string, config?: TransitionConfig): Promise<void> => {
    if (!stateSet.states[state]) {
      console.warn(`[Cascade] State "${state}" does not exist in state set`);
      return Promise.resolve();
    }
    
    // Get transition config
    const stateDef = stateSet.states[state];
    const transition = config || extractTransition(stateDef);
    
    // If no transition, set immediately
    if (!transition) {
      set(state);
      return Promise.resolve();
    }
    
    // Set the state (CSS transition will handle the animation)
    set(state);
    
    // Wait for transition duration
    const duration = transition.duration || 300;
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }, [stateSet, set]);
  
  // Get state definition
  const getState = useCallback((state: string): AnimationStateDefinition | undefined => {
    return stateSet.states[state];
  }, [stateSet.states]);
  
  // Check if state exists
  const hasState = useCallback((state: string): boolean => {
    return state in stateSet.states;
  }, [stateSet.states]);
  
  // Subscribe to state changes
  const onStateChange = useCallback((callback: (state: string) => void): (() => void) => {
    callbacksRef.current.add(callback);
    return () => {
      callbacksRef.current.delete(callback);
    };
  }, []);
  
  return {
    currentState,
    className,
    set,
    animateTo,
    getState,
    hasState,
    onStateChange,
  };
}


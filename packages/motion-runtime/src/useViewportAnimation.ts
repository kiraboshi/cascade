/**
 * Viewport Animation Hooks
 * Animate motion values based on viewport visibility
 */

import { useEffect, useRef, type RefObject } from 'react';
import type { MotionValue } from './motion-value';
import { useInView } from './useInView';
import type { ViewportConfig } from './useInView';
import type { SpringConfig } from '@cascade/compiler';
import type { MotionValueKeyframeConfig } from './motion-value';
import { createMissingPropertyError, createInvalidPropertyTypeError, ErrorCode } from './error-messages';

export interface ViewportAnimationConfig extends ViewportConfig {
  /**
   * Animation to trigger when element enters viewport
   */
  onEnter?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  
  /**
   * Animation to trigger when element leaves viewport
   */
  onExit?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  
  /**
   * Initial value (before viewport detection)
   */
  initial?: number | string;
  
  /**
   * Animate on mount if already in viewport
   */
  animateOnMount?: boolean;
  
  /**
   * Pause animations when element is off-screen (default: true)
   * When enabled, ongoing animations are paused when element leaves viewport
   * and resumed when element re-enters viewport
   */
  pauseWhenOffScreen?: boolean;
}

/**
 * Hook to animate motion values based on viewport visibility
 * Attempts to get the element from the motion value's elementRef
 * 
 * Note: For more control, use useViewportAnimationWithRef instead
 */
export function useViewportAnimation(
  motionValue: MotionValue<number | string>,
  config: ViewportAnimationConfig
): RefObject<HTMLElement> {
  // Validate config
  if (!motionValue) {
    throw createMissingPropertyError('motionValue', 'useViewportAnimation');
  }
  
  if (!config) {
    throw createMissingPropertyError('config', 'useViewportAnimation');
  }
  
  if (!config.onEnter && !config.onExit) {
    throw createMissingPropertyError(
      'onEnter or onExit',
      'useViewportAnimation'
    );
  }
  const elementRef = useRef<HTMLElement | null>(null);
  const configRef = useRef(config);
  const hasAnimatedRef = useRef(false);
  const initialValueSetRef = useRef(false);
  
  // Keep config ref up to date
  configRef.current = config;
  
  // Try to get element from motion value if available
  useEffect(() => {
    const mv = motionValue as any;
    if (mv.elementRef && mv.elementRef instanceof HTMLElement) {
      elementRef.current = mv.elementRef;
    }
  }, [motionValue]);
  
  // Get viewport state
  const isInView = useInView(elementRef, config);
  
  // Set initial value
  useEffect(() => {
    if (config.initial !== undefined && !initialValueSetRef.current) {
      motionValue.set(config.initial);
      initialValueSetRef.current = true;
    }
  }, [config.initial, motionValue]);
  
  // Pause/resume animations based on viewport visibility
  useEffect(() => {
    const currentConfig = configRef.current;
    const pauseWhenOffScreen = currentConfig.pauseWhenOffScreen !== false; // Default: true
    
    if (pauseWhenOffScreen) {
      const timeline = motionValue.getTimeline();
      if (timeline) {
        if (isInView) {
          // Resume animation if paused
          if (timeline.isPaused) {
            timeline.play();
          }
        } else {
          // Pause animation when off-screen
          if (timeline.isPlaying) {
            timeline.pause();
          }
        }
      }
    }
  }, [isInView, motionValue]);
  
  // Animate on viewport change
  useEffect(() => {
    const currentConfig = configRef.current;
    
    // Don't trigger animations if paused when off-screen and element is off-screen
    const pauseWhenOffScreen = currentConfig.pauseWhenOffScreen !== false; // Default: true
    if (pauseWhenOffScreen && !isInView && currentConfig.onEnter) {
      // Element is off-screen and we're pausing - don't start new animations
      return;
    }
    
    if (isInView && currentConfig.onEnter) {
      // Check if we should animate on mount
      if (!currentConfig.animateOnMount && !hasAnimatedRef.current) {
        // If element is already in view on mount and animateOnMount is false,
        // we need to check if it was already in view initially
        // For now, we'll animate anyway if onEnter is provided
      }
      
      motionValue.animateTo(currentConfig.onEnter.target, currentConfig.onEnter.config);
      hasAnimatedRef.current = true;
    } else if (!isInView && currentConfig.onExit) {
      motionValue.animateTo(currentConfig.onExit.target, currentConfig.onExit.config);
    }
  }, [isInView, motionValue]);
  
  return elementRef;
}

/**
 * Hook that accepts element ref directly for more control
 * This is the recommended approach when you have direct access to the element ref
 */
export function useViewportAnimationWithRef(
  elementRef: RefObject<HTMLElement>,
  motionValue: MotionValue<number | string>,
  config: ViewportAnimationConfig
): void {
  // Validate inputs
  if (!elementRef) {
    throw createMissingPropertyError('elementRef', 'useViewportAnimationWithRef');
  }
  
  if (!motionValue) {
    throw createMissingPropertyError('motionValue', 'useViewportAnimationWithRef');
  }
  
  if (!config) {
    throw createMissingPropertyError('config', 'useViewportAnimationWithRef');
  }
  
  if (!config.onEnter && !config.onExit) {
    throw createMissingPropertyError(
      'onEnter or onExit',
      'useViewportAnimationWithRef'
    );
  }
  const configRef = useRef(config);
  const hasAnimatedRef = useRef(false);
  const initialValueSetRef = useRef(false);
  
  // Keep config ref up to date
  configRef.current = config;
  
  // Get viewport state
  const isInView = useInView(elementRef, config);
  
  // Set initial value
  useEffect(() => {
    if (config.initial !== undefined && !initialValueSetRef.current) {
      motionValue.set(config.initial);
      initialValueSetRef.current = true;
    }
  }, [config.initial, motionValue]);
  
  // Pause/resume animations based on viewport visibility
  useEffect(() => {
    const currentConfig = configRef.current;
    const pauseWhenOffScreen = currentConfig.pauseWhenOffScreen !== false; // Default: true
    
    if (pauseWhenOffScreen) {
      const timeline = motionValue.getTimeline();
      if (timeline) {
        if (isInView) {
          // Resume animation if paused
          if (timeline.isPaused) {
            timeline.play();
          }
        } else {
          // Pause animation when off-screen
          if (timeline.isPlaying) {
            timeline.pause();
          }
        }
      }
    }
  }, [isInView, motionValue]);
  
  // Animate on viewport change
  useEffect(() => {
    const currentConfig = configRef.current;
    const element = elementRef.current;
    
    // Don't do anything if element isn't available yet
    if (!element) return;
    
    // Ensure initial value is set before animating
    if (currentConfig.initial !== undefined && !initialValueSetRef.current) {
      motionValue.set(currentConfig.initial);
      initialValueSetRef.current = true;
    }
    
    // Don't trigger animations if paused when off-screen and element is off-screen
    const pauseWhenOffScreen = currentConfig.pauseWhenOffScreen !== false; // Default: true
    if (pauseWhenOffScreen && !isInView && currentConfig.onEnter) {
      // Element is off-screen and we're pausing - don't start new animations
      return;
    }
    
    if (isInView && currentConfig.onEnter) {
      // Only animate if we haven't animated yet (for once: true) or always (for once: false)
      // Note: once defaults to false/undefined, so we check if it's explicitly false
      const shouldAnimate = currentConfig.once !== true || !hasAnimatedRef.current;
      
      if (shouldAnimate) {
        motionValue.animateTo(currentConfig.onEnter.target, currentConfig.onEnter.config).catch((err) => {
          console.error('Viewport animation error:', err);
        });
        hasAnimatedRef.current = true;
      }
    } else if (!isInView && currentConfig.onExit) {
      motionValue.animateTo(currentConfig.onExit.target, currentConfig.onExit.config).catch((err) => {
        console.error('Viewport animation error:', err);
      });
      // Reset hasAnimated if once is false, so it can animate again when entering
      if (currentConfig.once === false) {
        hasAnimatedRef.current = false;
      }
    }
  }, [isInView, motionValue, elementRef]);
}


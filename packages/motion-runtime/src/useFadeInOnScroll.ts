/**
 * Convenience Hook: Fade In On Scroll
 * Simple fade-in animation when element enters viewport
 */

import { useEffect, type RefObject } from 'react';
import { useMotionValue } from './useMotionValue';
import { useViewportAnimationWithRef } from './useViewportAnimation';
import type { ViewportConfig } from './useInView';
import type { SpringConfig } from '@cascade/compiler';

export interface FadeInOnScrollConfig extends ViewportConfig {
  /**
   * Animation duration in ms (for keyframe animations)
   */
  duration?: number;
  
  /**
   * Spring config (if using spring animation)
   */
  spring?: SpringConfig;
  
  /**
   * Use spring animation instead of keyframe
   */
  useSpring?: boolean;
  
  /**
   * Initial opacity (default: 0)
   */
  initial?: number;
  
  /**
   * Target opacity (default: 1)
   */
  target?: number;
}

/**
 * Convenience hook for fade-in animations on scroll
 * Automatically creates an opacity motion value and applies it to the element
 */
export function useFadeInOnScroll(
  elementRef: RefObject<HTMLElement>,
  config: FadeInOnScrollConfig = {}
): void {
  const {
    useSpring = false,
    spring,
    duration = 300,
    initial = 0,
    target = 1,
    ...viewportConfig
  } = config;
  
  // Create opacity motion value with element reference if available
  const opacity = useMotionValue(initial, {
    property: 'opacity',
    element: elementRef.current || undefined,
  });
  
  // Update element reference when it becomes available
  useEffect(() => {
    if (elementRef.current && opacity) {
      const mv = opacity as any;
      if (mv.elementRef !== elementRef.current) {
        mv.elementRef = elementRef.current;
      }
    }
  }, [elementRef, opacity]);
  
  // Apply opacity to element - MUST happen before viewport animation
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // Set initial opacity immediately - critical for visibility
    element.style.opacity = String(initial);
    
    // Subscribe to opacity changes from motion value
    const unsubscribe = opacity.onChange((value) => {
      const el = elementRef.current;
      if (el) {
        el.style.opacity = String(value);
      }
    });
    
    return unsubscribe;
  }, [elementRef, opacity, initial]);
  
  // Set up viewport animation - this will trigger animations when element enters viewport
  useViewportAnimationWithRef(
    elementRef,
    opacity,
    {
      ...viewportConfig,
      initial,
      onEnter: {
        target,
        config: useSpring
          ? (spring || { stiffness: 300, damping: 30 })
          : { duration, easing: 'ease-out' },
      },
    }
  );
}


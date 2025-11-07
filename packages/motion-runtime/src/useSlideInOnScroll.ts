/**
 * Convenience Hook: Slide In On Scroll
 * Slide-in animation when element enters viewport
 */

import { useEffect, type RefObject } from 'react';
import { useMotionValue } from './useMotionValue';
import { useViewportAnimationWithRef } from './useViewportAnimation';
import type { ViewportConfig } from './useInView';
import type { SpringConfig } from '@cascade/compiler';

export interface SlideInOnScrollConfig extends ViewportConfig {
  /**
   * Direction to slide from
   */
  direction?: 'up' | 'down' | 'left' | 'right';
  
  /**
   * Distance to slide (in px)
   */
  distance?: number;
  
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
   * Initial offset (default: based on direction and distance)
   */
  initial?: { x: number; y: number };
  
  /**
   * Target offset (default: { x: 0, y: 0 })
   */
  target?: { x: number; y: number };
}

/**
 * Convenience hook for slide-in animations on scroll
 * Returns motion values for x and y transforms
 */
export function useSlideInOnScroll(
  elementRef: RefObject<HTMLElement>,
  config: SlideInOnScrollConfig = {}
): { x: ReturnType<typeof useMotionValue<number>>; y: ReturnType<typeof useMotionValue<number>> } {
  const {
    direction = 'up',
    distance = 50,
    useSpring = false,
    spring,
    duration = 400,
    initial: customInitial,
    target: customTarget = { x: 0, y: 0 },
    ...viewportConfig
  } = config;
  
  // Calculate initial position based on direction
  const getInitialPosition = (): { x: number; y: number } => {
    if (customInitial) {
      return customInitial;
    }
    
    switch (direction) {
      case 'up':
        return { x: 0, y: distance };
      case 'down':
        return { x: 0, y: -distance };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      default:
        return { x: 0, y: distance };
    }
  };
  
  const initial = getInitialPosition();
  
  // Create motion values for x and y
  const x = useMotionValue(initial.x, {
    property: 'translateX',
    unit: 'px',
  });
  
  const y = useMotionValue(initial.y, {
    property: 'translateY',
    unit: 'px',
  });
  
  // Set up viewport animations
  const animationConfig = useSpring
    ? (spring || { stiffness: 300, damping: 30 })
    : { duration, easing: 'ease-out' };
  
  useViewportAnimationWithRef(
    elementRef,
    x,
    {
      ...viewportConfig,
      initial: initial.x,
      onEnter: {
        target: customTarget.x,
        config: animationConfig,
      },
    }
  );
  
  useViewportAnimationWithRef(
    elementRef,
    y,
    {
      ...viewportConfig,
      initial: initial.y,
      onEnter: {
        target: customTarget.y,
        config: animationConfig,
      },
    }
  );
  
  // Apply transforms to element
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const updateTransform = () => {
      const xValue = x.get();
      const yValue = y.get();
      element.style.transform = `translate(${xValue}px, ${yValue}px)`;
    };
    
    const unsubscribeX = x.onChange(() => {
      updateTransform();
    });
    
    const unsubscribeY = y.onChange(() => {
      updateTransform();
    });
    
    // Set initial transform
    updateTransform();
    
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [elementRef, x, y]);
  
  return { x, y };
}


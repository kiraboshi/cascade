/**
 * Hook for animating layout changes on a single element using FLIP technique
 */

import { useLayoutEffect, useRef, type RefObject } from 'react';
import { measureElement, type BoundingBox } from './layout-utils';
import { applyFLIPAnimation } from './flip-animation';

export interface LayoutTransitionConfig {
  duration?: number;
  easing?: string;
  origin?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onComplete?: () => void;
  enabled?: boolean;
}

/**
 * Hook for animating layout changes on a single element
 * 
 * @example
 * ```tsx
 * function AnimatedItem() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   useLayoutTransition(ref, {
 *     duration: 300,
 *     easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
 *     origin: 'center',
 *   });
 *   
 *   return <div ref={ref}>Content</div>;
 * }
 * ```
 */
export function useLayoutTransition(
  elementRef: RefObject<HTMLElement>,
  config?: LayoutTransitionConfig
): void {
  const previousBoundsRef = useRef<BoundingBox | null>(null);
  const enabled = config?.enabled !== false;

  useLayoutEffect(() => {
    if (!enabled) {
      // Reset previous bounds when disabled
      previousBoundsRef.current = null;
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    // Measure current bounds after layout
    const currentBounds = measureElement(element);

    if (previousBoundsRef.current) {
      // Check if there's a significant change
      const deltaX = Math.abs(currentBounds.x - previousBoundsRef.current.x);
      const deltaY = Math.abs(currentBounds.y - previousBoundsRef.current.y);
      const deltaWidth = Math.abs(currentBounds.width - previousBoundsRef.current.width);
      const deltaHeight = Math.abs(currentBounds.height - previousBoundsRef.current.height);

      const threshold = 1; // pixels
      const hasSignificantChange =
        deltaX > threshold ||
        deltaY > threshold ||
        deltaWidth > threshold ||
        deltaHeight > threshold;

      if (hasSignificantChange) {
        // Generate and apply FLIP animation
        applyFLIPAnimation(element, previousBoundsRef.current, currentBounds, config);
      }
    }

    // Update previous bounds for next render
    previousBoundsRef.current = currentBounds;
  });
}


/**
 * Hook for animating shared elements between different components/pages
 * Uses a global registry to track elements with the same layoutId
 */

import { useLayoutEffect, useRef, type RefObject } from 'react';
import { measureElement, type BoundingBox } from './layout-utils';
import { applyFLIPAnimation } from './flip-animation';

export interface SharedLayoutTransitionConfig {
  layoutId: string;
  duration?: number;
  easing?: string;
  origin?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onComplete?: () => void;
}

interface SharedElement {
  element: HTMLElement | null; // null when element is unmounted but bounds are preserved
  bounds: BoundingBox;
  timestamp: number;
}

/**
 * Global registry for shared layout elements
 * Maps layoutId to the most recent element with that ID
 * When an element unmounts, we keep its bounds but set element to null
 * This allows the next element to animate from those bounds
 */
const sharedLayoutRegistry = new Map<string, SharedElement>();

/**
 * Clean up old entries from the registry (older than 1 second)
 */
function cleanupOldEntries(): void {
  const now = Date.now();
  for (const [id, entry] of sharedLayoutRegistry.entries()) {
    if (now - entry.timestamp > 1000) {
      sharedLayoutRegistry.delete(id);
    }
  }
}

/**
 * Hook for animating shared elements between different components/pages
 * 
 * Elements with the same `layoutId` will animate from the previous element's
 * position to the current element's position.
 * 
 * @example
 * ```tsx
 * function CollapsedCard({ layoutId }: { layoutId: string }) {
 *   const ref = useRef<HTMLDivElement>(null);
 *   useSharedLayoutTransition(ref, { layoutId });
 *   
 *   return <div ref={ref}>Collapsed</div>;
 * }
 * 
 * function ExpandedCard({ layoutId }: { layoutId: string }) {
 *   const ref = useRef<HTMLDivElement>(null);
 *   useSharedLayoutTransition(ref, { layoutId });
 *   
 *   return <div ref={ref}>Expanded</div>;
 * }
 * ```
 */
export function useSharedLayoutTransition(
  elementRef: RefObject<HTMLElement>,
  config: SharedLayoutTransitionConfig
): void {
  const { layoutId, duration, easing, origin, onComplete } = config;

  // Use useLayoutEffect to measure before paint
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Clean up old entries periodically
    cleanupOldEntries();

    // Measure current bounds BEFORE any animation
    const currentBounds = measureElement(element);
    
    // Check if there's a previous element with the same layoutId
    const previous = sharedLayoutRegistry.get(layoutId);

    // Animate if there's a previous entry (either mounted or unmounted) and it's a different element
    if (previous && (previous.element === null || previous.element !== element)) {
      // Generate FLIP animation from previous element's bounds to current bounds
      applyFLIPAnimation(
        element,
        previous.bounds,
        currentBounds,
        { duration, easing, origin, onComplete }
      );

      // Remove the previous entry (it's been used for animation)
      sharedLayoutRegistry.delete(layoutId);
    }

    // Register this element with its current bounds
    sharedLayoutRegistry.set(layoutId, {
      element,
      bounds: currentBounds,
      timestamp: Date.now(),
    });
  }, [layoutId, duration, easing, origin, onComplete]);

  // Separate effect to handle unmounting - preserve bounds for next element
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    return () => {
      // When unmounting, preserve the bounds but mark element as null
      // This allows the next element to animate from these bounds
      const current = sharedLayoutRegistry.get(layoutId);
      if (current && current.element === element) {
        // Keep the bounds but mark element as unmounted
        sharedLayoutRegistry.set(layoutId, {
          element: null, // Mark as unmounted
          bounds: current.bounds, // Preserve bounds
          timestamp: Date.now(), // Update timestamp
        });
      }
    };
  }, [layoutId]);
}


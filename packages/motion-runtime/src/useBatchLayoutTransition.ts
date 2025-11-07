/**
 * Hook for animating layout changes on multiple elements simultaneously
 * Useful for list reordering, grid layout changes, etc.
 */

import { useLayoutEffect, useRef, type RefObject } from 'react';
import { measureElement, type BoundingBox } from './layout-utils';
import { detectLayoutChanges } from './layout-detector';
import { applyFLIPAnimation } from './flip-animation';
import type { LayoutTransitionConfig } from './useLayoutTransition';
import { debugLog, debugWarn } from './debug';

/**
 * Hook for animating layout changes on multiple elements simultaneously
 * 
 * Useful for:
 * - List reordering
 * - Grid layout changes
 * - Multiple elements moving together
 * 
 * @example
 * ```tsx
 * function ReorderableList() {
 *   const [items, setItems] = useState([1, 2, 3, 4, 5]);
 *   const itemRefs = useRef<RefObject<HTMLElement>[]>([]);
 *   
 *   // Initialize refs
 *   items.forEach((_, i) => {
 *     if (!itemRefs.current[i]) {
 *       itemRefs.current[i] = createRef();
 *     }
 *   });
 *   
 *   useBatchLayoutTransition(
 *     itemRefs.current.map(ref => ref as RefObject<HTMLElement>),
 *     { duration: 300 }
 *   );
 *   
 *   return (
 *     <ul>
 *       {items.map((item, i) => (
 *         <li key={item} ref={itemRefs.current[i]}>
 *           {item}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useBatchLayoutTransition(
  elementRefs: RefObject<HTMLElement>[],
  config?: LayoutTransitionConfig
): void {
  const previousBoundsRef = useRef<Map<HTMLElement, BoundingBox>>(new Map());
  const isInitializedRef = useRef<boolean>(false);
  const isInitializingRef = useRef<boolean>(false);
  const enabled = config?.enabled !== false;
  const previousRefsLengthRef = useRef<number>(0);
  const initializationFrameRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    debugLog('useBatchLayoutTransition', 'Effect running', {
      enabled,
      isInitialized: isInitializedRef.current,
      isInitializing: isInitializingRef.current,
      refsLength: elementRefs.length,
      previousRefsLength: previousRefsLengthRef.current,
      previousBoundsSize: previousBoundsRef.current.size,
    });

    if (!enabled) {
      // Reset when disabled
      previousBoundsRef.current.clear();
      isInitializedRef.current = false;
      isInitializingRef.current = false;
      previousRefsLengthRef.current = 0;
      if (initializationFrameRef.current !== null) {
        cancelAnimationFrame(initializationFrameRef.current);
        initializationFrameRef.current = null;
      }
      return;
    }

    // Get all valid elements
    const elements = elementRefs
      .map(ref => ref.current)
      .filter((el): el is HTMLElement => el !== null);

    debugLog('useBatchLayoutTransition', 'Elements found', {
      elementCount: elements.length,
      elementRefsLength: elementRefs.length,
      refsStatus: elementRefs.map((ref, idx) => ({
        idx,
        hasCurrent: ref.current !== null,
        elementText: ref.current?.textContent?.substring(0, 20) || 'null',
      })),
    });

    if (elements.length === 0) {
      // If no elements, reset
      if (previousBoundsRef.current.size > 0) {
        previousBoundsRef.current.clear();
        isInitializedRef.current = false;
        isInitializingRef.current = false;
        previousRefsLengthRef.current = 0;
      }
      if (initializationFrameRef.current !== null) {
        cancelAnimationFrame(initializationFrameRef.current);
        initializationFrameRef.current = null;
      }
      return;
    }

    // Check if element count changed (new elements added/removed)
    // Only re-initialize if count actually changed AND we were already initialized
    const elementCountChanged = elements.length !== previousRefsLengthRef.current;
    const shouldReinitialize = !isInitializedRef.current || (elementCountChanged && isInitializedRef.current);
    
    // Update refs length after checking
    previousRefsLengthRef.current = elements.length;

    // If not initialized yet or count changed (elements added/removed), initialize
    if (shouldReinitialize) {
      // If already initializing, don't start another initialization
      if (isInitializingRef.current) {
        debugLog('useBatchLayoutTransition', 'Initialization already in progress, skipping');
        return;
      }

      debugLog('useBatchLayoutTransition', 'Scheduling initialization', {
        reason: !isInitializedRef.current ? 'not initialized' : 'element count changed',
        elementCount: elements.length,
        previousCount: previousRefsLengthRef.current,
      });
      isInitializingRef.current = true;
      
      // Cancel any pending initialization
      if (initializationFrameRef.current !== null) {
        cancelAnimationFrame(initializationFrameRef.current);
      }
      
      // Schedule initialization for after paint
      // Use triple RAF to ensure layout is fully complete and stable
      initializationFrameRef.current = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const currentElements = elementRefs
              .map(ref => ref.current)
              .filter((el): el is HTMLElement => el !== null);
            
            if (currentElements.length === 0) {
              isInitializedRef.current = false;
              isInitializingRef.current = false;
              initializationFrameRef.current = null;
              return;
            }

            // Force a reflow to ensure all layout calculations are complete
            // This ensures elements are in their final positions
            if (currentElements.length > 0) {
              // Force reflow by reading layout properties
              void currentElements[0].offsetWidth;
              void currentElements[0].offsetHeight;
            }

            // Measure all elements after layout is complete
            const initialBounds = new Map<HTMLElement, BoundingBox>();
            for (const element of currentElements) {
              // Double-check: ensure element is still in DOM and not animating
              if (!element.isConnected) {
                debugWarn('useBatchLayoutTransition', 'Element disconnected during initialization', {
                  element: element.textContent?.substring(0, 20) || 'unknown',
                });
                continue;
              }
              
              const bounds = measureElement(element);
              initialBounds.set(element, bounds);
              debugLog('useBatchLayoutTransition', 'Initialized bounds for element', {
                element: element.textContent?.substring(0, 20) || 'unknown',
                bounds,
                computedStyle: window.getComputedStyle(element).transform,
              });
            }
            
            // Verify we got bounds for all elements
            if (initialBounds.size !== currentElements.length) {
              debugWarn('useBatchLayoutTransition', 'Mismatch in bounds count', {
                expected: currentElements.length,
                actual: initialBounds.size,
              });
            }

            previousBoundsRef.current = new Map(initialBounds);
            isInitializedRef.current = true;
            isInitializingRef.current = false;
            initializationFrameRef.current = null;
            debugLog('useBatchLayoutTransition', 'Initialization complete', {
              boundsCount: previousBoundsRef.current.size,
            });
          });
        });
      });
      
      return;
    }

    // Don't animate if still initializing
    if (isInitializingRef.current) {
      debugLog('useBatchLayoutTransition', 'Still initializing, skipping animation');
      return;
    }

    // Measure all elements for current render
    const currentBounds = new Map<HTMLElement, BoundingBox>();
    for (const element of elements) {
      const bounds = measureElement(element);
      currentBounds.set(element, bounds);
      debugLog('useBatchLayoutTransition', 'Measured element', {
        element: element.textContent?.substring(0, 20) || 'unknown',
        bounds,
      });
    }

    // Log previous bounds for debugging
    debugLog('useBatchLayoutTransition', 'Previous bounds', {
      previousBoundsSize: previousBoundsRef.current.size,
      previousBoundsEntries: Array.from(previousBoundsRef.current.entries()).map(([el, bounds]) => ({
        element: el.textContent?.substring(0, 20) || 'unknown',
        bounds,
      })),
    });

    // Detect changes using the layout detector
    const changes = detectLayoutChanges(elements, previousBoundsRef.current);

    debugLog('useBatchLayoutTransition', 'Changes detected', {
      changeCount: changes.length,
      changes: changes.map(change => ({
        element: change.element.textContent?.substring(0, 20) || 'unknown',
        from: change.from,
        to: change.to,
        delta: change.delta,
      })),
    });

    // Animate each change
    if (changes.length > 0) {
      for (const change of changes) {
        debugLog('useBatchLayoutTransition', 'Applying animation', {
          element: change.element.textContent?.substring(0, 20) || 'unknown',
          from: change.from,
          to: change.to,
        });
        applyFLIPAnimation(
          change.element,
          change.from,
          change.to,
          config
        );
      }
    } else {
      debugLog('useBatchLayoutTransition', 'No changes to animate');
    }

    // Update previous bounds for next render
    previousBoundsRef.current = new Map(currentBounds);
    debugLog('useBatchLayoutTransition', 'Updated previous bounds', {
      newBoundsSize: previousBoundsRef.current.size,
    });
  });
}


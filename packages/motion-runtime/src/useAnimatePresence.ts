/**
 * Hook version of AnimatePresence for programmatic control
 * Provides enter/exit animations for single elements based on presence state
 */

import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { applyExitAnimation, applyEnterAnimation, type ExitAnimationConfig, type EnterAnimationConfig } from './animate-presence-utils';
import { measureElement, type BoundingBox } from './layout-utils';
import { applyFLIPAnimation } from './flip-animation';

export interface UseAnimatePresenceConfig {
  /**
   * Animation mode
   * - 'sync': Animate enter/exit simultaneously (default)
   * - 'wait': Wait for exit animation before entering
   * - 'popLayout': Remove element from layout immediately
   */
  mode?: 'sync' | 'wait' | 'popLayout';
  
  /**
   * Skip initial animation on mount
   */
  initial?: boolean;
  
  /**
   * Custom exit animation config
   */
  exit?: ExitAnimationConfig;
  
  /**
   * Custom enter animation config
   */
  enter?: EnterAnimationConfig;
  
  /**
   * Use layout transitions for exit
   */
  layout?: boolean;
}

export interface UseAnimatePresenceReturn {
  /**
   * Ref callback to attach to the element
   */
  ref: (el: HTMLElement | null) => void;
  
  /**
   * Whether the element is currently exiting
   */
  isExiting: boolean;
  
  /**
   * Whether the element is currently entering
   */
  isEntering: boolean;
  
  /**
   * Whether the element should be rendered
   */
  shouldRender: boolean;
}

/**
 * Hook version of AnimatePresence for programmatic control
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [isVisible, setIsVisible] = useState(false);
 *   const { ref, isExiting, isEntering, shouldRender } = useAnimatePresence(isVisible, {
 *     exit: { opacity: 0, config: { duration: 300 } },
 *     enter: { opacity: 0, config: { duration: 300 } },
 *   });
 *   
 *   return (
 *     <>
 *       <button onClick={() => setIsVisible(!isVisible)}>
 *         Toggle
 *       </button>
 *       {shouldRender && (
 *         <div ref={ref}>
 *           Content {isExiting ? '(exiting)' : isEntering ? '(entering)' : ''}
 *         </div>
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
export function useAnimatePresence(
  isPresent: boolean,
  config: UseAnimatePresenceConfig = {}
): UseAnimatePresenceReturn {
  const {
    mode = 'sync',
    initial = true,
    exit,
    enter,
    layout = false,
  } = config;
  
  const elementRef = useRef<HTMLElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [shouldRender, setShouldRender] = useState(isPresent);
  const [elementReady, setElementReady] = useState(false);
  const [waitingForExit, setWaitingForExit] = useState(false);
  
  const wasPresentRef = useRef(isPresent);
  const hasAnimatedRef = useRef(initial);
  const isInitialMountRef = useRef(true);
  const exitCleanupRef = useRef<(() => void) | null>(null);
  const enterCleanupRef = useRef<(() => void) | null>(null);
  const previousBoundsRef = useRef<BoundingBox | null>(null);
  
  // Use callback ref to track element ready state
  const refCallback = React.useCallback((el: HTMLElement | null) => {
    const prevElement = elementRef.current;
    elementRef.current = el;
    setElementReady(!!el);
    
    if (!el && prevElement) {
      // Element was removed - reset state
      setElementReady(false);
    }
  }, []);
  
  // Track bounds for layout transitions
  useLayoutEffect(() => {
    if (elementRef.current && !isExiting) {
      previousBoundsRef.current = measureElement(elementRef.current);
    }
  });
  
  // Handle presence changes
  useEffect(() => {
    const becamePresent = isPresent && !wasPresentRef.current;
    const becameAbsent = !isPresent && wasPresentRef.current;
    
    // Mark initial mount as complete after first render
    const wasInitialMount = isInitialMountRef.current;
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
    }
    
    if (becamePresent) {
      // Element is becoming present
      if (mode === 'wait' && waitingForExit) {
        // In wait mode, don't enter until exit completes
        // Keep shouldRender false until wait clears
        return;
      }
      
      setShouldRender(true);
      setIsExiting(false);
      setIsEntering(true);
      setWaitingForExit(false);
      // Reset animation state - if initial={true} and first mount, skip animation
      hasAnimatedRef.current = initial && wasInitialMount;
    } else if (becameAbsent) {
      // Element is becoming absent
      if (exit) {
        setIsExiting(true);
        setWaitingForExit(mode === 'wait');
        // Keep shouldRender true during exit animation
      } else {
        // No exit config - remove immediately
        setShouldRender(false);
        setIsExiting(false);
        setIsEntering(false);
        setWaitingForExit(false);
      }
    }
    
    wasPresentRef.current = isPresent;
  }, [isPresent, mode, exit, enter, initial, waitingForExit]);
  
  // Handle popLayout mode - remove from layout immediately
  useLayoutEffect(() => {
    if (mode === 'popLayout' && isExiting && elementRef.current) {
      const element = elementRef.current;
      
      // Measure element position BEFORE removing from layout
      const rect = element.getBoundingClientRect();
      
      // Find the nearest positioned ancestor to position relative to it
      let positionedParent: HTMLElement | null = element.parentElement;
      while (positionedParent) {
        const style = window.getComputedStyle(positionedParent);
        if (style.position !== 'static') {
          break;
        }
        positionedParent = positionedParent.parentElement;
      }
      
      // Calculate position relative to positioned parent or viewport
      let left: number;
      let top: number;
      
      if (positionedParent) {
        const parentRect = positionedParent.getBoundingClientRect();
        left = rect.left - parentRect.left;
        top = rect.top - parentRect.top;
      } else {
        // No positioned parent, position relative to viewport
        // Account for scroll position
        const scrollX = window.scrollX || window.pageXOffset || 0;
        const scrollY = window.scrollY || window.pageYOffset || 0;
        left = rect.left + scrollX;
        top = rect.top + scrollY;
      }
      
      // Store original styles to restore later
      const originalPosition = element.style.position || '';
      const originalLeft = element.style.left || '';
      const originalTop = element.style.top || '';
      const originalWidth = element.style.width || '';
      const originalHeight = element.style.height || '';
      
      // Remove from layout flow while keeping visual position
      element.style.position = 'absolute';
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
      element.style.width = `${rect.width}px`;
      element.style.height = `${rect.height}px`;
      
      // Store cleanup function to restore styles if needed
      return () => {
        // Only restore if element still exists and hasn't been removed
        if (elementRef.current === element) {
          element.style.position = originalPosition;
          element.style.left = originalLeft;
          element.style.top = originalTop;
          element.style.width = originalWidth;
          element.style.height = originalHeight;
        }
      };
    }
  }, [mode, isExiting]);
  
  // Apply exit animation
  useEffect(() => {
    if (isExiting && elementRef.current) {
      if (exit) {
        const element = elementRef.current;
        
        // Clean up any existing animations
        if (exitCleanupRef.current) {
          exitCleanupRef.current();
        }
        
        // If layout transitions are enabled, measure element and apply FLIP animation
        if (layout && previousBoundsRef.current) {
          // Measure current bounds (before removal from layout)
          const currentBounds = measureElement(element);
          
          // Calculate collapsed bounds (width/height to 0, maintaining position)
          const collapsedBounds: BoundingBox = {
            x: currentBounds.x,
            y: currentBounds.y,
            width: 0,
            height: 0,
          };
          
          // Extract duration and easing from exit config
          const duration = typeof exit.config === 'object' && exit.config !== null && 'duration' in exit.config
            ? (typeof exit.config.duration === 'number' 
                ? exit.config.duration 
                : typeof exit.config.duration === 'string'
                ? parseFloat(exit.config.duration)
                : 300)
            : 300;
          
          const easing = typeof exit.config === 'object' && exit.config !== null && 'easing' in exit.config
            ? exit.config.easing || 'cubic-bezier(0.4, 0, 0.2, 1)'
            : 'cubic-bezier(0.4, 0, 0.2, 1)';
          
          // Apply FLIP animation for layout-aware exit
          applyFLIPAnimation(element, currentBounds, collapsedBounds, {
            duration,
            easing,
            origin: 'top-left',
          });
        }
        
        // Apply standard exit animation (opacity/transform)
        exitCleanupRef.current = applyExitAnimation(element, exit, () => {
          setShouldRender(false);
          setIsExiting(false);
          setIsEntering(false);
          setWaitingForExit(false);
        });
      } else {
        // No exit config - remove immediately
        setShouldRender(false);
        setIsExiting(false);
        setIsEntering(false);
        setWaitingForExit(false);
      }
    } else if (!isExiting && exitCleanupRef.current) {
      // Clean up exit animation if no longer exiting
      exitCleanupRef.current();
      exitCleanupRef.current = null;
    }
    
    return () => {
      if (exitCleanupRef.current) {
        exitCleanupRef.current();
        exitCleanupRef.current = null;
      }
    };
  }, [isExiting, exit, layout]);
  
  // Handle wait mode clearing - trigger enter when wait completes
  useEffect(() => {
    if (mode === 'wait' && !waitingForExit && isPresent && !shouldRender) {
      // Wait mode cleared and element should be present - render it
      setShouldRender(true);
      setIsExiting(false);
      setIsEntering(true);
      // Reset animation state for new entry after wait
      hasAnimatedRef.current = false; // Always animate after wait mode
    }
  }, [mode, waitingForExit, isPresent, shouldRender]);
  
  // Apply enter animation when element becomes ready
  useEffect(() => {
    if (elementReady && !hasAnimatedRef.current && enter && !isExiting && isPresent && shouldRender && elementRef.current) {
      const element = elementRef.current;
      
      // Mark as animating to prevent duplicate animations
      hasAnimatedRef.current = true;
      
      // Clean up any existing animations
      if (enterCleanupRef.current) {
        enterCleanupRef.current();
      }
      
      // Apply enter animation
      enterCleanupRef.current = applyEnterAnimation(element, enter);
      
      // Mark entering as complete after animation starts
      setIsEntering(false);
    } else if (!isPresent && !isExiting) {
      // Reset animation state when element becomes absent and not exiting
      hasAnimatedRef.current = initial;
      setIsEntering(false);
      setElementReady(false);
    }
    
    return () => {
      if (enterCleanupRef.current) {
        enterCleanupRef.current();
        enterCleanupRef.current = null;
      }
    };
  }, [elementReady, enter, isExiting, isPresent, shouldRender, initial]);
  
  return {
    ref: refCallback,
    isExiting,
    isEntering,
    shouldRender,
  };
}


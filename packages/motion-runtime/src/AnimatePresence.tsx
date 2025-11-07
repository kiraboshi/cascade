/**
 * AnimatePresence Component
 * Enables smooth enter/exit animations for components that mount and unmount
 */

import React, {
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { applyExitAnimation, applyEnterAnimation, type ExitAnimationConfig, type EnterAnimationConfig } from './animate-presence-utils';
import { measureElement, type BoundingBox } from './layout-utils';
import { applyFLIPAnimation, type FlipAnimationConfig } from './flip-animation';
import { useLayoutTransition } from './useLayoutTransition';

export interface AnimatePresenceProps {
  /**
   * Children to animate
   */
  children: ReactNode;
  
  /**
   * Animation mode
   * - 'sync': Animate all children simultaneously (default)
   * - 'wait': Wait for exit animation before entering next
   * - 'popLayout': Remove element from layout immediately
   */
  mode?: 'sync' | 'wait' | 'popLayout';
  
  /**
   * Skip initial animation on mount
   */
  initial?: boolean;
  
  /**
   * Callback when all exit animations complete
   */
  onExitComplete?: () => void;
  
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

interface ChildState {
  element: ReactElement;
  isExiting: boolean;
  hasEntered: boolean;
}

/**
 * Component for animating mount/unmount of children
 */
export function AnimatePresence({
  children,
  mode = 'sync',
  initial = true,
  onExitComplete,
  exit,
  enter,
  layout = false,
}: AnimatePresenceProps): JSX.Element {
  const [displayedChildren, setDisplayedChildren] = useState<Map<string, ChildState>>(new Map());
  const exitingChildrenRef = useRef<Set<string>>(new Set());
  const exitCallbacksRef = useRef<Map<string, () => void>>(new Map());
  const isInitialMountRef = useRef(true);
  const waitingForExitRef = useRef(false);
  
  // Track children by key
  useEffect(() => {
    setDisplayedChildren((prev: Map<string, ChildState>) => {
      const currentKeys = new Set<string>();
      const newChildren = new Map<string, ChildState>();
      
      // Process current children
      Children.forEach(children, (child: ReactNode, index: number) => {
        if (!isValidElement(child)) return;
        
        const key = child.key ?? `presence-${index}`;
        currentKeys.add(key);
        
        // Check if this is a new child
        const existingState = prev.get(key);
        if (!existingState) {
          // New child entering
          newChildren.set(key, {
            element: child,
            isExiting: false,
            hasEntered: false,
          });
        } else {
          // Existing child - keep state but update element
          newChildren.set(key, {
            ...existingState,
            element: child,
            isExiting: false, // Reset exiting state if child is back
          });
        }
      });
      
      // Find children that are exiting
      for (const [key, state] of prev.entries()) {
        if (!currentKeys.has(key)) {
          // Child is exiting
          exitingChildrenRef.current.add(key);
          newChildren.set(key, {
            ...state,
            isExiting: true,
          });
          
          // In wait mode, mark that we're waiting
          if (mode === 'wait') {
            waitingForExitRef.current = true;
          }
        }
      }
      
      return newChildren;
    });
    
    // Mark initial mount as complete after first render
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
    }
    
    // Clean up if no exiting children
    if (exitingChildrenRef.current.size === 0 && waitingForExitRef.current) {
      waitingForExitRef.current = false;
    }
  }, [children, mode]);
  
  // Handle exit complete callback
  useEffect(() => {
    if (exitingChildrenRef.current.size === 0 && onExitComplete && !waitingForExitRef.current) {
      onExitComplete();
    }
  }, [onExitComplete]);
  
  return (
    <>
      {Array.from(displayedChildren.entries()).map(([key, state]: [string, ChildState]) => {
        if (!isValidElement(state.element)) return null;
        
        // In wait mode, don't render new children until exits complete
        // Only block if we're waiting AND this child hasn't entered yet
        if (mode === 'wait' && waitingForExitRef.current && !state.isExiting && !state.hasEntered) {
          console.log('[AnimatePresence] Wait mode: blocking child', { key, waitingForExit: waitingForExitRef.current, isExiting: state.isExiting, hasEntered: state.hasEntered });
          return null;
        }
        
        // If wait mode just cleared and this child was blocked, ensure it can animate
        // (hasEntered will be false, so enter animation should run)
        
        return (
          <AnimatePresenceChild
            key={key}
            presenceKey={key}
            child={state.element}
            mode={mode}
            initial={initial ? isInitialMountRef.current : false}
            isExiting={state.isExiting}
            exit={exit}
            enter={enter}
            layout={layout}
            onExitComplete={() => {
              exitingChildrenRef.current.delete(key);
              setDisplayedChildren((prev: Map<string, ChildState>) => {
                const next = new Map(prev);
                const existing = next.get(key);
                if (existing) {
                  next.delete(key);
                }
                return next;
              });
              
              // In wait mode, clear waiting flag when all exits complete
              if (mode === 'wait' && exitingChildrenRef.current.size === 0) {
                console.log('[AnimatePresence] Wait mode: all exits complete, clearing wait flag');
                waitingForExitRef.current = false;
                // Force a re-render to allow blocked children to render
                setDisplayedChildren((prev) => new Map(prev));
              }
              
              if (exitingChildrenRef.current.size === 0 && onExitComplete) {
                onExitComplete();
              }
            }}
            onEnterComplete={() => {
              setDisplayedChildren((prev: Map<string, ChildState>) => {
                const next = new Map(prev);
                const existing = next.get(key);
                if (existing) {
                  next.set(key, {
                    ...existing,
                    hasEntered: true,
                  });
                }
                return next;
              });
            }}
          />
        );
      })}
    </>
  );
}

interface AnimatePresenceChildProps {
  presenceKey: string;
  child: ReactElement;
  mode: 'sync' | 'wait' | 'popLayout';
  initial: boolean;
  isExiting: boolean;
  exit?: ExitAnimationConfig;
  enter?: EnterAnimationConfig;
  layout?: boolean;
  onExitComplete: () => void;
  onEnterComplete: () => void;
}

function AnimatePresenceChild({
  presenceKey,
  child,
  mode,
  initial,
  isExiting,
  exit,
  enter,
  layout,
  onExitComplete,
  onEnterComplete,
}: AnimatePresenceChildProps): JSX.Element | null {
  const elementRef = useRef<HTMLElement | null>(null);
  const [shouldRender, setShouldRender] = useState(true);
  const [elementReady, setElementReady] = useState(false);
  // Track if enter animation has been applied for this specific child instance
  // Reset when child changes (new child = new instance)
  const hasAnimatedRef = useRef(false);
  const exitCleanupRef = useRef<(() => void) | null>(null);
  const enterCleanupRef = useRef<(() => void) | null>(null);
  
  // Reset hasAnimatedRef when child changes (new child instance)
  // The initial prop tells us whether to skip animation on the very first mount
  // For new children added later, we always want to animate
  useEffect(() => {
    // Reset animation state for new children
    // If initial={true}, skip animation only on the very first mount
    // For subsequent children (initial will be false), always animate
    hasAnimatedRef.current = initial;
    setElementReady(false); // Reset element ready state for new child
    // Clear any existing enter cleanup
    if (enterCleanupRef.current) {
      enterCleanupRef.current();
      enterCleanupRef.current = null;
    }
  }, [presenceKey, initial]); // Reset when key changes (new child)
  
  // Handle popLayout mode - remove from layout immediately
  // Use useLayoutEffect to measure BEFORE React removes the element from layout
  useLayoutEffect(() => {
    if (mode === 'popLayout' && isExiting && elementRef.current) {
      const element = elementRef.current;
      
      console.log('[AnimatePresence] popLayout: removing from layout', {
        presenceKey,
        elementText: element.textContent?.substring(0, 30) || 'unknown',
      });
      
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
      
      console.log('[AnimatePresence] popLayout: positioned absolutely', {
        presenceKey,
        left,
        top,
        width: rect.width,
        height: rect.height,
        hasPositionedParent: !!positionedParent,
      });
      
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
  
  // Apply layout transition to non-exiting children when layout={true}
  // This animates remaining elements when siblings are removed
  useLayoutTransition(
    elementRef,
    layout && !isExiting
      ? {
          duration: typeof exit?.config === 'object' && exit?.config !== null && 'duration' in exit.config
            ? (typeof exit.config.duration === 'number' 
                ? exit.config.duration 
                : typeof exit.config.duration === 'string'
                ? parseFloat(exit.config.duration)
                : 300)
            : 300,
          easing: typeof exit?.config === 'object' && exit?.config !== null && 'easing' in exit.config
            ? exit.config.easing || 'cubic-bezier(0.4, 0, 0.2, 1)'
            : 'cubic-bezier(0.4, 0, 0.2, 1)',
          enabled: true,
        }
      : { enabled: false }
  );
  
  // Measure element bounds for layout transitions (before exit)
  const previousBoundsRef = useRef<BoundingBox | null>(null);
  const layoutStylesRef = useRef<{
    position: string;
    left: string;
    top: string;
    width: string;
    height: string;
  } | null>(null);
  
  // Track bounds when element is mounted (for layout transitions on exit)
  useLayoutEffect(() => {
    if (elementRef.current && !isExiting) {
      // Measure current bounds
      previousBoundsRef.current = measureElement(elementRef.current);
    }
  });
  
  // Handle layout removal - must happen synchronously in useLayoutEffect
  // so remaining elements can shift before their useLayoutTransition hooks measure
  useLayoutEffect(() => {
    if (layout && isExiting && elementRef.current && exit) {
      const element = elementRef.current;
      
      // Measure element position BEFORE removing from layout
      const rect = element.getBoundingClientRect();
      
      // Position relative to the direct parent element (container)
      // This ensures the element stays in the same visual position
      const parent = element.parentElement;
      if (!parent) {
        // No parent - can't position correctly, skip layout removal
        return;
      }
      
      const parentRect = parent.getBoundingClientRect();
      const left = rect.left - parentRect.left;
      const top = rect.top - parentRect.top;
      
      // Store original styles
      layoutStylesRef.current = {
        position: element.style.position || '',
        left: element.style.left || '',
        top: element.style.top || '',
        width: element.style.width || '',
        height: element.style.height || '',
      };
      
      // Remove from layout flow immediately - this allows siblings to shift
      // This happens synchronously before paint, so useLayoutTransition on siblings
      // will measure the new positions correctly
      element.style.position = 'absolute';
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
      element.style.width = `${rect.width}px`;
      element.style.height = `${rect.height}px`;
      
      // Start exit animation immediately on next frame
      // This ensures opacity fade happens simultaneously with layout shift
      requestAnimationFrame(() => {
        if (elementRef.current === element && exit) {
          // Clean up any existing animations
          if (exitCleanupRef.current) {
            exitCleanupRef.current();
          }
          
          // Measure current bounds (after removal from layout)
          const currentBounds = measureElement(element);
          
          // Calculate collapsed bounds (width/height to 0)
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
          
          // Apply FLIP animation to collapse the element
          applyFLIPAnimation(element, currentBounds, collapsedBounds, {
            duration,
            easing,
            origin: 'top-left',
          });
          
          // Apply standard exit animation (opacity/transform) immediately
          // This runs in parallel with the FLIP animation and layout shifts
          // Store the cleanup function so it doesn't get overwritten
          const cleanup = applyExitAnimation(element, exit, () => {
            // Only remove from DOM after animation completes
            setShouldRender(false);
            onExitComplete();
          });
          
          exitCleanupRef.current = cleanup;
        }
      });
      
      return () => {
        // Don't restore styles in cleanup - let the exit animation complete first
        // Styles will be cleaned up when the element is actually removed from DOM
        // This prevents premature style restoration that could interrupt the fade
      };
    } else if (!isExiting) {
      // Reset layout styles ref when not exiting
      layoutStylesRef.current = null;
    }
  }, [layout, isExiting, exit, onExitComplete]);
  
  // Apply exit animation (only when layout is NOT enabled, as layout handles it)
  useEffect(() => {
    if (isExiting && !layout) {
      if (exit && elementRef.current) {
        const element = elementRef.current;
        
        // Clean up any existing animations
        if (exitCleanupRef.current) {
          exitCleanupRef.current();
        }
        
        // Apply standard exit animation (opacity/transform)
        exitCleanupRef.current = applyExitAnimation(element, exit, () => {
          setShouldRender(false);
          onExitComplete();
        });
      } else {
        // No exit config - remove immediately
        setShouldRender(false);
        onExitComplete();
      }
    } else if (!isExiting && exitCleanupRef.current) {
      // Clean up exit animation if child is no longer exiting
      exitCleanupRef.current();
      exitCleanupRef.current = null;
    }
    
    return () => {
      if (exitCleanupRef.current) {
        exitCleanupRef.current();
        exitCleanupRef.current = null;
      }
    };
  }, [isExiting, exit, layout, onExitComplete]);
  
  // Apply enter animation when element becomes available
  useEffect(() => {
    console.log('[AnimatePresence] Enter animation useEffect', {
      presenceKey,
      elementReady,
      hasAnimated: hasAnimatedRef.current,
      hasEnter: !!enter,
      isExiting,
      hasElement: !!elementRef.current,
    });
    
    // Wait for element to be available and ensure we haven't animated yet
    if (elementReady && !hasAnimatedRef.current && enter && !isExiting && elementRef.current) {
      const element = elementRef.current;
      
      console.log('[AnimatePresence] Triggering enter animation', {
        presenceKey,
        elementText: element.textContent?.substring(0, 20) || 'unknown',
        currentOpacity: window.getComputedStyle(element).opacity,
      });
      
      // Mark as animating to prevent duplicate animations
      hasAnimatedRef.current = true;
      
      // Clean up any existing animations
      if (enterCleanupRef.current) {
        enterCleanupRef.current();
      }
      
      // Apply enter animation
      enterCleanupRef.current = applyEnterAnimation(element, enter);
      
      // Call onEnterComplete after animation starts (use ref to avoid stale closure)
      const currentOnEnterComplete = onEnterComplete;
      setTimeout(() => {
        currentOnEnterComplete();
      }, 0);
    }
    
    return () => {
      if (enterCleanupRef.current) {
        enterCleanupRef.current();
        enterCleanupRef.current = null;
      }
    };
  }, [elementReady, enter, isExiting, presenceKey]); // onEnterComplete is stable, no need in deps
  
  if (!shouldRender) {
    return null;
  }
  
  // Clone element with ref
  const refCallback = (el: HTMLElement | null) => {
    const prevElement = elementRef.current;
    elementRef.current = el;
    
    // Call original ref if it exists
    if (typeof child.ref === 'function') {
      child.ref(el);
    } else if (child.ref && 'current' in child.ref) {
      (child.ref as React.MutableRefObject<HTMLElement | null>).current = el;
    }
    
    // Mark element as ready when ref is set
    if (el && !prevElement) {
      setElementReady(true);
    } else if (!el && prevElement) {
      setElementReady(false);
    }
  };
  
  // Clone element and ensure initial opacity is set if enter animation is configured
  const clonedChild = cloneElement(child, {
    ref: refCallback,
    style: {
      ...(child.props.style || {}),
      // Set initial opacity if enter animation is configured
      // This prevents flash of visible content before animation starts
      ...(enter && enter.opacity !== undefined && !hasAnimatedRef.current && !isExiting
        ? { opacity: enter.opacity }
        : {}),
    },
  } as any);
  
  return clonedChild;
}


/**
 * Viewport Detection Hooks
 * Detect when elements enter/leave the viewport using IntersectionObserver
 */

import { useEffect, useRef, useState, type RefObject } from 'react';

export interface ViewportConfig {
  /**
   * Margin around the root bounding box
   * Similar to CSS margin: "10px 20px 30px 40px" or "10px"
   */
  rootMargin?: string;
  
  /**
   * Threshold(s) at which the callback is triggered
   * 0 = element just enters viewport
   * 1 = element fully visible
   * [0, 0.5, 1] = triggers at 0%, 50%, and 100% visibility
   */
  threshold?: number | number[];
  
  /**
   * Only trigger once (for enter animations)
   */
  once?: boolean;
  
  /**
   * Root element for intersection calculation
   * Default: viewport (null)
   */
  root?: Element | null;
  
  /**
   * Amount of element that must be visible (0-1)
   * Shorthand for threshold
   */
  amount?: 'some' | 'all' | number;
}

export interface ViewportState {
  isInView: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Normalize threshold value from config
 */
function normalizeThreshold(
  threshold?: number | number[],
  amount?: 'some' | 'all' | number
): number | number[] {
  if (threshold !== undefined) {
    return threshold;
  }
  
  if (amount === 'some') {
    return 0;
  }
  if (amount === 'all') {
    return 1;
  }
  if (typeof amount === 'number') {
    return amount;
  }
  
  return 0; // Default: trigger when any part enters
}

/**
 * Hook to detect when an element enters/leaves the viewport
 * Returns a boolean indicating if the element is currently in view
 */
export function useInView(
  elementRef: RefObject<HTMLElement>,
  config: ViewportConfig = {}
): boolean {
  const [isInView, setIsInView] = useState(false);
  const configRef = useRef(config);
  const hasTriggeredRef = useRef(false);
  
  // Keep config ref up to date
  configRef.current = config;
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      return;
    }
    
    // Normalize config
    const threshold = normalizeThreshold(config.threshold, config.amount);
    const rootMargin = config.rootMargin || '0px';
    const once = config.once || false;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;
          
          if (once && hasTriggeredRef.current && !isIntersecting) {
            return; // Already triggered, ignore exit
          }
          
          if (isIntersecting) {
            hasTriggeredRef.current = true;
          }
          
          setIsInView(isIntersecting);
        });
      },
      {
        root: config.root || null,
        rootMargin,
        threshold,
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [
    elementRef,
    config.root,
    config.rootMargin,
    config.threshold,
    config.amount,
    config.once,
  ]);
  
  return isInView;
}

/**
 * Hook that returns detailed viewport state including the IntersectionObserverEntry
 * Useful when you need access to intersection ratio, bounding boxes, etc.
 */
export function useInViewState(
  elementRef: RefObject<HTMLElement>,
  config: ViewportConfig = {}
): ViewportState {
  const [state, setState] = useState<ViewportState>({
    isInView: false,
    entry: null,
  });
  
  const configRef = useRef(config);
  configRef.current = config;
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      return;
    }
    
    const threshold = normalizeThreshold(config.threshold, config.amount);
    const rootMargin = config.rootMargin || '0px';
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setState({
            isInView: entry.isIntersecting,
            entry,
          });
        });
      },
      {
        root: config.root || null,
        rootMargin,
        threshold,
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [
    elementRef,
    config.root,
    config.rootMargin,
    config.threshold,
    config.amount,
  ]);
  
  return state;
}


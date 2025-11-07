/**
 * Tap Gesture Hooks
 * Detect tap/click gestures on elements
 */

import { useEffect, useRef, useState, type RefObject } from 'react';

export interface TapConfig {
  /**
   * Callback when tap starts
   */
  onTapStart?: (event: MouseEvent | TouchEvent) => void;
  
  /**
   * Callback when tap completes
   */
  onTap?: (event: MouseEvent | TouchEvent) => void;
  
  /**
   * Callback when tap is cancelled (e.g., drag starts)
   */
  onTapCancel?: (event: MouseEvent | TouchEvent) => void;
  
  /**
   * Maximum distance (in px) for a tap (prevents tap on drag)
   */
  tapThreshold?: number;
  
  /**
   * Maximum time (in ms) for a tap
   */
  tapTimeout?: number;
  
  /**
   * Disable tap detection
   */
  disabled?: boolean;
}

export interface TapState {
  isTapping: boolean;
  tapCount: number;
}

/**
 * Helper to get point coordinates from mouse or touch event
 */
function getEventPoint(event: MouseEvent | TouchEvent): { x: number; y: number } {
  if ('touches' in event && event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }
  if ('changedTouches' in event && event.changedTouches.length > 0) {
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
    };
  }
  return {
    x: (event as MouseEvent).clientX,
    y: (event as MouseEvent).clientY,
  };
}

/**
 * Hook to detect tap gestures on an element
 * Returns a ref that should be attached to the tappable element
 */
export function useTap(
  config: TapConfig = {}
): RefObject<HTMLElement> {
  const elementRef = useRef<HTMLElement>(null);
  const configRef = useRef(config);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasMovedRef = useRef(false);
  
  configRef.current = config;
  const tapThreshold = config.tapThreshold ?? 10; // pixels
  const tapTimeout = config.tapTimeout ?? 300; // ms
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || config.disabled) return;
    
    const handleStart = (event: MouseEvent | TouchEvent) => {
      const point = getEventPoint(event);
      startPointRef.current = point;
      startTimeRef.current = Date.now();
      hasMovedRef.current = false;
      
      configRef.current.onTapStart?.(event);
    };
    
    const handleMove = (event: MouseEvent | TouchEvent) => {
      if (!startPointRef.current) return;
      
      const point = getEventPoint(event);
      const distance = Math.sqrt(
        Math.pow(point.x - startPointRef.current.x, 2) +
        Math.pow(point.y - startPointRef.current.y, 2)
      );
      
      if (distance > tapThreshold) {
        hasMovedRef.current = true;
      }
    };
    
    const handleEnd = (event: MouseEvent | TouchEvent) => {
      if (!startPointRef.current || !startTimeRef.current) return;
      
      const elapsed = Date.now() - startTimeRef.current;
      const point = getEventPoint(event);
      const distance = Math.sqrt(
        Math.pow(point.x - startPointRef.current.x, 2) +
        Math.pow(point.y - startPointRef.current.y, 2)
      );
      
      if (hasMovedRef.current || distance > tapThreshold || elapsed > tapTimeout) {
        configRef.current.onTapCancel?.(event);
      } else {
        configRef.current.onTap?.(event);
      }
      
      startPointRef.current = null;
      startTimeRef.current = null;
      hasMovedRef.current = false;
    };
    
    // Mouse events
    element.addEventListener('mousedown', handleStart);
    element.addEventListener('mousemove', handleMove);
    element.addEventListener('mouseup', handleEnd);
    element.addEventListener('mouseleave', handleEnd);
    
    // Touch events
    element.addEventListener('touchstart', handleStart, { passive: true });
    element.addEventListener('touchmove', handleMove, { passive: true });
    element.addEventListener('touchend', handleEnd, { passive: true });
    element.addEventListener('touchcancel', handleEnd, { passive: true });
    
    return () => {
      element.removeEventListener('mousedown', handleStart);
      element.removeEventListener('mousemove', handleMove);
      element.removeEventListener('mouseup', handleEnd);
      element.removeEventListener('mouseleave', handleEnd);
      element.removeEventListener('touchstart', handleStart);
      element.removeEventListener('touchmove', handleMove);
      element.removeEventListener('touchend', handleEnd);
      element.removeEventListener('touchcancel', handleEnd);
    };
  }, [config.disabled, tapThreshold, tapTimeout]);
  
  return elementRef;
}

/**
 * Hook that returns detailed tap state
 * Useful when you need access to tap count and tapping state
 */
export function useTapState(
  config: TapConfig = {}
): [RefObject<HTMLElement>, TapState] {
  const elementRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<TapState>({
    isTapping: false,
    tapCount: 0,
  });
  const configRef = useRef(config);
  
  configRef.current = config;
  
  const tapRef = useTap({
    ...config,
    onTapStart: (event) => {
      setState(prev => ({ ...prev, isTapping: true }));
      config.onTapStart?.(event);
    },
    onTap: (event) => {
      setState(prev => ({
        isTapping: false,
        tapCount: prev.tapCount + 1,
      }));
      config.onTap?.(event);
    },
    onTapCancel: (event) => {
      setState(prev => ({ ...prev, isTapping: false }));
      config.onTapCancel?.(event);
    },
  });
  
  // Sync refs
  useEffect(() => {
    elementRef.current = tapRef.current;
  }, [tapRef]);
  
  return [elementRef, state];
}


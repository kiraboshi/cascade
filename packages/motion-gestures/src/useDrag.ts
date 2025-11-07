/**
 * useDrag Hook
 * React hook for drag gestures
 */

import { useEffect, useRef, type RefObject } from 'react';
import type { MotionValue } from '@cascade/motion-runtime';
import type { GestureConfig } from './gesture-handler';
import { createGestureHandler, type GestureHandler } from './gesture-handler';

/**
 * React hook for drag gestures
 * Returns a ref that should be attached to the draggable element
 */
export function useDrag(
  motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
  },
  config?: GestureConfig
): RefObject<HTMLElement> {
  const elementRef = useRef<HTMLElement>(null);
  const handlerRef = useRef<GestureHandler | null>(null);
  const motionValuesRef = useRef(motionValues);
  const configRef = useRef(config);
  
  // Keep refs in sync
  motionValuesRef.current = motionValues;
  configRef.current = config;
  
  // Set up handler when element is available
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // Clean up previous handler
    if (handlerRef.current) {
      handlerRef.current.stop();
    }
    
    // Create and start new handler
    handlerRef.current = createGestureHandler(element, motionValuesRef.current, configRef.current || {});
    handlerRef.current.start();
    
    // Cleanup on unmount or when element changes
    return () => {
      handlerRef.current?.stop();
      handlerRef.current = null;
    };
  }, []); // Empty deps - we use refs to access latest values
  
  return elementRef;
}


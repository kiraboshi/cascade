/**
 * useWheel Hook
 * React hook for wheel/scroll wheel gestures
 */

import { useEffect, useRef, type RefObject } from 'react';
import type { MotionValue } from '@cascade/motion-runtime';
import type { SpringConfig } from '@cascade/compiler';

export interface WheelConfig {
  axis?: 'x' | 'y' | 'both';
  multiplier?: number;
  spring?: SpringConfig;
}

/**
 * React hook for wheel gestures
 * Returns a ref that should be attached to the element
 */
export function useWheel(
  motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
  },
  config?: WheelConfig
): RefObject<HTMLElement> {
  const elementRef = useRef<HTMLElement>(null);
  const motionValuesRef = useRef(motionValues);
  const configRef = useRef(config);
  
  // Keep refs in sync
  motionValuesRef.current = motionValues;
  configRef.current = config;
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const multiplier = configRef.current?.multiplier || 1;
    const axis = configRef.current?.axis || 'y';
    
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Normalize delta values - different browsers/modes use different units
      // deltaMode: 0 = pixels, 1 = lines, 2 = pages
      let deltaX = event.deltaX;
      let deltaY = event.deltaY;
      
      if (event.deltaMode === 1) {
        // Line mode - convert to approximate pixels (assuming ~16px per line)
        deltaX *= 16;
        deltaY *= 16;
      } else if (event.deltaMode === 2) {
        // Page mode - convert to approximate pixels (assuming ~800px per page)
        deltaX *= 800;
        deltaY *= 800;
      }
      
      // Apply axis and multiplier
      // For zoom, we typically want negative deltaY (scroll up) to increase value
      // So we invert deltaY: negative becomes positive, positive becomes negative
      const finalDeltaX = axis !== 'y' ? deltaX * multiplier : 0;
      const finalDeltaY = axis !== 'x' ? -deltaY * multiplier : 0; // Invert for natural zoom direction
      
      if (motionValuesRef.current.x && finalDeltaX !== 0) {
        const currentX = motionValuesRef.current.x.get() as number;
        const newX = currentX + finalDeltaX;
        motionValuesRef.current.x.set(newX);
      }
      if (motionValuesRef.current.y && finalDeltaY !== 0) {
        const currentY = motionValuesRef.current.y.get() as number;
        const newY = currentY + finalDeltaY;
        motionValuesRef.current.y.set(newY);
      }
    };
    
    element.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, []); // Empty deps - we use refs to access latest values
  
  return elementRef;
}


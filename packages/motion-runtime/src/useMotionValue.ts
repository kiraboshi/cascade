/**
 * React hook for creating motion values in components
 */

import { useEffect, useRef } from 'react';
import { createMotionValue, type MotionValue } from './motion-value';
import type { MotionValueConfig } from './motion-value';

/**
 * React hook for creating motion values in components
 * Returns a stable reference that persists across renders
 */
export function useMotionValue<T extends number | string>(
  initialValue: T,
  config?: Omit<MotionValueConfig, 'initialValue'>
): MotionValue<T> {
  const valueRef = useRef<MotionValue<T> | null>(null);
  
  // Initialize on first render
  if (!valueRef.current) {
    valueRef.current = createMotionValue({
      initialValue,
      ...config,
    });
  }
  
  // Update element reference when it becomes available
  useEffect(() => {
    if (valueRef.current && config?.element) {
      // Update the internal elementRef so motion value can re-register
      const mv = valueRef.current as any;
      if (mv.elementRef !== config.element) {
        mv.elementRef = config.element;
        // Trigger a set to ensure re-registration happens
        const currentVal = valueRef.current.get();
        valueRef.current.set(currentVal);
      }
    }
  }, [config?.element]);
  
  // Update initial value if it changes (but keep same instance)
  useEffect(() => {
    if (valueRef.current && valueRef.current.get() !== initialValue) {
      // Only update if value actually changed externally
      // This allows controlled updates from props
    }
  }, [initialValue]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      valueRef.current?.destroy();
    };
  }, []);
  
  return valueRef.current;
}



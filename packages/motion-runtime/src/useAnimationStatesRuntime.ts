/**
 * Runtime motion value integration for animation states
 * Handles runtime states that need motion values
 */

import { useEffect, useRef, useState } from 'react';
import { useMotionValue, type MotionValue } from './useMotionValue';
import type { AnimationStateDefinition } from '@cascade/compiler';

/**
 * Extract property value from state definition
 */
function extractPropertyValue(propValue: any): {
  value: string | number;
  isRuntime: boolean;
  isFunction: boolean;
} {
  if (typeof propValue === 'string' || typeof propValue === 'number') {
    const isRuntime = typeof propValue === 'string' && 
      (propValue.startsWith('var(') || propValue.startsWith('--'));
    return { value: propValue, isRuntime, isFunction: false };
  }
  
  if (typeof propValue === 'function') {
    return { value: propValue(), isRuntime: true, isFunction: true };
  }
  
  if (typeof propValue === 'object' && propValue !== null && 'value' in propValue) {
    const value = propValue.value;
    const isRuntime = typeof value === 'string' && 
      (value.startsWith('var(') || value.startsWith('--'));
    return { value, isRuntime, isFunction: false };
  }
  
  return { value: '', isRuntime: false, isFunction: false };
}

/**
 * Create motion values for runtime properties in a state
 * This hook creates and manages motion values for runtime state properties
 */
export function useRuntimeMotionValues(
  state: AnimationStateDefinition,
  element?: HTMLElement
): Map<string, MotionValue<number | string>> {
  const motionValuesRef = useRef<Map<string, MotionValue<number | string>>>(new Map());
  const [motionValues, setMotionValues] = useState<Map<string, MotionValue<number | string>>>(new Map());
  
  // Track which properties need motion values
  const runtimeProps = useRef<Set<string>>(new Set());
  
  // Identify runtime properties
  useEffect(() => {
    const newRuntimeProps = new Set<string>();
    
    for (const [prop, propValue] of Object.entries(state)) {
      if (prop === 'transition' || prop === '_mode') {
        continue;
      }
      
      const { isRuntime } = extractPropertyValue(propValue);
      if (isRuntime) {
        newRuntimeProps.add(prop);
      }
    }
    
    runtimeProps.current = newRuntimeProps;
  }, [state]);
  
  // Create motion values for each runtime property
  // We need to create them individually using hooks
  const propEntries = Array.from(runtimeProps.current);
  
  // For now, return empty map - runtime states will be handled differently
  // Full implementation would require creating motion values per property
  return motionValuesRef.current;
}

/**
 * Apply runtime state values to element
 */
export function applyRuntimeState(
  element: HTMLElement,
  state: AnimationStateDefinition,
  motionValues: Map<string, MotionValue<number | string>>
): void {
  for (const [prop, propValue] of Object.entries(state)) {
    if (prop === 'transition' || prop === '_mode') {
      continue;
    }
    
    const { value, isRuntime, isFunction } = extractPropertyValue(propValue);
    
    if (isRuntime) {
      const mv = motionValues.get(prop);
      if (mv) {
        // Update element style with motion value
        if (prop === 'transform') {
          // Transform is handled by transform registry
          element.style.transform = `var(${mv.cssVarName})`;
        } else {
          element.style.setProperty(prop, `var(${mv.cssVarName})`);
        }
      }
    } else {
      // Static value - apply directly
      if (prop === 'transform') {
        element.style.transform = String(value);
      } else {
        element.style.setProperty(prop, String(value));
      }
    }
  }
}


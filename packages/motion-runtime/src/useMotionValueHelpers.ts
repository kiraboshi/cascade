/**
 * React hook helpers for common transform properties
 */

import { useMotionValue } from './useMotionValue';
import type { MotionValue, MotionValueConfig } from './motion-value';

export function useTranslateX(
  initialValue: number = 0,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return useMotionValue(initialValue, { 
    property: 'x', 
    unit: 'px', 
    transformMode: 'transform', 
    ...config 
  });
}

export function useTranslateY(
  initialValue: number = 0,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return useMotionValue(initialValue, { 
    property: 'y', 
    unit: 'px', 
    transformMode: 'transform', 
    ...config 
  });
}

export function useRotate(
  initialValue: number = 0,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return useMotionValue(initialValue, { 
    property: 'rotate', 
    unit: 'deg', 
    transformMode: 'transform', 
    ...config 
  });
}

export function useScale(
  initialValue: number = 1,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return useMotionValue(initialValue, { 
    property: 'scale', 
    unit: '', 
    transformMode: 'transform', 
    ...config 
  });
}


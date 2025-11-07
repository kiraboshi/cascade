/**
 * Helper functions for common transform properties
 */

import { createMotionValue, type MotionValueConfig } from './motion-value';
import type { MotionValue } from './motion-value';

export function createTranslateX(
  initialValue: number = 0,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return createMotionValue({
    initialValue,
    property: 'x',
    unit: 'px',
    transformMode: 'transform',
    ...config,
  });
}

export function createTranslateY(
  initialValue: number = 0,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return createMotionValue({
    initialValue,
    property: 'y',
    unit: 'px',
    transformMode: 'transform',
    ...config,
  });
}

export function createRotate(
  initialValue: number = 0,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return createMotionValue({
    initialValue,
    property: 'rotate',
    unit: 'deg',
    transformMode: 'transform',
    ...config,
  });
}

export function createScale(
  initialValue: number = 1,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return createMotionValue({
    initialValue,
    property: 'scale',
    unit: '',
    transformMode: 'transform',
    ...config,
  });
}


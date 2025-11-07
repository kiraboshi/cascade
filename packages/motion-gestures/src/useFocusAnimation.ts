/**
 * Focus Animation Hook
 * Animate motion values based on focus state
 */

import { useRef, type RefObject } from 'react';
import type { MotionValue } from '@cascade/motion-runtime';
import type { SpringConfig } from '@cascade/compiler';
import type { MotionValueKeyframeConfig } from '@cascade/motion-runtime';
import { useFocus } from './useFocus';

export interface FocusAnimationConfig {
  /**
   * Animation when focus starts
   */
  onFocusStart?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  
  /**
   * Animation when focus ends
   */
  onFocusEnd?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  
  /**
   * Disable focus detection
   */
  disabled?: boolean;
}

/**
 * Hook to animate motion values on focus
 * Returns a ref that should be attached to the focusable element
 */
export function useFocusAnimation(
  motionValue: MotionValue<number | string>,
  config: FocusAnimationConfig
): RefObject<HTMLElement> {
  const configRef = useRef(config);
  configRef.current = config;
  
  const [focusRef, isFocused] = useFocus({
    disabled: config.disabled,
    onFocusChange: (focused) => {
      const currentConfig = configRef.current;
      
      if (focused && currentConfig.onFocusStart) {
        motionValue.animateTo(
          currentConfig.onFocusStart.target,
          currentConfig.onFocusStart.config
        ).catch((err) => {
          console.error('Focus animation error:', err);
        });
      } else if (!focused && currentConfig.onFocusEnd) {
        motionValue.animateTo(
          currentConfig.onFocusEnd.target,
          currentConfig.onFocusEnd.config
        ).catch((err) => {
          console.error('Focus animation error:', err);
        });
      }
    },
  });
  
  return focusRef;
}


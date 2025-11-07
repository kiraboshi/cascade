/**
 * Hover Animation Hook
 * Animate motion values based on hover state
 */

import { useRef, type RefObject } from 'react';
import type { MotionValue } from '@cascade/motion-runtime';
import type { SpringConfig } from '@cascade/compiler';
import type { MotionValueKeyframeConfig } from '@cascade/motion-runtime';
import { useHover } from './useHover';

export interface HoverAnimationConfig {
  /**
   * Animation when hover starts
   */
  onHoverStart?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  
  /**
   * Animation when hover ends
   */
  onHoverEnd?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  
  /**
   * Disable hover detection
   */
  disabled?: boolean;
}

/**
 * Hook to animate motion values on hover
 * Returns a ref that should be attached to the hoverable element
 */
export function useHoverAnimation(
  motionValue: MotionValue<number | string>,
  config: HoverAnimationConfig
): RefObject<HTMLElement> {
  const configRef = useRef(config);
  configRef.current = config;
  
  const [hoverRef, isHovering] = useHover({
    disabled: config.disabled,
    onHoverChange: (hovering) => {
      const currentConfig = configRef.current;
      
      if (hovering && currentConfig.onHoverStart) {
        motionValue.animateTo(
          currentConfig.onHoverStart.target,
          currentConfig.onHoverStart.config
        ).catch((err) => {
          console.error('Hover animation error:', err);
        });
      } else if (!hovering && currentConfig.onHoverEnd) {
        motionValue.animateTo(
          currentConfig.onHoverEnd.target,
          currentConfig.onHoverEnd.config
        ).catch((err) => {
          console.error('Hover animation error:', err);
        });
      }
    },
  });
  
  return hoverRef;
}


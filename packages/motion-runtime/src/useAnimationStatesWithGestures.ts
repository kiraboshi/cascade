/**
 * Integration helpers for useAnimationStates with gesture hooks
 */

import { useRef, useEffect, useCallback } from 'react';
import type React from 'react';
import { useAnimationStates, type AnimationStatesControls, type UseAnimationStatesOptions } from './useAnimationStates';
import type { AnimationStateSet } from '@cascade/compiler';
import { useHover, type HoverConfig } from '@cascade/motion-gestures';
import { useTap, type TapConfig } from '@cascade/motion-gestures';
import { useFocus, type FocusConfig } from '@cascade/motion-gestures';

/**
 * Options for useAnimationStatesWithGestures
 */
export interface UseAnimationStatesWithGesturesOptions extends UseAnimationStatesOptions {
  /**
   * Enable hover state integration
   */
  hover?: boolean | {
    onHoverStart?: () => void;
    onHoverEnd?: () => void;
  };
  
  /**
   * Enable tap state integration
   */
  tap?: boolean | {
    onTapStart?: () => void;
    onTapEnd?: () => void;
  };
  
  /**
   * Enable focus state integration
   */
  focus?: boolean | {
    onFocusStart?: () => void;
    onFocusEnd?: () => void;
  };
}

/**
 * Result of useAnimationStatesWithGestures
 */
export interface AnimationStatesWithGesturesResult extends AnimationStatesControls {
  /**
   * Ref to attach to element for gesture detection
   */
  ref: React.RefObject<HTMLElement>;
}

/**
 * Hook that integrates animation states with gesture hooks
 */
export function useAnimationStatesWithGestures(
  stateSet: AnimationStateSet,
  options: UseAnimationStatesWithGesturesOptions = {}
): AnimationStatesWithGesturesResult {
  const {
    hover,
    tap,
    focus,
    ...animationOptions
  } = options;
  
  const animation = useAnimationStates(stateSet, animationOptions);
  const elementRef = useRef<HTMLElement>(null);
  
  // Integrate hover
  const hoverEnabled = hover !== false && stateSet.states.hover;
  const [hoverRef, isHovering] = useHover({
    disabled: !hoverEnabled,
    onHoverStart: () => {
      if (hoverEnabled) {
        animation.set('hover');
      }
      if (typeof hover === 'object' && hover.onHoverStart) {
        hover.onHoverStart();
      }
    },
    onHoverEnd: () => {
      if (hoverEnabled) {
        // Return to animate state if it exists, otherwise keep hover
        if (stateSet.states.animate) {
          animation.set('animate');
        }
      }
      if (typeof hover === 'object' && hover.onHoverEnd) {
        hover.onHoverEnd();
      }
    },
  });
  
  // Integrate tap
  const tapEnabled = tap !== false && stateSet.states.tap;
  const tapRef = useTap({
    disabled: !tapEnabled,
    onTapStart: () => {
      if (tapEnabled) {
        animation.set('tap');
      }
      if (typeof tap === 'object' && tap.onTapStart) {
        tap.onTapStart();
      }
    },
    onTap: () => {
      if (tapEnabled) {
        // Return to hover if hovering, otherwise animate
        if (isHovering && stateSet.states.hover) {
          animation.set('hover');
        } else if (stateSet.states.animate) {
          animation.set('animate');
        }
      }
      if (typeof tap === 'object' && tap.onTapEnd) {
        tap.onTapEnd();
      }
    },
  });
  
  // Integrate focus
  const focusEnabled = focus !== false && stateSet.states.focus;
  const [focusRef, isFocused] = useFocus({
    disabled: !focusEnabled,
    onFocusStart: () => {
      if (focusEnabled) {
        animation.set('focus');
      }
      if (typeof focus === 'object' && focus.onFocusStart) {
        focus.onFocusStart();
      }
    },
    onFocusEnd: () => {
      if (focusEnabled) {
        // Return to animate state
        if (stateSet.states.animate) {
          animation.set('animate');
        }
      }
      if (typeof focus === 'object' && focus.onFocusEnd) {
        focus.onFocusEnd();
      }
    },
  });
  
  // Create a callback ref that syncs all gesture refs
  const callbackRef = useCallback((el: HTMLElement | null) => {
    elementRef.current = el;
    
    // Sync all gesture refs to the same element
    if (hoverEnabled && hoverRef) {
      (hoverRef as any).current = el;
    }
    if (tapEnabled && tapRef) {
      (tapRef as any).current = el;
    }
    if (focusEnabled && focusRef) {
      (focusRef as any).current = el;
    }
  }, [hoverEnabled, tapEnabled, focusEnabled, hoverRef, tapRef, focusRef]);
  
  // Create a ref object that works with both callback and object refs
  const combinedRef = useRef<HTMLElement>(null);
  combinedRef.current = elementRef.current;
  (combinedRef as any).callback = callbackRef;
  
  return {
    ...animation,
    ref: combinedRef as React.RefObject<HTMLElement>,
  };
}


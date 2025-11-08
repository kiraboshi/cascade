/**
 * Hook to automatically pause motion value animations when element is off-screen
 * This is a performance optimization to prevent unnecessary updates for invisible elements
 */

import { useEffect, useRef, type RefObject } from 'react';
import type { MotionValue } from './motion-value';
import { useInView, type ViewportConfig } from './useInView';

export interface PauseWhenOffScreenConfig extends ViewportConfig {
  /**
   * Motion values to pause when off-screen
   */
  motionValues: MotionValue<number | string>[];
  
  /**
   * Whether to pause when off-screen (default: true)
   * Set to false to disable this optimization
   */
  enabled?: boolean;
}

/**
 * Hook to automatically pause motion value animations when element is off-screen
 * 
 * This is a performance optimization that prevents animations from running
 * when elements are not visible, reducing CPU usage and improving performance.
 * 
 * @example
 * ```typescript
 * const opacity = useMotionValue(0);
 * const y = useTranslateY(0);
 * const ref = useRef<HTMLDivElement>(null);
 * 
 * // Pause animations when off-screen
 * usePauseWhenOffScreen(ref, {
 *   motionValues: [opacity, y],
 * });
 * ```
 */
export function usePauseWhenOffScreen(
  elementRef: RefObject<HTMLElement>,
  config: PauseWhenOffScreenConfig
): void {
  const { motionValues, enabled = true, ...viewportConfig } = config;
  
  const isInView = useInView(elementRef, viewportConfig);
  const motionValuesRef = useRef(motionValues);
  
  // Keep motionValues ref up to date
  useEffect(() => {
    motionValuesRef.current = motionValues;
  }, [motionValues]);
  
  useEffect(() => {
    if (!enabled) return;
    
    motionValuesRef.current.forEach(motionValue => {
      const timeline = motionValue.getTimeline();
      if (!timeline) return;
      
      if (isInView) {
        // Resume animation if paused
        if (timeline.isPaused) {
          timeline.play();
        }
      } else {
        // Pause animation when off-screen
        if (timeline.isPlaying) {
          timeline.pause();
        }
      }
    });
  }, [isInView, enabled]);
}


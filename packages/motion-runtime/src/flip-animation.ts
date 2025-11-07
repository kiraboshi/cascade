/**
 * Shared utility for applying FLIP animations to elements
 */

import { generateFLIPKeyframes, type FLIPConfig } from './flip-generator';
import type { BoundingBox } from './layout-utils';
import { debugLog } from './debug';

export interface FlipAnimationConfig {
  duration?: number;
  easing?: string;
  origin?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onComplete?: () => void;
}

/**
 * Apply FLIP animation to an element
 */
export function applyFLIPAnimation(
  element: HTMLElement,
  from: BoundingBox,
  to: BoundingBox,
  config?: FlipAnimationConfig
): void {
  debugLog('applyFLIPAnimation', 'Starting animation', {
    element: element.textContent?.substring(0, 20) || 'unknown',
    from,
    to,
    config,
  });

  // Generate keyframes
  const animationName = `flip-${Math.random().toString(36).substr(2, 9)}`;
  const { css, className } = generateFLIPKeyframes(animationName, {
    from,
    to,
    duration: config?.duration ?? 300,
    easing: config?.easing ?? 'cubic-bezier(0.4, 0, 0.2, 1)',
    origin: config?.origin ?? 'center',
  });

  debugLog('applyFLIPAnimation', 'Generated keyframes', {
    animationName,
    className,
    cssLength: css.length,
  });

  // Inject CSS
  const styleId = `flip-style-${animationName}`;
  let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
  }

  // Set transform-origin on the element
  const transformOriginValue = config?.origin === 'center'
    ? 'center'
    : config?.origin === 'top-left'
    ? '0 0'
    : config?.origin === 'top-right'
    ? '100% 0'
    : config?.origin === 'bottom-left'
    ? '0 100%'
    : '100% 100%';

  // Store original transform-origin if not already set
  const originalTransformOrigin = element.style.transformOrigin || '';
  
  // Set transform-origin
  element.style.setProperty('transform-origin', transformOriginValue, 'important');
  element.style.transformOrigin = transformOriginValue;

  // Check if element has an active CSS animation (from MotionStage or other sources)
  // If so, don't apply FLIP animation to avoid conflicts
  const computedStyle = window.getComputedStyle(element);
  const hasActiveAnimation = computedStyle.animationName !== 'none' && computedStyle.animationName !== '';
  
  if (hasActiveAnimation) {
    debugLog('applyFLIPAnimation', 'Skipping FLIP animation - CSS animation already active', {
      animationName: computedStyle.animationName,
    });
    return;
  }

  // Remove any existing animation class first
  const existingClasses = Array.from(element.classList).filter(cls => cls.startsWith('flip-') || cls.startsWith('shared-flip-'));
  existingClasses.forEach(cls => element.classList.remove(cls));

  // Force reflow
  void element.offsetWidth;

  // Apply animation class
  element.classList.add(className);

  // Clean up after animation
  const handleAnimationEnd = (e: AnimationEvent) => {
    if (e.animationName === animationName) {
      element.classList.remove(className);
      
      // Restore original transform-origin or remove it
      if (originalTransformOrigin) {
        element.style.transformOrigin = originalTransformOrigin;
      } else {
        element.style.removeProperty('transform-origin');
      }
      
      // Clean up style element after a delay (in case animation is reused)
      setTimeout(() => {
        if (styleElement && document.head.contains(styleElement)) {
          // Only remove if no other elements are using this animation
          const hasOtherUsers = Array.from(document.querySelectorAll(`.${className}`)).length > 0;
          if (!hasOtherUsers) {
            styleElement.remove();
          }
        }
      }, 100);
      
      config?.onComplete?.();
    }
  };

  element.addEventListener('animationend', handleAnimationEnd, { once: true });
  element.addEventListener('animationcancel', handleAnimationEnd, { once: true });
}


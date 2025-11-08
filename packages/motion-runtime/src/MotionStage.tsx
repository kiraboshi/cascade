/**
 * MotionStage component for individual animation stages
 */

import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { useLayoutTransition, type LayoutTransitionConfig } from './useLayoutTransition';
import { warnDuplicateClass, warnMissingCSS } from './dev-warnings';

export interface MotionStageProps {
  animation?: string | { className: string; css?: string };
  delay?: number | 'until-previous-completes';
  onComplete?: (event: { next: () => void }) => void;
  onStart?: () => void;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
  /**
   * Enable layout transition (FLIP) for this stage.
   * When enabled, the element will automatically animate layout changes (position, size).
   * Can be a boolean to enable with defaults, or a config object for customization.
   */
  layoutTransition?: boolean | LayoutTransitionConfig;
}

export const MotionStage = forwardRef<HTMLDivElement, MotionStageProps>(function MotionStage({
  animation,
  delay = 0,
  onComplete,
  onStart,
  style,
  className,
  children,
  layoutTransition,
}, ref) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [shouldStart, setShouldStart] = useState(delay === 0 || delay === 'until-previous-completes');
  
  // Apply layout transition if enabled, but disable it when CSS animation is active
  // This prevents conflicts between CSS animations and layout transitions
  const layoutTransitionConfig: LayoutTransitionConfig | undefined = layoutTransition
    ? typeof layoutTransition === 'boolean'
      ? { enabled: layoutTransition && !isActive }
      : { ...layoutTransition, enabled: layoutTransition.enabled !== false && !isActive }
    : undefined;
  
  useLayoutTransition(elementRef, layoutTransitionConfig);
  
  const animationClassName = animation
    ? typeof animation === 'string' 
      ? animation 
      : animation.className
    : undefined;

  // Inject CSS synchronously if provided (before first render to prevent flash)
  if (animation && typeof animation === 'object' && animation.css) {
    const styleId = `motion-style-${animation.className}`;
    if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = animation.css;
      document.head.appendChild(styleElement);
    }
  }

  // Use useLayoutEffect to ensure CSS is injected before browser paint
  useLayoutEffect(() => {
    // Inject CSS if provided
    if (animation && typeof animation === 'object' && animation.css) {
      const styleId = `motion-style-${animation.className}`;
      if (!document.getElementById(styleId)) {
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = animation.css;
        document.head.appendChild(styleElement);
      }
    }
  }, [animation]);
  
  useEffect(() => {
    // Skip animation logic if no animation is provided
    if (!animation || !animationClassName || !shouldStart || !elementRef.current) {
      return;
    }
    
    const element = elementRef.current;
    let timeoutId: number | null = null;
    let classWasAddedInEffect = false;
    
    const handleAnimationStart = () => {
      setIsActive(true);
      if (onStart) {
        onStart();
      }
    };
    
    const handleAnimationEnd = () => {
      setIsActive(false);
      if (onComplete) {
        onComplete({
          next: () => {
            // Signal to parent that next stage should start
            // This is handled by MotionSequence
          },
        });
      }
    };
    
    // Check if class was already applied synchronously (via className prop)
    const classAlreadyApplied = element.classList.contains(animationClassName);
    
    // Apply delay if numeric
    if (typeof delay === 'number' && delay > 0) {
      timeoutId = window.setTimeout(() => {
        if (!element.classList.contains(animationClassName)) {
          element.classList.add(animationClassName);
          classWasAddedInEffect = true;
        } else {
          // Warn if class is already applied
          warnDuplicateClass(animationClassName, element);
        }
        // Check if CSS is injected
        warnMissingCSS(animationClassName, element);
        handleAnimationStart();
      }, delay);
    } else if (!classAlreadyApplied) {
      // Only add class if not already present (might have been added synchronously)
      element.classList.add(animationClassName);
      classWasAddedInEffect = true;
      // Check if CSS is injected
      warnMissingCSS(animationClassName, element);
      handleAnimationStart();
    } else {
      // Class already applied synchronously via className prop, just set up event listeners
      // The animation should already be running, so we'll catch it with the event listener
      // Warn about duplicate application
      warnDuplicateClass(animationClassName, element);
      // Check if CSS is injected
      warnMissingCSS(animationClassName, element);
      handleAnimationStart();
    }
    
    element.addEventListener('animationstart', handleAnimationStart);
    element.addEventListener('animationend', handleAnimationEnd);
    
    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      element.removeEventListener('animationstart', handleAnimationStart);
      element.removeEventListener('animationend', handleAnimationEnd);
      // Only remove class if we added it in this effect (not if it was in className prop)
      if (classWasAddedInEffect) {
        element.classList.remove(animationClassName);
      }
    };
  }, [shouldStart, delay, animationClassName, onStart, onComplete, animation]);
  
  // Expose methods to start/reset this stage (called by MotionSequence)
  useEffect(() => {
    if (elementRef.current) {
      (elementRef.current as any).__cascadeStartStage = () => {
        setShouldStart(true);
      };
      (elementRef.current as any).__cascadeResetStage = () => {
        setShouldStart(false);
        setIsActive(false);
        // Remove animation class to reset
        if (elementRef.current && animationClassName) {
          elementRef.current.classList.remove(animationClassName);
        }
      };
    }
  }, [animationClassName]);
  
  // Use useLayoutEffect to apply class before browser paint (prevents flash)
  // This ensures animation-fill-mode: backwards works from the first paint
  useLayoutEffect(() => {
    if (!animationClassName || !shouldStart || delay !== 0 || !elementRef.current) {
      return;
    }
    
    const element = elementRef.current;
    // Apply class immediately before paint
    if (!element.classList.contains(animationClassName)) {
      element.classList.add(animationClassName);
    }
  }, [animationClassName, shouldStart, delay]);
  
  return (
    <div
      ref={(el) => {
        elementRef.current = el;
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          (ref as any).current = el;
        }
      }}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
});


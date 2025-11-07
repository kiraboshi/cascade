/**
 * MotionStage component for individual animation stages
 */

import { forwardRef, useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';

export interface MotionStageProps {
  animation: string | { className: string; css?: string };
  delay?: number | 'until-previous-completes';
  onComplete?: (event: { next: () => void }) => void;
  onStart?: () => void;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}

export const MotionStage = forwardRef<HTMLDivElement, MotionStageProps>(function MotionStage({
  animation,
  delay = 0,
  onComplete,
  onStart,
  style,
  className,
  children,
}, ref) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [shouldStart, setShouldStart] = useState(delay === 0 || delay === 'until-previous-completes');
  
  const animationClassName = typeof animation === 'string' 
    ? animation 
    : animation.className;
  
  useEffect(() => {
    // Inject CSS if provided
    if (typeof animation === 'object' && animation.css) {
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
    if (!shouldStart || !elementRef.current) {
      return;
    }
    
    const element = elementRef.current;
    let timeoutId: number | null = null;
    
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
    
    // Apply delay if numeric
    if (typeof delay === 'number' && delay > 0) {
      timeoutId = window.setTimeout(() => {
        element.classList.add(animationClassName);
        handleAnimationStart();
      }, delay);
    } else {
      element.classList.add(animationClassName);
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
      element.classList.remove(animationClassName);
    };
  }, [shouldStart, delay, animationClassName, onStart, onComplete]);
  
  // Expose method to start this stage (called by MotionSequence)
  useEffect(() => {
    if (elementRef.current) {
      (elementRef.current as any).__cascadeStartStage = () => {
        setShouldStart(true);
      };
    }
  }, []);
  
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


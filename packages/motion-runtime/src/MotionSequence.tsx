/**
 * MotionSequence component for orchestrating multiple animation stages
 */

import { useEffect, useRef, useState, type ReactNode, Children, cloneElement, isValidElement } from 'react';
import { MotionStage, type MotionStageProps } from './MotionStage';
import { prefersReducedMotion } from './motion-state';

export interface MotionSequenceProps {
  children: ReactNode;
  onComplete?: () => void;
  autoStart?: boolean;
  respectReducedMotion?: boolean;
  pauseOnHover?: boolean;
}

export function MotionSequence({
  children,
  onComplete,
  autoStart = false,
  respectReducedMotion = true,
  pauseOnHover = false,
}: MotionSequenceProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(autoStart);
  const stageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const shouldRespectMotion = respectReducedMotion && prefersReducedMotion();
  
  // Extract MotionStage children
  const childArray = Children.toArray(children);
  const validStages = childArray.filter(
    (child): child is React.ReactElement<MotionStageProps> =>
      isValidElement(child) && child.type === MotionStage
  );
  
  useEffect(() => {
    stageRefs.current = validStages.map(() => null);
  }, [validStages.length]);
  
  const startNextStage = () => {
    if (shouldRespectMotion) {
      // Skip animations if user prefers reduced motion
      if (onComplete && currentStageIndex >= validStages.length - 1) {
        onComplete();
      }
      return;
    }
    
    const nextIndex = currentStageIndex + 1;
    if (nextIndex < validStages.length) {
      setCurrentStageIndex(nextIndex);
      // Trigger start on next stage
      const nextStageElement = stageRefs.current[nextIndex];
      if (nextStageElement && (nextStageElement as any).__cascadeStartStage) {
        (nextStageElement as any).__cascadeStartStage();
      }
    } else {
      // All stages complete
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  useEffect(() => {
    if (!hasStarted || shouldRespectMotion) {
      return;
    }
    
    // Set up completion handlers for each stage
    const completionHandlers: Array<() => void> = [];
    
    validStages.forEach((stage, index) => {
      const originalOnComplete = stage.props.onComplete;
      const handler = () => {
        if (index === currentStageIndex) {
          startNextStage();
        }
        if (originalOnComplete) {
          originalOnComplete({ next: startNextStage });
        }
      };
      completionHandlers.push(handler);
    });
    
    // Start first stage if autoStart
    if (autoStart && currentStageIndex === 0) {
      const firstStageElement = stageRefs.current[0];
      if (firstStageElement && (firstStageElement as any).__cascadeStartStage) {
        (firstStageElement as any).__cascadeStartStage();
      }
    }
    
    return () => {
      completionHandlers.length = 0;
    };
  }, [hasStarted, currentStageIndex, validStages, autoStart, shouldRespectMotion, onComplete]);
  
  // Handle pause on hover
  useEffect(() => {
    if (!pauseOnHover) {
      return;
    }
    
    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => setIsPaused(false);
    
    // This would need to be attached to a container element
    // For now, we'll handle it at the component level
    
    return () => {
      // Cleanup if needed
    };
  }, [pauseOnHover]);
  
  // Clone children and inject refs and completion handlers
  const enhancedChildren = validStages.map((stage, index) => {
    const originalOnComplete = stage.props.onComplete;
    const enhancedOnComplete = (event: { next: () => void }) => {
      if (index === currentStageIndex && !isPaused) {
        startNextStage();
      }
      if (originalOnComplete) {
        originalOnComplete(event);
      }
    };
    
    return cloneElement(stage, {
      ...stage.props,
      key: stage.key || index,
      onComplete: enhancedOnComplete,
      ref: (el: HTMLDivElement | null) => {
        stageRefs.current[index] = el;
        if (typeof stage.ref === 'function') {
          stage.ref(el);
        } else if (stage.ref) {
          (stage.ref as any).current = el;
        }
      },
    });
  });
  
  return <>{enhancedChildren}</>;
}


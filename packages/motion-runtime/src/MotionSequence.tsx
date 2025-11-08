/**
 * MotionSequence component for orchestrating multiple animation stages
 */

import { useEffect, useRef, useState, type ReactNode, Children, cloneElement, isValidElement } from 'react';
import { MotionStage, type MotionStageProps } from './MotionStage';
import { prefersReducedMotion } from './motion-state';
import type { LayoutTransitionConfig } from './useLayoutTransition';
import type { AnimationStateSet, TransitionConfig } from '@cascade/compiler';

export interface MotionSequenceProps {
  children: ReactNode;
  onComplete?: () => void;
  autoStart?: boolean;
  respectReducedMotion?: boolean;
  pauseOnHover?: boolean;
  /**
   * Default layout transition config for all stages in this sequence.
   * Individual stages can override this with their own `layoutTransition` prop.
   */
  layoutTransition?: boolean | LayoutTransitionConfig;
  /**
   * Animation state set for orchestration (staggerChildren, delayChildren)
   * If provided, stages will be orchestrated based on the state's transition config
   */
  animationStateSet?: AnimationStateSet;
  /**
   * State name to use for orchestration (default: 'animate')
   */
  orchestrationState?: string;
}

export function MotionSequence({
  children,
  onComplete,
  autoStart = false,
  respectReducedMotion = true,
  pauseOnHover = false,
  layoutTransition,
  animationStateSet,
  orchestrationState = 'animate',
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
  
  // React to autoStart prop changes
  useEffect(() => {
    const prevHasStarted = hasStarted;
    setHasStarted(autoStart);
    
    // If autoStart becomes true and we haven't started yet, start the sequence
    if (autoStart && !prevHasStarted && currentStageIndex === 0) {
      // Use setTimeout to ensure refs are set up
      setTimeout(() => {
        const firstStageElement = stageRefs.current[0];
        if (firstStageElement && (firstStageElement as any).__cascadeStartStage) {
          (firstStageElement as any).__cascadeStartStage();
        }
      }, 0);
    }
    
    // If autoStart becomes false, reset the sequence
    if (!autoStart && prevHasStarted) {
      setCurrentStageIndex(0);
      // Reset all stages by removing animation classes
      stageRefs.current.forEach((element) => {
        if (element && (element as any).__cascadeResetStage) {
          (element as any).__cascadeResetStage();
        }
      });
    }
  }, [autoStart]);
  
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
    
    // Start first stage if autoStart and we're at the beginning
    if (autoStart && currentStageIndex === 0 && hasStarted) {
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
  
  // Extract orchestration config from animation state set
  const orchestrationConfig = animationStateSet && animationStateSet.states[orchestrationState]
    ? (animationStateSet.states[orchestrationState].transition as TransitionConfig | undefined)
    : undefined;
  
  const staggerChildren = orchestrationConfig?.staggerChildren;
  const delayChildren = orchestrationConfig?.delayChildren || 0;
  
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
    
    // Calculate delay based on orchestration config
    let calculatedDelay: number | 'until-previous-completes' = stage.props.delay ?? 0;
    
    if (staggerChildren !== undefined && index > 0) {
      // Apply stagger: base delay + (index * staggerChildren)
      calculatedDelay = delayChildren + (index * staggerChildren);
    } else if (index === 0 && delayChildren > 0) {
      // First child gets delayChildren
      calculatedDelay = delayChildren;
    }
    
    // Apply default layout transition if provided and stage doesn't have its own
    const layoutTransitionProp = stage.props.layoutTransition !== undefined
      ? stage.props.layoutTransition
      : layoutTransition;
    
    return cloneElement(stage, {
      ...stage.props,
      key: stage.key || index,
      delay: calculatedDelay,
      onComplete: enhancedOnComplete,
      layoutTransition: layoutTransitionProp,
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


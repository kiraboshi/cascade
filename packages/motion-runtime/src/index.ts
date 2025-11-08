/**
 * @cascade/motion-runtime
 * Optional runtime orchestrator for complex animation sequences
 */

export { MotionSequence, type MotionSequenceProps } from './MotionSequence';
export { MotionStage, type MotionStageProps } from './MotionStage';
export { useMotionSequence, type UseMotionSequenceOptions, type MotionSequenceControls } from './useMotionSequence';
export { prefersReducedMotion, type AnimationState, type SequenceState, type MotionStageState } from './motion-state';

// Reactive Motion Values
export { createMotionValue, type MotionValue, type MotionValueConfig, type MotionValueKeyframeConfig } from './motion-value';
export { useMotionValue } from './useMotionValue';
export { animateSpringRuntime, type RuntimeSpringConfig } from './spring-animator';
export { createTranslateX, createTranslateY, createRotate, createScale } from './motion-value-helpers';
export { useTranslateX, useTranslateY, useRotate, useScale } from './useMotionValueHelpers';

// Animation Timeline
export { AnimationTimelineImpl, SpringAnimationTimeline, type AnimationTimeline, type TimelineState } from './animation-timeline';

// Layout Transition Utilities
export { measureElement, measureElements, calculateTransformDelta, type BoundingBox, type TransformDelta } from './layout-utils';
export { detectLayoutChanges, type LayoutChange } from './layout-detector';
export { generateFLIPKeyframes, clearFLIPCache, getFLIPCacheSize, type FLIPConfig } from './flip-generator';
export { useLayoutTransition, type LayoutTransitionConfig } from './useLayoutTransition';
export { useSharedLayoutTransition, type SharedLayoutTransitionConfig } from './useSharedLayoutTransition';
export { useBatchLayoutTransition } from './useBatchLayoutTransition';

// Viewport Animations
export { useInView, useInViewState, type ViewportConfig, type ViewportState } from './useInView';
export { useViewportAnimation, useViewportAnimationWithRef, type ViewportAnimationConfig } from './useViewportAnimation';
export { useFadeInOnScroll, type FadeInOnScrollConfig } from './useFadeInOnScroll';
export { useSlideInOnScroll, type SlideInOnScrollConfig } from './useSlideInOnScroll';
export { usePauseWhenOffScreen, type PauseWhenOffScreenConfig } from './usePauseWhenOffScreen';

// AnimatePresence
export { AnimatePresence, type AnimatePresenceProps } from './AnimatePresence';
export { applyExitAnimation, applyEnterAnimation, type ExitAnimationConfig, type EnterAnimationConfig } from './animate-presence-utils';
export { useAnimatePresence, type UseAnimatePresenceConfig, type UseAnimatePresenceReturn } from './useAnimatePresence';

// Development utilities (for advanced use cases)
export { 
  setWarningsEnabled, 
  areWarningsEnabled,
  warnDuplicateClass,
  warnMissingCSS,
  warnConflictingTransform,
  warnInvalidAnimationConfig,
  warnMotionValueMisuse,
  warnDirectClassUsage,
  warnPerformanceIssue
} from './dev-warnings';
export { 
  ErrorCode,
  createInvalidHookCallError,
  createHookInCallbackError,
  createHookConditionalError,
  createInvalidMotionValueError,
  createInvalidAnimationConfigError,
  createMissingPropertyError,
  createInvalidPropertyTypeError,
  createAnimationNotFoundError,
  getErrorCode,
  isCascadeMotionError
} from './error-messages';
export {
  enableDebugLogging,
  disableDebugLogging,
  isDebugCategoryEnabled,
  getEnabledDebugCategories,
  debugLog,
  debugWarn,
  debugError
} from './debug';


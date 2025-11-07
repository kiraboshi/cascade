/**
 * @cascade/motion-gestures
 * Gesture-driven animations for Cascade Motion
 */

export { useDrag } from './useDrag';
export { usePan } from './usePan';
export { useScrollMotion, type ScrollConfig } from './useScroll';
export { useWheel, type WheelConfig } from './useWheel';
export { createGestureHandler, type GestureHandler, type GestureConfig, type GestureState } from './gesture-handler';
export { VelocityTracker } from './velocity-tracker';
export { animateSpringWithVelocity, type GestureSpringConfig } from './spring-bridge';

// Hover Gestures
export { useHover, useHoverState, type HoverConfig, type HoverState } from './useHover';
export { useHoverAnimation, type HoverAnimationConfig } from './useHoverAnimation';

// Tap Gestures
export { useTap, useTapState, type TapConfig, type TapState } from './useTap';
export { useTapAnimation, type TapAnimationConfig } from './useTapAnimation';

// Focus Gestures
export { useFocus, useFocusState, type FocusConfig, type FocusState } from './useFocus';
export { useFocusAnimation, type FocusAnimationConfig } from './useFocusAnimation';



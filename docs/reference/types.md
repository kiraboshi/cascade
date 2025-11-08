# Type Definitions Reference

Complete reference for all TypeScript types and interfaces in Cascade Motion.

---

## Motion Values

### `MotionValue<T>`

Core motion value interface.

```typescript
interface MotionValue<T = number | string> {
  get(): T;
  set(value: T): void;
  onChange(callback: (value: T) => void): () => void;
  animateTo(
    target: T,
    config?: SpringConfig | MotionValueKeyframeConfig
  ): Promise<void>;
  stop(): void;
  destroy(): void;
  getTransformValue(): string;
  reverse(): void;
  seek(progress: number | { time: number } | { progress: number }): void;
  play(): void;
  pause(): void;
  getTimeline(): AnimationTimeline | null;
  onAnimationStateChange(callback: (state: TimelineState) => void): () => void;
  
  readonly id: string;
  readonly cssVarName: string;
  readonly isGPUAccelerated: boolean;
  readonly triggersLayout: boolean;
}
```

---

### `MotionValueConfig`

Configuration for creating motion values.

```typescript
interface MotionValueConfig {
  initialValue: number | string;
  property?: string;
  unit?: string;
  element?: HTMLElement;
  warnOnLayoutTrigger?: boolean;
  transformMode?: 'auto' | 'transform' | 'position';
}
```

---

### `MotionValueKeyframeConfig`

Configuration for keyframe animations.

```typescript
interface MotionValueKeyframeConfig {
  duration?: number | string;
  easing?: string;
}
```

---

## Gestures

### `GestureConfig`

Configuration for drag and pan gestures.

```typescript
interface GestureConfig {
  onStart?: (state: GestureState, event: PointerEvent | WheelEvent) => void;
  onMove?: (state: GestureState, event: Event) => void;
  onEnd?: (state: GestureState) => void;
  spring?: SpringConfig;
  constraints?: {
    min?: { x?: number; y?: number };
    max?: { x?: number; y?: number };
  };
  axis?: 'x' | 'y' | 'both';
  threshold?: number;
}
```

---

### `GestureState`

State object passed to gesture callbacks.

```typescript
interface GestureState {
  isActive: boolean;
  delta: { x: number; y: number };
  velocity: { x: number; y: number };
  startPoint: { x: number; y: number };
  currentPoint: { x: number; y: number };
}
```

---

### `HoverConfig`

Configuration for hover detection.

```typescript
interface HoverConfig {
  onHoverStart?: (event: MouseEvent) => void;
  onHoverEnd?: (event: MouseEvent) => void;
  onHoverChange?: (isHovering: boolean) => void;
  disabled?: boolean;
}
```

---

### `HoverAnimationConfig`

Configuration for hover animations.

```typescript
interface HoverAnimationConfig {
  onHoverStart?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  onHoverEnd?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  disabled?: boolean;
}
```

---

### `TapConfig`

Configuration for tap detection.

```typescript
interface TapConfig {
  onTapStart?: (event: MouseEvent | TouchEvent) => void;
  onTap?: (event: MouseEvent | TouchEvent) => void;
  onTapCancel?: (event: MouseEvent | TouchEvent) => void;
  tapThreshold?: number;
  tapTimeout?: number;
  disabled?: boolean;
}
```

---

### `TapAnimationConfig`

Configuration for tap animations.

```typescript
interface TapAnimationConfig {
  onTapStart?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  onTapEnd?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  onTap?: (event: MouseEvent | TouchEvent) => void;
  disabled?: boolean;
  tapThreshold?: number;
  tapTimeout?: number;
}
```

---

### `FocusConfig`

Configuration for focus detection.

```typescript
interface FocusConfig {
  onFocusStart?: (event: FocusEvent) => void;
  onFocusEnd?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  disabled?: boolean;
}
```

---

### `FocusAnimationConfig`

Configuration for focus animations.

```typescript
interface FocusAnimationConfig {
  onFocusStart?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  onFocusEnd?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  disabled?: boolean;
}
```

---

### `ScrollConfig`

Configuration for scroll-driven animations.

```typescript
interface ScrollConfig {
  axis?: 'x' | 'y' | 'both';
  multiplier?: number;
  spring?: SpringConfig;
  container?: HTMLElement | Window;
}
```

---

### `WheelConfig`

Configuration for wheel gestures.

```typescript
interface WheelConfig {
  axis?: 'x' | 'y' | 'both';
  multiplier?: number;
  spring?: SpringConfig;
}
```

---

## Layout Transitions

### `LayoutTransitionConfig`

Configuration for layout transitions.

```typescript
interface LayoutTransitionConfig {
  duration?: number;
  easing?: string;
  origin?: TransformOrigin;
  onComplete?: () => void;
  enabled?: boolean;
}
```

---

### `SharedLayoutTransitionConfig`

Configuration for shared element transitions.

```typescript
interface SharedLayoutTransitionConfig {
  layoutId: string;
  duration?: number;
  easing?: string;
  origin?: TransformOrigin;
  onComplete?: () => void;
}
```

---

### `TransformOrigin`

Transform origin options.

```typescript
type TransformOrigin = 
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
```

---

### `BoundingBox`

Element bounding box.

```typescript
interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

---

### `TransformDelta`

Transform delta between bounding boxes.

```typescript
interface TransformDelta {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}
```

---

### `LayoutChange`

Detected layout change.

```typescript
interface LayoutChange {
  element: HTMLElement;
  from: BoundingBox;
  to: BoundingBox;
  delta: TransformDelta;
}
```

---

## Viewport Animations

### `ViewportConfig`

Configuration for viewport detection.

```typescript
interface ViewportConfig {
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
  root?: Element | null;
  amount?: 'some' | 'all' | number;
}
```

---

### `ViewportAnimationConfig`

Configuration for viewport animations.

```typescript
interface ViewportAnimationConfig extends ViewportConfig {
  onEnter?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  onExit?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  initial?: number | string;
  animateOnMount?: boolean;
  pauseWhenOffScreen?: boolean; // Default: true - pauses animations when off-screen
}
```

### `PauseWhenOffScreenConfig`

Configuration for pausing animations when off-screen.

```typescript
interface PauseWhenOffScreenConfig extends ViewportConfig {
  motionValues: MotionValue<number | string>[];
  enabled?: boolean; // Default: true
}
```

---

### `ViewportState`

State returned by `useInViewState`.

```typescript
interface ViewportState {
  isInView: boolean;
  entry: IntersectionObserverEntry | null;
}
```

---

### `FadeInOnScrollConfig`

Configuration for fade-in animations.

```typescript
interface FadeInOnScrollConfig extends ViewportConfig {
  duration?: number;
  spring?: SpringConfig;
  useSpring?: boolean;
  initial?: number;
  target?: number;
}
```

---

### `SlideInOnScrollConfig`

Configuration for slide-in animations.

```typescript
interface SlideInOnScrollConfig extends ViewportConfig {
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  spring?: SpringConfig;
  useSpring?: boolean;
  initial?: { x: number; y: number };
  target?: { x: number; y: number };
}
```

---

## Sequences

### `MotionSequenceProps`

Props for `MotionSequence` component.

```typescript
interface MotionSequenceProps {
  children: ReactNode;
  onComplete?: () => void;
  autoStart?: boolean;
  respectReducedMotion?: boolean;
  pauseOnHover?: boolean;
  layoutTransition?: boolean | LayoutTransitionConfig;
}
```

---

### `MotionStageProps`

Props for `MotionStage` component.

```typescript
interface MotionStageProps {
  animation?: string | { className: string; css?: string };
  delay?: number | 'until-previous-completes';
  onComplete?: (event: { next: () => void }) => void;
  onStart?: () => void;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
  layoutTransition?: boolean | LayoutTransitionConfig;
}
```

---

### `UseMotionSequenceOptions`

Configuration for `useMotionSequence` hook.

```typescript
interface UseMotionSequenceOptions {
  autoStart?: boolean;
  respectReducedMotion?: boolean;
  onComplete?: () => void;
}
```

---

### `MotionSequenceControls`

Controls returned by `useMotionSequence`.

```typescript
interface MotionSequenceControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  goToStage: (index: number) => void;
  state: SequenceState;
}
```

---

### `SequenceState`

State returned by `useMotionSequence`.

```typescript
interface SequenceState {
  currentStage: number;
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
  stageStates: MotionStageState[];
}
```

---

### `MotionStageState`

State of an individual stage.

```typescript
interface MotionStageState {
  index: number;
  state: AnimationState;
  progress: number;
}
```

---

### `AnimationState`

Animation state type.

```typescript
type AnimationState = 'idle' | 'running' | 'paused' | 'completed';
```

---

## AnimatePresence

### `AnimatePresenceProps`

Props for `AnimatePresence` component.

```typescript
interface AnimatePresenceProps {
  children: ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
  onExitComplete?: () => void;
  exit?: ExitAnimationConfig;
  enter?: EnterAnimationConfig;
  layout?: boolean;
}
```

---

### `UseAnimatePresenceConfig`

Configuration for `useAnimatePresence` hook.

```typescript
interface UseAnimatePresenceConfig {
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
  exit?: ExitAnimationConfig;
  enter?: EnterAnimationConfig;
  layout?: boolean;
}
```

---

### `UseAnimatePresenceReturn`

Return value from `useAnimatePresence` hook.

```typescript
interface UseAnimatePresenceReturn {
  ref: (el: HTMLElement | null) => void;
  isExiting: boolean;
  isEntering: boolean;
  shouldRender: boolean;
}
```

---

### `ExitAnimationConfig`

Configuration for exit animations.

```typescript
interface ExitAnimationConfig {
  opacity?: number;
  transform?: string;
  config?: SpringConfig | MotionValueKeyframeConfig;
}
```

---

### `EnterAnimationConfig`

Configuration for enter animations.

```typescript
interface EnterAnimationConfig {
  opacity?: number;
  transform?: string;
  config?: SpringConfig | MotionValueKeyframeConfig;
}
```

---

## Animation Configuration

### `SpringConfig`

Spring physics configuration.

```typescript
interface SpringConfig {
  stiffness: number;
  damping: number;
  mass?: number;
  from: number;
  to: number;
  duration?: number;
}
```

---

### `RuntimeSpringConfig`

Extended spring config for runtime animations.

```typescript
interface RuntimeSpringConfig extends SpringConfig {
  duration?: number;
  initialVelocity?: number;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}
```

---

### `GestureSpringConfig`

Spring config with velocity support.

```typescript
interface GestureSpringConfig extends SpringConfig {
  initialVelocity?: number;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}
```

---

## Animation Timeline

### `AnimationTimeline`

Interface for animation timelines.

```typescript
interface AnimationTimeline {
  play(): void;
  pause(): void;
  seek(time: number): void;
  getState(): TimelineState;
  onStateChange(callback: (state: TimelineState) => void): () => void;
}
```

---

### `TimelineState`

State of an animation timeline.

```typescript
interface TimelineState {
  progress: number;      // 0-1
  time: number;          // Current time in ms
  duration: number;      // Total duration in ms
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
}
```

---

## FLIP Animation

### `FLIPConfig`

Configuration for FLIP keyframe generation.

```typescript
interface FLIPConfig {
  from: BoundingBox;
  to: BoundingBox;
  duration?: number;
  easing?: string;
  origin?: TransformOrigin;
}
```

---

## State Types

### `HoverState`

State returned by `useHoverState`.

```typescript
interface HoverState {
  isHovering: boolean;
}
```

---

### `TapState`

State returned by `useTapState`.

```typescript
interface TapState {
  isTapping: boolean;
  tapCount: number;
}
```

---

### `FocusState`

State returned by `useFocusState`.

```typescript
interface FocusState {
  isFocused: boolean;
}
```

---

## Utility Types

### `TransformOrigin`

Transform origin options.

```typescript
type TransformOrigin = 
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
```

---

### `AnimationState`

Animation state type.

```typescript
type AnimationState = 'idle' | 'running' | 'paused' | 'completed';
```

---

## Type Exports

All types are exported from their respective packages:

```typescript
// @cascade/motion-runtime
import type {
  MotionValue,
  MotionValueConfig,
  MotionValueKeyframeConfig,
  LayoutTransitionConfig,
  ViewportConfig,
  ViewportAnimationConfig,
  AnimatePresenceProps,
  UseAnimatePresenceConfig,
  MotionSequenceProps,
  MotionStageProps,
  // ... etc
} from '@cascade/motion-runtime';

// @cascade/motion-gestures
import type {
  GestureConfig,
  GestureState,
  HoverConfig,
  HoverAnimationConfig,
  TapConfig,
  TapAnimationConfig,
  FocusConfig,
  FocusAnimationConfig,
  ScrollConfig,
  WheelConfig,
  // ... etc
} from '@cascade/motion-gestures';

// @cascade/compiler
import type {
  SpringConfig,
  SpringMotionConfig,
  KeyframeConfig,
  // ... etc
} from '@cascade/compiler';
```

---

## See Also

- [Motion Values Reference](./motion-values.md) - Motion value types
- [Gestures Reference](./gestures.md) - Gesture types
- [Layout Transitions Reference](./layout-transitions.md) - Layout types
- [TypeScript Guide](../typescript/type-safety.md) - Type safety guide


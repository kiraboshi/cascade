# Gestures API Reference

Complete technical reference for gesture-driven animations in Cascade Motion.

---

## Overview

The `@cascade/motion-gestures` package provides React hooks and utilities for creating interactive, gesture-based animations using pointer events, scroll, wheel, hover, tap, and focus interactions.

---

## Drag & Pan Gestures

### `useDrag(motionValues, config?): RefObject<HTMLElement>`

React hook for drag gestures with pointer/touch support.

**Signature:**
```typescript
function useDrag(
  motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
  },
  config?: GestureConfig
): RefObject<HTMLElement>
```

**Parameters:**

- `motionValues`: Object containing optional `x` and `y` motion values
- `config?`: Optional gesture configuration (see `GestureConfig` below)

**Returns:** A ref object that should be attached to the draggable element

**Example:**
```typescript
import { useDrag } from '@cascade/motion-gestures';
import { useTranslateX, useTranslateY } from '@cascade/motion-runtime';

function DraggableCard() {
  const x = useTranslateX(0);
  const y = useTranslateY(0);
  
  const dragRef = useDrag(
    { x, y },
    {
      spring: { stiffness: 300, damping: 30 },
      constraints: {
        min: { x: -200, y: -200 },
        max: { x: 200, y: 200 },
      },
    }
  );
  
  return (
    <div
      ref={dragRef}
      style={{
        transform: `translate(var(${x.cssVarName}), var(${y.cssVarName}))`,
      }}
    >
      Drag me
    </div>
  );
}
```

---

### `usePan(motionValues, config?): RefObject<HTMLElement>`

React hook for pan gestures, optimized for touch interactions.

**Signature:**
```typescript
function usePan(
  motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
  },
  config?: GestureConfig
): RefObject<HTMLElement>
```

**Parameters:**

- `motionValues`: Object containing optional `x` and `y` motion values
- `config?`: Optional gesture configuration

**Returns:** A ref object that should be attached to the pannable element

**Note:** `usePan` is similar to `useDrag` but uses a lower threshold (5px) for better touch responsiveness.

**Example:**
```typescript
const panRef = usePan({ x, y }, { threshold: 5 });
return <div ref={panRef}>Pan me</div>;
```

---

## Scroll Gestures

### `useScrollMotion(motionValue, config?): void`

React hook for scroll-driven animations.

**Signature:**
```typescript
function useScrollMotion(
  motionValue: MotionValue<number>,
  config?: ScrollConfig
): void
```

**Parameters:**

- `motionValue`: A single motion value to update based on scroll position
- `config?`: Optional scroll configuration (see `ScrollConfig` below)

**Returns:** Nothing. The hook updates the motion value directly.

**Example:**
```typescript
import { useScrollMotion } from '@cascade/motion-gestures';
import { useMotionValue } from '@cascade/motion-runtime';

function ScrollComponent() {
  const scrollY = useMotionValue(0, { unit: 'px' });
  
  useScrollMotion(scrollY, {
    axis: 'y',
    multiplier: 0.5,
  });
  
  return (
    <div style={{ transform: `translateY(var(${scrollY.cssVarName}))` }}>
      Scroll me
    </div>
  );
}
```

---

## Wheel Gestures

### `useWheel(motionValues, config?): RefObject<HTMLElement>`

React hook for wheel/scroll wheel gestures.

**Signature:**
```typescript
function useWheel(
  motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
  },
  config?: WheelConfig
): RefObject<HTMLElement>
```

**Parameters:**

- `motionValues`: Object containing optional `x` and `y` motion values
- `config?`: Optional wheel configuration (see `WheelConfig` below)

**Returns:** A ref object that should be attached to the element that should respond to wheel events

**Example:**
```typescript
import { useWheel } from '@cascade/motion-gestures';
import { useScale } from '@cascade/motion-runtime';

function ZoomableComponent() {
  const scale = useScale(1);
  
  const wheelRef = useWheel(
    { y: scale },
    {
      axis: 'y',
      multiplier: 0.01,
    }
  );
  
  return (
    <div
      ref={wheelRef}
      style={{ transform: `scale(var(${scale.cssVarName}))` }}
    >
      Zoom me with wheel
    </div>
  );
}
```

---

## Hover Gestures

### `useHover(config?): [RefObject<HTMLElement>, boolean]`

React hook for detecting hover state on elements.

**Signature:**
```typescript
function useHover(
  config?: HoverConfig
): [RefObject<HTMLElement>, boolean]
```

**Parameters:**

- `config?`: Optional hover configuration (see `HoverConfig` below)

**Returns:** A tuple containing:
- A ref object that should be attached to the hoverable element
- A boolean indicating whether the element is currently being hovered

**Example:**
```typescript
import { useHover } from '@cascade/motion-gestures';

function HoverableComponent() {
  const [hoverRef, isHovering] = useHover({
    onHoverStart: () => console.log('Hover started'),
    onHoverEnd: () => console.log('Hover ended'),
  });
  
  return (
    <div ref={hoverRef}>
      {isHovering ? 'Hovering!' : 'Hover me'}
    </div>
  );
}
```

---

### `useHoverState(config?): [RefObject<HTMLElement>, HoverState]`

React hook that returns detailed hover state.

**Signature:**
```typescript
function useHoverState(
  config?: HoverConfig
): [RefObject<HTMLElement>, HoverState]
```

**Returns:** A tuple containing:
- A ref object that should be attached to the hoverable element
- A `HoverState` object with `isHovering` property

---

### `useHoverAnimation(motionValue, config): RefObject<HTMLElement>`

React hook to animate motion values based on hover state.

**Signature:**
```typescript
function useHoverAnimation(
  motionValue: MotionValue<number | string>,
  config: HoverAnimationConfig
): RefObject<HTMLElement>
```

**Parameters:**

- `motionValue`: Motion value to animate
- `config`: Hover animation configuration (see `HoverAnimationConfig` below)

**Returns:** A ref object that should be attached to the hoverable element

**Example:**
```typescript
import { useHoverAnimation } from '@cascade/motion-gestures';
import { useScale } from '@cascade/motion-runtime';

function HoverableCard() {
  const scale = useScale(1);
  
  const hoverRef = useHoverAnimation(scale, {
    onHoverStart: {
      target: 1.1,
      config: { stiffness: 300, damping: 20 },
    },
    onHoverEnd: {
      target: 1,
      config: { stiffness: 300, damping: 20 },
    },
  });
  
  return (
    <div
      ref={hoverRef}
      style={{ transform: `scale(var(${scale.cssVarName}))` }}
    >
      Hover me
    </div>
  );
}
```

---

## Tap Gestures

### `useTap(config?): RefObject<HTMLElement>`

React hook for detecting tap/click gestures on elements.

**Signature:**
```typescript
function useTap(
  config?: TapConfig
): RefObject<HTMLElement>
```

**Parameters:**

- `config?`: Optional tap configuration (see `TapConfig` below)

**Returns:** A ref object that should be attached to the tappable element

**Example:**
```typescript
import { useTap } from '@cascade/motion-gestures';

function TappableButton() {
  const tapRef = useTap({
    onTap: () => console.log('Tapped!'),
    tapThreshold: 10, // Max distance in px for a tap
  });
  
  return <button ref={tapRef}>Tap me</button>;
}
```

---

### `useTapState(config?): [RefObject<HTMLElement>, TapState]`

React hook that returns detailed tap state.

**Signature:**
```typescript
function useTapState(
  config?: TapConfig
): [RefObject<HTMLElement>, TapState]
```

**Returns:** A tuple containing:
- A ref object that should be attached to the tappable element
- A `TapState` object with `isTapping` and `tapCount` properties

---

### `useTapAnimation(motionValue, config): RefObject<HTMLElement>`

React hook to animate motion values based on tap gestures.

**Signature:**
```typescript
function useTapAnimation(
  motionValue: MotionValue<number | string>,
  config: TapAnimationConfig
): RefObject<HTMLElement>
```

**Parameters:**

- `motionValue`: Motion value to animate
- `config`: Tap animation configuration (see `TapAnimationConfig` below)

**Returns:** A ref object that should be attached to the tappable element

**Example:**
```typescript
import { useTapAnimation } from '@cascade/motion-gestures';
import { useScale } from '@cascade/motion-runtime';

function TappableButton() {
  const scale = useScale(1);
  
  const tapRef = useTapAnimation(scale, {
    onTapStart: {
      target: 0.9,
      config: { duration: 100 },
    },
    onTapEnd: {
      target: 1,
      config: { stiffness: 400, damping: 25 },
    },
  });
  
  return (
    <button
      ref={tapRef}
      style={{ transform: `scale(var(${scale.cssVarName}))` }}
    >
      Tap me
    </button>
  );
}
```

---

## Focus Gestures

### `useFocus(config?): [RefObject<HTMLElement>, boolean]`

React hook for detecting focus state on elements.

**Signature:**
```typescript
function useFocus(
  config?: FocusConfig
): [RefObject<HTMLElement>, boolean]
```

**Parameters:**

- `config?`: Optional focus configuration (see `FocusConfig` below)

**Returns:** A tuple containing:
- A ref object that should be attached to the focusable element
- A boolean indicating whether the element is currently focused

**Example:**
```typescript
import { useFocus } from '@cascade/motion-gestures';

function FocusableInput() {
  const [focusRef, isFocused] = useFocus({
    onFocusStart: () => console.log('Focused'),
    onFocusEnd: () => console.log('Blurred'),
  });
  
  return <input ref={focusRef} />;
}
```

---

### `useFocusState(config?): [RefObject<HTMLElement>, FocusState]`

React hook that returns detailed focus state.

**Signature:**
```typescript
function useFocusState(
  config?: FocusConfig
): [RefObject<HTMLElement>, FocusState]
```

**Returns:** A tuple containing:
- A ref object that should be attached to the focusable element
- A `FocusState` object with `isFocused` property

---

### `useFocusAnimation(motionValue, config): RefObject<HTMLElement>`

React hook to animate motion values based on focus state.

**Signature:**
```typescript
function useFocusAnimation(
  motionValue: MotionValue<number | string>,
  config: FocusAnimationConfig
): RefObject<HTMLElement>
```

**Parameters:**

- `motionValue`: Motion value to animate
- `config`: Focus animation configuration (see `FocusAnimationConfig` below)

**Returns:** A ref object that should be attached to the focusable element

**Example:**
```typescript
import { useFocusAnimation } from '@cascade/motion-gestures';
import { useScale } from '@cascade/motion-runtime';

function FocusableInput() {
  const scale = useScale(1);
  
  const focusRef = useFocusAnimation(scale, {
    onFocusStart: {
      target: 1.05,
      config: { stiffness: 300, damping: 20 },
    },
    onFocusEnd: {
      target: 1,
      config: { stiffness: 300, damping: 20 },
    },
  });
  
  return (
    <input
      ref={focusRef}
      style={{ transform: `scale(var(${scale.cssVarName}))` }}
    />
  );
}
```

---

## Core Utilities

### `createGestureHandler(element, motionValues, config?): GestureHandler`

Create a gesture handler instance (used internally by hooks).

**Signature:**
```typescript
function createGestureHandler(
  element: HTMLElement,
  motionValues: { x?: MotionValue<number>; y?: MotionValue<number> },
  config?: GestureConfig
): GestureHandler
```

**Returns:** A `GestureHandler` instance with methods:
- `start()`: Start listening for gestures
- `stop()`: Stop listening for gestures
- `isActive()`: Check if gesture is active
- `getState()`: Get current gesture state

---

### `animateSpringWithVelocity(motionValue, target, config): () => void`

Animate a motion value using spring physics with initial velocity.

**Signature:**
```typescript
function animateSpringWithVelocity(
  motionValue: MotionValue<number>,
  target: number,
  config: GestureSpringConfig
): () => void
```

**Parameters:**

- `motionValue`: Motion value to animate
- `target`: Target value
- `config`: Spring configuration with optional `initialVelocity`

**Returns:** A cancel function to stop the animation

**Example:**
```typescript
import { animateSpringWithVelocity } from '@cascade/motion-gestures';

const cancel = animateSpringWithVelocity(x, 100, {
  stiffness: 300,
  damping: 30,
  initialVelocity: 500, // px/s
});

// Later: cancel();
```

---

### `VelocityTracker`

Utility class for tracking velocity over recent points.

**Methods:**

- `addPoint(point: { x: number; y: number; timestamp: number }): void` - Add a point to track
- `getVelocity(): { x: number; y: number }` - Get current velocity in px/s
- `reset(): void` - Clear all tracked points

**Note:** Tracks up to 10 points within a 100ms window.

---

## Type Definitions

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
  threshold?: number; // Minimum movement to start gesture (default: 10)
}
```

**Properties:**

- `onStart`: Callback fired when gesture starts
- `onMove`: Callback fired during gesture movement
- `onEnd`: Callback fired when gesture ends
- `spring`: Spring configuration for animation on release
- `constraints`: Min/max bounds for gesture movement
- `axis`: Lock gesture to specific axis (`'x'`, `'y'`, or `'both'`)
- `threshold`: Minimum movement in pixels to start gesture (default: `10`)

---

### `ScrollConfig`

Configuration for scroll-driven animations.

```typescript
interface ScrollConfig {
  axis?: 'x' | 'y' | 'both';
  multiplier?: number; // Default: 1
  spring?: SpringConfig;
  container?: HTMLElement | Window; // Default: window
}
```

**Properties:**

- `axis`: Scroll axis to track (`'x'`, `'y'`, or `'both'`)
- `multiplier`: Multiplier for scroll value (default: `1`)
- `spring`: Optional spring configuration (not currently used)
- `container`: Container element to track scroll from (default: `window`)

---

### `WheelConfig`

Configuration for wheel gestures.

```typescript
interface WheelConfig {
  axis?: 'x' | 'y' | 'both';
  multiplier?: number; // Default: 1
  spring?: SpringConfig; // Not currently used
}
```

**Properties:**

- `axis`: Axis to respond to (`'x'`, `'y'`, or `'both'`)
- `multiplier`: Multiplier for wheel delta (default: `1`)
- `spring`: Optional spring configuration (not currently used)

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

**Properties:**

- `isActive`: Whether the gesture is currently active
- `delta`: Change in position since gesture started
- `velocity`: Current velocity in pixels per second
- `startPoint`: Starting point of the gesture
- `currentPoint`: Current point of the gesture

---

### `HoverConfig`

Configuration for hover detection hooks.

```typescript
interface HoverConfig {
  onHoverStart?: (event: MouseEvent) => void;
  onHoverEnd?: (event: MouseEvent) => void;
  onHoverChange?: (isHovering: boolean) => void;
  disabled?: boolean;
}
```

---

### `HoverState`

State object returned by `useHoverState`.

```typescript
interface HoverState {
  isHovering: boolean;
}
```

---

### `HoverAnimationConfig`

Configuration for hover animation hook.

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

Configuration for tap detection hooks.

```typescript
interface TapConfig {
  onTapStart?: (event: MouseEvent | TouchEvent) => void;
  onTap?: (event: MouseEvent | TouchEvent) => void;
  onTapCancel?: (event: MouseEvent | TouchEvent) => void;
  tapThreshold?: number; // Default: 10px
  tapTimeout?: number; // Default: 300ms
  disabled?: boolean;
}
```

**Properties:**

- `onTapStart`: Callback fired when tap starts
- `onTap`: Callback fired when tap completes
- `onTapCancel`: Callback fired when tap is cancelled (e.g., drag starts)
- `tapThreshold`: Maximum distance in pixels for a tap (default: `10`)
- `tapTimeout`: Maximum time in milliseconds for a tap (default: `300`)
- `disabled`: Disable tap detection (default: `false`)

---

### `TapState`

State object returned by `useTapState`.

```typescript
interface TapState {
  isTapping: boolean;
  tapCount: number;
}
```

---

### `TapAnimationConfig`

Configuration for tap animation hook.

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

Configuration for focus detection hooks.

```typescript
interface FocusConfig {
  onFocusStart?: (event: FocusEvent) => void;
  onFocusEnd?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  disabled?: boolean;
}
```

---

### `FocusState`

State object returned by `useFocusState`.

```typescript
interface FocusState {
  isFocused: boolean;
}
```

---

### `FocusAnimationConfig`

Configuration for focus animation hook.

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

### `GestureSpringConfig`

Extended spring config with velocity support.

```typescript
interface GestureSpringConfig extends SpringConfig {
  initialVelocity?: number; // Initial velocity in px/s
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}
```

---

## Performance Considerations

1. **Batching**: Gesture updates are batched using `requestAnimationFrame` for optimal performance.

2. **Velocity Tracking**: Velocity calculation uses a sliding window (10 points, 100ms) for efficiency.

3. **Passive Listeners**: Scroll listeners use passive event listeners to avoid blocking scrolling.

4. **Constraints**: Constraints are checked efficiently using bounds checking.

5. **Cleanup**: Event listeners are properly cleaned up on unmount to prevent memory leaks.

---

## See Also

- [Gestures Tutorial](../tutorials/gestures.md) - Learn how to use gestures
- [How to Add Drag Gesture](../how-to/add-drag-gesture.md) - Practical examples
- [Motion Values Reference](./motion-values.md) - Understanding motion values


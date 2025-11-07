# @cascade/motion-gestures API Reference

Complete API documentation for the `@cascade/motion-gestures` package.

## Hooks

### `useDrag`

React hook for drag gestures with pointer/touch support.

```tsx
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
- `config`: Optional gesture configuration (see `GestureConfig` below)

**Returns:**

A ref object that should be attached to the draggable element.

**Example:**

```tsx
const dragRef = useDrag({ x, y }, { spring: { stiffness: 300 } });
return <div ref={dragRef}>Drag me</div>;
```

---

### `usePan`

React hook for pan gestures, optimized for touch interactions.

```tsx
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
- `config`: Optional gesture configuration (see `GestureConfig` below)

**Returns:**

A ref object that should be attached to the pannable element.

**Note:** `usePan` is similar to `useDrag` but uses a lower threshold (5px) for better touch responsiveness.

---

### `useScrollMotion`

React hook for scroll-driven animations.

```tsx
function useScrollMotion(
  motionValue: MotionValue<number>,
  config?: ScrollConfig
): void
```

**Parameters:**

- `motionValue`: A single motion value to update based on scroll position
- `config`: Optional scroll configuration (see `ScrollConfig` below)

**Returns:**

Nothing. The hook updates the motion value directly.

**Example:**

```tsx
const scrollY = useMotionValue(0);
useScrollMotion(scrollY, { axis: 'y', multiplier: 0.5 });
```

---

### `useWheel`

React hook for wheel/scroll wheel gestures.

```tsx
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
- `config`: Optional wheel configuration (see `WheelConfig` below)

**Returns:**

A ref object that should be attached to the element that should respond to wheel events.

**Example:**

```tsx
const scale = useMotionValue(1);
const wheelRef = useWheel({ y: scale }, { axis: 'y', multiplier: 0.01 });
return <div ref={wheelRef}>Zoom me</div>;
```

---

### `useHover`

React hook for detecting hover state on elements.

```tsx
function useHover(
  config?: HoverConfig
): [RefObject<HTMLElement>, boolean]
```

**Parameters:**

- `config`: Optional hover configuration (see `HoverConfig` below)

**Returns:**

A tuple containing:
- A ref object that should be attached to the hoverable element
- A boolean indicating whether the element is currently being hovered

**Example:**

```tsx
const [hoverRef, isHovering] = useHover({
  onHoverStart: () => console.log('Hover started'),
  onHoverEnd: () => console.log('Hover ended'),
});
return <div ref={hoverRef}>{isHovering ? 'Hovering!' : 'Hover me'}</div>;
```

---

### `useHoverState`

React hook that returns detailed hover state.

```tsx
function useHoverState(
  config?: HoverConfig
): [RefObject<HTMLElement>, HoverState]
```

**Returns:**

A tuple containing:
- A ref object that should be attached to the hoverable element
- A `HoverState` object with `isHovering` property

---

### `useHoverAnimation`

React hook to animate motion values based on hover state.

```tsx
function useHoverAnimation(
  motionValue: MotionValue<number | string>,
  config: HoverAnimationConfig
): RefObject<HTMLElement>
```

**Parameters:**

- `motionValue`: Motion value to animate
- `config`: Hover animation configuration (see `HoverAnimationConfig` below)

**Returns:**

A ref object that should be attached to the hoverable element.

**Example:**

```tsx
const scale = useMotionValue(1);
const hoverRef = useHoverAnimation(scale, {
  onHoverStart: { target: 1.1, config: { stiffness: 300, damping: 20 } },
  onHoverEnd: { target: 1, config: { stiffness: 300, damping: 20 } },
});
return <div ref={hoverRef} style={{ transform: `scale(${scale.get()})` }}>Hover me</div>;
```

---

### `useTap`

React hook for detecting tap/click gestures on elements.

```tsx
function useTap(
  config?: TapConfig
): RefObject<HTMLElement>
```

**Parameters:**

- `config`: Optional tap configuration (see `TapConfig` below)

**Returns:**

A ref object that should be attached to the tappable element.

**Example:**

```tsx
const tapRef = useTap({
  onTap: () => console.log('Tapped!'),
  tapThreshold: 10, // Max distance in px for a tap
});
return <button ref={tapRef}>Tap me</button>;
```

---

### `useTapState`

React hook that returns detailed tap state.

```tsx
function useTapState(
  config?: TapConfig
): [RefObject<HTMLElement>, TapState]
```

**Returns:**

A tuple containing:
- A ref object that should be attached to the tappable element
- A `TapState` object with `isTapping` and `tapCount` properties

---

### `useTapAnimation`

React hook to animate motion values based on tap gestures.

```tsx
function useTapAnimation(
  motionValue: MotionValue<number | string>,
  config: TapAnimationConfig
): RefObject<HTMLElement>
```

**Parameters:**

- `motionValue`: Motion value to animate
- `config`: Tap animation configuration (see `TapAnimationConfig` below)

**Returns:**

A ref object that should be attached to the tappable element.

**Example:**

```tsx
const scale = useMotionValue(1);
const tapRef = useTapAnimation(scale, {
  onTapStart: { target: 0.9, config: { duration: 100 } },
  onTapEnd: { target: 1, config: { stiffness: 400, damping: 25 } },
});
return <button ref={tapRef} style={{ transform: `scale(${scale.get()})` }}>Tap me</button>;
```

---

### `useFocus`

React hook for detecting focus state on elements.

```tsx
function useFocus(
  config?: FocusConfig
): [RefObject<HTMLElement>, boolean]
```

**Parameters:**

- `config`: Optional focus configuration (see `FocusConfig` below)

**Returns:**

A tuple containing:
- A ref object that should be attached to the focusable element
- A boolean indicating whether the element is currently focused

**Example:**

```tsx
const [focusRef, isFocused] = useFocus({
  onFocusStart: () => console.log('Focused'),
  onFocusEnd: () => console.log('Blurred'),
});
return <input ref={focusRef} />;
```

---

### `useFocusState`

React hook that returns detailed focus state.

```tsx
function useFocusState(
  config?: FocusConfig
): [RefObject<HTMLElement>, FocusState]
```

**Returns:**

A tuple containing:
- A ref object that should be attached to the focusable element
- A `FocusState` object with `isFocused` property

---

### `useFocusAnimation`

React hook to animate motion values based on focus state.

```tsx
function useFocusAnimation(
  motionValue: MotionValue<number | string>,
  config: FocusAnimationConfig
): RefObject<HTMLElement>
```

**Parameters:**

- `motionValue`: Motion value to animate
- `config`: Focus animation configuration (see `FocusAnimationConfig` below)

**Returns:**

A ref object that should be attached to the focusable element.

**Example:**

```tsx
const scale = useMotionValue(1);
const focusRef = useFocusAnimation(scale, {
  onFocusStart: { target: 1.05, config: { stiffness: 300, damping: 20 } },
  onFocusEnd: { target: 1, config: { stiffness: 300, damping: 20 } },
});
return <input ref={focusRef} style={{ transform: `scale(${scale.get()})` }} />;
```

---

## Configuration Types

### `GestureConfig`

Configuration for drag and pan gestures.

```tsx
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
- `axis`: Lock gesture to specific axis ('x', 'y', or 'both')
- `threshold`: Minimum movement in pixels to start gesture (default: 10)

---

### `ScrollConfig`

Configuration for scroll-driven animations.

```tsx
interface ScrollConfig {
  axis?: 'x' | 'y' | 'both';
  multiplier?: number; // Default: 1
  spring?: SpringConfig;
  container?: HTMLElement | Window; // Default: window
}
```

**Properties:**

- `axis`: Scroll axis to track ('x', 'y', or 'both')
- `multiplier`: Multiplier for scroll value (default: 1)
- `spring`: Optional spring configuration (not currently used)
- `container`: Container element to track scroll from (default: window)

---

### `WheelConfig`

Configuration for wheel gestures.

```tsx
interface WheelConfig {
  axis?: 'x' | 'y' | 'both';
  multiplier?: number; // Default: 1
  spring?: SpringConfig; // Not currently used
}
```

**Properties:**

- `axis`: Axis to respond to ('x', 'y', or 'both')
- `multiplier`: Multiplier for wheel delta (default: 1)
- `spring`: Optional spring configuration (not currently used)

---

### `SpringConfig`

Spring physics configuration (from `@cascade/compiler`).

```tsx
interface SpringConfig {
  stiffness: number;  // Spring stiffness (higher = stiffer)
  damping: number;    // Damping coefficient (higher = less oscillation)
  mass?: number;      // Mass (default: 1, higher = slower)
  from: number;       // Starting value
  to: number;         // Target value
  duration?: number;  // Animation duration in ms (default: 1000)
}
```

---

### `GestureState`

State object passed to gesture callbacks.

```tsx
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

## Core Utilities

### `createGestureHandler`

Create a gesture handler instance (used internally by hooks).

```tsx
function createGestureHandler(
  element: HTMLElement,
  motionValues: { x?: MotionValue<number>; y?: MotionValue<number> },
  config?: GestureConfig
): GestureHandler
```

**Returns:**

A `GestureHandler` instance with methods:
- `start()`: Start listening for gestures
- `stop()`: Stop listening for gestures
- `isActive()`: Check if gesture is active
- `getState()`: Get current gesture state

---

### `animateSpringWithVelocity`

Animate a motion value using spring physics with initial velocity.

```tsx
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

**Returns:**

A cancel function to stop the animation.

**Example:**

```tsx
const cancel = animateSpringWithVelocity(x, 100, {
  stiffness: 300,
  damping: 30,
  initialVelocity: 500, // px/s
});
// Later: cancel();
```

---

### `GestureSpringConfig`

Extended spring config with velocity support.

```tsx
interface GestureSpringConfig extends SpringConfig {
  initialVelocity?: number; // Initial velocity in px/s
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}
```

---

### `VelocityTracker`

Utility class for tracking velocity over recent points.

```tsx
class VelocityTracker {
  addPoint(point: { x: number; y: number; timestamp: number }): void;
  getVelocity(): { x: number; y: number };
  reset(): void;
}
```

**Methods:**

- `addPoint(point)`: Add a point to track
- `getVelocity()`: Get current velocity in px/s
- `reset()`: Clear all tracked points

**Note:** Tracks up to 10 points within a 100ms window.

---

### `HoverConfig`

Configuration for hover detection hooks.

```tsx
interface HoverConfig {
  onHoverStart?: (event: MouseEvent) => void;
  onHoverEnd?: (event: MouseEvent) => void;
  onHoverChange?: (isHovering: boolean) => void;
  disabled?: boolean;
}
```

**Properties:**

- `onHoverStart`: Callback fired when hover starts
- `onHoverEnd`: Callback fired when hover ends
- `onHoverChange`: Callback fired when hover state changes
- `disabled`: Disable hover detection (default: false)

---

### `HoverState`

State object returned by `useHoverState`.

```tsx
interface HoverState {
  isHovering: boolean;
}
```

---

### `HoverAnimationConfig`

Configuration for hover animation hook.

```tsx
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

**Properties:**

- `onHoverStart`: Animation configuration when hover starts
- `onHoverEnd`: Animation configuration when hover ends
- `disabled`: Disable hover detection (default: false)

---

### `TapConfig`

Configuration for tap detection hooks.

```tsx
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
- `tapThreshold`: Maximum distance in pixels for a tap (default: 10)
- `tapTimeout`: Maximum time in milliseconds for a tap (default: 300)
- `disabled`: Disable tap detection (default: false)

---

### `TapState`

State object returned by `useTapState`.

```tsx
interface TapState {
  isTapping: boolean;
  tapCount: number;
}
```

---

### `TapAnimationConfig`

Configuration for tap animation hook.

```tsx
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

**Properties:**

- `onTapStart`: Animation configuration when tap starts
- `onTapEnd`: Animation configuration when tap ends
- `onTap`: Callback fired when tap completes (for side effects)
- `disabled`: Disable tap detection (default: false)
- `tapThreshold`: Maximum distance in pixels for a tap (default: 10)
- `tapTimeout`: Maximum time in milliseconds for a tap (default: 300)

---

### `FocusConfig`

Configuration for focus detection hooks.

```tsx
interface FocusConfig {
  onFocusStart?: (event: FocusEvent) => void;
  onFocusEnd?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  disabled?: boolean;
}
```

**Properties:**

- `onFocusStart`: Callback fired when focus starts
- `onFocusEnd`: Callback fired when focus ends (blur)
- `onFocusChange`: Callback fired when focus state changes
- `disabled`: Disable focus detection (default: false)

---

### `FocusState`

State object returned by `useFocusState`.

```tsx
interface FocusState {
  isFocused: boolean;
}
```

---

### `FocusAnimationConfig`

Configuration for focus animation hook.

```tsx
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

**Properties:**

- `onFocusStart`: Animation configuration when focus starts
- `onFocusEnd`: Animation configuration when focus ends (blur)
- `disabled`: Disable focus detection (default: false)

---

## Type Exports

All types are exported from the package:

```tsx
import type {
  GestureConfig,
  GestureState,
  GestureHandler,
  ScrollConfig,
  WheelConfig,
  GestureSpringConfig,
  HoverConfig,
  HoverState,
  HoverAnimationConfig,
  TapConfig,
  TapState,
  TapAnimationConfig,
  FocusConfig,
  FocusState,
  FocusAnimationConfig,
} from '@cascade/motion-gestures';
```

---

## Error Handling

- Gesture handlers gracefully handle missing elements
- Spring animations catch errors and call error callbacks
- Invalid configurations fall back to defaults
- Missing motion values are ignored

---

## Performance Notes

- Gesture updates are batched using `requestAnimationFrame`
- Velocity calculation uses a sliding window for efficiency
- Scroll listeners use passive event listeners
- Constraints are checked efficiently using bounds checking
- Event listeners are properly cleaned up on unmount


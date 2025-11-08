# Motion Values API Reference

Complete technical reference for motion values in Cascade Motion.

---

## Overview

Motion values are reactive values that control CSS custom properties, enabling runtime animation control while maintaining CSS performance. They provide a bridge between JavaScript state and CSS animations.

---

## Core API

### `createMotionValue<T>(config: MotionValueConfig): MotionValue<T>`

Creates a reactive motion value that writes to CSS custom properties.

**Signature:**
```typescript
function createMotionValue<T extends number | string>(
  config: MotionValueConfig
): MotionValue<T>
```

**Parameters:**

- `config` (`MotionValueConfig`): Configuration object
  - `initialValue` (required): Starting value (number or string)
  - `property?`: CSS property name (e.g., `'transform'`, `'opacity'`)
  - `unit?`: Unit suffix (e.g., `'px'`, `'deg'`, `'%'`)
  - `element?`: Optional HTMLElement to scope CSS variable to element
  - `warnOnLayoutTrigger?`: Show warnings for layout-triggering properties (default: `true` in dev)
  - `transformMode?`: How to handle transform properties - `'auto'` | `'transform'` | `'position'` (default: `'auto'`)

**Returns:** `MotionValue<T>` - A motion value instance

**Example:**
```typescript
import { createMotionValue } from '@cascade/motion-runtime';

const opacity = createMotionValue({
  initialValue: 1,
  property: 'opacity',
});

const x = createMotionValue({
  initialValue: 0,
  property: 'x',
  unit: 'px',
  transformMode: 'transform',
});
```

---

### `useMotionValue<T>(initialValue: T, config?: Omit<MotionValueConfig, 'initialValue'>): MotionValue<T>`

React hook for creating motion values in components. Returns a stable reference that persists across renders.

**Signature:**
```typescript
function useMotionValue<T extends number | string>(
  initialValue: T,
  config?: Omit<MotionValueConfig, 'initialValue'>
): MotionValue<T>
```

**Parameters:**

- `initialValue` (required): Starting value (number or string)
- `config?`: Optional configuration (same as `MotionValueConfig` except `initialValue`)

**Returns:** `MotionValue<T>` - A motion value instance

**Example:**
```typescript
import { useMotionValue } from '@cascade/motion-runtime';

function MyComponent() {
  const opacity = useMotionValue(1, { property: 'opacity' });
  const x = useMotionValue(0, { property: 'x', unit: 'px' });
  
  return (
    <div
      style={{
        opacity: `var(${opacity.cssVarName})`,
        transform: `translateX(var(${x.cssVarName}))`,
      }}
    >
      Content
    </div>
  );
}
```

---

## MotionValue Interface

### Methods

#### `get(): T`

Gets the current value.

**Returns:** Current value of type `T`

**Example:**
```typescript
const x = useMotionValue(100);
console.log(x.get()); // 100
```

---

#### `set(value: T): void`

Sets the value immediately. Updates are batched using `requestAnimationFrame` for performance.

**Parameters:**

- `value`: New value to set

**Example:**
```typescript
const x = useMotionValue(0);
x.set(100); // Updates immediately
```

---

#### `onChange(callback: (value: T) => void): () => void`

Subscribes to value changes. Returns an unsubscribe function.

**Parameters:**

- `callback`: Function called whenever the value changes

**Returns:** Unsubscribe function

**Example:**
```typescript
const x = useMotionValue(0);

const unsubscribe = x.onChange((value) => {
  console.log('Value changed:', value);
});

// Later...
unsubscribe();
```

---

#### `animateTo(target: T, config?: SpringConfig | MotionValueKeyframeConfig): Promise<void>`

Animates the value to a target using spring physics or keyframe animation.

**Parameters:**

- `target`: Target value
- `config?`: Animation configuration
  - For spring: `SpringConfig` (stiffness, damping, mass, etc.)
  - For keyframe: `MotionValueKeyframeConfig` (duration, easing)

**Returns:** Promise that resolves when animation completes

**Example:**
```typescript
// Spring animation
await x.animateTo(100, {
  stiffness: 300,
  damping: 30,
});

// Keyframe animation
await x.animateTo(100, {
  duration: 300,
  easing: 'ease-out',
});
```

---

#### `stop(): void`

Stops any active animation.

**Example:**
```typescript
x.animateTo(100);
x.stop(); // Cancels animation
```

---

#### `destroy(): void`

Cleans up the motion value, removing it from registries and unsubscribing all listeners.

**Example:**
```typescript
useEffect(() => {
  const x = createMotionValue({ initialValue: 0 });
  
  return () => {
    x.destroy(); // Cleanup on unmount
  };
}, []);
```

---

#### `getTransformValue(): string`

Returns formatted transform string if the motion value is part of a transform property.

**Returns:** Transform string (e.g., `"translateX(100px)"`) or empty string

**Example:**
```typescript
const x = useMotionValue(100, { property: 'x', unit: 'px' });
console.log(x.getTransformValue()); // "translateX(100px)"
```

---

#### `reverse(): void`

Reverses the direction of the current animation.

**Example:**
```typescript
x.animateTo(100);
x.reverse(); // Now animating back to start
```

---

#### `seek(progress: number | { time: number } | { progress: number }): void`

Seeks to a specific point in the animation.

**Parameters:**

- `progress`: Either:
  - Number (0-1) representing progress
  - `{ time: number }` - seek to specific time in ms
  - `{ progress: number }` - seek to specific progress (0-1)

**Example:**
```typescript
x.animateTo(100, { duration: 1000 });
x.seek(0.5); // Jump to halfway point
x.seek({ time: 500 }); // Jump to 500ms
```

---

#### `play(): void`

Resumes a paused animation.

**Example:**
```typescript
x.pause();
x.play(); // Resume
```

---

#### `pause(): void`

Pauses the current animation.

**Example:**
```typescript
x.animateTo(100);
x.pause(); // Pause animation
```

---

#### `getTimeline(): AnimationTimeline | null`

Gets the active animation timeline, if any.

**Returns:** `AnimationTimeline` if animation is active, `null` otherwise

**Example:**
```typescript
x.animateTo(100);
const timeline = x.getTimeline();
if (timeline) {
  console.log('Animation is active');
}
```

---

#### `onAnimationStateChange(callback: (state: TimelineState) => void): () => void`

Subscribes to animation state changes.

**Parameters:**

- `callback`: Function called when animation state changes

**Returns:** Unsubscribe function

**Example:**
```typescript
const unsubscribe = x.onAnimationStateChange((state) => {
  console.log('Animation state:', state);
});
```

---

### Properties

#### `id: string` (readonly)

Unique identifier for the motion value.

**Example:**
```typescript
const x = useMotionValue(0);
console.log(x.id); // "mv-abc123..."
```

---

#### `cssVarName: string` (readonly)

CSS custom property name for this motion value.

**Example:**
```typescript
const x = useMotionValue(0);
console.log(x.cssVarName); // "--motion-value-abc123..."

// Use in CSS
<div style={{ transform: `translateX(var(${x.cssVarName}))` }} />
```

---

#### `isGPUAccelerated: boolean` (readonly)

Whether the property is GPU-accelerated.

**Example:**
```typescript
const opacity = useMotionValue(1, { property: 'opacity' });
console.log(opacity.isGPUAccelerated); // true

const width = useMotionValue(100, { property: 'width' });
console.log(width.isGPUAccelerated); // false
```

---

#### `triggersLayout: boolean` (readonly)

Whether the property triggers layout recalculation.

**Example:**
```typescript
const transform = useMotionValue(0, { property: 'x' });
console.log(transform.triggersLayout); // false

const width = useMotionValue(100, { property: 'width' });
console.log(width.triggersLayout); // true
```

---

## Helper Functions

### Transform Helpers

#### `createTranslateX(initialValue?: number, config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>): MotionValue<number>`

Creates a motion value for horizontal translation.

**Parameters:**

- `initialValue?`: Starting X position (default: `0`)
- `config?`: Additional configuration

**Returns:** `MotionValue<number>`

**Example:**
```typescript
import { createTranslateX } from '@cascade/motion-runtime';

const x = createTranslateX(0);
x.animateTo(100);
```

---

#### `createTranslateY(initialValue?: number, config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>): MotionValue<number>`

Creates a motion value for vertical translation.

**Parameters:**

- `initialValue?`: Starting Y position (default: `0`)
- `config?`: Additional configuration

**Returns:** `MotionValue<number>`

---

#### `createRotate(initialValue?: number, config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>): MotionValue<number>`

Creates a motion value for rotation.

**Parameters:**

- `initialValue?`: Starting rotation in degrees (default: `0`)
- `config?`: Additional configuration

**Returns:** `MotionValue<number>`

**Example:**
```typescript
const rotate = createRotate(0);
rotate.animateTo(360);
```

---

#### `createScale(initialValue?: number, config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>): MotionValue<number>`

Creates a motion value for scaling.

**Parameters:**

- `initialValue?`: Starting scale (default: `1`)
- `config?`: Additional configuration

**Returns:** `MotionValue<number>`

**Example:**
```typescript
const scale = createScale(1);
scale.animateTo(1.5);
```

---

## React Hooks

### `useTranslateX(initialValue?: number, config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>): MotionValue<number>`

React hook for horizontal translation.

**Example:**
```typescript
import { useTranslateX } from '@cascade/motion-runtime';

function MyComponent() {
  const x = useTranslateX(0);
  
  return (
    <div style={{ transform: `translateX(var(${x.cssVarName}))` }}>
      Content
    </div>
  );
}
```

---

### `useTranslateY(initialValue?: number, config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>): MotionValue<number>`

React hook for vertical translation.

---

### `useRotate(initialValue?: number, config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>): MotionValue<number>`

React hook for rotation.

---

### `useScale(initialValue?: number, config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>): MotionValue<number>`

React hook for scaling.

---

## Animation Utilities

### `animateSpringRuntime(motionValue: MotionValue<number>, config: SpringConfig & { duration?: number }, onComplete?: () => void, onError?: (error: Error) => void): () => void`

Animates a motion value using spring physics at runtime.

**Parameters:**

- `motionValue`: Motion value to animate
- `config`: Spring configuration
  - `stiffness`: Spring stiffness
  - `damping`: Damping coefficient
  - `mass?`: Mass (default: `1`)
  - `from`: Starting value
  - `to`: Target value
  - `duration?`: Maximum duration in ms (default: `10000`)
  - `initialVelocity?`: Initial velocity
- `onComplete?`: Completion callback
- `onError?`: Error callback

**Returns:** Cancel function

**Example:**
```typescript
import { animateSpringRuntime } from '@cascade/motion-runtime';

const cancel = animateSpringRuntime(x, {
  stiffness: 300,
  damping: 30,
  from: 0,
  to: 100,
  duration: 1000,
}, () => {
  console.log('Animation complete');
});

// Cancel if needed
cancel();
```

---

## Type Definitions

### `MotionValueConfig`

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

```typescript
interface MotionValueKeyframeConfig {
  duration?: number | string;
  easing?: string;
}
```

---

### `MotionValue<T>`

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

### `RuntimeSpringConfig`

```typescript
interface RuntimeSpringConfig extends SpringConfig {
  duration?: number;
  initialVelocity?: number;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}
```

---

## Transform Registry System

Motion values for transform properties (`x`, `y`, `rotate`, `scale`, etc.) are automatically registered in a transform registry. Multiple transform values for the same element are combined into a single CSS custom property (`--motion-transform-{elementId}`) for optimal performance.

**Example:**
```typescript
const x = useTranslateX(0);
const y = useTranslateY(0);
const rotate = useRotate(0);

// All three values are combined into a single transform:
// transform: var(--motion-transform-{elementId})
```

---

## Performance Considerations

1. **GPU Acceleration**: Properties like `transform` and `opacity` are GPU-accelerated. Use `isGPUAccelerated` to check.

2. **Layout Triggers**: Properties like `width`, `height`, `margin` trigger layout recalculation. Use `triggersLayout` to check.

3. **Batching**: Updates are automatically batched using `requestAnimationFrame` for optimal performance.

4. **Transform Registry**: Transform values are combined into a single CSS variable to minimize style recalculations.

---

## See Also

- [Motion Values Tutorial](../tutorials/motion-values.md) - Learn how to use motion values
- [How to Create Animations](../how-to/create-fade-animation.md) - Practical examples
- [CSS-First Philosophy](../explanations/css-first-philosophy.md) - Understanding the design


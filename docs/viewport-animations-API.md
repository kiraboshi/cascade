# @cascade/motion-runtime Viewport Animations API Reference

Complete API documentation for viewport-based animations using IntersectionObserver API.

## Overview

Viewport animations enable scroll-triggered animations that activate when elements enter or leave the viewport. This provides a declarative way to create engaging scroll-based interactions similar to Framer Motion's `whileInView` feature.

---

## Hooks

### `useInView`

React hook to detect when an element enters or leaves the viewport.

```tsx
function useInView(
  elementRef: RefObject<HTMLElement>,
  config?: ViewportConfig
): boolean
```

**Parameters:**

- `elementRef`: React ref object pointing to the element to observe
- `config`: Optional viewport configuration (see `ViewportConfig` below)

**Returns:**

A boolean indicating whether the element is currently in the viewport.

**Example:**

```tsx
import { useRef } from 'react';
import { useInView } from '@cascade/motion-runtime';

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { threshold: 0.2 });
  
  return (
    <div
      ref={ref}
      style={{
        opacity: isInView ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      Content that fades in on scroll
    </div>
  );
}
```

---

### `useInViewState`

React hook that returns detailed viewport state including the IntersectionObserverEntry.

```tsx
function useInViewState(
  elementRef: RefObject<HTMLElement>,
  config?: ViewportConfig
): ViewportState
```

**Parameters:**

- `elementRef`: React ref object pointing to the element to observe
- `config`: Optional viewport configuration (see `ViewportConfig` below)

**Returns:**

```tsx
interface ViewportState {
  isInView: boolean;
  entry: IntersectionObserverEntry | null;
}
```

**Example:**

```tsx
import { useRef } from 'react';
import { useInViewState } from '@cascade/motion-runtime';

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  const { isInView, entry } = useInViewState(ref);
  
  return (
    <div ref={ref}>
      <p>In view: {isInView ? 'Yes' : 'No'}</p>
      {entry && (
        <p>Intersection ratio: {(entry.intersectionRatio * 100).toFixed(1)}%</p>
      )}
    </div>
  );
}
```

---

### `useViewportAnimation`

React hook to animate motion values based on viewport visibility. Attempts to get the element from the motion value's elementRef.

```tsx
function useViewportAnimation(
  motionValue: MotionValue<number | string>,
  config: ViewportAnimationConfig
): RefObject<HTMLElement>
```

**Parameters:**

- `motionValue`: Motion value to animate
- `config`: Viewport animation configuration (see `ViewportAnimationConfig` below)

**Returns:**

A ref object that should be attached to the element (if element wasn't found from motion value).

**Note:** For more control, use `useViewportAnimationWithRef` instead.

**Example:**

```tsx
import { useMotionValue, useViewportAnimation } from '@cascade/motion-runtime';

function MyComponent() {
  const opacity = useMotionValue(0);
  const elementRef = useViewportAnimation(opacity, {
    initial: 0,
    onEnter: {
      target: 1,
      config: { duration: 500 },
    },
  });
  
  return (
    <div ref={elementRef} style={{ opacity: opacity.get() }}>
      Animated content
    </div>
  );
}
```

---

### `useViewportAnimationWithRef`

React hook that accepts element ref directly for more control. This is the recommended approach when you have direct access to the element ref.

```tsx
function useViewportAnimationWithRef(
  elementRef: RefObject<HTMLElement>,
  motionValue: MotionValue<number | string>,
  config: ViewportAnimationConfig
): void
```

**Parameters:**

- `elementRef`: React ref object pointing to the element to observe
- `motionValue`: Motion value to animate
- `config`: Viewport animation configuration (see `ViewportAnimationConfig` below)

**Returns:**

Nothing. The hook updates the motion value based on viewport visibility.

**Example:**

```tsx
import { useRef } from 'react';
import { useMotionValue, useViewportAnimationWithRef } from '@cascade/motion-runtime';

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(0);
  const y = useMotionValue(50);
  
  useViewportAnimationWithRef(ref, opacity, {
    initial: 0,
    onEnter: {
      target: 1,
      config: { duration: 500, easing: 'ease-out' },
    },
  });
  
  useViewportAnimationWithRef(ref, y, {
    initial: 50,
    onEnter: {
      target: 0,
      config: { stiffness: 300, damping: 30 },
    },
  });
  
  return (
    <div
      ref={ref}
      style={{
        opacity: opacity.get(),
        transform: `translateY(${y.get()}px)`,
      }}
    >
      Animated content
    </div>
  );
}
```

---

### `useFadeInOnScroll`

Convenience hook for fade-in animations on scroll. Automatically creates an opacity motion value and applies it to the element.

```tsx
function useFadeInOnScroll(
  elementRef: RefObject<HTMLElement>,
  config?: FadeInOnScrollConfig
): void
```

**Parameters:**

- `elementRef`: React ref object pointing to the element to animate
- `config`: Optional fade-in configuration (see `FadeInOnScrollConfig` below)

**Returns:**

Nothing. The hook automatically applies opacity to the element.

**Example:**

```tsx
import { useRef } from 'react';
import { useFadeInOnScroll } from '@cascade/motion-runtime';

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  
  useFadeInOnScroll(ref, {
    threshold: 0.2,
    duration: 500,
    once: true,
  });
  
  return (
    <div ref={ref}>
      Content that fades in on scroll
    </div>
  );
}
```

**With Spring Animation:**

```tsx
useFadeInOnScroll(ref, {
  threshold: 0.2,
  useSpring: true,
  spring: { stiffness: 300, damping: 30 },
  once: true,
});
```

---

### `useSlideInOnScroll`

Convenience hook for slide-in animations on scroll. Returns motion values for x and y transforms.

```tsx
function useSlideInOnScroll(
  elementRef: RefObject<HTMLElement>,
  config?: SlideInOnScrollConfig
): { x: MotionValue<number>; y: MotionValue<number> }
```

**Parameters:**

- `elementRef`: React ref object pointing to the element to animate
- `config`: Optional slide-in configuration (see `SlideInOnScrollConfig` below)

**Returns:**

An object containing `x` and `y` motion values for the slide animation.

**Example:**

```tsx
import { useRef } from 'react';
import { useSlideInOnScroll } from '@cascade/motion-runtime';

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = useSlideInOnScroll(ref, {
    direction: 'up',
    distance: 50,
    duration: 600,
    threshold: 0.2,
    once: true,
  });
  
  return (
    <div
      ref={ref}
      style={{
        transform: `translate(${x.get()}px, ${y.get()}px)`,
      }}
    >
      Content that slides in on scroll
    </div>
  );
}
```

**Available Directions:**

- `'up'` - Slides up from below
- `'down'` - Slides down from above
- `'left'` - Slides in from the right
- `'right'` - Slides in from the left

---

## Configuration Types

### `ViewportConfig`

Configuration for viewport detection.

```tsx
interface ViewportConfig {
  /**
   * Margin around the root bounding box
   * Similar to CSS margin: "10px 20px 30px 40px" or "10px"
   */
  rootMargin?: string;
  
  /**
   * Threshold(s) at which the callback is triggered
   * 0 = element just enters viewport
   * 1 = element fully visible
   * [0, 0.5, 1] = triggers at 0%, 50%, and 100% visibility
   */
  threshold?: number | number[];
  
  /**
   * Only trigger once (for enter animations)
   */
  once?: boolean;
  
  /**
   * Root element for intersection calculation
   * Default: viewport (null)
   */
  root?: Element | null;
  
  /**
   * Amount of element that must be visible (0-1)
   * Shorthand for threshold
   * 'some' = 0 (any part visible)
   * 'all' = 1 (fully visible)
   */
  amount?: 'some' | 'all' | number;
}
```

**Examples:**

```tsx
// Trigger when 20% visible
{ threshold: 0.2 }

// Trigger when fully visible
{ amount: 'all' }

// Trigger when any part is visible
{ amount: 'some' }

// Trigger with 100px margin
{ rootMargin: '100px' }

// Only animate once
{ once: true }
```

---

### `ViewportAnimationConfig`

Configuration for viewport-based animations. Extends `ViewportConfig`.

```tsx
interface ViewportAnimationConfig extends ViewportConfig {
  /**
   * Animation to trigger when element enters viewport
   */
  onEnter?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  
  /**
   * Animation to trigger when element leaves viewport
   */
  onExit?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  
  /**
   * Initial value (before viewport detection)
   */
  initial?: number | string;
  
  /**
   * Animate on mount if already in viewport
   */
  animateOnMount?: boolean;
}
```

**Example:**

```tsx
{
  threshold: 0.2,
  initial: 0,
  onEnter: {
    target: 1,
    config: { duration: 500, easing: 'ease-out' },
  },
  onExit: {
    target: 0,
    config: { duration: 300 },
  },
  once: true,
}
```

---

### `FadeInOnScrollConfig`

Configuration for fade-in animations. Extends `ViewportConfig`.

```tsx
interface FadeInOnScrollConfig extends ViewportConfig {
  /**
   * Animation duration in ms (for keyframe animations)
   */
  duration?: number;
  
  /**
   * Spring config (if using spring animation)
   */
  spring?: SpringConfig;
  
  /**
   * Use spring animation instead of keyframe
   */
  useSpring?: boolean;
  
  /**
   * Initial opacity (default: 0)
   */
  initial?: number;
  
  /**
   * Target opacity (default: 1)
   */
  target?: number;
}
```

**Example:**

```tsx
{
  threshold: 0.2,
  duration: 500,
  initial: 0,
  target: 1,
  once: true,
}
```

---

### `SlideInOnScrollConfig`

Configuration for slide-in animations. Extends `ViewportConfig`.

```tsx
interface SlideInOnScrollConfig extends ViewportConfig {
  /**
   * Direction to slide from
   */
  direction?: 'up' | 'down' | 'left' | 'right';
  
  /**
   * Distance to slide (in px)
   */
  distance?: number;
  
  /**
   * Animation duration in ms (for keyframe animations)
   */
  duration?: number;
  
  /**
   * Spring config (if using spring animation)
   */
  spring?: SpringConfig;
  
  /**
   * Use spring animation instead of keyframe
   */
  useSpring?: boolean;
  
  /**
   * Initial offset (default: based on direction and distance)
   */
  initial?: { x: number; y: number };
  
  /**
   * Target offset (default: { x: 0, y: 0 })
   */
  target?: { x: number; y: number };
}
```

**Example:**

```tsx
{
  direction: 'up',
  distance: 50,
  duration: 600,
  threshold: 0.2,
  once: true,
}
```

---

## Animation Config Types

### `SpringConfig`

Spring physics configuration for animations.

```tsx
interface SpringConfig {
  stiffness?: number;  // Default: 300
  damping?: number;    // Default: 20
  mass?: number;       // Default: 1
  from?: number;
  to?: number;
  duration?: number;
}
```

### `MotionValueKeyframeConfig`

Keyframe animation configuration.

```tsx
interface MotionValueKeyframeConfig {
  duration?: number | string;  // e.g., 500 or "500ms"
  easing?: string;             // e.g., "ease-out", "ease-in-out"
}
```

---

## Browser Support

IntersectionObserver is supported in:
- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 15+

For older browsers, consider using a polyfill or fallback to scroll-based detection.

---

## Performance Considerations

1. **IntersectionObserver Efficiency**: Uses native IntersectionObserver API for efficient viewport detection without scroll listeners.

2. **Motion Value Batching**: Motion values batch updates and use requestAnimationFrame for optimal performance.

3. **GPU Acceleration**: Transform-based animations (like slide-in) use GPU-accelerated properties for smooth 60fps animations.

4. **Observer Cleanup**: Observers are automatically cleaned up when components unmount to prevent memory leaks.

---

## See Also

- [Motion Values API](./api-reference.md#motion-values) - Learn about motion values
- [Layout Transitions API](./layout-transitions-API.md) - Related animation features
- [Examples](./viewport-animations-EXAMPLES.md) - Code examples and recipes


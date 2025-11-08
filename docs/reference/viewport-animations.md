# Viewport Animations API Reference

Complete technical reference for viewport-based animations in Cascade Motion.

---

## Overview

Viewport animations enable scroll-triggered animations that activate when elements enter or leave the viewport. Uses the IntersectionObserver API for efficient viewport detection.

---

## Hooks

### `useInView(elementRef, config?): boolean`

React hook to detect when an element enters or leaves the viewport.

**Signature:**
```typescript
function useInView(
  elementRef: RefObject<HTMLElement>,
  config?: ViewportConfig
): boolean
```

**Parameters:**

- `elementRef`: React ref object pointing to the element to observe
- `config?`: Optional viewport configuration (see `ViewportConfig` below)

**Returns:** A boolean indicating whether the element is currently in the viewport.

**Example:**
```typescript
import { useInView } from '@cascade/motion-runtime';
import { useRef } from 'react';

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

### `useInViewState(elementRef, config?): ViewportState`

React hook that returns detailed viewport state including the IntersectionObserverEntry.

**Signature:**
```typescript
function useInViewState(
  elementRef: RefObject<HTMLElement>,
  config?: ViewportConfig
): ViewportState
```

**Returns:**
```typescript
interface ViewportState {
  isInView: boolean;
  entry: IntersectionObserverEntry | null;
}
```

**Example:**
```typescript
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

### `useViewportAnimation(motionValue, config): RefObject<HTMLElement>`

React hook to animate motion values based on viewport visibility. Attempts to get the element from the motion value's elementRef.

**Signature:**
```typescript
function useViewportAnimation(
  motionValue: MotionValue<number | string>,
  config: ViewportAnimationConfig
): RefObject<HTMLElement>
```

**Parameters:**

- `motionValue`: Motion value to animate
- `config`: Viewport animation configuration (see `ViewportAnimationConfig` below)

**Returns:** A ref object that should be attached to the element (if element wasn't found from motion value).

**Note:** For more control, use `useViewportAnimationWithRef` instead.

**Example:**
```typescript
import { useMotionValue, useViewportAnimation } from '@cascade/motion-runtime';

function MyComponent() {
  const opacity = useMotionValue(0, { property: 'opacity' });
  const elementRef = useViewportAnimation(opacity, {
    initial: 0,
    onEnter: {
      target: 1,
      config: { duration: 500 },
    },
  });
  
  return (
    <div
      ref={elementRef}
      style={{ opacity: `var(${opacity.cssVarName})` }}
    >
      Animated content
    </div>
  );
}
```

---

### `useViewportAnimationWithRef(elementRef, motionValue, config): void`

React hook that accepts element ref directly for more control. This is the recommended approach when you have direct access to the element ref.

**Signature:**
```typescript
function useViewportAnimationWithRef(
  elementRef: RefObject<HTMLElement>,
  motionValue: MotionValue<number | string>,
  config: ViewportAnimationConfig
): void
```

**Parameters:**

- `elementRef`: React ref object pointing to the element to observe
- `motionValue`: Motion value to animate
- `config`: Viewport animation configuration

**Returns:** Nothing. The hook updates the motion value based on viewport visibility.

**Example:**
```typescript
import { useViewportAnimationWithRef } from '@cascade/motion-runtime';
import { useMotionValue, useTranslateY } from '@cascade/motion-runtime';

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(0, { property: 'opacity' });
  const y = useTranslateY(50);
  
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
        opacity: `var(${opacity.cssVarName})`,
        transform: `translateY(var(${y.cssVarName}))`,
      }}
    >
      Animated content
    </div>
  );
}
```

---

### `useFadeInOnScroll(elementRef, config?): void`

Convenience hook for fade-in animations on scroll. Automatically creates an opacity motion value and applies it to the element.

**Signature:**
```typescript
function useFadeInOnScroll(
  elementRef: RefObject<HTMLElement>,
  config?: FadeInOnScrollConfig
): void
```

**Parameters:**

- `elementRef`: React ref object pointing to the element to animate
- `config?`: Optional fade-in configuration (see `FadeInOnScrollConfig` below)

**Returns:** Nothing. The hook automatically applies opacity to the element.

**Example:**
```typescript
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
```typescript
useFadeInOnScroll(ref, {
  threshold: 0.2,
  useSpring: true,
  spring: { stiffness: 300, damping: 30 },
  once: true,
});
```

---

### `useSlideInOnScroll(elementRef, config?): { x: MotionValue<number>; y: MotionValue<number> }`

Convenience hook for slide-in animations on scroll. Returns motion values for x and y transforms.

**Signature:**
```typescript
function useSlideInOnScroll(
  elementRef: RefObject<HTMLElement>,
  config?: SlideInOnScrollConfig
): { x: MotionValue<number>; y: MotionValue<number> }
```

**Parameters:**

- `elementRef`: React ref object pointing to the element to animate
- `config?`: Optional slide-in configuration (see `SlideInOnScrollConfig` below)

**Returns:** An object containing `x` and `y` motion values for the slide animation.

**Example:**
```typescript
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
        transform: `translate(var(${x.cssVarName}), var(${y.cssVarName}))`,
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

```typescript
interface ViewportConfig {
  rootMargin?: string;        // Margin around root (e.g., "10px 20px")
  threshold?: number | number[]; // Visibility threshold (0-1)
  once?: boolean;             // Only trigger once
  root?: Element | null;      // Root element (default: viewport)
  amount?: 'some' | 'all' | number; // Shorthand for threshold
}
```

**Properties:**

- `rootMargin`: Margin around the root bounding box. Similar to CSS margin: `"10px 20px 30px 40px"` or `"10px"`
- `threshold`: Threshold(s) at which callback is triggered. `0` = element just enters viewport, `1` = element fully visible, `[0, 0.5, 1]` = triggers at 0%, 50%, and 100% visibility
- `once`: Only trigger once (for enter animations). Default: `false`
- `root`: Root element for intersection calculation. Default: `null` (viewport)
- `amount`: Shorthand for threshold. `'some'` = 0 (any part visible), `'all'` = 1 (fully visible), or a number

**Examples:**
```typescript
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
}
```

**Properties:**

- `onEnter`: Animation to trigger when element enters viewport
- `onExit`: Animation to trigger when element leaves viewport
- `initial`: Initial value (before viewport detection)
- `animateOnMount`: Animate on mount if already in viewport. Default: `false`

**Example:**
```typescript
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

```typescript
interface FadeInOnScrollConfig extends ViewportConfig {
  duration?: number;      // Animation duration in ms (for keyframe animations)
  spring?: SpringConfig;  // Spring config (if using spring animation)
  useSpring?: boolean;   // Use spring animation instead of keyframe
  initial?: number;       // Initial opacity (default: 0)
  target?: number;        // Target opacity (default: 1)
}
```

**Example:**
```typescript
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

```typescript
interface SlideInOnScrollConfig extends ViewportConfig {
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;     // Distance to slide (in px)
  duration?: number;      // Animation duration in ms
  spring?: SpringConfig;  // Spring config (if using spring animation)
  useSpring?: boolean;   // Use spring animation instead of keyframe
  initial?: { x: number; y: number };
  target?: { x: number; y: number };
}
```

**Example:**
```typescript
{
  direction: 'up',
  distance: 50,
  duration: 600,
  threshold: 0.2,
  once: true,
}
```

---

## Performance Considerations

1. **IntersectionObserver Efficiency**: Uses native IntersectionObserver API for efficient viewport detection without scroll listeners.

2. **Motion Value Batching**: Motion values batch updates and use `requestAnimationFrame` for optimal performance.

3. **GPU Acceleration**: Transform-based animations (like slide-in) use GPU-accelerated properties for smooth 60fps animations.

4. **Observer Cleanup**: Observers are automatically cleaned up when components unmount to prevent memory leaks.

---

## Browser Support

IntersectionObserver is supported in:
- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 15+

For older browsers, consider using a polyfill or fallback to scroll-based detection.

---

## See Also

- [How to Animate on Scroll](../how-to/animate-on-scroll.md) - Practical examples
- [Motion Values Reference](./motion-values.md) - Understanding motion values
- [Layout Transitions Reference](./layout-transitions.md) - Related animation features


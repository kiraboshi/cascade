# Getting Started with Viewport Animations

A step-by-step guide to creating scroll-triggered animations.

## Prerequisites

- React 16.8+ (hooks support)
- `@cascade/motion-runtime` installed
- Basic understanding of React hooks

## Your First Viewport Animation

### Step 1: Create a Component

```tsx
import { useRef } from 'react';

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={ref}>
      Content that will animate on scroll
    </div>
  );
}
```

### Step 2: Add Fade-In Animation

```tsx
import { useRef } from 'react';
import { useFadeInOnScroll } from '@cascade/motion-runtime';

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  
  useFadeInOnScroll(ref, {
    threshold: 0.2,  // Trigger when 20% visible
    duration: 500,   // Animation duration in ms
    once: true,      // Only animate once
  });
  
  return (
    <div ref={ref}>
      Content that fades in on scroll
    </div>
  );
}
```

That's it! The element will now fade in when it enters the viewport.

## Understanding Threshold

The `threshold` option controls when the animation triggers:

- `0` - Triggers as soon as any part enters viewport
- `0.5` - Triggers when 50% is visible
- `1` - Triggers when fully visible

```tsx
// Trigger early (as soon as visible)
useFadeInOnScroll(ref, { threshold: 0 });

// Trigger when mostly visible
useFadeInOnScroll(ref, { threshold: 0.7 });

// Trigger when fully visible
useFadeInOnScroll(ref, { threshold: 1 });
```

## Using the `once` Option

The `once` option controls whether the animation repeats:

```tsx
// Animate every time element enters viewport
useFadeInOnScroll(ref, { once: false });

// Animate only once (default for convenience hooks)
useFadeInOnScroll(ref, { once: true });
```

## Slide-In Animations

Use `useSlideInOnScroll` for slide animations:

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
      Content that slides in
    </div>
  );
}
```

**Available Directions:**
- `'up'` - Slides up from below
- `'down'` - Slides down from above
- `'left'` - Slides in from right
- `'right'` - Slides in from left

## Custom Animations

For more control, use `useViewportAnimationWithRef`:

```tsx
import { useRef } from 'react';
import { useMotionValue, useViewportAnimationWithRef } from '@cascade/motion-runtime';

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(0);
  const scale = useMotionValue(0.8);
  
  useViewportAnimationWithRef(ref, opacity, {
    initial: 0,
    onEnter: {
      target: 1,
      config: { duration: 500, easing: 'ease-out' },
    },
  });
  
  useViewportAnimationWithRef(ref, scale, {
    initial: 0.8,
    onEnter: {
      target: 1,
      config: { stiffness: 300, damping: 25 }, // Spring animation
    },
  });
  
  return (
    <div
      ref={ref}
      style={{
        opacity: opacity.get(),
        transform: `scale(${scale.get()})`,
      }}
    >
      Custom animated content
    </div>
  );
}
```

## Spring vs Keyframe Animations

### Keyframe Animation (Default)

```tsx
useFadeInOnScroll(ref, {
  duration: 500,
  easing: 'ease-out',
});
```

### Spring Animation

```tsx
useFadeInOnScroll(ref, {
  useSpring: true,
  spring: {
    stiffness: 300,
    damping: 30,
  },
});
```

**When to use:**
- **Keyframe**: Predictable timing, consistent duration
- **Spring**: Natural, physics-based motion

## Exit Animations

Add exit animations using `onExit`:

```tsx
useViewportAnimationWithRef(ref, opacity, {
  initial: 0,
  onEnter: {
    target: 1,
    config: { duration: 500 },
  },
  onExit: {
    target: 0,
    config: { duration: 300 },
  },
});
```

## Multiple Elements

Animate multiple elements independently:

```tsx
function MyComponent() {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);
  
  useFadeInOnScroll(ref1, { threshold: 0.1, duration: 400 });
  useFadeInOnScroll(ref2, { threshold: 0.2, duration: 500 });
  useFadeInOnScroll(ref3, { threshold: 0.3, duration: 600 });
  
  return (
    <>
      <div ref={ref1}>Element 1</div>
      <div ref={ref2}>Element 2</div>
      <div ref={ref3}>Element 3</div>
    </>
  );
}
```

## Next Steps

- 📚 [API Reference](./viewport-animations-API.md) - Complete API documentation
- 💡 [Examples](./viewport-animations-EXAMPLES.md) - More code examples
- 🎨 [Motion Values](./api-reference.md#motion-values) - Learn about motion values


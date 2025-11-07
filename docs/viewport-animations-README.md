# Viewport Animations

Scroll-triggered animations using IntersectionObserver API for Cascade Motion.

## Overview

Viewport animations enable you to create engaging scroll-based interactions where elements animate as they enter or leave the viewport. This provides a declarative way to trigger animations based on scroll position, similar to Framer Motion's `whileInView` feature.

## Features

- ✅ **Viewport Detection** - Detect when elements enter/leave viewport
- ✅ **Scroll-Triggered Animations** - Animate motion values on scroll
- ✅ **Convenience Hooks** - Pre-built fade-in and slide-in animations
- ✅ **Flexible Configuration** - Threshold, root margin, once options
- ✅ **Performance Optimized** - Uses IntersectionObserver for efficient detection
- ✅ **TypeScript Support** - Full type safety

## Quick Start

### Basic Fade-In

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
  
  return <div ref={ref}>Content that fades in</div>;
}
```

### Custom Animation

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
      config: { duration: 500 },
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

## Installation

Viewport animations are part of `@cascade/motion-runtime`:

```bash
npm install @cascade/motion-runtime
```

## Documentation

- 📖 [API Reference](./viewport-animations-API.md) - Complete API documentation
- 🚀 [Getting Started](./viewport-animations-GETTING_STARTED.md) - Step-by-step guide
- 💡 [Examples](./viewport-animations-EXAMPLES.md) - Code examples and recipes

## Browser Support

Requires IntersectionObserver API support:
- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 15+

## Related

- [Motion Values](./api-reference.md#motion-values) - Learn about reactive motion values
- [Layout Transitions](./layout-transitions-README.md) - Related animation features


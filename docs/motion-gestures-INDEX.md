# @cascade/motion-gestures Documentation Index

Complete documentation for the `@cascade/motion-gestures` package.

## Documentation Files

### 📖 [README](./motion-gestures-README.md)
Overview of the package, features, quick start, and basic usage.

**Start here if:** You're new to the package or want a high-level overview.

### 🚀 [Getting Started](./motion-gestures-GETTING_STARTED.md)
Step-by-step guide to create your first gesture-driven animation.

**Start here if:** You want to build something right away.

### 📚 [API Reference](./motion-gestures-API.md)
Complete API documentation for all hooks, types, and utilities.

**Start here if:** You need detailed information about specific APIs.

### 💡 [Examples](./motion-gestures-EXAMPLES.md)
Complete code examples for common use cases.

**Start here if:** You want to see how things work in practice.

## Quick Links

### Common Tasks

- [Create a draggable element](./motion-gestures-GETTING_STARTED.md#your-first-draggable-element)
- [Add spring animation](./motion-gestures-GETTING_STARTED.md#adding-spring-animation)
- [Limit drag movement](./motion-gestures-GETTING_STARTED.md#adding-constraints)
- [Create scroll-driven animation](./motion-gestures-GETTING_STARTED.md#scroll-driven-animation)
- [Add wheel zoom](./motion-gestures-GETTING_STARTED.md#wheel-zoom)

### API Reference

- [`useDrag` Hook](./motion-gestures-API.md#usedrag)
- [`usePan` Hook](./motion-gestures-API.md#usepan)
- [`useScrollMotion` Hook](./motion-gestures-API.md#usescrollmotion)
- [`useWheel` Hook](./motion-gestures-API.md#usewheel)
- [Configuration Types](./motion-gestures-API.md#configuration-types)

### Examples

- [Basic Drag](./motion-gestures-EXAMPLES.md#basic-drag)
- [Drag with Constraints](./motion-gestures-EXAMPLES.md#drag-with-constraints)
- [Drag with Spring](./motion-gestures-EXAMPLES.md#drag-with-spring-animation)
- [Scroll Animation](./motion-gestures-EXAMPLES.md#scroll-driven-animation)
- [Wheel Zoom](./motion-gestures-EXAMPLES.md#wheel-zoom)
- [Custom Callbacks](./motion-gestures-EXAMPLES.md#custom-callbacks)

## Package Overview

`@cascade/motion-gestures` provides React hooks and utilities for creating interactive, gesture-based animations:

- **Drag & Pan**: Pointer/touch-based dragging with velocity tracking
- **Scroll**: Map scroll position to motion values
- **Wheel**: Zoom and other wheel-based interactions
- **Spring Physics**: Natural spring animations with velocity support
- **Constraints**: Limit gesture movement to bounds
- **Axis Locking**: Restrict gestures to specific axes

## Installation

```bash
pnpm add @cascade/motion-gestures @cascade/motion-runtime
```

## Quick Example

```tsx
import { useDrag } from '@cascade/motion-gestures';
import { useMotionValue } from '@cascade/motion-runtime';

function Draggable() {
  const x = useMotionValue(0, { unit: 'px' });
  const y = useMotionValue(0, { unit: 'px' });
  const dragRef = useDrag({ x, y });
  
  return <div ref={dragRef}>Drag me!</div>;
}
```

## Related Packages

- [`@cascade/motion-runtime`](../packages/motion-runtime): Core motion value system
- [`@cascade/compiler`](../packages/compiler): Spring physics solver

## Support

For issues, questions, or contributions, please refer to the main project repository.


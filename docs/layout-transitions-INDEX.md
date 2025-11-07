# Layout Transitions Documentation Index

Complete documentation for layout transitions (FLIP animations) in Cascade Motion.

## Documentation Files

### 📖 [README](./layout-transitions-README.md)
Overview of layout transitions, features, quick start, and basic usage.

**Start here if:** You're new to layout transitions or want a high-level overview.

### 🚀 [Getting Started](./layout-transitions-GETTING_STARTED.md)
Step-by-step guide to create your first layout transition.

**Start here if:** You want to build something right away.

### 📚 [API Reference](./layout-transitions-API.md)
Complete API documentation for all hooks, utilities, and types.

**Start here if:** You need detailed information about specific APIs.

### 💡 [Examples](./layout-transitions-EXAMPLES.md)
Complete code examples for common use cases.

**Start here if:** You want to see how things work in practice.

## Quick Links

### Common Tasks

- [Animate a single element's layout changes](./layout-transitions-GETTING_STARTED.md#animating-a-single-element)
- [Create shared element transitions](./layout-transitions-GETTING_STARTED.md#shared-element-transitions)
- [Animate multiple elements together](./layout-transitions-GETTING_STARTED.md#batch-layout-transitions)
- [Use with MotionStage](./layout-transitions-GETTING_STARTED.md#integration-with-motionstage)

### API Reference

- [`useLayoutTransition` Hook](./layout-transitions-API.md#uselayouttransition)
- [`useSharedLayoutTransition` Hook](./layout-transitions-API.md#usesharedlayouttransition)
- [`useBatchLayoutTransition` Hook](./layout-transitions-API.md#usebatchlayouttransition)
- [Layout Utilities](./layout-transitions-API.md#layout-utilities)
- [FLIP Generator](./layout-transitions-API.md#flip-generator)

### Examples

- [List Reordering](./layout-transitions-EXAMPLES.md#list-reordering)
- [Grid Layout Changes](./layout-transitions-EXAMPLES.md#grid-layout-changes)
- [Card Expand/Collapse](./layout-transitions-EXAMPLES.md#card-expandcollapse)
- [Modal Transitions](./layout-transitions-EXAMPLES.md#modal-transitions)
- [Shared Element Between Pages](./layout-transitions-EXAMPLES.md#shared-element-between-pages)

## What are Layout Transitions?

Layout transitions use the FLIP (First, Last, Invert, Play) technique to smoothly animate elements when their position or size changes. This is perfect for:

- **List reordering**: Animate items when they move positions
- **Grid layouts**: Smooth transitions when columns change
- **Shared elements**: Animate elements that appear in different places
- **Modal dialogs**: Smooth open/close animations
- **Card expansions**: Animate cards that expand/collapse

## Key Features

- ✅ **GPU Accelerated**: Uses CSS transforms for smooth 60fps animations
- ✅ **Automatic Detection**: Detects layout changes automatically
- ✅ **Shared Elements**: Animate elements between different components
- ✅ **Batch Animations**: Animate multiple elements simultaneously
- ✅ **Zero Configuration**: Works out of the box with sensible defaults
- ✅ **TypeScript**: Full type safety and IntelliSense support

## Installation

Layout transitions are part of `@cascade/motion-runtime`:

```bash
pnpm add @cascade/motion-runtime
```

## Quick Example

```tsx
import { useLayoutTransition } from '@cascade/motion-runtime';
import { useRef } from 'react';

function AnimatedCard() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutTransition(ref, { duration: 300 });
  
  return (
    <div ref={ref} style={{ width: expanded ? '400px' : '200px' }}>
      Content
    </div>
  );
}
```

## Browser Support

- **getBoundingClientRect**: Supported in all modern browsers
- **CSS Transforms**: Excellent support
- **requestAnimationFrame**: Supported in all modern browsers

## Performance

Layout transitions are optimized for performance:

- Uses CSS transforms (GPU accelerated)
- Batches measurements using `requestAnimationFrame`
- Caches generated keyframes
- Only animates significant changes (threshold: 1px)

## Next Steps

1. Read the [Getting Started Guide](./layout-transitions-GETTING_STARTED.md)
2. Check out [Examples](./layout-transitions-EXAMPLES.md) for common patterns
3. Explore the [API Reference](./layout-transitions-API.md) for advanced usage


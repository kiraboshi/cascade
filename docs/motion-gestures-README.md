# @cascade/motion-gestures

Gesture-driven animations for Cascade Motion. This package provides React hooks and utilities for creating interactive, gesture-based animations using pointer events, scroll, and wheel interactions.

## Features

- **Drag Gestures**: Drag elements with pointer/touch support
- **Pan Gestures**: Touch-optimized pan gestures
- **Scroll-Driven Animations**: Map scroll position to motion values
- **Wheel Gestures**: Zoom and other wheel-based interactions
- **Hover Gestures**: Detect and animate on hover state
- **Tap Gestures**: Detect tap/click gestures with threshold support
- **Focus Gestures**: Detect and animate on focus/blur state
- **Velocity-Based Springs**: Natural spring animations that respect gesture velocity
- **Constraints**: Limit gesture movement to specific bounds
- **Axis Locking**: Restrict gestures to specific axes

## Installation

```bash
pnpm add @cascade/motion-gestures
```

## Quick Start

```tsx
import { useDrag } from '@cascade/motion-gestures';
import { useMotionValue } from '@cascade/motion-runtime';

function DraggableCard() {
  const x = useMotionValue(0, { unit: 'px' });
  const y = useMotionValue(0, { unit: 'px' });
  
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
        transform: `translate(${x.get()}px, ${y.get()}px)`,
      }}
    >
      Drag me!
    </div>
  );
}
```

## Hooks

### `useDrag`

Create draggable elements with pointer/touch support.

```tsx
const dragRef = useDrag(
  { x, y },
  {
    spring: { stiffness: 300, damping: 30 },
    constraints: { min: { x: -100 }, max: { x: 100 } },
    onStart: (state) => console.log('Drag started'),
    onEnd: (state) => console.log('Drag ended'),
  }
);
```

### `usePan`

Similar to `useDrag` but optimized for touch gestures with a lower threshold.

```tsx
const panRef = usePan({ x, y }, { constraints: { ... } });
```

### `useScrollMotion`

Map scroll position to a motion value for scroll-driven animations.

```tsx
const scrollY = useMotionValue(0);
useScrollMotion(scrollY, { axis: 'y', multiplier: 0.5 });
```

### `useWheel`

Handle wheel/scroll wheel gestures for zoom and other interactions.

```tsx
const scale = useMotionValue(1);
const wheelRef = useWheel(
  { y: scale },
  { axis: 'y', multiplier: 0.01 }
);
```

### `useHover` / `useHoverAnimation`

Detect hover state and animate on hover.

```tsx
const scale = useMotionValue(1);
const hoverRef = useHoverAnimation(scale, {
  onHoverStart: { target: 1.1, config: { stiffness: 300, damping: 20 } },
  onHoverEnd: { target: 1, config: { stiffness: 300, damping: 20 } },
});
```

### `useTap` / `useTapAnimation`

Detect tap/click gestures and animate on tap.

```tsx
const scale = useMotionValue(1);
const tapRef = useTapAnimation(scale, {
  onTapStart: { target: 0.9, config: { duration: 100 } },
  onTapEnd: { target: 1, config: { stiffness: 400, damping: 25 } },
});
```

### `useFocus` / `useFocusAnimation`

Detect focus state and animate on focus/blur.

```tsx
const scale = useMotionValue(1);
const focusRef = useFocusAnimation(scale, {
  onFocusStart: { target: 1.05, config: { stiffness: 300, damping: 20 } },
  onFocusEnd: { target: 1, config: { stiffness: 300, damping: 20 } },
});
```

## Core Concepts

### Motion Values

All gesture hooks work with `MotionValue` instances from `@cascade/motion-runtime`. Motion values are reactive values that update CSS custom properties, enabling smooth animations.

```tsx
const x = useMotionValue(0, { unit: 'px' });
```

### Spring Animations

When gestures end, elements can spring back to their original position using velocity-based spring physics. The spring animation uses the gesture's velocity to create natural momentum.

```tsx
{
  spring: {
    stiffness: 300,  // Higher = stiffer spring
    damping: 30,     // Higher = less oscillation
    mass: 1,         // Higher = slower response
  }
}
```

### Constraints

Limit gesture movement to specific bounds:

```tsx
{
  constraints: {
    min: { x: -100, y: -100 },
    max: { x: 100, y: 100 },
  }
}
```

## Examples

See the [Examples Guide](./motion-gestures-EXAMPLES.md) for complete code examples.

## API Reference

See the [API Reference](./motion-gestures-API.md) for complete API documentation.

## Browser Support

- **Pointer Events**: Chrome 55+, Firefox 59+, Safari 13+
- **Touch Events**: All modern browsers
- **Passive Listeners**: Supported in modern browsers

## Performance Considerations

- Gesture updates are throttled to `requestAnimationFrame`
- Velocity calculation uses a sliding window (max 10 points, 100ms window)
- Scroll listeners use passive event listeners for better performance
- Constraints are checked efficiently using bounds checking

## License

MIT


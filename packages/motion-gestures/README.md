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
pnpm add @cascade/motion-gestures @cascade/motion-runtime
```

## Quick Start

```tsx
import { useDrag } from '@cascade/motion-gestures';
import { useTranslateX, useTranslateY } from '@cascade/motion-runtime';

function DraggableCard() {
  const x = useTranslateX(0);
  const y = useTranslateY(0);
  
  const dragRef = useDrag({ x, y }, {
    spring: { stiffness: 300, damping: 30 },
    constraints: {
      min: { x: -200, y: -200 },
      max: { x: 200, y: 200 },
    },
  });
  
  return (
    <div
      ref={dragRef}
      style={{
        transform: `translate(var(${x.cssVarName}), var(${y.cssVarName}))`,
      }}
    >
      Drag me!
    </div>
  );
}
```

## Documentation

For complete documentation, see:
- [Gestures Tutorial](../../docs/tutorials/gestures.md) - Learn gestures step-by-step
- [Gestures API Reference](../../docs/reference/gestures.md) - Complete API documentation
- [How-to Guides](../../docs/how-to/) - Practical examples and guides

## Browser Support

- **Pointer Events**: Chrome 55+, Firefox 59+, Safari 13+
- **Touch Events**: All modern browsers
- **Passive Listeners**: Supported in modern browsers

## License

MIT


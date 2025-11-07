# Getting Started with @cascade/motion-gestures

A quick guide to get you started with gesture-driven animations in Cascade Motion.

## Installation

```bash
pnpm add @cascade/motion-gestures @cascade/motion-runtime
```

## Your First Draggable Element

Let's create a simple draggable card:

```tsx
import { useDrag } from '@cascade/motion-gestures';
import { useMotionValue } from '@cascade/motion-runtime';
import { useState, useEffect } from 'react';

function MyDraggableCard() {
  // Create motion values for x and y position
  const x = useMotionValue(0, { unit: 'px' });
  const y = useMotionValue(0, { unit: 'px' });
  
  // Track current values for rendering
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  
  // Create drag handler
  const dragRef = useDrag({ x, y });
  
  // Subscribe to motion value changes
  useEffect(() => {
    const unsubscribeX = x.onChange((value: number) => {
      setCurrentX(value);
    });
    const unsubscribeY = y.onChange((value: number) => {
      setCurrentY(value);
    });
    
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y]);
  
  return (
    <div style={{ position: 'relative', height: '400px' }}>
      <div
        ref={dragRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '100px',
          height: '100px',
          backgroundColor: '#3b82f6',
          borderRadius: '8px',
          transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`,
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        Drag Me!
      </div>
    </div>
  );
}
```

## Key Concepts

### 1. Motion Values

Motion values are reactive values that update CSS custom properties. They're created with `useMotionValue`:

```tsx
const x = useMotionValue(0, { unit: 'px' });
```

The `unit` option tells the motion value to append 'px' when updating CSS.

### 2. Gesture Hooks

Gesture hooks like `useDrag` return a ref that you attach to an element:

```tsx
const dragRef = useDrag({ x, y });
// ...
<div ref={dragRef}>...</div>
```

### 3. Subscribing to Changes

Motion values don't trigger React re-renders automatically. You need to subscribe:

```tsx
useEffect(() => {
  const unsubscribe = x.onChange((value: number) => {
    setCurrentX(value); // Update state to trigger re-render
  });
  return unsubscribe; // Clean up subscription
}, [x]);
```

## Adding Spring Animation

Make the element spring back when released:

```tsx
import type { SpringConfig } from '@cascade/compiler';

const springConfig: SpringConfig = {
  stiffness: 300,  // Higher = stiffer spring
  damping: 30,     // Higher = less bouncy
  mass: 1,         // Higher = slower
  from: 0,
  to: 0,
};

const dragRef = useDrag(
  { x, y },
  {
    spring: springConfig,
  }
);
```

The spring animation automatically uses the gesture's velocity for natural momentum!

## Adding Constraints

Limit how far the element can be dragged:

```tsx
const dragRef = useDrag(
  { x, y },
  {
    constraints: {
      min: { x: -200, y: -200 },
      max: { x: 200, y: 200 },
    },
  }
);
```

## Scroll-Driven Animation

Create animations that respond to scroll:

```tsx
function ScrollExample() {
  const scrollY = useMotionValue(0);
  const [currentY, setCurrentY] = useState(0);
  
  // Map scroll position to motion value
  useScrollMotion(scrollY, { axis: 'y', multiplier: 0.5 });
  
  useEffect(() => {
    const unsubscribe = scrollY.onChange((value: number) => {
      setCurrentY(value);
    });
    return unsubscribe;
  }, [scrollY]);
  
  return (
    <div
      style={{
        transform: `translateY(${currentY}px)`,
      }}
    >
      Scroll me!
    </div>
  );
}
```

## Wheel Zoom

Add zoom with mouse wheel:

```tsx
function ZoomExample() {
  const scale = useMotionValue(1);
  const [currentScale, setCurrentScale] = useState(1);
  
  const wheelRef = useWheel(
    { y: scale },
    {
      axis: 'y',
      multiplier: 0.01, // Adjust sensitivity
    }
  );
  
  useEffect(() => {
    const unsubscribe = scale.onChange((value: number) => {
      const clamped = Math.max(0.5, Math.min(value, 3)); // Clamp between 0.5x and 3x
      setCurrentScale(clamped);
    });
    return unsubscribe;
  }, [scale]);
  
  return (
    <div
      ref={wheelRef}
      style={{
        transform: `scale(${currentScale})`,
        cursor: 'zoom-in',
      }}
    >
      Zoom me!
    </div>
  );
}
```

## Common Patterns

### Pattern 1: Draggable with Spring Back

```tsx
const dragRef = useDrag(
  { x, y },
  {
    spring: { stiffness: 300, damping: 30 },
    constraints: { min: { x: -200 }, max: { x: 200 } },
  }
);
```

### Pattern 2: Horizontal-Only Drag

```tsx
const dragRef = useDrag(
  { x },
  {
    axis: 'x', // Lock to horizontal
    constraints: { min: { x: -200 }, max: { x: 200 } },
  }
);
```

### Pattern 3: Touch-Optimized Pan

```tsx
const panRef = usePan(
  { x, y },
  {
    constraints: { min: { x: -150 }, max: { x: 150 } },
  }
);
```

## Best Practices

1. **Always clean up subscriptions** in `useEffect` return functions
2. **Use `touchAction: 'none'`** on draggable elements
3. **Clamp values** for wheel/scroll to prevent extremes
4. **Use `userSelect: 'none'`** to prevent text selection
5. **Subscribe to motion values** to update React state for rendering

## Next Steps

- Check out the [Examples Guide](./motion-gestures-EXAMPLES.md) for more complex examples
- Read the [API Reference](./motion-gestures-API.md) for complete documentation
- See the [README](./motion-gestures-README.md) for an overview

## Troubleshooting

### Element doesn't move when dragging

- Make sure you've attached the ref: `<div ref={dragRef}>`
- Check that you're subscribing to motion value changes
- Verify the element has `touchAction: 'none'`

### Spring animation doesn't work

- Ensure you've provided a `spring` config
- Check that the motion values are being updated during drag
- Verify the spring config has valid `stiffness` and `damping` values

### Scroll animation not updating

- Make sure there's enough scrollable content
- Check that you're subscribing to the motion value
- Verify the `multiplier` is appropriate for your use case


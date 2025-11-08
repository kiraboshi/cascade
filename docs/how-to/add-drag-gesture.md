# How to Add Drag Gesture

A step-by-step guide to making elements draggable with Cascade Motion.

---

## Goal

Make an element draggable with smooth spring animation on release.

---

## Solution

### Step 1: Import Required Hooks

```typescript
import { useDrag } from '@cascade/motion-gestures';
import { useTranslateX, useTranslateY } from '@cascade/motion-runtime';
```

### Step 2: Create Motion Values for Position

```typescript
const x = useTranslateX(0);
const y = useTranslateY(0);
```

These create motion values for horizontal and vertical translation.

### Step 3: Set Up Drag Gesture

```typescript
const dragRef = useDrag(
  { x, y },
  {
    spring: { stiffness: 300, damping: 30 },
  }
);
```

### Step 4: Apply to Element

```typescript
<div
  ref={dragRef}
  style={{
    transform: `translate(var(${x.cssVarName}), var(${y.cssVarName}))`,
  }}
>
  Drag me!
</div>
```

---

## Complete Example

```typescript
import { useDrag } from '@cascade/motion-gestures';
import { useTranslateX, useTranslateY } from '@cascade/motion-runtime';

export function DraggableCard() {
  const x = useTranslateX(0);
  const y = useTranslateY(0);
  
  const dragRef = useDrag(
    { x, y },
    {
      spring: {
        stiffness: 300,
        damping: 30,
        from: 0,
        to: 0,
      },
    }
  );
  
  return (
    <div
      ref={dragRef}
      style={{
        transform: `translate(var(${x.cssVarName}), var(${y.cssVarName}))`,
        cursor: 'grab',
      }}
      onMouseDown={() => {
        document.body.style.cursor = 'grabbing';
      }}
      onMouseUp={() => {
        document.body.style.cursor = '';
      }}
    >
      Drag me around!
    </div>
  );
}
```

---

## Variations

### Constrain Drag Movement

Limit how far the element can be dragged:

```typescript
const dragRef = useDrag(
  { x, y },
  {
    constraints: {
      min: { x: -200, y: -200 },
      max: { x: 200, y: 200 },
    },
    spring: { stiffness: 300, damping: 30 },
  }
);
```

### Lock to Single Axis

Only allow horizontal or vertical dragging:

```typescript
// Horizontal only
const dragRef = useDrag(
  { x },
  {
    axis: 'x',
    spring: { stiffness: 300, damping: 30 },
  }
);

// Vertical only
const dragRef = useDrag(
  { y },
  {
    axis: 'y',
    spring: { stiffness: 300, damping: 30 },
  }
);
```

### Add Callbacks

Respond to drag events:

```typescript
const dragRef = useDrag(
  { x, y },
  {
    onStart: (state) => {
      console.log('Drag started', state.startPoint);
    },
    onMove: (state) => {
      console.log('Dragging', state.delta);
    },
    onEnd: (state) => {
      console.log('Drag ended', state.velocity);
    },
    spring: { stiffness: 300, damping: 30 },
  }
);
```

### Custom Spring Configuration

Adjust spring physics for different feels:

```typescript
// Bouncy spring
const dragRef = useDrag(
  { x, y },
  {
    spring: {
      stiffness: 400,
      damping: 20, // Lower damping = more bounce
    },
  }
);

// Stiff spring (less bounce)
const dragRef = useDrag(
  { x, y },
  {
    spring: {
      stiffness: 300,
      damping: 40, // Higher damping = less bounce
    },
  }
);
```

### Drag Threshold

Require minimum movement before drag starts:

```typescript
const dragRef = useDrag(
  { x, y },
  {
    threshold: 10, // 10px minimum movement
    spring: { stiffness: 300, damping: 30 },
  }
);
```

---

## Touch-Optimized Pan Gesture

For better touch responsiveness, use `usePan` instead:

```typescript
import { usePan } from '@cascade/motion-gestures';

const panRef = usePan(
  { x, y },
  {
    spring: { stiffness: 300, damping: 30 },
  }
);
```

`usePan` uses a lower threshold (5px) for better touch responsiveness.

---

## Advanced: Drag with Snap Points

Snap to specific positions when released:

```typescript
const x = useTranslateX(0);
const y = useTranslateY(0);

const dragRef = useDrag(
  { x, y },
  {
    onEnd: (state) => {
      // Snap to nearest 100px
      const snapX = Math.round(state.currentPoint.x / 100) * 100;
      const snapY = Math.round(state.currentPoint.y / 100) * 100;
      
      x.animateTo(snapX, { stiffness: 400, damping: 30 });
      y.animateTo(snapY, { stiffness: 400, damping: 30 });
    },
    spring: { stiffness: 300, damping: 30 },
  }
);
```

---

## Performance Tips

1. **Use transform**: Always use `transform` for position changes (not `left`/`top`)
2. **GPU acceleration**: Transform properties are GPU-accelerated
3. **Batch updates**: Motion values automatically batch updates
4. **Cleanup**: Gesture handlers clean up automatically on unmount

---

## Common Issues

### Element jumps on drag start

Make sure initial motion values match the element's initial position:

```typescript
// If element starts at (100, 100)
const x = useTranslateX(100);
const y = useTranslateY(100);
```

### Drag feels laggy

- Reduce spring damping for faster response
- Check for layout-triggering CSS properties
- Ensure you're using `transform`, not `left`/`top`

### Drag doesn't work on mobile

Use `usePan` instead of `useDrag` for better touch support, or ensure touch events are enabled.

---

## Related Guides

- [How to Add Hover Effect](./add-hover-effect.md)
- [Gestures Tutorial](../tutorials/gestures.md)
- [Gestures API Reference](../reference/gestures.md)
- [Motion Values API Reference](../reference/motion-values.md)

---

## See Also

- [useDrag API Reference](../reference/gestures.md#usedrag)
- [Gesture Configuration](../reference/gestures.md#gestureconfig)


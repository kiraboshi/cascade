# Gestures Tutorial

A step-by-step tutorial to master gesture-driven animations in Cascade Motion.

---

## What You'll Learn

By the end of this tutorial, you'll:
- ✅ Understand gesture hooks and how they work
- ✅ Create drag, hover, tap, and scroll interactions
- ✅ Combine gestures with motion values
- ✅ Handle gesture state and callbacks
- ✅ Optimize gesture performance

---

## Prerequisites

- Completed [Getting Started Tutorial](./getting-started.md)
- Completed [Motion Values Tutorial](./motion-values.md)
- Basic understanding of React hooks
- Familiarity with pointer events

---

## Step 1: Understanding Gestures

### What are Gestures?

Gestures are user interactions that trigger animations:
- **Drag** - Click and drag elements
- **Hover** - Mouse over/out
- **Tap** - Click/touch
- **Pan** - Touch drag
- **Scroll** - Scroll wheel or touch scroll
- **Wheel** - Mouse wheel
- **Focus** - Keyboard focus

### How Gestures Work

```typescript
// Gesture hooks return refs and state
const dragRef = useDrag({ x, y }, { /* config */ });

// Attach ref to element
<div ref={dragRef}>Draggable</div>

// Gesture updates motion values automatically
// Motion values update CSS custom properties
// CSS handles the visual animation
```

---

## Step 2: Creating Your First Drag Gesture

### Basic Drag

```typescript
import { useDrag } from '@cascade/motion-gestures';
import { useTranslateX, useTranslateY } from '@cascade/motion-runtime';

function DraggableBox() {
  const x = useTranslateX(0);
  const y = useTranslateY(0);
  
  const dragRef = useDrag({ x, y });
  
  return (
    <div
      ref={dragRef}
      style={{
        transform: `translate(var(${x.cssVarName}), var(${y.cssVarName}))`,
        cursor: 'grab',
      }}
    >
      Drag me!
    </div>
  );
}
```

### With Constraints

```typescript
const dragRef = useDrag({ x, y }, {
  constraints: {
    min: { x: -100, y: -100 },
    max: { x: 100, y: 100 },
  },
});
```

### With Spring Animation

```typescript
const dragRef = useDrag({ x, y }, {
  spring: {
    stiffness: 300,
    damping: 30,
  },
});
```

---

## Step 3: Hover Gestures

### Basic Hover Detection

```typescript
import { useHover } from '@cascade/motion-gestures';

function HoverableCard() {
  const [hoverRef, isHovering] = useHover();
  
  return (
    <div
      ref={hoverRef}
      style={{
        backgroundColor: isHovering ? 'blue' : 'gray',
      }}
    >
      {isHovering ? 'Hovering!' : 'Hover me'}
    </div>
  );
}
```

### Hover Animation

```typescript
import { useHoverAnimation } from '@cascade/motion-gestures';
import { useScale } from '@cascade/motion-runtime';

function HoverableCard() {
  const scale = useScale(1);
  
  const hoverRef = useHoverAnimation(scale, {
    onHoverStart: {
      target: 1.1,
      config: { stiffness: 300, damping: 20 },
    },
    onHoverEnd: {
      target: 1,
      config: { stiffness: 300, damping: 20 },
    },
  });
  
  return (
    <div
      ref={hoverRef}
      style={{ transform: `scale(var(${scale.cssVarName}))` }}
    >
      Hover me!
    </div>
  );
}
```

---

## Step 4: Tap Gestures

### Basic Tap Detection

```typescript
import { useTap } from '@cascade/motion-gestures';

function TappableButton() {
  const tapRef = useTap({
    onTap: (event) => {
      console.log('Tapped!', event);
    },
  });
  
  return (
    <button ref={tapRef}>
      Tap me!
    </button>
  );
}
```

### Tap Animation

```typescript
import { useTapAnimation } from '@cascade/motion-gestures';
import { useScale } from '@cascade/motion-runtime';

function TappableButton() {
  const scale = useScale(1);
  
  const tapRef = useTapAnimation(scale, {
    onTapStart: {
      target: 0.9,
      config: { duration: 100 },
    },
    onTapEnd: {
      target: 1,
      config: { stiffness: 400, damping: 25 },
    },
  });
  
  return (
    <button
      ref={tapRef}
      style={{ transform: `scale(var(${scale.cssVarName}))` }}
    >
      Tap me!
    </button>
  );
}
```

---

## Step 5: Scroll Gestures

### Scroll-Driven Animation

```typescript
import { useScrollMotion } from '@cascade/motion-gestures';
import { useTranslateY } from '@cascade/motion-runtime';

function ScrollParallax() {
  const y = useTranslateY(0);
  
  const scrollRef = useScrollMotion(y, {
    axis: 'y',
    multiplier: 0.5, // Move at half scroll speed
  });
  
  return (
    <div ref={scrollRef}>
      <div style={{ transform: `translateY(var(${y.cssVarName}))` }}>
        Parallax content
      </div>
    </div>
  );
}
```

### Wheel Gesture

```typescript
import { useWheel } from '@cascade/motion-gestures';
import { useTranslateY } from '@cascade/motion-runtime';

function WheelScroll() {
  const y = useTranslateY(0);
  
  const wheelRef = useWheel(y, {
    axis: 'y',
    multiplier: 1,
  });
  
  return (
    <div
      ref={wheelRef}
      style={{ transform: `translateY(var(${y.cssVarName}))` }}
    >
      Scroll with wheel
    </div>
  );
}
```

---

## Step 6: Combining Gestures

### Drag + Hover

```typescript
function InteractiveCard() {
  const x = useTranslateX(0);
  const y = useTranslateY(0);
  const scale = useScale(1);
  
  const dragRef = useDrag({ x, y });
  const hoverRef = useHoverAnimation(scale, {
    onHoverStart: { target: 1.1, config: { stiffness: 300 } },
    onHoverEnd: { target: 1, config: { stiffness: 300 } },
  });
  
  // Combine refs
  const combinedRef = (el: HTMLElement | null) => {
    if (dragRef.current) dragRef.current = el;
    if (hoverRef.current) hoverRef.current = el;
  };
  
  return (
    <div
      ref={combinedRef}
      style={{
        transform: `
          translate(var(${x.cssVarName}), var(${y.cssVarName}))
          scale(var(${scale.cssVarName}))
        `,
      }}
    >
      Drag and hover me!
    </div>
  );
}
```

---

## Step 7: Gesture State and Callbacks

### Accessing Gesture State

```typescript
const dragRef = useDrag({ x, y }, {
  onStart: (state, event) => {
    console.log('Drag started:', state);
    // state.delta, state.velocity, etc.
  },
  onMove: (state, event) => {
    console.log('Dragging:', state.delta);
  },
  onEnd: (state) => {
    console.log('Drag ended:', state.velocity);
  },
});
```

### Gesture State Properties

```typescript
interface GestureState {
  isActive: boolean;        // Is gesture currently active?
  delta: { x: number; y: number };  // Movement since start
  velocity: { x: number; y: number }; // Current velocity
  startPoint: { x: number; y: number }; // Starting position
  currentPoint: { x: number; y: number }; // Current position
}
```

---

## Step 8: Advanced Patterns

### Conditional Gestures

```typescript
const dragRef = useDrag({ x, y }, {
  disabled: !isDraggable,
  onStart: (state) => {
    if (state.delta.x < 0) {
      // Only allow dragging left
      return;
    }
  },
});
```

### Gesture Thresholds

```typescript
const dragRef = useDrag({ x, y }, {
  threshold: 10, // Don't start until moved 10px
});
```

### Velocity-Based Animations

```typescript
const dragRef = useDrag({ x, y }, {
  onEnd: (state) => {
    // Use velocity for spring animation
    x.animateTo(0, {
      stiffness: 300,
      damping: 30,
      initialVelocity: state.velocity.x,
    });
  },
});
```

---

## Common Patterns

### Pattern 1: Card Flip on Tap

```typescript
function FlipCard() {
  const rotateY = useRotate(0);
  
  const tapRef = useTapAnimation(rotateY, {
    onTap: () => {
      rotateY.animateTo(rotateY.get() + 180, { duration: 500 });
    },
  });
  
  return (
    <div
      ref={tapRef}
      style={{ transform: `rotateY(var(${rotateY.cssVarName}))` }}
    >
      Card content
    </div>
  );
}
```

### Pattern 2: Drag to Dismiss

```typescript
function DismissibleCard({ onDismiss }: { onDismiss: () => void }) {
  const x = useTranslateX(0);
  const opacity = useMotionValue(1, { property: 'opacity' });
  
  const dragRef = useDrag({ x }, {
    axis: 'x',
    onEnd: (state) => {
      if (Math.abs(state.delta.x) > 100) {
        // Dismiss
        Promise.all([
          x.animateTo(state.delta.x > 0 ? 500 : -500, { duration: 300 }),
          opacity.animateTo(0, { duration: 300 }),
        ]).then(() => {
          onDismiss();
        });
      } else {
        // Snap back
        x.animateTo(0, { stiffness: 300, damping: 30 });
      }
    },
  });
  
  return (
    <div
      ref={dragRef}
      style={{
        transform: `translateX(var(${x.cssVarName}))`,
        opacity: `var(${opacity.cssVarName})`,
      }}
    >
      Drag to dismiss
    </div>
  );
}
```

### Pattern 3: Scroll Reveal

```typescript
function ScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(0, { property: 'opacity' });
  const y = useTranslateY(50);
  
  useViewportAnimationWithRef(ref, opacity, {
    initial: 0,
    onEnter: { target: 1, config: { duration: 500 } },
  });
  
  useViewportAnimationWithRef(ref, y, {
    initial: 50,
    onEnter: { target: 0, config: { duration: 500 } },
  });
  
  return (
    <div
      ref={ref}
      style={{
        opacity: `var(${opacity.cssVarName})`,
        transform: `translateY(var(${y.cssVarName}))`,
      }}
    >
      Reveals on scroll
    </div>
  );
}
```

---

## Best Practices

### 1. Use Appropriate Gestures

```typescript
// ✅ Good: Hover for desktop
const hoverRef = useHoverAnimation(scale, { /* ... */ });

// ✅ Good: Tap for mobile
const tapRef = useTapAnimation(scale, { /* ... */ });
```

### 2. Provide Visual Feedback

```typescript
// ✅ Good: Cursor changes
<div ref={dragRef} style={{ cursor: 'grab' }}>
  Draggable
</div>

// ✅ Good: Visual state changes
<div ref={hoverRef} style={{ 
  backgroundColor: isHovering ? 'blue' : 'gray' 
}}>
  Hoverable
</div>
```

### 3. Handle Edge Cases

```typescript
const dragRef = useDrag({ x, y }, {
  constraints: {
    min: { x: 0, y: 0 },
    max: { x: window.innerWidth - 100, y: window.innerHeight - 100 },
  },
});
```

### 4. Clean Up

```typescript
// Gesture hooks automatically clean up on unmount
// But if you create custom handlers, clean them up:
useEffect(() => {
  const handleGesture = () => { /* ... */ };
  element.addEventListener('pointerdown', handleGesture);
  
  return () => {
    element.removeEventListener('pointerdown', handleGesture);
  };
}, []);
```

---

## Performance Tips

1. **Use GPU-accelerated properties** - `transform` and `opacity`
2. **Batch gesture updates** - Automatic with motion values
3. **Limit gesture handlers** - Don't attach too many
4. **Use thresholds** - Prevent accidental triggers
5. **Disable when not needed** - Use `disabled` prop

---

## Troubleshooting

### Gesture doesn't work

- Check that ref is properly attached
- Verify element is interactive (not `pointer-events: none`)
- Check `disabled` prop isn't set
- Verify motion values are set up correctly

### Gesture feels laggy

- Use GPU-accelerated properties
- Reduce animation duration
- Check for layout-triggering properties
- Limit simultaneous gestures

### Gesture conflicts

- Ensure refs are properly combined
- Check for overlapping gesture handlers
- Use appropriate thresholds
- Disable conflicting gestures

---

## Next Steps

- [Gestures API Reference](../reference/gestures.md) - Complete API documentation
- [How to Add Drag Gesture](../how-to/add-drag-gesture.md) - Practical examples
- [How to Add Hover Effect](../how-to/add-hover-effect.md) - Hover guide
- [Motion Values Tutorial](./motion-values.md) - Understanding motion values

---

## Summary

You've learned:
- ✅ What gestures are and how they work
- ✅ How to create drag, hover, tap, and scroll gestures
- ✅ How to combine gestures with motion values
- ✅ How to handle gesture state and callbacks
- ✅ Common patterns and best practices
- ✅ Performance optimization tips

**Ready for more?** Check out the [gestures API reference](../reference/gestures.md) or [how-to guides](../how-to/)!


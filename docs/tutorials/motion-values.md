# Motion Values Tutorial

A step-by-step tutorial to master motion values in Cascade Motion.

---

## What You'll Learn

By the end of this tutorial, you'll:
- ✅ Understand what motion values are and how they work
- ✅ Create and use motion values effectively
- ✅ Animate motion values with springs and keyframes
- ✅ Combine multiple motion values
- ✅ Use motion value helpers for common transforms

---

## Prerequisites

- Completed [Getting Started Tutorial](./getting-started.md)
- Basic understanding of React hooks
- Familiarity with CSS transforms and opacity

---

## Step 1: Understanding Motion Values

### What are Motion Values?

Motion values are reactive values that control CSS custom properties. They bridge JavaScript state and CSS animations, giving you:

- **JavaScript control** - Animate programmatically
- **CSS performance** - Animations run in CSS
- **Type safety** - Full TypeScript support

### How They Work

```typescript
// Create a motion value
const opacity = useMotionValue(0, { property: 'opacity' });

// Motion value creates a CSS custom property
// --motion-value-abc123: 0

// Use it in CSS
<div style={{ opacity: `var(${opacity.cssVarName})` }}>
  Content
</div>

// Update from JavaScript
opacity.set(1); // Updates CSS custom property automatically
```

---

## Step 2: Creating Your First Motion Value

### Basic Motion Value

```typescript
import { useMotionValue } from '@cascade/motion-runtime';

function MyComponent() {
  const opacity = useMotionValue(1, { property: 'opacity' });
  
  return (
    <div style={{ opacity: `var(${opacity.cssVarName})` }}>
      Content
    </div>
  );
}
```

### With Initial Value

```typescript
const opacity = useMotionValue(0, { property: 'opacity' });

// Later, animate to 1
opacity.animateTo(1, { duration: 300 });
```

---

## Step 3: Animating Motion Values

### Keyframe Animation

```typescript
const opacity = useMotionValue(0, { property: 'opacity' });

useEffect(() => {
  opacity.animateTo(1, {
    duration: 500,
    easing: 'ease-out',
  });
}, [opacity]);
```

### Spring Animation

```typescript
const x = useMotionValue(0, { property: 'x', unit: 'px' });

useEffect(() => {
  x.animateTo(100, {
    stiffness: 300,
    damping: 30,
  });
}, [x]);
```

### Awaiting Animation Completion

```typescript
const opacity = useMotionValue(0, { property: 'opacity' });

const handleClick = async () => {
  await opacity.animateTo(1, { duration: 300 });
  console.log('Animation complete!');
};
```

---

## Step 4: Using Helper Hooks

Cascade Motion provides helper hooks for common transforms:

### Translate Helpers

```typescript
import { useTranslateX, useTranslateY } from '@cascade/motion-runtime';

function MyComponent() {
  const x = useTranslateX(0);
  const y = useTranslateY(0);
  
  return (
    <div
      style={{
        transform: `translate(var(${x.cssVarName}), var(${y.cssVarName}))`,
      }}
    >
      Content
    </div>
  );
}
```

### Rotate Helper

```typescript
import { useRotate } from '@cascade/motion-runtime';

function MyComponent() {
  const rotate = useRotate(0);
  
  useEffect(() => {
    rotate.animateTo(360, { duration: 1000 });
  }, [rotate]);
  
  return (
    <div style={{ transform: `rotate(var(${rotate.cssVarName}))` }}>
      Rotating content
    </div>
  );
}
```

### Scale Helper

```typescript
import { useScale } from '@cascade/motion-runtime';

function MyComponent() {
  const scale = useScale(1);
  
  return (
    <div style={{ transform: `scale(var(${scale.cssVarName}))` }}>
      Scalable content
    </div>
  );
}
```

---

## Step 5: Combining Multiple Motion Values

### Multiple Transforms

```typescript
function ComplexAnimation() {
  const x = useTranslateX(0);
  const y = useTranslateY(0);
  const rotate = useRotate(0);
  const scale = useScale(1);
  
  useEffect(() => {
    // Animate all simultaneously
    Promise.all([
      x.animateTo(100, { duration: 500 }),
      y.animateTo(50, { duration: 500 }),
      rotate.animateTo(45, { duration: 500 }),
      scale.animateTo(1.2, { duration: 500 }),
    ]);
  }, [x, y, rotate, scale]);
  
  return (
    <div
      style={{
        transform: `
          translate(var(${x.cssVarName}), var(${y.cssVarName}))
          rotate(var(${rotate.cssVarName}))
          scale(var(${scale.cssVarName}))
        `,
      }}
    >
      Complex animation
    </div>
  );
}
```

**Note:** Transform values are automatically combined into a single CSS variable for optimal performance.

---

## Step 6: Listening to Changes

### onChange Callback

```typescript
const opacity = useMotionValue(0, { property: 'opacity' });

useEffect(() => {
  const unsubscribe = opacity.onChange((value) => {
    console.log('Opacity changed:', value);
  });
  
  return unsubscribe; // Cleanup
}, [opacity]);
```

### Animation State Changes

```typescript
const x = useTranslateX(0);

useEffect(() => {
  const unsubscribe = x.onAnimationStateChange((state) => {
    console.log('Animation state:', state);
  });
  
  return unsubscribe;
}, [x]);
```

---

## Step 7: Controlling Animations

### Play/Pause/Stop

```typescript
const x = useTranslateX(0);

const handleStart = () => {
  x.animateTo(100, { duration: 1000 });
};

const handlePause = () => {
  x.pause();
};

const handleResume = () => {
  x.play();
};

const handleStop = () => {
  x.stop();
};
```

### Seeking

```typescript
const x = useTranslateX(0);

// Seek to 50% progress
x.seek(0.5);

// Seek to specific time
x.seek({ time: 500 });

// Seek to specific progress
x.seek({ progress: 0.75 });
```

### Reversing

```typescript
const x = useTranslateX(0);

x.animateTo(100, { duration: 1000 });
x.reverse(); // Now animating back to 0
```

---

## Step 8: Advanced Patterns

### Conditional Animation

```typescript
function ConditionalAnimation({ isVisible }: { isVisible: boolean }) {
  const opacity = useMotionValue(isVisible ? 1 : 0, { property: 'opacity' });
  
  useEffect(() => {
    opacity.animateTo(isVisible ? 1 : 0, { duration: 300 });
  }, [isVisible, opacity]);
  
  return (
    <div style={{ opacity: `var(${opacity.cssVarName})` }}>
      {isVisible && 'Visible content'}
    </div>
  );
}
```

### Sequence Animation

```typescript
const x = useTranslateX(0);
const y = useTranslateY(0);

const sequence = async () => {
  await x.animateTo(100, { duration: 300 });
  await y.animateTo(100, { duration: 300 });
  await x.animateTo(0, { duration: 300 });
  await y.animateTo(0, { duration: 300 });
};
```

### Cleanup on Unmount

```typescript
useEffect(() => {
  const opacity = useMotionValue(0, { property: 'opacity' });
  
  return () => {
    opacity.destroy(); // Clean up
  };
}, []);
```

---

## Common Patterns

### Pattern 1: Fade In on Mount

```typescript
const opacity = useMotionValue(0, { property: 'opacity' });

useEffect(() => {
  opacity.animateTo(1, { duration: 300 });
}, [opacity]);
```

### Pattern 2: Spring Bounce

```typescript
const scale = useScale(1);

const handleClick = () => {
  scale.animateTo(1.2, {
    stiffness: 400,
    damping: 20, // Lower damping = more bounce
  });
  
  setTimeout(() => {
    scale.animateTo(1, { stiffness: 400, damping: 20 });
  }, 200);
};
```

### Pattern 3: Continuous Animation

```typescript
const rotate = useRotate(0);

useEffect(() => {
  const animate = async () => {
    while (true) {
      await rotate.animateTo(360, { duration: 2000 });
      rotate.set(0); // Reset for next loop
    }
  };
  
  animate();
}, [rotate]);
```

---

## Best Practices

1. **Use helper hooks** - `useTranslateX`, `useScale`, etc. for common transforms
2. **Combine transforms** - Multiple transform values are automatically combined
3. **Clean up** - Call `destroy()` on unmount for motion values created outside hooks
4. **Use CSS custom properties** - Always use `var(${motionValue.cssVarName})` in styles
5. **Check performance** - Use `isGPUAccelerated` and `triggersLayout` properties

---

## Next Steps

- [Gestures Tutorial](./gestures.md) - Learn about gesture-driven animations
- [Motion Values API Reference](../reference/motion-values.md) - Complete API documentation
- [How to Create Fade Animation](../how-to/create-fade-animation.md) - Practical examples

---

## Summary

You've learned:
- ✅ What motion values are and how they work
- ✅ How to create and use motion values
- ✅ How to animate with springs and keyframes
- ✅ How to combine multiple motion values
- ✅ How to control animations programmatically
- ✅ Common patterns and best practices

**Ready for more?** Check out the [gestures tutorial](./gestures.md) or [API reference](../reference/motion-values.md)!


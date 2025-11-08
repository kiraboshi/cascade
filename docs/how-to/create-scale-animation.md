# How to Create a Scale Animation

A step-by-step guide to creating scale animations with Cascade Motion.

---

## Goal

Create smooth scale-up/scale-down animations for elements.

---

## Solution

### Step 1: Import Required Hook

```typescript
import { useScale } from '@cascade/motion-runtime';
```

### Step 2: Create Motion Value

```typescript
const scale = useScale(1);
```

### Step 3: Animate on Mount

```typescript
useEffect(() => {
  scale.animateTo(1.2, { duration: 500, easing: 'ease-out' });
}, [scale]);
```

### Step 4: Apply to Element

```typescript
<div style={{ transform: `scale(var(${scale.cssVarName}))` }}>
  Scales up
</div>
```

---

## Complete Example: Scale Up on Mount

```typescript
import { useScale } from '@cascade/motion-runtime';
import { useEffect } from 'react';

function ScaleUp() {
  const scale = useScale(0); // Start at 0 (invisible)
  
  useEffect(() => {
    scale.animateTo(1, { duration: 500, easing: 'ease-out' });
  }, [scale]);
  
  return (
    <div style={{ transform: `scale(var(${scale.cssVarName}))` }}>
      Scales up from 0 to 1
    </div>
  );
}
```

---

## Variations

### Scale Down

```typescript
function ScaleDown() {
  const scale = useScale(1);
  
  useEffect(() => {
    scale.animateTo(0.5, { duration: 500, easing: 'ease-out' });
  }, [scale]);
  
  return (
    <div style={{ transform: `scale(var(${scale.cssVarName}))` }}>
      Scales down
    </div>
  );
}
```

### Scale with Spring

```typescript
function SpringScale() {
  const scale = useScale(0);
  
  useEffect(() => {
    scale.animateTo(1, {
      stiffness: 300,
      damping: 30,
    });
  }, [scale]);
  
  return (
    <div style={{ transform: `scale(var(${scale.cssVarName}))` }}>
      Spring scale
    </div>
  );
}
```

### Scale on Hover

```typescript
import { useHoverAnimation } from '@cascade/motion-gestures';

function ScaleOnHover() {
  const scale = useScale(1);
  
  const hoverRef = useHoverAnimation(scale, {
    onHoverStart: {
      target: 1.2,
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
      Hover to scale
    </div>
  );
}
```

### Scale on Tap

```typescript
import { useTapAnimation } from '@cascade/motion-gestures';

function ScaleOnTap() {
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
    <div
      ref={tapRef}
      style={{ transform: `scale(var(${scale.cssVarName}))` }}
    >
      Tap to scale
    </div>
  );
}
```

### Scale with Fade

```typescript
function ScaleWithFade() {
  const scale = useScale(0);
  const opacity = useMotionValue(0, { property: 'opacity' });
  
  useEffect(() => {
    scale.animateTo(1, { duration: 500, easing: 'ease-out' });
    opacity.animateTo(1, { duration: 500, easing: 'ease-out' });
  }, [scale, opacity]);
  
  return (
    <div
      style={{
        transform: `scale(var(${scale.cssVarName}))`,
        opacity: `var(${opacity.cssVarName})`,
      }}
    >
      Scales and fades in
    </div>
  );
}
```

### Pulse Animation

```typescript
function Pulse() {
  const scale = useScale(1);
  
  useEffect(() => {
    const pulse = async () => {
      while (true) {
        await scale.animateTo(1.1, { duration: 500, easing: 'ease-in-out' });
        await scale.animateTo(1, { duration: 500, easing: 'ease-in-out' });
      }
    };
    pulse();
  }, [scale]);
  
  return (
    <div style={{ transform: `scale(var(${scale.cssVarName}))` }}>
      Pulsing element
    </div>
  );
}
```

### Bounce Animation

```typescript
function Bounce() {
  const scale = useScale(0);
  
  useEffect(() => {
    // Bounce effect with spring
    scale.animateTo(1.2, {
      stiffness: 400,
      damping: 10, // Low damping = more bounce
    }).then(() => {
      scale.animateTo(1, {
        stiffness: 400,
        damping: 20,
      });
    });
  }, [scale]);
  
  return (
    <div style={{ transform: `scale(var(${scale.cssVarName}))` }}>
      Bounces in
    </div>
  );
}
```

### Scale X and Y Separately

```typescript
function ScaleXY() {
  const scaleX = useMotionValue(1, { property: 'scaleX' });
  const scaleY = useMotionValue(1, { property: 'scaleY' });
  
  useEffect(() => {
    scaleX.animateTo(1.2, { duration: 500 });
    scaleY.animateTo(0.8, { duration: 500 });
  }, [scaleX, scaleY]);
  
  return (
    <div
      style={{
        transform: `scaleX(var(${scaleX.cssVarName})) scaleY(var(${scaleY.cssVarName}))`,
      }}
    >
      Scales X and Y separately
    </div>
  );
}
```

### Conditional Scale

```typescript
function ConditionalScale({ isExpanded }: { isExpanded: boolean }) {
  const scale = useScale(isExpanded ? 1.2 : 1);
  
  useEffect(() => {
    scale.animateTo(isExpanded ? 1.2 : 1, { duration: 300 });
  }, [isExpanded, scale]);
  
  return (
    <div style={{ transform: `scale(var(${scale.cssVarName}))` }}>
      {isExpanded ? 'Expanded' : 'Normal'}
    </div>
  );
}
```

### Scale on Scroll

```typescript
import { useViewportAnimationWithRef } from '@cascade/motion-runtime';

function ScaleOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const scale = useScale(0.8);
  
  useViewportAnimationWithRef(ref, scale, {
    initial: 0.8,
    threshold: 0.2,
    onEnter: {
      target: 1,
      config: { duration: 500, easing: 'ease-out' },
    },
    once: true,
  });
  
  return (
    <div
      ref={ref}
      style={{ transform: `scale(var(${scale.cssVarName}))` }}
    >
      Scales up on scroll
    </div>
  );
}
```

---

## Performance Tips

1. **Use GPU-accelerated properties** - `transform: scale()` is GPU-accelerated
2. **Combine transforms** - Scale can be combined with translate/rotate
3. **Use appropriate easing** - `ease-out` feels natural for scale-up
4. **Limit scale range** - Don't scale too much (0.5-1.5 is usually enough)

---

## Common Issues

### Animation doesn't start

- Check that motion value is initialized correctly
- Verify `useEffect` dependencies
- Ensure element is mounted

### Element jumps

- Ensure initial value matches CSS
- Check for conflicting transforms
- Verify transform origin

### Scale feels unnatural

- Adjust easing function
- Use spring animation for more natural feel
- Consider scale range (too large feels unnatural)

---

## Transform Origin

Control where scaling happens from:

```typescript
<div
  style={{
    transform: `scale(var(${scale.cssVarName}))`,
    transformOrigin: 'top-left', // Scale from top-left
  }}
>
  Scales from top-left
</div>
```

**Available origins:**
- `center` (default)
- `top-left`
- `top-right`
- `bottom-left`
- `bottom-right`

---

## Related Guides

- [How to Create Fade Animation](./create-fade-animation.md) - Fade animations
- [How to Add Hover Effect](./add-hover-effect.md) - Hover effects
- [Motion Values Tutorial](../tutorials/motion-values.md) - Understanding motion values

---

## See Also

- [useScale API Reference](../reference/motion-values.md#usescale)
- [Motion Values Reference](../reference/motion-values.md) - Complete API
- [Gestures Reference](../reference/gestures.md) - Gesture hooks


# How to Add Hover Effect

A step-by-step guide to adding hover animations with Cascade Motion.

---

## Goal

Add smooth hover animations to elements.

---

## Solution

### Step 1: Import Required Hooks

```typescript
import { useHoverAnimation } from '@cascade/motion-gestures';
import { useScale } from '@cascade/motion-runtime';
```

### Step 2: Create Motion Value

```typescript
const scale = useScale(1);
```

### Step 3: Set Up Hover Animation

```typescript
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
```

### Step 4: Apply to Element

```typescript
<div
  ref={hoverRef}
  style={{ transform: `scale(var(${scale.cssVarName}))` }}
>
  Hover me
</div>
```

---

## Complete Example

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
      style={{
        transform: `scale(var(${scale.cssVarName}))`,
        transition: 'transform 0.2s',
      }}
    >
      Hover me!
    </div>
  );
}
```

---

## Variations

### Fade on Hover

```typescript
import { useHoverAnimation } from '@cascade/motion-gestures';
import { useMotionValue } from '@cascade/motion-runtime';

function FadeOnHover() {
  const opacity = useMotionValue(0.7, { property: 'opacity' });
  
  const hoverRef = useHoverAnimation(opacity, {
    onHoverStart: {
      target: 1,
      config: { duration: 200 },
    },
    onHoverEnd: {
      target: 0.7,
      config: { duration: 200 },
    },
  });
  
  return (
    <div
      ref={hoverRef}
      style={{ opacity: `var(${opacity.cssVarName})` }}
    >
      Hover to brighten
    </div>
  );
}
```

### Lift on Hover

```typescript
import { useHoverAnimation } from '@cascade/motion-gestures';
import { useTranslateY } from '@cascade/motion-runtime';

function LiftOnHover() {
  const y = useTranslateY(0);
  
  const hoverRef = useHoverAnimation(y, {
    onHoverStart: {
      target: -10,
      config: { stiffness: 400, damping: 25 },
    },
    onHoverEnd: {
      target: 0,
      config: { stiffness: 400, damping: 25 },
    },
  });
  
  return (
    <div
      ref={hoverRef}
      style={{
        transform: `translateY(var(${y.cssVarName}))`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      Lifts on hover
    </div>
  );
}
```

### Rotate on Hover

```typescript
import { useHoverAnimation } from '@cascade/motion-gestures';
import { useRotate } from '@cascade/motion-runtime';

function RotateOnHover() {
  const rotate = useRotate(0);
  
  const hoverRef = useHoverAnimation(rotate, {
    onHoverStart: {
      target: 5,
      config: { stiffness: 300, damping: 20 },
    },
    onHoverEnd: {
      target: 0,
      config: { stiffness: 300, damping: 20 },
    },
  });
  
  return (
    <div
      ref={hoverRef}
      style={{ transform: `rotate(var(${rotate.cssVarName}))` }}
    >
      Rotates on hover
    </div>
  );
}
```

### Multiple Properties

```typescript
function ComplexHover() {
  const scale = useScale(1);
  const y = useTranslateY(0);
  const opacity = useMotionValue(0.8, { property: 'opacity' });
  
  const hoverRef = useHoverAnimation(scale, {
    onHoverStart: {
      target: 1.05,
      config: { stiffness: 300, damping: 20 },
    },
    onHoverEnd: {
      target: 1,
      config: { stiffness: 300, damping: 20 },
    },
  });
  
  // Use multiple hover animations
  const hoverRef2 = useHoverAnimation(y, {
    onHoverStart: { target: -5, config: { stiffness: 300, damping: 20 } },
    onHoverEnd: { target: 0, config: { stiffness: 300, damping: 20 } },
  });
  
  const hoverRef3 = useHoverAnimation(opacity, {
    onHoverStart: { target: 1, config: { duration: 200 } },
    onHoverEnd: { target: 0.8, config: { duration: 200 } },
  });
  
  // Combine refs
  const combinedRef = (el: HTMLElement | null) => {
    if (hoverRef.current) hoverRef.current = el;
    if (hoverRef2.current) hoverRef2.current = el;
    if (hoverRef3.current) hoverRef3.current = el;
  };
  
  return (
    <div
      ref={combinedRef}
      style={{
        transform: `scale(var(${scale.cssVarName})) translateY(var(${y.cssVarName}))`,
        opacity: `var(${opacity.cssVarName})`,
      }}
    >
      Complex hover effect
    </div>
  );
}
```

### Keyframe Animation

```typescript
const hoverRef = useHoverAnimation(scale, {
  onHoverStart: {
    target: 1.1,
    config: { duration: 200, easing: 'ease-out' },
  },
  onHoverEnd: {
    target: 1,
    config: { duration: 200, easing: 'ease-in' },
  },
});
```

### Disable Hover

```typescript
const hoverRef = useHoverAnimation(scale, {
  disabled: !isInteractive,
  onHoverStart: {
    target: 1.1,
    config: { stiffness: 300, damping: 20 },
  },
  onHoverEnd: {
    target: 1,
    config: { stiffness: 300, damping: 20 },
  },
});
```

---

## Using with useHover Hook

For more control, use `useHover` to detect hover state:

```typescript
import { useHover } from '@cascade/motion-gestures';
import { useMotionValue } from '@cascade/motion-runtime';

function CustomHover() {
  const [hoverRef, isHovering] = useHover();
  const scale = useMotionValue(1, { property: 'scale' });
  
  useEffect(() => {
    if (isHovering) {
      scale.animateTo(1.1, { stiffness: 300, damping: 20 });
    } else {
      scale.animateTo(1, { stiffness: 300, damping: 20 });
    }
  }, [isHovering, scale]);
  
  return (
    <div
      ref={hoverRef}
      style={{ transform: `scale(var(${scale.cssVarName}))` }}
    >
      {isHovering ? 'Hovering!' : 'Hover me'}
    </div>
  );
}
```

---

## Performance Tips

1. **Use GPU-accelerated properties**: `transform` and `opacity` are GPU-accelerated
2. **Combine transforms**: Multiple transform values are automatically combined
3. **Spring vs keyframe**: Spring animations feel more natural, keyframes are faster
4. **Avoid layout-triggering**: Don't animate `width`, `height`, `margin`, etc.

---

## Common Issues

### Hover doesn't work on mobile

Hover effects work on touch devices, but consider using tap gestures for better mobile UX:

```typescript
import { useTapAnimation } from '@cascade/motion-gestures';

const tapRef = useTapAnimation(scale, {
  onTapStart: { target: 1.1, config: { duration: 100 } },
  onTapEnd: { target: 1, config: { stiffness: 400, damping: 25 } },
});
```

### Animation feels laggy

- Use spring animations instead of keyframes
- Reduce animation duration
- Check for layout-triggering properties

### Multiple hover animations conflict

Combine refs properly or use a single motion value with multiple properties.

---

## Related Guides

- [How to Add Tap Gesture](./add-tap-gesture.md)
- [Gestures Tutorial](../tutorials/gestures.md)
- [Gestures API Reference](../reference/gestures.md)

---

## See Also

- [useHoverAnimation API Reference](../reference/gestures.md#usehoveranimation)
- [useHover API Reference](../reference/gestures.md#usehover)


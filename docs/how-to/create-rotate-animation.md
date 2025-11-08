# How to Create a Rotate Animation

A step-by-step guide to creating rotation animations with Cascade Motion.

---

## Goal

Create smooth rotation animations for elements.

---

## Solution

### Step 1: Import Required Hook

```typescript
import { useRotate } from '@cascade/motion-runtime';
```

### Step 2: Create Motion Value

```typescript
const rotate = useRotate(0);
```

### Step 3: Animate on Mount

```typescript
useEffect(() => {
  rotate.animateTo(360, { duration: 1000, easing: 'ease-in-out' });
}, [rotate]);
```

### Step 4: Apply to Element

```typescript
<div style={{ transform: `rotate(var(${rotate.cssVarName}))` }}>
  Rotates
</div>
```

---

## Complete Example: Rotate 360 Degrees

```typescript
import { useRotate } from '@cascade/motion-runtime';
import { useEffect } from 'react';

function Rotate360() {
  const rotate = useRotate(0);
  
  useEffect(() => {
    rotate.animateTo(360, { duration: 1000, easing: 'ease-in-out' });
  }, [rotate]);
  
  return (
    <div style={{ transform: `rotate(var(${rotate.cssVarName}))` }}>
      Rotates 360 degrees
    </div>
  );
}
```

---

## Variations

### Continuous Rotation

```typescript
function ContinuousRotate() {
  const rotate = useRotate(0);
  
  useEffect(() => {
    const rotateContinuously = async () => {
      while (true) {
        await rotate.animateTo(360, { duration: 2000, easing: 'linear' });
        rotate.set(0); // Reset for next rotation
      }
    };
    rotateContinuously();
  }, [rotate]);
  
  return (
    <div style={{ transform: `rotate(var(${rotate.cssVarName}))` }}>
      Continuously rotating
    </div>
  );
}
```

### Rotate on Hover

```typescript
import { useHoverAnimation } from '@cascade/motion-gestures';

function RotateOnHover() {
  const rotate = useRotate(0);
  
  const hoverRef = useHoverAnimation(rotate, {
    onHoverStart: {
      target: 180,
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
      Hover to rotate
    </div>
  );
}
```

### Rotate on Tap

```typescript
import { useTapAnimation } from '@cascade/motion-gestures';

function RotateOnTap() {
  const rotate = useRotate(0);
  
  const tapRef = useTapAnimation(rotate, {
    onTapStart: {
      target: 90,
      config: { duration: 200 },
    },
    onTapEnd: {
      target: 0,
      config: { stiffness: 400, damping: 25 },
    },
  });
  
  return (
    <div
      ref={tapRef}
      style={{ transform: `rotate(var(${rotate.cssVarName}))` }}
    >
      Tap to rotate
    </div>
  );
}
```

### Spring Rotation

```typescript
function SpringRotate() {
  const rotate = useRotate(0);
  
  useEffect(() => {
    rotate.animateTo(360, {
      stiffness: 300,
      damping: 30,
    });
  }, [rotate]);
  
  return (
    <div style={{ transform: `rotate(var(${rotate.cssVarName}))` }}>
      Spring rotation
    </div>
  );
}
```

### Rotate with Scale

```typescript
function RotateWithScale() {
  const rotate = useRotate(0);
  const scale = useScale(1);
  
  useEffect(() => {
    rotate.animateTo(360, { duration: 1000, easing: 'ease-in-out' });
    scale.animateTo(1.2, { duration: 1000, easing: 'ease-in-out' });
  }, [rotate, scale]);
  
  return (
    <div
      style={{
        transform: `
          rotate(var(${rotate.cssVarName}))
          scale(var(${scale.cssVarName}))
        `,
      }}
    >
      Rotates and scales
    </div>
  );
}
```

### Flip Animation (180 degrees)

```typescript
function Flip() {
  const rotateY = useRotate(0); // Use rotateY for 3D flip
  
  const handleFlip = () => {
    rotateY.animateTo(rotateY.get() + 180, { duration: 500 });
  };
  
  return (
    <div
      onClick={handleFlip}
      style={{
        transform: `rotateY(var(${rotateY.cssVarName}))`,
        transformStyle: 'preserve-3d',
      }}
    >
      Click to flip
    </div>
  );
}
```

### Rotate X, Y, Z Separately

```typescript
function RotateXYZ() {
  const rotateX = useMotionValue(0, { property: 'rotateX' });
  const rotateY = useMotionValue(0, { property: 'rotateY' });
  const rotateZ = useRotate(0);
  
  useEffect(() => {
    rotateX.animateTo(45, { duration: 1000 });
    rotateY.animateTo(45, { duration: 1000 });
    rotateZ.animateTo(45, { duration: 1000 });
  }, [rotateX, rotateY, rotateZ]);
  
  return (
    <div
      style={{
        transform: `
          rotateX(var(${rotateX.cssVarName}))
          rotateY(var(${rotateY.cssVarName}))
          rotateZ(var(${rotateZ.cssVarName}))
        `,
        transformStyle: 'preserve-3d',
      }}
    >
      3D rotation
    </div>
  );
}
```

### Conditional Rotation

```typescript
function ConditionalRotate({ isOpen }: { isOpen: boolean }) {
  const rotate = useRotate(isOpen ? 90 : 0);
  
  useEffect(() => {
    rotate.animateTo(isOpen ? 90 : 0, { duration: 300 });
  }, [isOpen, rotate]);
  
  return (
    <div style={{ transform: `rotate(var(${rotate.cssVarName}))` }}>
      {isOpen ? '▼' : '▶'}
    </div>
  );
}
```

### Rotate on Scroll

```typescript
import { useViewportAnimationWithRef } from '@cascade/motion-runtime';

function RotateOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const rotate = useRotate(0);
  
  useViewportAnimationWithRef(ref, rotate, {
    initial: 0,
    threshold: 0.2,
    onEnter: {
      target: 360,
      config: { duration: 1000, easing: 'ease-out' },
    },
    once: true,
  });
  
  return (
    <div
      ref={ref}
      style={{ transform: `rotate(var(${rotate.cssVarName}))` }}
    >
      Rotates on scroll
    </div>
  );
}
```

### Spinner Loading Animation

```typescript
function Spinner() {
  const rotate = useRotate(0);
  
  useEffect(() => {
    const spin = async () => {
      while (true) {
        await rotate.animateTo(360, { duration: 1000, easing: 'linear' });
        rotate.set(0);
      }
    };
    spin();
  }, [rotate]);
  
  return (
    <div
      style={{
        transform: `rotate(var(${rotate.cssVarName}))`,
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
      }}
    />
  );
}
```

---

## Performance Tips

1. **Use GPU-accelerated properties** - `transform: rotate()` is GPU-accelerated
2. **Combine transforms** - Rotate can be combined with translate/scale
3. **Use linear easing** - For continuous rotation
4. **Limit rotation range** - Don't rotate too many times (use modulo)

---

## Common Issues

### Animation doesn't start

- Check that motion value is initialized correctly
- Verify `useEffect` dependencies
- Ensure element is mounted

### Continuous rotation resets

- Reset value to 0 after each rotation
- Or use modulo to keep value in range
- Consider using CSS animation for continuous rotation

### Element jumps

- Ensure initial value matches CSS
- Check for conflicting transforms
- Verify transform origin

---

## Transform Origin

Control where rotation happens from:

```typescript
<div
  style={{
    transform: `rotate(var(${rotate.cssVarName}))`,
    transformOrigin: 'center', // Rotate from center (default)
  }}
>
  Rotates from center
</div>
```

**Available origins:**
- `center` (default)
- `top-left`
- `top-right`
- `bottom-left`
- `bottom-right`
- Custom: `50% 50%`, `10px 20px`, etc.

---

## 3D Rotations

For 3D rotations, use `rotateX`, `rotateY`, and `rotateZ`:

```typescript
function Rotate3D() {
  const rotateX = useMotionValue(0, { property: 'rotateX' });
  const rotateY = useMotionValue(0, { property: 'rotateY' });
  
  useEffect(() => {
    rotateX.animateTo(45, { duration: 1000 });
    rotateY.animateTo(45, { duration: 1000 });
  }, [rotateX, rotateY]);
  
  return (
    <div
      style={{
        transform: `
          rotateX(var(${rotateX.cssVarName}))
          rotateY(var(${rotateY.cssVarName}))
        `,
        transformStyle: 'preserve-3d',
      }}
    >
      3D rotation
    </div>
  );
}
```

---

## Related Guides

- [How to Create Scale Animation](./create-scale-animation.md) - Scale animations
- [How to Add Hover Effect](./add-hover-effect.md) - Hover effects
- [Motion Values Tutorial](../tutorials/motion-values.md) - Understanding motion values

---

## See Also

- [useRotate API Reference](../reference/motion-values.md#userotate)
- [Motion Values Reference](../reference/motion-values.md) - Complete API
- [Gestures Reference](../reference/gestures.md) - Gesture hooks


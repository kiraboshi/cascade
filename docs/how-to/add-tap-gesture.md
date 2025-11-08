# How to Add a Tap Gesture

A step-by-step guide to adding tap/click animations with Cascade Motion.

---

## Goal

Add smooth tap/click animations to elements.

---

## Solution

### Step 1: Import Required Hooks

```typescript
import { useTapAnimation } from '@cascade/motion-gestures';
import { useScale } from '@cascade/motion-runtime';
```

### Step 2: Create Motion Value

```typescript
const scale = useScale(1);
```

### Step 3: Set Up Tap Animation

```typescript
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
```

### Step 4: Apply to Element

```typescript
<div
  ref={tapRef}
  style={{ transform: `scale(var(${scale.cssVarName}))` }}
>
  Tap me
</div>
```

---

## Complete Example

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

## Variations

### Tap with Opacity

```typescript
function TapWithOpacity() {
  const opacity = useMotionValue(1, { property: 'opacity' });
  
  const tapRef = useTapAnimation(opacity, {
    onTapStart: {
      target: 0.7,
      config: { duration: 100 },
    },
    onTapEnd: {
      target: 1,
      config: { duration: 200 },
    },
  });
  
  return (
    <div
      ref={tapRef}
      style={{ opacity: `var(${opacity.cssVarName})` }}
    >
      Tap to dim
    </div>
  );
}
```

### Tap with Rotation

```typescript
function TapWithRotation() {
  const rotate = useRotate(0);
  
  const tapRef = useTapAnimation(rotate, {
    onTapStart: {
      target: 15,
      config: { duration: 100 },
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

### Tap with Callback

```typescript
function TapWithCallback() {
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
    onTap: (event) => {
      console.log('Tapped!', event);
      // Handle tap action
    },
  });
  
  return (
    <div
      ref={tapRef}
      style={{ transform: `scale(var(${scale.cssVarName}))` }}
    >
      Tap me
    </div>
  );
}
```

### Tap Detection Only

```typescript
import { useTap } from '@cascade/motion-gestures';

function TapDetection() {
  const tapRef = useTap({
    onTap: (event) => {
      console.log('Tapped!', event);
    },
    onTapStart: (event) => {
      console.log('Tap started', event);
    },
    onTapCancel: (event) => {
      console.log('Tap cancelled', event);
    },
  });
  
  return (
    <div ref={tapRef}>
      Tap to detect
    </div>
  );
}
```

### Tap State

```typescript
import { useTapState } from '@cascade/motion-gestures';

function TapState() {
  const [tapRef, tapState] = useTapState();
  
  return (
    <div
      ref={tapRef}
      style={{
        backgroundColor: tapState.isTapping ? 'blue' : 'gray',
      }}
    >
      {tapState.isTapping ? 'Tapping...' : 'Tap me'}
      <p>Tap count: {tapState.tapCount}</p>
    </div>
  );
}
```

### Double Tap

```typescript
function DoubleTap() {
  const scale = useScale(1);
  const [tapCount, setTapCount] = useState(0);
  
  const tapRef = useTapAnimation(scale, {
    onTapStart: {
      target: 0.9,
      config: { duration: 100 },
    },
    onTapEnd: {
      target: 1,
      config: { stiffness: 400, damping: 25 },
    },
    onTap: () => {
      setTapCount(prev => prev + 1);
      if (tapCount === 1) {
        // Double tap detected
        scale.animateTo(1.2, { duration: 300 });
        setTimeout(() => {
          scale.animateTo(1, { duration: 300 });
        }, 300);
        setTapCount(0);
      } else {
        setTimeout(() => setTapCount(0), 300);
      }
    },
    tapTimeout: 300,
  });
  
  return (
    <div
      ref={tapRef}
      style={{ transform: `scale(var(${scale.cssVarName}))` }}
    >
      Double tap me
    </div>
  );
}
```

### Tap Threshold

```typescript
function TapWithThreshold() {
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
    tapThreshold: 10, // Only trigger if moved less than 10px
  });
  
  return (
    <div
      ref={tapRef}
      style={{ transform: `scale(var(${scale.cssVarName}))` }}
    >
      Tap (with threshold)
    </div>
  );
}
```

### Disable Tap

```typescript
function ConditionalTap({ isDisabled }: { isDisabled: boolean }) {
  const scale = useScale(1);
  
  const tapRef = useTapAnimation(scale, {
    disabled: isDisabled,
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
      style={{
        transform: `scale(var(${scale.cssVarName}))`,
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      {isDisabled ? 'Disabled' : 'Tap me'}
    </div>
  );
}
```

### Multiple Properties

```typescript
function ComplexTap() {
  const scale = useScale(1);
  const rotate = useRotate(0);
  const opacity = useMotionValue(1, { property: 'opacity' });
  
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
  
  // Use multiple tap animations
  const tapRef2 = useTapAnimation(rotate, {
    onTapStart: { target: 15, config: { duration: 100 } },
    onTapEnd: { target: 0, config: { stiffness: 400, damping: 25 } },
  });
  
  const tapRef3 = useTapAnimation(opacity, {
    onTapStart: { target: 0.7, config: { duration: 100 } },
    onTapEnd: { target: 1, config: { duration: 200 } },
  });
  
  // Combine refs
  const combinedRef = (el: HTMLElement | null) => {
    if (tapRef.current) tapRef.current = el;
    if (tapRef2.current) tapRef2.current = el;
    if (tapRef3.current) tapRef3.current = el;
  };
  
  return (
    <div
      ref={combinedRef}
      style={{
        transform: `
          scale(var(${scale.cssVarName}))
          rotate(var(${rotate.cssVarName}))
        `,
        opacity: `var(${opacity.cssVarName})`,
      }}
    >
      Complex tap
    </div>
  );
}
```

---

## Performance Tips

1. **Use GPU-accelerated properties** - `transform` and `opacity` are GPU-accelerated
2. **Keep animations short** - Tap animations should be quick (< 200ms)
3. **Use spring for bounce** - Spring animations feel more natural
4. **Combine transforms** - Multiple transform values are automatically combined

---

## Common Issues

### Tap doesn't work on mobile

- Tap gestures work on both desktop and mobile
- Ensure element is interactive (not `pointer-events: none`)
- Check `disabled` prop isn't set

### Animation feels laggy

- Use GPU-accelerated properties
- Reduce animation duration
- Check for layout-triggering properties

### Multiple taps trigger too fast

- Use `tapTimeout` to prevent rapid taps
- Debounce tap handler
- Use tap count to detect double taps

---

## Related Guides

- [How to Add Hover Effect](./add-hover-effect.md) - Hover effects
- [Gestures Tutorial](../tutorials/gestures.md) - Gestures tutorial
- [Gestures API Reference](../reference/gestures.md) - Complete API

---

## See Also

- [useTapAnimation API Reference](../reference/gestures.md#usetapanimation)
- [useTap API Reference](../reference/gestures.md#usetap)
- [useTapState API Reference](../reference/gestures.md#usetapstate)


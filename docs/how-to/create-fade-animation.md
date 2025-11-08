# How to Create a Fade Animation

A step-by-step guide to creating fade in/out animations with Cascade Motion.

---

## Goal

Create a component that fades in when it mounts and optionally fades out when it unmounts.

---

## Solution

### Step 1: Import Required Hooks

```typescript
import { useMotionValue } from '@cascade/motion-runtime';
import { useEffect } from 'react';
```

### Step 2: Create a Motion Value for Opacity

```typescript
const opacity = useMotionValue(0, { property: 'opacity' });
```

This creates a motion value starting at `0` (fully transparent) that controls the `opacity` CSS property.

### Step 3: Animate on Mount

```typescript
useEffect(() => {
  opacity.animateTo(1, {
    duration: 500,
    easing: 'ease-out',
  });
}, [opacity]);
```

This animates the opacity from `0` to `1` (fully opaque) when the component mounts.

### Step 4: Apply to Element

```typescript
<div
  style={{
    opacity: `var(${opacity.cssVarName})`,
  }}
>
  Content that fades in
</div>
```

---

## Complete Example

```typescript
import { useMotionValue } from '@cascade/motion-runtime';
import { useEffect } from 'react';

export function FadeIn() {
  const opacity = useMotionValue(0, { property: 'opacity' });
  
  useEffect(() => {
    opacity.animateTo(1, {
      duration: 500,
      easing: 'ease-out',
    });
  }, [opacity]);
  
  return (
    <div
      style={{
        opacity: `var(${opacity.cssVarName})`,
      }}
    >
      This content fades in!
    </div>
  );
}
```

---

## Variations

### Fade In with Spring Animation

```typescript
useEffect(() => {
  opacity.animateTo(1, {
    stiffness: 300,
    damping: 30,
  });
}, [opacity]);
```

### Fade Out on Unmount

```typescript
useEffect(() => {
  opacity.animateTo(1, { duration: 500 });
  
  return () => {
    // Fade out before unmount
    opacity.animateTo(0, { duration: 300 });
  };
}, [opacity]);
```

**Note:** For proper exit animations, consider using [`AnimatePresence`](../reference/animate-presence.md).

### Fade In on Scroll

```typescript
import { useFadeInOnScroll } from '@cascade/motion-runtime';

export function FadeInOnScroll() {
  const opacity = useMotionValue(0, { property: 'opacity' });
  
  useFadeInOnScroll(opacity, {
    threshold: 0.5, // Start fading when 50% visible
  });
  
  return (
    <div style={{ opacity: `var(${opacity.cssVarName})` }}>
      Fades in when scrolled into view
    </div>
  );
}
```

### Conditional Fade

```typescript
function ConditionalFade({ show }: { show: boolean }) {
  const opacity = useMotionValue(show ? 1 : 0, { property: 'opacity' });
  
  useEffect(() => {
    opacity.animateTo(show ? 1 : 0, { duration: 300 });
  }, [show, opacity]);
  
  return (
    <div style={{ opacity: `var(${opacity.cssVarName})` }}>
      {show && 'Visible content'}
    </div>
  );
}
```

---

## Using with AnimatePresence

For proper enter/exit animations:

```typescript
import { AnimatePresence } from '@cascade/motion-runtime';

function List({ items }: { items: string[] }) {
  return (
    <AnimatePresence
      enter={{ opacity: 0 }}
      exit={{ opacity: 0, config: { duration: 200 } }}
    >
      {items.map(item => (
        <div key={item}>{item}</div>
      ))}
    </AnimatePresence>
  );
}
```

---

## Performance Tips

1. **Use GPU-accelerated properties**: Opacity is GPU-accelerated, so it's very performant
2. **Avoid layout-triggering properties**: Stick to `opacity` and `transform` for best performance
3. **Batch updates**: Motion values automatically batch updates using `requestAnimationFrame`

---

## Related Guides

- [How to Create Slide Animation](./create-slide-animation.md)
- [How to Animate on Scroll](./animate-on-scroll.md)
- [Motion Values Tutorial](../tutorials/motion-values.md)
- [Motion Values API Reference](../reference/motion-values.md)

---

## Troubleshooting

### Animation not working?

- Make sure you're using `var(${opacity.cssVarName})` in your styles
- Check that the motion value is being updated (add `onChange` callback to debug)
- Verify the element is actually rendering

### Animation too fast/slow?

- Adjust the `duration` (in milliseconds)
- Try different `easing` functions: `'ease-in'`, `'ease-out'`, `'ease-in-out'`, `'linear'`
- Use spring animation for more natural motion

### Flickering on mount?

- Make sure initial value matches the starting state
- Consider using CSS to set initial opacity: `style={{ opacity: 0, ... }}`


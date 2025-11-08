# How to Animate on Scroll

A step-by-step guide to creating scroll-triggered animations with Cascade Motion.

---

## Goal

Create elements that animate when they scroll into view.

---

## Solution

### Step 1: Import Required Hooks

```typescript
import { useFadeInOnScroll } from '@cascade/motion-runtime';
import { useRef } from 'react';
```

### Step 2: Create Element Ref

```typescript
const ref = useRef<HTMLDivElement>(null);
```

### Step 3: Apply Scroll Animation

```typescript
useFadeInOnScroll(ref, {
  threshold: 0.2,
  duration: 500,
  once: true,
});
```

### Step 4: Attach Ref to Element

```typescript
<div ref={ref}>
  Content that fades in on scroll
</div>
```

---

## Complete Example: Fade In

```typescript
import { useFadeInOnScroll } from '@cascade/motion-runtime';
import { useRef } from 'react';

function FadeInSection() {
  const ref = useRef<HTMLDivElement>(null);
  
  useFadeInOnScroll(ref, {
    threshold: 0.2,  // Start animating when 20% visible
    duration: 500,   // Animation duration
    once: true,      // Only animate once
  });
  
  return (
    <div ref={ref}>
      <h2>Section Title</h2>
      <p>This content fades in when scrolled into view.</p>
    </div>
  );
}
```

---

## Variations

### Slide In from Different Directions

```typescript
import { useSlideInOnScroll } from '@cascade/motion-runtime';

function SlideInSection() {
  const ref = useRef<HTMLDivElement>(null);
  
  const { x, y } = useSlideInOnScroll(ref, {
    direction: 'up',    // 'up' | 'down' | 'left' | 'right'
    distance: 50,        // Distance in pixels
    duration: 600,
    threshold: 0.2,
    once: true,
  });
  
  return (
    <div
      ref={ref}
      style={{
        transform: `translate(var(${x.cssVarName}), var(${y.cssVarName}))`,
      }}
    >
      Slides in from below
    </div>
  );
}
```

### Custom Viewport Animation

```typescript
import { useViewportAnimationWithRef } from '@cascade/motion-runtime';
import { useMotionValue, useTranslateY } from '@cascade/motion-runtime';

function CustomScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(0, { property: 'opacity' });
  const y = useTranslateY(50);
  
  useViewportAnimationWithRef(ref, opacity, {
    initial: 0,
    threshold: 0.3,
    onEnter: {
      target: 1,
      config: { duration: 500, easing: 'ease-out' },
    },
    once: true,
  });
  
  useViewportAnimationWithRef(ref, y, {
    initial: 50,
    threshold: 0.3,
    onEnter: {
      target: 0,
      config: { stiffness: 300, damping: 30 },
    },
    once: true,
  });
  
  return (
    <div
      ref={ref}
      style={{
        opacity: `var(${opacity.cssVarName})`,
        transform: `translateY(var(${y.cssVarName}))`,
      }}
    >
      Custom animation
    </div>
  );
}
```

### Animate Multiple Elements

```typescript
function ScrollRevealList({ items }: { items: string[] }) {
  return (
    <div>
      {items.map((item, i) => (
        <ScrollRevealItem key={item} delay={i * 100}>
          {item}
        </ScrollRevealItem>
      ))}
    </div>
  );
}

function ScrollRevealItem({ 
  children, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(0, { property: 'opacity' });
  const y = useTranslateY(30);
  
  useViewportAnimationWithRef(ref, opacity, {
    initial: 0,
    onEnter: {
      target: 1,
      config: { duration: 400, easing: 'ease-out' },
    },
    once: true,
  });
  
  useViewportAnimationWithRef(ref, y, {
    initial: 30,
    onEnter: {
      target: 0,
      config: { duration: 400, easing: 'ease-out' },
    },
    once: true,
  });
  
  return (
    <div
      ref={ref}
      style={{
        opacity: `var(${opacity.cssVarName})`,
        transform: `translateY(var(${y.cssVarName}))`,
      }}
    >
      {children}
    </div>
  );
}
```

### Spring Animation

```typescript
useFadeInOnScroll(ref, {
  threshold: 0.2,
  useSpring: true,
  spring: {
    stiffness: 300,
    damping: 30,
  },
  once: true,
});
```

### Animate on Exit

```typescript
useViewportAnimationWithRef(ref, opacity, {
  initial: 1,
  threshold: 0.5,
  onEnter: {
    target: 1,
    config: { duration: 300 },
  },
  onExit: {
    target: 0,
    config: { duration: 300 },
  },
  once: false, // Allow multiple triggers
});
```

### Custom Threshold

```typescript
// Trigger when 50% visible
useFadeInOnScroll(ref, {
  threshold: 0.5,
  duration: 500,
});

// Trigger when fully visible
useFadeInOnScroll(ref, {
  amount: 'all',
  duration: 500,
});

// Trigger when any part is visible
useFadeInOnScroll(ref, {
  amount: 'some',
  duration: 500,
});
```

### With Root Margin

```typescript
// Start animating 100px before element enters viewport
useFadeInOnScroll(ref, {
  rootMargin: '100px',
  threshold: 0,
  duration: 500,
});
```

---

## Performance Tips

1. **Use `once: true`**: For one-time animations, set `once: true` to prevent re-triggering
2. **Batch animations**: Use `useBatchLayoutTransition` for multiple elements
3. **GPU acceleration**: Slide animations use `transform`, which is GPU-accelerated
4. **Threshold tuning**: Adjust threshold to balance visibility and performance

---

## Common Issues

### Animation doesn't trigger

- Check that `threshold` is appropriate (try `0` or `0.1`)
- Verify element is actually scrolling into view
- Ensure ref is properly attached

### Animation triggers too early/late

- Adjust `threshold` value (lower = earlier, higher = later)
- Use `rootMargin` to offset trigger point
- Try different `amount` values (`'some'` vs `'all'`)

### Animation repeats

- Set `once: true` to prevent re-triggering
- Check that element isn't rapidly entering/leaving viewport

---

## Related Guides

- [How to Create Fade Animation](./create-fade-animation.md)
- [How to Create Slide Animation](./create-slide-animation.md)
- [Viewport Animations API Reference](../reference/viewport-animations.md)

---

## See Also

- [useFadeInOnScroll API Reference](../reference/viewport-animations.md#usefadeinonscroll)
- [useSlideInOnScroll API Reference](../reference/viewport-animations.md#useslideinonscroll)
- [useViewportAnimationWithRef API Reference](../reference/viewport-animations.md#useviewportanimationwithref)


# How to Create a Slide Animation

A step-by-step guide to creating slide animations with Cascade Motion.

---

## Goal

Create smooth slide-in/slide-out animations for elements.

---

## Solution

### Step 1: Import Required Hooks

```typescript
import { useTranslateX, useTranslateY } from '@cascade/motion-runtime';
```

### Step 2: Create Motion Values

```typescript
const x = useTranslateX(0);
const y = useTranslateY(0);
```

### Step 3: Animate on Mount

```typescript
useEffect(() => {
  x.animateTo(100, { duration: 500, easing: 'ease-out' });
}, [x]);
```

### Step 4: Apply to Element

```typescript
<div style={{ transform: `translateX(var(${x.cssVarName}))` }}>
  Slides in from left
</div>
```

---

## Complete Example: Slide In from Left

```typescript
import { useTranslateX } from '@cascade/motion-runtime';
import { useEffect } from 'react';

function SlideInFromLeft() {
  const x = useTranslateX(-100); // Start off-screen
  
  useEffect(() => {
    x.animateTo(0, { duration: 500, easing: 'ease-out' });
  }, [x]);
  
  return (
    <div style={{ transform: `translateX(var(${x.cssVarName}))` }}>
      Slides in from left
    </div>
  );
}
```

---

## Variations

### Slide In from Right

```typescript
function SlideInFromRight() {
  const x = useTranslateX(100); // Start off-screen right
  
  useEffect(() => {
    x.animateTo(0, { duration: 500, easing: 'ease-out' });
  }, [x]);
  
  return (
    <div style={{ transform: `translateX(var(${x.cssVarName}))` }}>
      Slides in from right
    </div>
  );
}
```

### Slide In from Top

```typescript
function SlideInFromTop() {
  const y = useTranslateY(-100); // Start off-screen top
  
  useEffect(() => {
    y.animateTo(0, { duration: 500, easing: 'ease-out' });
  }, [y]);
  
  return (
    <div style={{ transform: `translateY(var(${y.cssVarName}))` }}>
      Slides in from top
    </div>
  );
}
```

### Slide In from Bottom

```typescript
function SlideInFromBottom() {
  const y = useTranslateY(100); // Start off-screen bottom
  
  useEffect(() => {
    y.animateTo(0, { duration: 500, easing: 'ease-out' });
  }, [y]);
  
  return (
    <div style={{ transform: `translateY(var(${y.cssVarName}))` }}>
      Slides in from bottom
    </div>
  );
}
```

### Diagonal Slide

```typescript
function DiagonalSlide() {
  const x = useTranslateX(-100);
  const y = useTranslateY(-100);
  
  useEffect(() => {
    x.animateTo(0, { duration: 500, easing: 'ease-out' });
    y.animateTo(0, { duration: 500, easing: 'ease-out' });
  }, [x, y]);
  
  return (
    <div
      style={{
        transform: `translate(var(${x.cssVarName}), var(${y.cssVarName}))`,
      }}
    >
      Slides in diagonally
    </div>
  );
}
```

### Spring Animation

```typescript
function SpringSlide() {
  const x = useTranslateX(-100);
  
  useEffect(() => {
    x.animateTo(0, {
      stiffness: 300,
      damping: 30,
    });
  }, [x]);
  
  return (
    <div style={{ transform: `translateX(var(${x.cssVarName}))` }}>
      Spring slide
    </div>
  );
}
```

### Slide with Fade

```typescript
function SlideWithFade() {
  const x = useTranslateX(-100);
  const opacity = useMotionValue(0, { property: 'opacity' });
  
  useEffect(() => {
    x.animateTo(0, { duration: 500, easing: 'ease-out' });
    opacity.animateTo(1, { duration: 500, easing: 'ease-out' });
  }, [x, opacity]);
  
  return (
    <div
      style={{
        transform: `translateX(var(${x.cssVarName}))`,
        opacity: `var(${opacity.cssVarName})`,
      }}
    >
      Slides and fades in
    </div>
  );
}
```

### Conditional Slide

```typescript
function ConditionalSlide({ isVisible }: { isVisible: boolean }) {
  const x = useTranslateX(isVisible ? 0 : -100);
  
  useEffect(() => {
    x.animateTo(isVisible ? 0 : -100, { duration: 500 });
  }, [isVisible, x]);
  
  return (
    <div style={{ transform: `translateX(var(${x.cssVarName}))` }}>
      {isVisible && 'Visible content'}
    </div>
  );
}
```

### Slide Out Animation

```typescript
function SlideOut({ onComplete }: { onComplete: () => void }) {
  const x = useTranslateX(0);
  
  const handleSlideOut = async () => {
    await x.animateTo(-100, { duration: 300, easing: 'ease-in' });
    onComplete();
  };
  
  return (
    <div style={{ transform: `translateX(var(${x.cssVarName}))` }}>
      <button onClick={handleSlideOut}>Slide Out</button>
    </div>
  );
}
```

### Staggered Slide (Multiple Elements)

```typescript
function StaggeredSlide({ items }: { items: string[] }) {
  const refs = items.map(() => useRef<HTMLDivElement>(null));
  
  useEffect(() => {
    items.forEach((_, i) => {
      const x = useTranslateX(-100);
      setTimeout(() => {
        x.animateTo(0, { duration: 500, easing: 'ease-out' });
      }, i * 100); // Stagger by 100ms
    });
  }, [items]);
  
  return (
    <div>
      {items.map((item, i) => (
        <div key={item} ref={refs[i]}>
          {item}
        </div>
      ))}
    </div>
  );
}
```

### Slide on Scroll

```typescript
import { useSlideInOnScroll } from '@cascade/motion-runtime';

function SlideOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = useSlideInOnScroll(ref, {
    direction: 'up',
    distance: 50,
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
      Slides in on scroll
    </div>
  );
}
```

---

## Performance Tips

1. **Use GPU-accelerated properties** - `transform` is GPU-accelerated
2. **Combine transforms** - Multiple transform values are automatically combined
3. **Use appropriate easing** - `ease-out` feels natural for slides
4. **Limit distance** - Don't slide too far (100-200px is usually enough)

---

## Common Issues

### Animation doesn't start

- Check that motion value is initialized correctly
- Verify `useEffect` dependencies
- Ensure element is mounted

### Animation is janky

- Use GPU-accelerated properties (`transform`)
- Avoid layout-triggering properties
- Check animation duration isn't too long

### Element jumps

- Ensure initial value matches CSS
- Check for conflicting transforms
- Verify transform origin

---

## Related Guides

- [How to Create Fade Animation](./create-fade-animation.md) - Fade animations
- [How to Animate on Scroll](./animate-on-scroll.md) - Scroll-triggered animations
- [Motion Values Tutorial](../tutorials/motion-values.md) - Understanding motion values

---

## See Also

- [useTranslateX API Reference](../reference/motion-values.md#usetranslatex)
- [useTranslateY API Reference](../reference/motion-values.md#usetranslatey)
- [Motion Values Reference](../reference/motion-values.md) - Complete API


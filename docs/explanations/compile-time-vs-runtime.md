# Compile-Time vs Runtime Animations

Understanding when to use compile-time animations versus runtime animations in Cascade Motion.

---

## Overview

Cascade Motion supports two approaches to animations:

1. **Compile-time animations** - Defined at build time using `defineMotion`
2. **Runtime animations** - Controlled dynamically using motion values and hooks

Each approach has its strengths and use cases.

---

## Compile-Time Animations

### What They Are

Compile-time animations are defined using `defineMotion` and generate CSS at build time:

```typescript
import { defineMotion } from '@cascade/compiler';

const fadeIn = defineMotion({
  type: 'spring',
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});

// Generates CSS:
// .motion-fade-in { animation: ... }
```

### Characteristics

- ✅ **Zero runtime cost** - CSS handles everything
- ✅ **Smaller bundle** - No JavaScript animation code
- ✅ **Better performance** - Runs on compositor thread
- ✅ **Static** - Values are fixed at build time
- ⚠️ **Less flexible** - Can't change values dynamically

### When to Use

- **Static animations** - Values don't change
- **Performance-critical** - Need maximum performance
- **Simple animations** - Fade, slide, scale
- **Design system** - Consistent animations across app

### Example

```typescript
const fadeIn = defineMotion({
  type: 'spring',
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});

// Inject CSS
useEffect(() => {
  const style = document.createElement('style');
  style.textContent = fadeIn.css;
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
  };
}, []);

// Use class name
<div className={fadeIn.className}>
  Content
</div>
```

---

## Runtime Animations

### What They Are

Runtime animations are controlled dynamically using motion values:

```typescript
import { useMotionValue } from '@cascade/motion-runtime';

const opacity = useMotionValue(0, { property: 'opacity' });

// Animate dynamically
opacity.animateTo(1, { duration: 300 });
```

### Characteristics

- ✅ **Flexible** - Values can change dynamically
- ✅ **Interactive** - Responds to user input
- ✅ **Programmatic** - Full JavaScript control
- ⚠️ **Runtime cost** - JavaScript handles updates
- ⚠️ **Larger bundle** - Includes animation code

### When to Use

- **Dynamic animations** - Values change based on state
- **User interactions** - Drag, hover, scroll
- **Complex logic** - Conditional or sequenced animations
- **Data-driven** - Animations based on data

### Example

```typescript
function DynamicFade({ isVisible }: { isVisible: boolean }) {
  const opacity = useMotionValue(isVisible ? 1 : 0, { property: 'opacity' });
  
  useEffect(() => {
    opacity.animateTo(isVisible ? 1 : 0, { duration: 300 });
  }, [isVisible, opacity]);
  
  return (
    <div style={{ opacity: `var(${opacity.cssVarName})` }}>
      {isVisible && 'Content'}
    </div>
  );
}
```

---

## Comparison

| Aspect | Compile-Time | Runtime |
|--------|--------------|---------|
| **Performance** | Excellent (CSS) | Good (JavaScript) |
| **Bundle Size** | Smaller | Larger |
| **Flexibility** | Low (static) | High (dynamic) |
| **Use Case** | Static animations | Interactive animations |
| **Setup** | Build-time | Runtime |
| **Control** | CSS classes | JavaScript API |

---

## Hybrid Approach

### Best of Both Worlds

You can combine both approaches:

```typescript
// Compile-time: Base animation
const fadeIn = defineMotion({
  type: 'spring',
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});

// Runtime: Dynamic control
const opacity = useMotionValue(0, { property: 'opacity' });

// Use compile-time for initial animation
useEffect(() => {
  element.classList.add(fadeIn.className);
}, []);

// Use runtime for dynamic updates
const handleClick = () => {
  opacity.animateTo(0.5, { duration: 200 });
};
```

---

## Decision Tree

### Use Compile-Time When:

- ✅ Animation values are static
- ✅ Performance is critical
- ✅ Bundle size matters
- ✅ Animation is simple (fade, slide, scale)
- ✅ Part of design system

### Use Runtime When:

- ✅ Animation values change dynamically
- ✅ User interaction drives animation
- ✅ Complex conditional logic
- ✅ Data-driven animations
- ✅ Need programmatic control

---

## Performance Impact

### Compile-Time

**Pros:**
- Zero JavaScript overhead
- CSS compositor handles animation
- Smaller bundle size
- Better battery life

**Cons:**
- Less flexible
- Can't change values dynamically
- Requires CSS injection

### Runtime

**Pros:**
- Full flexibility
- Dynamic control
- Easy to integrate with React state
- Rich API

**Cons:**
- JavaScript overhead
- Larger bundle
- More memory usage
- Can block main thread if not optimized

---

## Real-World Examples

### Example 1: Page Transitions (Compile-Time)

```typescript
// Define once at build time
const pageTransition = defineMotion({
  type: 'spring',
  from: { opacity: 0, transform: 'translateY(20px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
  duration: 300,
});

// Use consistently across app
<Page className={pageTransition.className}>
  Content
</Page>
```

**Why compile-time?** Static animation, performance-critical, design system consistency.

---

### Example 2: Drag Gesture (Runtime)

```typescript
// Must be dynamic - responds to user input
const x = useTranslateX(0);
const y = useTranslateY(0);

const dragRef = useDrag({ x, y });
```

**Why runtime?** Values change based on user input, needs programmatic control.

---

### Example 3: Scroll Reveal (Runtime)

```typescript
// Dynamic - depends on scroll position
const opacity = useMotionValue(0, { property: 'opacity' });

useViewportAnimationWithRef(ref, opacity, {
  initial: 0,
  onEnter: { target: 1, config: { duration: 500 } },
});
```

**Why runtime?** Values change based on scroll position, needs dynamic control.

---

### Example 4: Button Hover (Compile-Time)

```typescript
// Static animation - same every time
const buttonHover = defineMotion({
  type: 'spring',
  from: { transform: 'scale(1)' },
  to: { transform: 'scale(1.05)' },
  duration: 200,
});

<button className={buttonHover.className}>
  Hover me
</button>
```

**Why compile-time?** Static animation, performance-critical, design system.

---

## Best Practices

### 1. Prefer Compile-Time for Static

```typescript
// ✅ Good: Static animation
const fadeIn = defineMotion({
  type: 'spring',
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});

// ⚠️ Avoid: Runtime for static animation
const opacity = useMotionValue(0);
opacity.animateTo(1, { duration: 300 });
```

### 2. Use Runtime for Dynamic

```typescript
// ✅ Good: Dynamic animation
const opacity = useMotionValue(isVisible ? 1 : 0);
opacity.animateTo(isVisible ? 1 : 0, { duration: 300 });

// ⚠️ Avoid: Compile-time for dynamic animation
// (Can't change values dynamically)
```

### 3. Combine When Appropriate

```typescript
// ✅ Good: Compile-time base + runtime control
const baseAnimation = defineMotion({ /* ... */ });
const dynamicValue = useMotionValue(0);

// Use compile-time for initial animation
// Use runtime for dynamic updates
```

### 4. Optimize Bundle Size

```typescript
// ✅ Good: Compile-time reduces bundle
const animations = {
  fadeIn: defineMotion({ /* ... */ }),
  slideIn: defineMotion({ /* ... */ }),
};

// ⚠️ Avoid: Runtime for everything increases bundle
```

---

## Migration Path

### From Runtime to Compile-Time

If you have static animations using runtime:

```typescript
// Before: Runtime
const opacity = useMotionValue(0);
opacity.animateTo(1, { duration: 300 });

// After: Compile-time
const fadeIn = defineMotion({
  type: 'spring',
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});
```

**Benefits:** Better performance, smaller bundle.

---

### From Compile-Time to Runtime

If you need dynamic control:

```typescript
// Before: Compile-time (static)
const fadeIn = defineMotion({ /* ... */ });

// After: Runtime (dynamic)
const opacity = useMotionValue(0);
opacity.animateTo(isVisible ? 1 : 0, { duration: 300 });
```

**Benefits:** Dynamic control, flexible values.

---

## Summary

**Compile-time animations:**
- Best for static, performance-critical animations
- Zero runtime cost, smaller bundle
- Use `defineMotion` at build time

**Runtime animations:**
- Best for dynamic, interactive animations
- Full flexibility, programmatic control
- Use motion values and hooks

**Choose based on:**
- Static vs dynamic values
- Performance requirements
- Bundle size constraints
- Flexibility needs

---

## See Also

- [CSS-First Philosophy](./css-first-philosophy.md) - Why CSS-first?
- [Motion Values Explained](./motion-values.md) - Understanding motion values
- [Performance Characteristics](./performance-characteristics.md) - Performance details
- [How to Create Fade Animation](../how-to/create-fade-animation.md) - Practical examples


# How to Optimize Animation Performance

A step-by-step guide to optimizing animations for best performance in Cascade Motion.

---

## Goal

Achieve smooth 60fps animations with minimal CPU and battery usage.

---

## Solution: Use GPU-Accelerated Properties

### ✅ Do: Use Transform and Opacity

```typescript
// ✅ GPU-accelerated - smooth 60fps
const x = useTranslateX(0);
const y = useTranslateY(0);
const opacity = useMotionValue(1, { property: 'opacity' });
```

### ❌ Don't: Use Layout-Triggering Properties

```typescript
// ❌ Triggers layout recalculation - janky
const width = useMotionValue(100, { property: 'width' });
const margin = useMotionValue(0, { property: 'margin' });
```

---

## Step 1: Check Property Performance

### Use Performance Properties

```typescript
const opacity = useMotionValue(1, { property: 'opacity' });

// Check if GPU-accelerated
console.log(opacity.isGPUAccelerated); // true

// Check if triggers layout
console.log(opacity.triggersLayout); // false
```

### Prefer Transform Over Position

```typescript
// ✅ Good: Uses transform (GPU-accelerated)
const x = useTranslateX(0);
const y = useTranslateY(0);

// ❌ Avoid: Uses position (triggers layout)
const left = useMotionValue(0, { property: 'left' });
const top = useMotionValue(0, { property: 'top' });
```

---

## Step 2: Batch Updates

### Automatic Batching

Motion values automatically batch updates:

```typescript
// All updates happen in one frame
x.set(100);
y.set(200);
scale.set(1.5);
rotate.set(45);
```

### Manual Batching

For multiple elements, batch operations:

```typescript
// ✅ Good: Single batch operation
useBatchLayoutTransition(refs, { duration: 300 });

// ❌ Less efficient: Multiple individual operations
refs.forEach(ref => useLayoutTransition(ref, { duration: 300 }));
```

---

## Step 3: Use Transform Registry

### Automatic Combination

Transform values are automatically combined:

```typescript
const x = useTranslateX(0);
const y = useTranslateY(0);
const rotate = useRotate(0);
const scale = useScale(1);

// All combined into single CSS variable:
// --motion-transform-{elementId}
```

This reduces style recalculations.

---

## Step 4: Optimize Animation Config

### Prefer Compile-Time When Possible

```typescript
// ✅ Good: Compile-time (zero runtime cost)
const fadeIn = defineMotion({
  type: 'spring',
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});

// ⚠️ OK: Runtime (when you need dynamic control)
const opacity = useMotionValue(0);
opacity.animateTo(1, { duration: 300 });
```

### Use Appropriate Durations

```typescript
// ✅ Good: Short duration for quick interactions
opacity.animateTo(1, { duration: 200 });

// ⚠️ OK: Longer duration for dramatic effects
opacity.animateTo(1, { duration: 1000 });
```

---

## Step 5: Limit Simultaneous Animations

### Avoid Too Many Animations

```typescript
// ✅ Good: Reasonable number of animations
const items = [1, 2, 3, 4, 5];
items.forEach(item => {
  // Animate each item
});

// ⚠️ Avoid: Hundreds of simultaneous animations
const items = Array.from({ length: 100 });
// May cause performance issues
```

### Use Virtualization for Long Lists

```typescript
// For lists with 100+ items, consider virtualization
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedList({ items }: { items: string[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  // Only render visible items
  return (
    <div ref={parentRef}>
      {virtualizer.getVirtualItems().map(virtualItem => (
        <AnimatedItem key={virtualItem.key} item={items[virtualItem.index]} />
      ))}
    </div>
  );
}
```

---

## Step 6: Optimize Gesture Handlers

### Use Appropriate Thresholds

```typescript
// ✅ Good: Reasonable threshold
const dragRef = useDrag({ x, y }, { threshold: 10 });

// ⚠️ Too low: May trigger too easily
const dragRef = useDrag({ x, y }, { threshold: 1 });
```

### Disable When Not Needed

```typescript
const hoverRef = useHoverAnimation(scale, {
  disabled: !isInteractive,
  onHoverStart: { target: 1.1, config: { stiffness: 300 } },
});
```

---

## Step 7: Use CSS Hints

### will-change Property

```typescript
<div
  ref={dragRef}
  style={{
    transform: `translate(var(${x.cssVarName}), var(${y.cssVarName}))`,
    willChange: 'transform', // Hint to browser
  }}
>
  Draggable
</div>
```

**Note:** Only use `will-change` when animation is active. Remove it when done.

---

## Performance Checklist

- [ ] Using GPU-accelerated properties (`transform`, `opacity`)
- [ ] Avoiding layout-triggering properties (`width`, `height`, `margin`)
- [ ] Batching updates when possible
- [ ] Using transform registry (automatic)
- [ ] Limiting simultaneous animations
- [ ] Using appropriate animation durations
- [ ] Optimizing gesture handlers
- [ ] Using CSS hints when needed

---

## Common Performance Issues

### Issue: Janky Animations

**Causes:**
- Using layout-triggering properties
- Too many simultaneous animations
- Missing GPU acceleration

**Solutions:**
- Use `transform` and `opacity`
- Limit concurrent animations
- Check `isGPUAccelerated` property

---

### Issue: High CPU Usage

**Causes:**
- Layout-triggering properties
- Too many motion values
- Inefficient batching

**Solutions:**
- Prefer `transform` over position properties
- Combine transforms (automatic)
- Use batch operations

---

### Issue: Battery Drain

**Causes:**
- Continuous animations
- Too many active animations
- Layout-triggering properties

**Solutions:**
- Pause animations when not visible
- Use `will-change` sparingly
- Prefer GPU-accelerated properties

---

## Performance Monitoring

### Check Animation Performance

```typescript
const opacity = useMotionValue(1, { property: 'opacity' });

// Check performance characteristics
console.log('GPU accelerated:', opacity.isGPUAccelerated);
console.log('Triggers layout:', opacity.triggersLayout);
```

### Monitor Frame Rate

Use browser DevTools:
1. Open Performance tab
2. Record animation
3. Check FPS (should be 60fps)
4. Look for layout/paint operations

---

## Best Practices Summary

1. **Always use `transform` and `opacity`** - GPU-accelerated
2. **Avoid layout-triggering properties** - Causes jank
3. **Batch updates** - Automatic with motion values
4. **Limit simultaneous animations** - Keep it reasonable
5. **Use compile-time when possible** - Zero runtime cost
6. **Optimize gesture handlers** - Appropriate thresholds
7. **Monitor performance** - Use DevTools

---

## Related Guides

- [Troubleshooting](./troubleshooting.md) - Common issues
- [Motion Values Tutorial](../tutorials/motion-values.md) - Learn motion values
- [Performance Characteristics](../explanations/performance-characteristics.md) - Deep dive

---

## See Also

- [CSS-First Philosophy](../explanations/css-first-philosophy.md) - Why CSS-first?
- [Motion Values Explained](../explanations/motion-values.md) - Conceptual overview


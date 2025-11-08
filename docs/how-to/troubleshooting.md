# Troubleshooting Guide

Common issues and solutions when working with Cascade Motion.

---

## Animations Not Working

### Problem: Animation doesn't start

**Possible Causes:**

1. **CSS custom property not applied**
   ```typescript
   // ❌ Wrong: Not using CSS custom property
   <div style={{ opacity: opacity.get() }}>
   
   // ✅ Correct: Using CSS custom property
   <div style={{ opacity: `var(${opacity.cssVarName})` }}>
   ```

2. **Motion value not initialized**
   ```typescript
   // ✅ Ensure motion value is created
   const opacity = useMotionValue(0, { property: 'opacity' });
   ```

3. **Animation not triggered**
   ```typescript
   // ✅ Ensure animateTo is called
   useEffect(() => {
     opacity.animateTo(1, { duration: 300 });
   }, [opacity]);
   ```

**Solution:** Check that you're using `var(${motionValue.cssVarName})` in your styles and that `animateTo` is being called.

---

### Problem: Animation is instant (no transition)

**Possible Causes:**

1. **Missing CSS transition**
   ```typescript
   // ✅ Add CSS transition
   <div
     style={{
       opacity: `var(${opacity.cssVarName})`,
       transition: 'opacity 0.3s ease-out', // Add this
     }}
   >
   ```

2. **Using `set()` instead of `animateTo()`**
   ```typescript
   // ❌ Instant change
   opacity.set(1);
   
   // ✅ Animated change
   opacity.animateTo(1, { duration: 300 });
   ```

**Solution:** Add a CSS transition property or use `animateTo()` instead of `set()`.

---

## Performance Issues

### Problem: Animations are janky or stuttering

**Possible Causes:**

1. **Using layout-triggering properties**
   ```typescript
   // ❌ Avoid: Triggers layout
   const width = useMotionValue(100, { property: 'width' });
   
   // ✅ Prefer: GPU-accelerated
   const scale = useScale(1);
   ```

2. **Too many simultaneous animations**
   ```typescript
   // ✅ Batch updates (automatic with motion values)
   x.set(100);
   y.set(200);
   scale.set(1.5);
   // All batched in one frame
   ```

3. **Missing GPU acceleration**
   ```typescript
   // ✅ Check if property is GPU-accelerated
   console.log(opacity.isGPUAccelerated); // true
   console.log(width.isGPUAccelerated); // false
   ```

**Solution:** Use GPU-accelerated properties (`transform`, `opacity`) and check `isGPUAccelerated` property.

---

### Problem: High CPU usage during animations

**Possible Causes:**

1. **Layout-triggering properties**
   ```typescript
   // ❌ Triggers layout recalculation
   const margin = useMotionValue(0, { property: 'margin' });
   
   // ✅ Use transform instead
   const x = useTranslateX(0);
   ```

2. **Too many motion values**
   ```typescript
   // ✅ Consider combining transforms
   const x = useTranslateX(0);
   const y = useTranslateY(0);
   // Automatically combined into single transform
   ```

**Solution:** Prefer `transform` and `opacity` over layout-triggering properties.

---

## Type Errors

### Problem: TypeScript errors with motion values

**Possible Causes:**

1. **Incorrect generic type**
   ```typescript
   // ✅ Specify type if needed
   const opacity = useMotionValue<number>(0, { property: 'opacity' });
   ```

2. **Missing type imports**
   ```typescript
   // ✅ Import types
   import type { MotionValue, MotionValueConfig } from '@cascade/motion-runtime';
   ```

**Solution:** Ensure proper TypeScript types are imported and used.

---

### Problem: Type errors with gesture hooks

**Possible Causes:**

1. **Missing motion value types**
   ```typescript
   // ✅ Ensure motion values are typed correctly
   const x = useTranslateX(0); // Returns MotionValue<number>
   const y = useTranslateY(0);
   
   useDrag({ x, y }); // Types match
   ```

**Solution:** Check that motion values match expected types for gesture hooks.

---

## SSR Issues

### Problem: Hydration mismatches

**Possible Causes:**

1. **Motion values initialized differently on server/client**
   ```typescript
   // ✅ Use consistent initial values
   const opacity = useMotionValue(0, { property: 'opacity' });
   
   useEffect(() => {
     // Only animate on client
     if (typeof window !== 'undefined') {
       opacity.animateTo(1);
     }
   }, [opacity]);
   ```

2. **CSS custom properties not available on server**
   ```typescript
   // ✅ Provide fallback
   <div
     style={{
       opacity: typeof window !== 'undefined' 
         ? `var(${opacity.cssVarName})` 
         : 0,
     }}
   >
   ```

**Solution:** Ensure consistent initial states and guard client-only code.

---

## Gesture Issues

### Problem: Drag doesn't work on mobile

**Possible Causes:**

1. **Using `useDrag` instead of `usePan`**
   ```typescript
   // ✅ Use usePan for better touch support
   const panRef = usePan({ x, y }, { threshold: 5 });
   ```

2. **Touch events blocked**
   ```typescript
   // ✅ Ensure element is touchable
   <div
     ref={dragRef}
     style={{ touchAction: 'none' }} // Prevent default touch behavior
   >
   ```

**Solution:** Use `usePan` for touch-optimized gestures and set `touchAction: 'none'`.

---

### Problem: Gesture conflicts with scroll

**Possible Causes:**

1. **Missing axis constraint**
   ```typescript
   // ✅ Lock to specific axis
   const dragRef = useDrag({ x }, { axis: 'x' });
   ```

2. **Scroll container interference**
   ```typescript
   // ✅ Prevent default on drag
   const dragRef = useDrag({ x, y }, {
     onStart: (state, event) => {
       event.preventDefault();
     },
   });
   ```

**Solution:** Use axis constraints and prevent default behavior when needed.

---

## Layout Transition Issues

### Problem: Layout transitions not triggering

**Possible Causes:**

1. **Change below threshold**
   ```typescript
   // ✅ Ensure changes exceed 1px threshold
   // Layout transitions require >1px position or size change
   ```

2. **Ref not attached**
   ```typescript
   // ✅ Ensure ref is properly attached
   const ref = useRef<HTMLDivElement>(null);
   useLayoutTransition(ref, { duration: 300 });
   
   return <div ref={ref}>Content</div>;
   ```

3. **Enabled flag is false**
   ```typescript
   // ✅ Check enabled flag
   useLayoutTransition(ref, {
     enabled: true, // Ensure this is true
   });
   ```

**Solution:** Verify ref attachment, check thresholds, and ensure `enabled` is `true`.

---

### Problem: Shared elements not animating

**Possible Causes:**

1. **Mismatched layoutId**
   ```typescript
   // ✅ Ensure same layoutId
   useSharedLayoutTransition(ref1, { layoutId: 'card-123' });
   useSharedLayoutTransition(ref2, { layoutId: 'card-123' }); // Must match
   ```

2. **Timing issue**
   ```typescript
   // ✅ Elements must mount/unmount within 1 second
   // Registry entries expire after 1 second
   ```

**Solution:** Ensure `layoutId` matches and elements mount/unmount within 1 second.

---

## Browser Compatibility

### Problem: Animations don't work in older browsers

**Possible Causes:**

1. **CSS custom properties not supported**
   ```typescript
   // ✅ Provide fallback
   <div
     style={{
       opacity: 1, // Fallback
       opacity: `var(${opacity.cssVarName})`, // Modern browsers
     }}
   >
   ```

2. **Transform not supported**
   ```typescript
   // ✅ Cascade Motion requires modern browser features
   // Minimum: Chrome 49+, Firefox 31+, Safari 9.1+, Edge 15+
   ```

**Solution:** Provide fallbacks for older browsers or require modern browsers.

---

## Debugging Tips

### 1. Check Motion Value State

```typescript
const opacity = useMotionValue(0);

// Log value changes
opacity.onChange((value) => {
  console.log('Opacity changed:', value);
});

// Check current value
console.log('Current opacity:', opacity.get());
```

### 2. Verify CSS Custom Properties

```typescript
// Check if CSS variable is set
const element = document.querySelector('.my-element');
const computed = getComputedStyle(element);
console.log('CSS variable:', computed.getPropertyValue(opacity.cssVarName));
```

### 3. Check Animation Timeline

```typescript
const timeline = opacity.getTimeline();
if (timeline) {
  console.log('Animation active:', timeline);
} else {
  console.log('No active animation');
}
```

### 4. Monitor Performance

```typescript
// Check if property triggers layout
console.log('Triggers layout:', opacity.triggersLayout);
console.log('GPU accelerated:', opacity.isGPUAccelerated);
```

---

## Getting Help

If you're still experiencing issues:

1. **Check the documentation**
   - [API Reference](../reference/)
   - [Tutorials](../tutorials/)
   - [How-to Guides](./)

2. **Review examples**
   - Check existing examples in the codebase
   - Look at test files for usage patterns

3. **Create a minimal reproduction**
   - Isolate the issue in a small example
   - Share code that demonstrates the problem

---

## Common Patterns

### Pattern: Conditional Animation

```typescript
const opacity = useMotionValue(0);

useEffect(() => {
  if (isVisible) {
    opacity.animateTo(1, { duration: 300 });
  } else {
    opacity.animateTo(0, { duration: 300 });
  }
}, [isVisible, opacity]);
```

### Pattern: Animation on Mount

```typescript
const x = useTranslateX(-100);

useEffect(() => {
  x.animateTo(0, { duration: 400 });
}, [x]); // Empty deps = run once on mount
```

### Pattern: Cleanup on Unmount

```typescript
const opacity = useMotionValue(1);

useEffect(() => {
  return () => {
    opacity.destroy(); // Clean up
  };
}, [opacity]);
```

---

## See Also

- [Motion Values API Reference](../reference/motion-values.md)
- [Gestures API Reference](../reference/gestures.md)
- [Layout Transitions API Reference](../reference/layout-transitions.md)
- [Performance Best Practices](../how-to/optimize-performance.md)


# Troubleshooting Guide

Common issues and solutions when working with Cascade Motion.

**Quick Links:**
- [Animation Flash/Jank](#animation-flash-or-jank-on-initial-render) - Elements flashing before animation starts
- [Animation Running Twice](#animation-running-twice) - Animations restarting unexpectedly
- [Viewport Animations Not Triggering](#viewport-animations-not-triggering) - Scroll animations not working
- [Missing CSS Warnings](#missing-css-warnings) - Animation classes applied but CSS not injected
- [Performance Issues](#performance-issues) - Janky or stuttering animations

---

## Animation Flash or Jank on Initial Render

### Problem: Element flashes visible before animation starts

**Symptoms:**
- Element appears in final state briefly
- Visible "jump" when animation starts
- Flash of content on page load

**Possible Causes:**

1. **CSS not injected synchronously**
   ```typescript
   // ❌ Wrong: CSS injected in useEffect (too late)
   useEffect(() => {
     const style = document.createElement('style');
     style.textContent = animation.css;
     document.head.appendChild(style);
   }, []);
   
   // ✅ Correct: Use MotionStage or useMotionStyles
   <MotionStage animation={{ className, css }}>
     Content
   </MotionStage>
   ```

2. **Initial value doesn't match `from` state**
   ```typescript
   // ❌ Wrong: Initial value differs from animation from state
   const opacity = useMotionValue(1, { property: 'opacity' });
   // Animation: from: { opacity: 0 }
   
   // ✅ Correct: Match initial value to from state
   const opacity = useMotionValue(0, { property: 'opacity' });
   // Animation: from: { opacity: 0 }
   ```

3. **Animation class applied too late**
   ```typescript
   // ❌ Wrong: Class applied in useEffect
   useEffect(() => {
     element.classList.add(animation.className);
   }, []);
   
   // ✅ Correct: Use MotionStage (applies class before paint)
   <MotionStage animation={{ className, css }}>
     Content
   </MotionStage>
   ```

**Solution:** 
- Use `MotionStage` for automatic CSS injection and class application
- Ensure initial values match animation `from` state
- See [How to Prevent Animation Flash](./prevent-animation-flash.md) for detailed guide

---

## Animation Running Twice

### Problem: Animation completes, then restarts

**Symptoms:**
- Animation plays once, then immediately plays again
- Console warnings about duplicate class application
- Animation state resets unexpectedly

**Possible Causes:**

1. **Animation class applied multiple times**
   ```typescript
   // ❌ Wrong: Class applied in multiple places
   <div className={animation.className}>  // Applied here
     <MotionStage animation={animation}>  // And here
       Content
     </MotionStage>
   </div>
   
   // ✅ Correct: Let MotionStage handle class application
   <MotionStage animation={{ className, css }}>
     Content
   </MotionStage>
   ```

2. **MotionSequence autoStart prop not reactive**
   ```typescript
   // ❌ Wrong: autoStart doesn't react to changes (old behavior)
   <MotionSequence autoStart={isInView}>
     {/* Doesn't restart when isInView changes */}
   </MotionSequence>
   
   // ✅ Correct: autoStart now reacts to changes (fixed in v1.1+)
   <MotionSequence autoStart={isInView}>
     {/* Properly restarts when isInView changes */}
   </MotionSequence>
   ```

3. **useEffect running multiple times**
   ```typescript
   // ❌ Wrong: Effect runs on every render
   useEffect(() => {
     element.classList.add(animation.className);
   }); // Missing dependency array
   
   // ✅ Correct: Run once or with proper dependencies
   useEffect(() => {
     element.classList.add(animation.className);
   }, []); // Run once on mount
   ```

**Solution:**
- Use `MotionStage` to avoid duplicate class application
- Check for dev-mode warnings about duplicate classes
- Ensure `useEffect` dependencies are correct
- See [Dev-Mode Warnings](../reference/dev-warnings.md) for more info

---

## Viewport Animations Not Triggering

### Problem: Scroll-triggered animations don't start

**Symptoms:**
- Elements don't animate when scrolling into view
- `MotionSequence` with `autoStart={isInView}` doesn't work
- No console errors, but animations don't trigger

**Possible Causes:**

1. **MotionSequence autoStart not reactive (old versions)**
   ```typescript
   // ❌ Old behavior: autoStart only checked on mount
   <MotionSequence autoStart={isInView}>
     {/* Doesn't react to isInView changes */}
   </MotionSequence>
   
   // ✅ Fixed in v1.1+: autoStart now reactive
   <MotionSequence autoStart={isInView}>
     {/* Properly reacts to isInView changes */}
   </MotionSequence>
   ```

2. **IntersectionObserver threshold too high**
   ```typescript
   // ❌ Wrong: Threshold too high, element never enters viewport
   useViewportAnimationWithRef(ref, opacity, {
     threshold: 1.0, // Requires 100% visibility
   });
   
   // ✅ Correct: Lower threshold
   useViewportAnimationWithRef(ref, opacity, {
     threshold: 0.1, // Triggers at 10% visibility
   });
   ```

3. **Ref not attached to element**
   ```typescript
   // ❌ Wrong: Ref not attached
   const ref = useRef<HTMLDivElement>(null);
   useViewportAnimationWithRef(ref, opacity, config);
   return <div>Content</div>; // Missing ref
   
   // ✅ Correct: Attach ref
   const ref = useRef<HTMLDivElement>(null);
   useViewportAnimationWithRef(ref, opacity, config);
   return <div ref={ref}>Content</div>;
   ```

**Solution:**
- Update to latest version (autoStart reactivity fixed)
- Check IntersectionObserver threshold
- Verify ref is attached to element
- See [Viewport Animation Patterns](./viewport-animation-patterns.md) for detailed guide

---

## Missing CSS Warnings

### Problem: Console warning about missing CSS

**Symptoms:**
- Console warning: "Animation class 'X' is applied but CSS is not injected"
- Animation class present but animation doesn't work
- Element visible but not animating

**Possible Causes:**

1. **CSS not injected**
   ```typescript
   // ❌ Wrong: Using className without injecting CSS
   <div className={fadeIn.className}>
     Content
   </div>
   
   // ✅ Correct: Inject CSS first
   useMotionStyles([fadeIn]);
   <div className={fadeIn.className}>
     Content
   </div>
   
   // ✅ Or use MotionStage (handles injection automatically)
   <MotionStage animation={{ className: fadeIn.className, css: fadeIn.css }}>
     Content
   </MotionStage>
   ```

2. **CSS injected after class applied**
   ```typescript
   // ❌ Wrong: CSS injected too late
   useEffect(() => {
     injectCSS(animation.css);
   }, []);
   // Class already applied, CSS not ready
   
   // ✅ Correct: Inject CSS synchronously
   useMotionStyles([animation]); // Synchronous injection
   ```

**Solution:**
- Use `MotionStage` for automatic CSS injection
- Or use `useMotionStyles` before applying classes
- Check browser DevTools for injected CSS
- See [How to Inject Animation CSS](./inject-animation-css.md) for detailed guide

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

### Related How-to Guides

- [How to Prevent Animation Flash](./prevent-animation-flash.md) - Detailed guide on preventing visual flash
- [Animation Timing Considerations](./animation-timing-considerations.md) - When to use useLayoutEffect vs useEffect
- [Viewport Animation Patterns](./viewport-animation-patterns.md) - Best practices for scroll-triggered animations
- [How to Inject Animation CSS](./inject-animation-css.md) - CSS injection patterns and best practices
- [How to Debug Animations](./debug-animations.md) - Enable debug logging for troubleshooting

### API Reference

- [Motion Values API Reference](../reference/motion-values.md)
- [Gestures API Reference](../reference/gestures.md)
- [Layout Transitions API Reference](../reference/layout-transitions.md)
- [Viewport Animations API Reference](../reference/viewport-animations.md)
- [Sequences API Reference](../reference/sequences.md)

### Performance & Best Practices

- [Performance Best Practices](./optimize-performance.md)
- [CSS-First Philosophy](../explanations/css-first-philosophy.md)


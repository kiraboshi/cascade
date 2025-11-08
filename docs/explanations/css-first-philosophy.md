# CSS-First Philosophy

Understanding why Cascade Motion uses a CSS-first approach and how it benefits your applications.

---

## What is CSS-First?

CSS-first means that animations run primarily in CSS rather than JavaScript. Cascade Motion uses CSS custom properties (CSS variables) as a bridge between JavaScript state and CSS animations, giving you the control of JavaScript with the performance of CSS.

---

## Why CSS-First?

### 1. Performance

CSS animations run on the compositor thread, separate from the main JavaScript thread. This means:

- **Smooth 60fps animations** even when JavaScript is busy
- **Lower CPU usage** - the browser optimizes CSS animations
- **Better battery life** on mobile devices
- **No layout thrashing** - CSS handles rendering efficiently

### 2. Bundle Size

By leveraging CSS instead of JavaScript:

- **Smaller bundle sizes** - less JavaScript code
- **Better tree-shaking** - only import what you use
- **Native browser optimizations** - browsers are highly optimized for CSS

### 3. Accessibility

CSS animations respect user preferences:

- **`prefers-reduced-motion`** is automatically respected
- **Browser-level controls** work out of the box
- **Screen readers** handle CSS animations better

### 4. Developer Experience

CSS-first doesn't mean you write CSS:

- **Type-safe APIs** - Full TypeScript support
- **React hooks** - Familiar React patterns
- **JavaScript control** - Animate programmatically when needed
- **CSS flexibility** - Use any CSS property or animation

---

## How It Works

### The Bridge: CSS Custom Properties

Cascade Motion uses CSS custom properties as a bridge:

```typescript
// JavaScript
const opacity = useMotionValue(0, { property: 'opacity' });
opacity.animateTo(1, { duration: 300 });

// CSS (automatically)
// --motion-value-abc123: 1;
// opacity: var(--motion-value-abc123);
```

The motion value updates the CSS custom property, and CSS handles the animation.

### Compile-Time vs Runtime

Cascade Motion supports both approaches:

**Compile-Time (Recommended):**
- Animations defined at build time
- Generated as CSS `@keyframes`
- Zero runtime cost
- Best performance

**Runtime:**
- Animations defined in JavaScript
- Uses CSS custom properties
- More flexible, slightly more overhead
- Still GPU-accelerated

---

## Comparison with Other Approaches

### vs. JavaScript-Only Animations

**JavaScript-Only (e.g., Framer Motion):**
- Animations run in JavaScript
- Can block main thread
- More flexible but heavier
- Requires more JavaScript

**CSS-First (Cascade Motion):**
- Animations run in CSS
- Never blocks main thread
- Smaller bundle size
- Better performance

### vs. Pure CSS Animations

**Pure CSS:**
- Limited control from JavaScript
- Hard to coordinate complex animations
- Difficult to respond to user input

**CSS-First (Cascade Motion):**
- Full JavaScript control
- Easy to coordinate animations
- Responds to user input naturally
- Best of both worlds

---

## When to Use CSS-First

### ✅ Best For

- **UI animations** - Transitions, hover effects, page transitions
- **Performance-critical apps** - Need smooth 60fps
- **Mobile apps** - Battery life matters
- **Large applications** - Bundle size matters
- **Accessibility-focused** - Need to respect user preferences

### ⚠️ Consider Alternatives For

- **Complex physics simulations** - May need JavaScript
- **Canvas/WebGL animations** - Different use case
- **Very dynamic animations** - May need more JavaScript control

---

## Technical Details

### CSS Custom Properties

Cascade Motion uses CSS custom properties (`--variable-name`) because:

1. **Dynamic updates** - Can be changed from JavaScript
2. **Scoped** - Can be element-scoped or global
3. **Performant** - Browsers optimize CSS variable updates
4. **Compatible** - Works in all modern browsers

### Transform Registry

Transform properties (`x`, `y`, `rotate`, `scale`) are combined into a single CSS variable:

```css
/* Instead of multiple variables */
--motion-x: 100px;
--motion-y: 50px;
--motion-rotate: 45deg;

/* One combined variable */
--motion-transform-el123: translate3d(100px, 50px, 0) rotate(45deg);
```

This reduces style recalculations and improves performance.

### GPU Acceleration

Properties like `transform` and `opacity` are GPU-accelerated:

- **Hardware acceleration** - Uses GPU instead of CPU
- **Smooth animations** - Even with many animated elements
- **Lower CPU usage** - Frees CPU for other tasks

Cascade Motion automatically uses GPU-accelerated properties when possible.

---

## Migration Considerations

### From JavaScript Animation Libraries

If you're migrating from a JavaScript-only library:

1. **Motion values replace animation objects** - Similar API, CSS-powered
2. **Hooks replace components** - More flexible, less magic
3. **CSS custom properties replace inline styles** - Better performance
4. **Same control, better performance** - You get the best of both

### From Pure CSS

If you're migrating from pure CSS animations:

1. **Add JavaScript control** - Animate programmatically
2. **Coordinate animations** - Easier to sequence and coordinate
3. **Respond to user input** - Gestures and interactions
4. **Keep CSS performance** - Still runs in CSS

---

## Best Practices

### 1. Prefer Compile-Time When Possible

```typescript
// ✅ Good: Compile-time animation
const fadeIn = defineMotion({
  type: 'spring',
  from: { opacity: 0 },
  to: { opacity: 1 },
});

// ⚠️ OK: Runtime animation (when you need dynamic control)
const opacity = useMotionValue(0);
opacity.animateTo(1);
```

### 2. Use GPU-Accelerated Properties

```typescript
// ✅ Good: GPU-accelerated
const x = useTranslateX(0);
const opacity = useMotionValue(1, { property: 'opacity' });

// ⚠️ Avoid: Layout-triggering
const width = useMotionValue(100, { property: 'width' });
```

### 3. Batch Updates

Motion values automatically batch updates, but be aware:

```typescript
// ✅ Good: Batched automatically
x.set(100);
y.set(200);
scale.set(1.5);

// All updates happen in one frame
```

### 4. Respect User Preferences

```typescript
// ✅ Good: Respect reduced motion
if (prefersReducedMotion()) {
  // Skip animations or use instant transitions
}
```

---

## Conclusion

CSS-first is not about writing more CSS—it's about leveraging CSS's performance while maintaining JavaScript's control. Cascade Motion gives you:

- ✅ **Performance** - CSS animations are fast
- ✅ **Control** - JavaScript APIs are flexible
- ✅ **Size** - Smaller bundles
- ✅ **Accessibility** - Respects user preferences
- ✅ **Developer Experience** - Type-safe, React-friendly

---

## See Also

- [Motion Values Explained](./motion-values.md) - How motion values work
- [Compile-time vs Runtime](./compile-time-vs-runtime.md) - When to use each
- [Performance Characteristics](./performance-characteristics.md) - Performance details
- [Comparison with Framer Motion](./comparison-framer-motion.md) - How it differs


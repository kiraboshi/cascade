# Motion Values Explained

Understanding the conceptual foundation of motion values in Cascade Motion.

---

## What are Motion Values?

Motion values are reactive JavaScript values that control CSS custom properties. They provide a bridge between JavaScript state management and CSS animations, enabling programmatic control while maintaining CSS performance.

---

## Core Concept

### The Bridge

Motion values act as a bridge:

```
JavaScript State ←→ Motion Value ←→ CSS Custom Property ←→ Visual Animation
```

1. **JavaScript** updates the motion value
2. **Motion value** updates the CSS custom property
3. **CSS** handles the visual animation
4. **Browser** optimizes the animation

### Why This Approach?

**Traditional JavaScript Animation:**
- Animations run in JavaScript
- Can block main thread
- More JavaScript code
- Less efficient

**CSS-Only Animation:**
- Limited control from JavaScript
- Hard to coordinate
- Difficult to respond to user input

**Motion Values (Best of Both):**
- Full JavaScript control
- CSS performance
- Easy coordination
- Natural user interaction

---

## How Motion Values Work

### 1. Creation

When you create a motion value:

```typescript
const opacity = useMotionValue(0, { property: 'opacity' });
```

Internally:
- A unique ID is generated
- A CSS custom property name is created: `--motion-value-{id}`
- The value is stored in JavaScript
- The CSS custom property is registered

### 2. Updates

When you update a motion value:

```typescript
opacity.set(1);
```

Internally:
- The JavaScript value is updated
- The update is queued for batching
- On next `requestAnimationFrame`, the CSS custom property is updated
- CSS handles the visual change

### 3. Animations

When you animate a motion value:

```typescript
opacity.animateTo(1, { duration: 300 });
```

Internally:
- An animation timeline is created
- Values are interpolated over time
- CSS custom property is updated each frame
- Animation completes when target is reached

---

## Transform Registry System

### The Problem

Multiple transform properties (`x`, `y`, `rotate`, `scale`) need to be combined into a single CSS `transform` property.

### The Solution

Cascade Motion uses a transform registry:

1. **Register** transform motion values by element
2. **Combine** all transforms into a single CSS variable
3. **Update** efficiently using batching

```typescript
const x = useTranslateX(0);
const y = useTranslateY(0);
const rotate = useRotate(0);

// All three are automatically combined:
// transform: var(--motion-transform-{elementId})
```

### Benefits

- **Single CSS variable** - One update instead of multiple
- **Efficient batching** - All transforms updated together
- **Correct order** - Transform order matters (translate → rotate → scale)
- **Automatic cleanup** - Registry cleaned up on unmount

---

## Performance Characteristics

### GPU Acceleration

Motion values automatically detect GPU-accelerated properties:

```typescript
const opacity = useMotionValue(1, { property: 'opacity' });
console.log(opacity.isGPUAccelerated); // true

const width = useMotionValue(100, { property: 'width' });
console.log(width.isGPUAccelerated); // false
```

**GPU-accelerated properties:**
- `transform` (translate, rotate, scale)
- `opacity`
- `filter` (some filters)

**Non-accelerated properties:**
- `width`, `height`
- `margin`, `padding`
- `left`, `top` (when not using transform)

### Layout Triggering

Motion values warn about layout-triggering properties:

```typescript
const width = useMotionValue(100, { property: 'width' });
console.log(width.triggersLayout); // true
```

**Layout-triggering properties** cause the browser to recalculate layout, which is expensive. Prefer `transform` and `opacity` instead.

### Batching

Updates are automatically batched:

```typescript
x.set(100);
y.set(200);
scale.set(1.5);

// All three updates happen in one frame
```

This reduces style recalculations and improves performance.

---

## Type System

### Generic Types

Motion values are generic:

```typescript
const opacity = useMotionValue<number>(0, { property: 'opacity' });
const text = useMotionValue<string>('Hello', { property: 'content' });
```

### Type Inference

TypeScript infers types from initial values:

```typescript
const opacity = useMotionValue(0, { property: 'opacity' });
// Type: MotionValue<number>

const text = useMotionValue('Hello', { property: 'content' });
// Type: MotionValue<string>
```

---

## Comparison with Other Approaches

### vs. Framer Motion Motion Values

**Similarities:**
- Same API (`get()`, `set()`, `onChange()`)
- Similar animation methods
- Reactive updates

**Differences:**
- Cascade Motion uses CSS custom properties
- Framer Motion uses inline styles
- Cascade Motion is CSS-first
- Framer Motion is JavaScript-first

### vs. React State

**React State:**
- Triggers re-renders
- Can cause performance issues
- Not optimized for animations

**Motion Values:**
- No re-renders (updates CSS directly)
- Optimized for animations
- Batched updates

---

## Design Decisions

### Why CSS Custom Properties?

1. **Performance** - CSS handles animations efficiently
2. **Flexibility** - Can be used in any CSS context
3. **Composability** - Multiple values can be combined
4. **Browser Optimization** - Browsers optimize CSS animations

### Why Not Inline Styles?

Inline styles have limitations:
- Harder to combine multiple values
- Less efficient for animations
- Can't leverage CSS optimizations
- More JavaScript overhead

### Why Transform Registry?

Transform properties must be combined:
- CSS `transform` is a single property
- Order matters (translate → rotate → scale)
- Single update is more efficient
- Matches CSS best practices

---

## Use Cases

### ✅ Best For

- **UI animations** - Transitions, hover effects, page transitions
- **Gesture-driven animations** - Drag, scroll, wheel
- **Coordinated animations** - Multiple elements animating together
- **Performance-critical animations** - Need smooth 60fps

### ⚠️ Consider Alternatives For

- **Complex physics simulations** - May need more JavaScript control
- **Canvas/WebGL animations** - Different use case
- **Very dynamic content** - May need different approach

---

## Best Practices

### 1. Use Helper Hooks

```typescript
// ✅ Good: Use helper hooks
const x = useTranslateX(0);

// ⚠️ OK: But more verbose
const x = useMotionValue(0, { property: 'x', unit: 'px', transformMode: 'transform' });
```

### 2. Prefer GPU-Accelerated Properties

```typescript
// ✅ Good: GPU-accelerated
const opacity = useMotionValue(1, { property: 'opacity' });
const x = useTranslateX(0);

// ⚠️ Avoid: Layout-triggering
const width = useMotionValue(100, { property: 'width' });
```

### 3. Combine Transforms

```typescript
// ✅ Good: Automatically combined
const x = useTranslateX(0);
const y = useTranslateY(0);
const rotate = useRotate(0);

// All combined into single transform variable
```

### 4. Clean Up

```typescript
// ✅ Good: Clean up on unmount
useEffect(() => {
  const opacity = createMotionValue({ initialValue: 0, property: 'opacity' });
  
  return () => {
    opacity.destroy();
  };
}, []);
```

---

## Technical Details

### CSS Custom Property Naming

Motion values use a consistent naming scheme:

- **Single values**: `--motion-value-{id}`
- **Transform values**: `--motion-transform-{elementId}` (combined)
- **Element-scoped**: Uses `data-motion-element-id` attribute

### Update Batching

Updates are batched using `requestAnimationFrame`:

1. Multiple `set()` calls queue updates
2. On next frame, all updates are applied
3. CSS custom properties are updated
4. Browser handles rendering

### Transform Combination

Transform values are combined in correct order:

1. **Translate** (x, y, z)
2. **Rotate** (rotate, rotateX, rotateY, rotateZ)
3. **Scale** (scale, scaleX, scaleY)

This matches CSS transform order requirements.

---

## See Also

- [CSS-First Philosophy](./css-first-philosophy.md) - Why CSS-first?
- [Motion Values Tutorial](../tutorials/motion-values.md) - Learn by doing
- [Motion Values API Reference](../reference/motion-values.md) - Complete API
- [Compile-time vs Runtime](./compile-time-vs-runtime.md) - When to use each


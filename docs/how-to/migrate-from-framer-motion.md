# How to Migrate from Framer Motion

A step-by-step guide to migrating your Framer Motion code to Cascade Motion.

---

## Overview

Cascade Motion uses a CSS-first approach, which means animations run in CSS rather than JavaScript. This provides better performance and smaller bundle sizes, but requires some API changes.

---

## Key Differences

| Aspect | Framer Motion | Cascade Motion |
|--------|---------------|----------------|
| **Approach** | JavaScript animations | CSS-first with JS control |
| **Components** | `motion.div`, `motion.button` | React hooks + regular elements |
| **Motion Values** | `useMotionValue()` | `useMotionValue()` (similar API) |
| **Animations** | `animate` prop | `animateTo()` method |
| **Gestures** | `whileHover`, `whileTap` | `useHoverAnimation()`, `useTapAnimation()` |
| **Layout** | `layout` prop | `useLayoutTransition()` hook |
| **AnimatePresence** | `AnimatePresence` | `AnimatePresence` (similar) |

---

## Migration Steps

### Step 1: Replace Motion Components

**Framer Motion:**
```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  Content
</motion.div>
```

**Cascade Motion:**
```typescript
import { useMotionValue } from '@cascade/motion-runtime';
import { useEffect } from 'react';

function AnimatedDiv() {
  const opacity = useMotionValue(0, { property: 'opacity' });
  
  useEffect(() => {
    opacity.animateTo(1, { duration: 300 });
  }, [opacity]);
  
  return (
    <div style={{ opacity: `var(${opacity.cssVarName})` }}>
      Content
    </div>
  );
}
```

---

### Step 2: Migrate Motion Values

**Framer Motion:**
```typescript
const x = useMotionValue(0);
const controls = useAnimationControls();
```

**Cascade Motion:**
```typescript
// Basic motion value (same API)
const x = useMotionValue(0, { property: 'x', unit: 'px' });

// Or use helpers
const x = useTranslateX(0);
const scale = useScale(1);
const opacity = useMotionValue(1, { property: 'opacity' });
```

**Key Differences:**
- Cascade Motion requires `property` and `unit` for CSS custom properties
- Use helper hooks (`useTranslateX`, `useScale`) for common transforms
- CSS custom properties are used instead of inline styles

---

### Step 3: Migrate Animations

**Framer Motion:**
```typescript
<motion.div
  animate={{ x: 100, opacity: 1 }}
  transition={{ duration: 0.5 }}
/>
```

**Cascade Motion:**
```typescript
const x = useTranslateX(0);
const opacity = useMotionValue(0, { property: 'opacity' });

useEffect(() => {
  x.animateTo(100, { duration: 500 });
  opacity.animateTo(1, { duration: 500 });
}, [x, opacity]);

<div
  style={{
    transform: `translateX(var(${x.cssVarName}))`,
    opacity: `var(${opacity.cssVarName})`,
  }}
/>
```

---

### Step 4: Migrate Gestures

**Framer Motion:**
```typescript
<motion.div
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
>
  Hover me
</motion.div>
```

**Cascade Motion:**
```typescript
import { useHoverAnimation, useTapAnimation } from '@cascade/motion-gestures';
import { useScale } from '@cascade/motion-runtime';

function InteractiveCard() {
  const scale = useScale(1);
  
  const hoverRef = useHoverAnimation(scale, {
    onHoverStart: {
      target: 1.1,
      config: { stiffness: 300, damping: 20 },
    },
    onHoverEnd: {
      target: 1,
      config: { stiffness: 300, damping: 20 },
    },
  });
  
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
  
  // Combine refs (use a ref callback)
  const combinedRef = (el: HTMLElement | null) => {
    if (hoverRef.current) hoverRef.current = el;
    if (tapRef.current) tapRef.current = el;
  };
  
  return (
    <div
      ref={combinedRef}
      style={{ transform: `scale(var(${scale.cssVarName}))` }}
    >
      Hover and tap me
    </div>
  );
}
```

---

### Step 5: Migrate Drag Gestures

**Framer Motion:**
```typescript
<motion.div
  drag
  dragConstraints={{ left: -100, right: 100 }}
  onDragEnd={(event, info) => {
    // Handle drag end
  }}
>
  Drag me
</motion.div>
```

**Cascade Motion:**
```typescript
import { useDrag } from '@cascade/motion-gestures';
import { useTranslateX, useTranslateY } from '@cascade/motion-runtime';

function DraggableCard() {
  const x = useTranslateX(0);
  const y = useTranslateY(0);
  
  const dragRef = useDrag(
    { x, y },
    {
      constraints: {
        min: { x: -100 },
        max: { x: 100 },
      },
      spring: { stiffness: 300, damping: 30 },
      onEnd: (state) => {
        console.log('Drag ended', state.velocity);
      },
    }
  );
  
  return (
    <div
      ref={dragRef}
      style={{
        transform: `translate(var(${x.cssVarName}), var(${y.cssVarName}))`,
      }}
    >
      Drag me
    </div>
  );
}
```

---

### Step 6: Migrate Layout Animations

**Framer Motion:**
```typescript
<motion.div layout>
  {items.map(item => (
    <motion.div key={item} layout>
      {item}
    </motion.div>
  ))}
</motion.div>
```

**Cascade Motion:**
```typescript
import { useBatchLayoutTransition } from '@cascade/motion-runtime';

function AnimatedList({ items }: { items: string[] }) {
  const refs = items.map(() => useRef<HTMLDivElement>(null));
  
  useBatchLayoutTransition(refs, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });
  
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

---

### Step 7: Migrate AnimatePresence

**Framer Motion:**
```typescript
<AnimatePresence>
  {items.map(item => (
    <motion.div
      key={item}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {item}
    </motion.div>
  ))}
</AnimatePresence>
```

**Cascade Motion:**
```typescript
import { AnimatePresence } from '@cascade/motion-runtime';

<AnimatePresence
  enter={{ opacity: 0 }}
  exit={{ opacity: 0, config: { duration: 200 } }}
>
  {items.map(item => (
    <div key={item}>{item}</div>
  ))}
</AnimatePresence>
```

---

## API Mapping Table

| Framer Motion | Cascade Motion | Notes |
|--------------|----------------|-------|
| `motion.div` | `useMotionValue` + `<div>` | Use hooks instead of components |
| `useMotionValue()` | `useMotionValue()` | Similar API, requires config |
| `animate` prop | `animateTo()` method | Method call instead of prop |
| `whileHover` | `useHoverAnimation()` | Hook-based gesture |
| `whileTap` | `useTapAnimation()` | Hook-based gesture |
| `drag` prop | `useDrag()` hook | Hook-based gesture |
| `layout` prop | `useLayoutTransition()` | Hook-based layout animation |
| `AnimatePresence` | `AnimatePresence` | Similar component |
| `useAnimationControls()` | `animateTo()` directly | No separate controls needed |
| `variants` | Compile-time animations | Use `defineMotion()` for variants |

---

## Common Migration Patterns

### Pattern 1: Simple Fade In

**Framer Motion:**
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

**Cascade Motion:**
```typescript
const opacity = useMotionValue(0, { property: 'opacity' });

useEffect(() => {
  opacity.animateTo(1, { duration: 300 });
}, [opacity]);

<div style={{ opacity: `var(${opacity.cssVarName})` }}>
  Content
</div>
```

---

### Pattern 2: Spring Animation

**Framer Motion:**
```typescript
<motion.div
  animate={{ x: 100 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
/>
```

**Cascade Motion:**
```typescript
const x = useTranslateX(0);

useEffect(() => {
  x.animateTo(100, {
    stiffness: 300,
    damping: 30,
  });
}, [x]);
```

---

### Pattern 3: Sequence Animation

**Framer Motion:**
```typescript
const sequence = async () => {
  await controls.start({ x: 100 });
  await controls.start({ y: 100 });
};
```

**Cascade Motion:**
```typescript
const x = useTranslateX(0);
const y = useTranslateY(0);

const sequence = async () => {
  await x.animateTo(100, { duration: 300 });
  await y.animateTo(100, { duration: 300 });
};
```

---

## Benefits of Migration

1. **Better Performance**: CSS animations run on compositor thread
2. **Smaller Bundle**: Less JavaScript code
3. **Better Battery Life**: Hardware-accelerated animations
4. **Accessibility**: Automatic `prefers-reduced-motion` support

---

## Migration Checklist

- [ ] Replace `motion.*` components with hooks + regular elements
- [ ] Convert `animate` props to `animateTo()` calls
- [ ] Migrate gesture props to gesture hooks
- [ ] Update layout animations to use `useLayoutTransition`
- [ ] Replace `AnimatePresence` usage (if needed)
- [ ] Update CSS to use CSS custom properties
- [ ] Test animations in target browsers
- [ ] Verify performance improvements

---

## Getting Help

If you encounter issues during migration:

1. **Check the documentation**
   - [API Reference](../reference/)
   - [Tutorials](../tutorials/)
   - [How-to Guides](./)

2. **Review examples**
   - Look at existing Cascade Motion examples
   - Compare with Framer Motion patterns

3. **Ask for help**
   - Create a minimal reproduction
   - Share your migration code

---

## See Also

- [Comparison with Framer Motion](../explanations/comparison-framer-motion.md)
- [CSS-First Philosophy](../explanations/css-first-philosophy.md)
- [Getting Started Tutorial](../tutorials/getting-started.md)


# Animation Timing Considerations

This guide explains when to use `useLayoutEffect` vs `useEffect` for animations and how browser rendering affects animation timing.

## Overview

React provides two hooks for side effects: `useEffect` and `useLayoutEffect`. Understanding when to use each is crucial for smooth animations without visual glitches.

---

## The Difference

### useEffect

- **Runs**: After browser paint
- **Timing**: Asynchronous, non-blocking
- **Use Case**: Non-critical side effects, data fetching, subscriptions
- **Visual Impact**: Can cause visible changes after initial render

### useLayoutEffect

- **Runs**: Synchronously before browser paint
- **Timing**: Blocks paint until complete
- **Use Case**: DOM measurements, preventing visual flash, synchronous updates
- **Visual Impact**: Changes happen before user sees anything

---

## Browser Rendering Pipeline

Understanding the rendering pipeline helps explain why timing matters:

```
1. JavaScript Execution
   ↓
2. Style Calculation (CSS)
   ↓
3. Layout (positioning)
   ↓
4. Paint (drawing)
   ↓
5. Composite (layers)
```

### React's Rendering Cycle

```
1. Render Phase
   - Component functions execute
   - Virtual DOM created
   ↓
2. Commit Phase
   - DOM mutations applied
   - useLayoutEffect runs (synchronously)
   ↓
3. Browser Paint
   - Elements painted to screen
   ↓
4. useEffect Runs
   - Side effects execute
```

**Key Point:** `useLayoutEffect` runs **before** paint, `useEffect` runs **after** paint.

---

## When to Use Each

### Use `useLayoutEffect` For

#### 1. Applying Animation Classes

**Why:** Prevents flash by applying classes before paint.

```typescript
import { useLayoutEffect, useRef } from 'react';

function AnimatedComponent() {
  const ref = useRef<HTMLDivElement>(null);
  
  useLayoutEffect(() => {
    // Apply animation class before paint
    if (ref.current) {
      ref.current.classList.add('fade-in');
    }
  }, []);
  
  return <div ref={ref}>Content</div>;
}
```

#### 2. Injecting CSS Synchronously

**Why:** Ensures CSS is available before element renders.

```typescript
import { useLayoutEffect } from 'react';

function useMotionStyles(animations: MotionOutput[]) {
  useLayoutEffect(() => {
    // Inject CSS before paint
    const styleId = `motion-styles-${animations[0].className}`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = animations.map(a => a.css).join('\n');
      document.head.appendChild(style);
    }
  }, [animations]);
}
```

#### 3. DOM Measurements Before Paint

**Why:** Measurements must happen before layout calculations.

```typescript
import { useLayoutEffect, useRef, useState } from 'react';

function MeasuredComponent() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  
  useLayoutEffect(() => {
    // Measure before paint
    if (ref.current) {
      setWidth(ref.current.offsetWidth);
    }
  }, []);
  
  return <div ref={ref}>Width: {width}px</div>;
}
```

#### 4. Preventing Visual Flash

**Why:** Synchronous updates prevent visible changes.

```typescript
import { useLayoutEffect, useRef } from 'react';

function FlashPrevention() {
  const ref = useRef<HTMLDivElement>(null);
  
  useLayoutEffect(() => {
    // Set initial state before paint
    if (ref.current) {
      ref.current.style.opacity = '0';
      ref.current.style.transform = 'translateY(20px)';
    }
  }, []);
  
  return <div ref={ref}>Content</div>;
}
```

### Use `useEffect` For

#### 1. Starting Animations

**Why:** Non-critical, can happen after paint.

```typescript
import { useEffect } from 'react';
import { useMotionValue } from '@cascade/motion-runtime';

function AnimatedComponent() {
  const opacity = useMotionValue(0, { property: 'opacity' });
  
  useEffect(() => {
    // Start animation after paint is fine
    opacity.animateTo(1, { duration: 300 });
  }, [opacity]);
  
  return (
    <div style={{ opacity: `var(${opacity.cssVarName})` }}>
      Content
    </div>
  );
}
```

#### 2. Event Listeners

**Why:** Event listeners don't affect initial render.

```typescript
import { useEffect, useRef } from 'react';

function ScrollComponent() {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      // Handle scroll
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return <div ref={ref}>Content</div>;
}
```

#### 3. Data Fetching

**Why:** Doesn't affect initial render.

```typescript
import { useEffect, useState } from 'react';

function DataComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return <div>{data ? data.content : 'Loading...'}</div>;
}
```

#### 4. Subscriptions

**Why:** Non-critical side effects.

```typescript
import { useEffect } from 'react';

function SubscriptionComponent() {
  useEffect(() => {
    const subscription = subscribeToUpdates((update) => {
      // Handle update
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  return <div>Content</div>;
}
```

---

## Cascade Motion's Approach

Cascade Motion uses both hooks appropriately:

### MotionStage

```typescript
// CSS injection: useLayoutEffect (before paint)
useLayoutEffect(() => {
  if (animation && animation.css) {
    // Inject CSS synchronously
    injectCSS(animation.css);
  }
}, [animation]);

// Class application: useLayoutEffect (before paint)
useLayoutEffect(() => {
  if (shouldStart && delay === 0) {
    element.classList.add(animationClassName);
  }
}, [shouldStart, delay]);

// Event listeners: useEffect (after paint)
useEffect(() => {
  element.addEventListener('animationstart', handleStart);
  element.addEventListener('animationend', handleEnd);
  return () => {
    element.removeEventListener('animationstart', handleStart);
    element.removeEventListener('animationend', handleEnd);
  };
}, []);
```

### useMotionStyles

```typescript
// Synchronous injection during render (before paint)
if (typeof document !== 'undefined') {
  const id = `motion-styles-${animations[0]?.className}`;
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = animations.map(a => a.css).join('\n');
    document.head.appendChild(style);
  }
}

// Fallback: useEffect for SSR/hydration
useEffect(() => {
  // Same injection logic
}, [animations]);
```

---

## Performance Considerations

### useLayoutEffect Performance

**Warning:** `useLayoutEffect` blocks paint until it completes.

**Impact:**
- Can delay first paint if work is heavy
- Use sparingly for critical operations only
- Keep work minimal and fast

**Best Practice:**
```typescript
// ✅ Fast, synchronous operation
useLayoutEffect(() => {
  element.classList.add('animation-class');
}, []);

// ❌ Heavy work - use useEffect instead
useLayoutEffect(() => {
  // Heavy computation blocks paint
  const result = expensiveCalculation();
}, []);
```

### useEffect Performance

**Benefit:** Non-blocking, doesn't delay paint.

**Use For:**
- Heavy computations
- Network requests
- Non-critical updates

---

## Common Patterns

### Pattern 1: Prevent Flash on Mount

```typescript
import { useLayoutEffect, useRef } from 'react';
import { MotionStage } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';

const fadeIn = defineMotion({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

function Component() {
  // MotionStage uses useLayoutEffect internally
  return (
    <MotionStage animation={{ className: fadeIn.className, css: fadeIn.css }}>
      Content
    </MotionStage>
  );
}
```

### Pattern 2: Measure Then Animate

```typescript
import { useLayoutEffect, useRef, useState } from 'react';
import { useMotionValue } from '@cascade/motion-runtime';

function MeasuredAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const width = useMotionValue(0, { property: 'width', unit: 'px' });
  
  // Measure before paint
  useLayoutEffect(() => {
    if (ref.current) {
      const measuredWidth = ref.current.offsetWidth;
      width.set(measuredWidth);
    }
  }, [width]);
  
  // Animate after paint
  useEffect(() => {
    width.animateTo(200, { duration: 300 });
  }, [width]);
  
  return (
    <div ref={ref} style={{ width: `var(${width.cssVarName})` }}>
      Content
    </div>
  );
}
```

### Pattern 3: Conditional Animation Setup

```typescript
import { useLayoutEffect, useRef } from 'react';
import { useMotionStyles } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';

const slideIn = defineMotion({
  from: { transform: 'translateX(-100px)' },
  to: { transform: 'translateX(0)' },
});

function ConditionalAnimation({ shouldAnimate }: { shouldAnimate: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Inject CSS synchronously
  useMotionStyles([slideIn]);
  
  // Apply class before paint
  useLayoutEffect(() => {
    if (ref.current && shouldAnimate) {
      ref.current.classList.add(slideIn.className);
    }
  }, [shouldAnimate]);
  
  return <div ref={ref}>Content</div>;
}
```

---

## Troubleshooting

### Flash Still Occurs

**Problem:** Using `useEffect` for critical operations.

**Solution:** Use `useLayoutEffect` for operations that affect initial render.

```typescript
// ❌ Flash occurs
useEffect(() => {
  element.classList.add('animation-class');
}, []);

// ✅ No flash
useLayoutEffect(() => {
  element.classList.add('animation-class');
}, []);
```

### Performance Issues

**Problem:** Heavy work in `useLayoutEffect` blocking paint.

**Solution:** Move heavy work to `useEffect`.

```typescript
// ❌ Blocks paint
useLayoutEffect(() => {
  const result = expensiveComputation();
  setState(result);
}, []);

// ✅ Doesn't block paint
useEffect(() => {
  const result = expensiveComputation();
  setState(result);
}, []);
```

---

## Best Practices

### ✅ Do

1. **Use `useLayoutEffect` for preventing flash**
2. **Use `useLayoutEffect` for DOM measurements before paint**
3. **Use `useEffect` for non-critical side effects**
4. **Keep `useLayoutEffect` work minimal and fast**
5. **Use Cascade Motion's built-in components** (they handle timing correctly)

### ❌ Don't

1. **Don't use `useLayoutEffect` for heavy computations**
2. **Don't use `useEffect` for preventing flash**
3. **Don't mix timing patterns unnecessarily**
4. **Don't block paint with slow `useLayoutEffect` operations**

---

## See Also

- [How to Prevent Animation Flash](./prevent-animation-flash.md) - Preventing visual flash
- [How to Inject Animation CSS](./inject-animation-css.md) - CSS injection patterns
- [Troubleshooting Guide](./troubleshooting.md) - Common issues and solutions


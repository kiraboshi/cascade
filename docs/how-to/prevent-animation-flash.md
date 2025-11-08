# How to Prevent Animation Flash

This guide explains how to prevent elements from flashing or appearing in their final state before animations start.

## Overview

When animations start, elements can briefly appear in their final state (or default state) before the animation begins. This creates a visual "flash" or "jank" that degrades the user experience. Cascade Motion includes built-in mechanisms to prevent this.

---

## The Problem

### What is Animation Flash?

Animation flash occurs when:
1. An element renders with its default styles (e.g., `opacity: 1`)
2. The animation CSS hasn't loaded yet
3. The animation class is applied
4. The animation starts from its `from` state (e.g., `opacity: 0`)

This causes a visible "flash" as the element jumps from the default state to the animation's `from` state.

### Example of Flash

```typescript
// ❌ This can cause flash
const fadeIn = defineMotion({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

function MyComponent() {
  return (
    <div className={fadeIn.className}>
      Content
    </div>
  );
}
```

**What happens:**
1. Element renders with `opacity: 1` (default)
2. CSS loads
3. Animation class applied
4. Element jumps to `opacity: 0` (from state)
5. Animation starts

**Result:** Visible flash!

---

## The Solution: `animation-fill-mode: backwards`

### How It Works

`animation-fill-mode: backwards` tells CSS to apply the `from` state of the animation **immediately**, even before the animation starts. This ensures the element starts in the correct initial state.

### Automatic Application

Cascade Motion **automatically includes** `animation-fill-mode: backwards` in all generated animations:

```typescript
const fadeIn = defineMotion({
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});

// Generated CSS includes:
// animation-fill-mode: backwards;
```

This means the `from` state (`opacity: 0`) is applied immediately when the animation class is added, preventing flash.

---

## CSS Injection Timing

For `animation-fill-mode: backwards` to work, the CSS must be available **before** the element renders. Cascade Motion handles this automatically:

### Pattern 1: Using MotionStage (Recommended)

`MotionStage` injects CSS synchronously during render:

```typescript
import { MotionStage } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';

const fadeIn = defineMotion({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

function MyComponent() {
  return (
    <MotionStage
      animation={{
        className: fadeIn.className,
        css: fadeIn.css,  // CSS injected synchronously
      }}
    >
      <div>Content</div>
    </MotionStage>
  );
}
```

**How it works:**
1. CSS is injected synchronously during render (before paint)
2. Animation class is applied via `useLayoutEffect` (before paint)
3. `animation-fill-mode: backwards` applies `from` state immediately
4. Element renders in correct initial state
5. Animation starts smoothly

### Pattern 2: Using useMotionStyles

`useMotionStyles` also injects CSS synchronously:

```typescript
import { useMotionStyles } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';

const fadeIn = defineMotion({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

function MyComponent() {
  // CSS injected synchronously during render
  useMotionStyles([fadeIn]);
  
  return (
    <div className={fadeIn.className}>
      Content
    </div>
  );
}
```

---

## Common Scenarios

### Scenario 1: Page Load Animation

**Problem:** Hero section flashes visible before fade-in animation starts.

**Solution:** Use `MotionStage` with `autoStart`:

```typescript
import { MotionSequence, MotionStage } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';

const heroFadeIn = defineMotion({
  from: { opacity: 0, transform: 'translateY(20px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
  duration: 600,
});

function HeroSection() {
  return (
    <MotionSequence autoStart>
      <MotionStage
        animation={{
          className: heroFadeIn.className,
          css: heroFadeIn.css,
        }}
      >
        <h1>Welcome</h1>
      </MotionStage>
    </MotionSequence>
  );
}
```

**Why it works:**
- CSS injected synchronously
- `animation-fill-mode: backwards` applies `from` state immediately
- No flash on page load

### Scenario 2: Scroll-Triggered Animation

**Problem:** Elements flash visible before scroll animation triggers.

**Solution:** Ensure CSS is injected before element renders:

```typescript
import { useMotionStyles } from '@cascade/motion-runtime';
import { useViewportAnimationWithRef } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';
import { useRef } from 'react';

const slideIn = defineMotion({
  from: { transform: 'translateY(30px)', opacity: 0 },
  to: { transform: 'translateY(0)', opacity: 1 },
});

function ScrollCard() {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(0, { property: 'opacity' });
  const y = useTranslateY(30);
  
  // Inject CSS before element renders
  useMotionStyles([slideIn]);
  
  useViewportAnimationWithRef(ref, opacity, {
    initial: 0,  // Start at 0 (matches from state)
    onEnter: { target: 1, config: { duration: 500 } },
  });
  
  useViewportAnimationWithRef(ref, y, {
    initial: 30,  // Start at 30 (matches from state)
    onEnter: { target: 0, config: { duration: 500 } },
  });
  
  return (
    <div ref={ref}>
      Content
    </div>
  );
}
```

**Why it works:**
- CSS injected synchronously
- Initial values match `from` state
- No flash when element enters viewport

### Scenario 3: Conditional Animation

**Problem:** Element flashes when animation condition becomes true.

**Solution:** Apply initial state manually or use `MotionStage`:

```typescript
import { MotionStage } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';
import { useState } from 'react';

const fadeIn = defineMotion({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

function ConditionalAnimation({ shouldAnimate }: { shouldAnimate: boolean }) {
  return (
    <MotionStage
      animation={shouldAnimate ? {
        className: fadeIn.className,
        css: fadeIn.css,
      } : undefined}
    >
      <div>Content</div>
    </MotionStage>
  );
}
```

---

## Troubleshooting

### Flash Still Occurs

**Possible Causes:**

1. **CSS not injected synchronously**
   - ✅ Use `MotionStage` or `useMotionStyles`
   - ❌ Don't inject CSS manually in `useEffect`

2. **Initial value doesn't match `from` state**
   - ✅ Set initial value to match `from` state
   - ❌ Don't use default values that differ from `from`

3. **Animation class applied too late**
   - ✅ Use `MotionStage` which applies class before paint
   - ❌ Don't apply class manually in `useEffect`

### Element Never Appears

**Possible Causes:**

1. **`animation-fill-mode: backwards` preventing visibility**
   - Check that `to` state includes visible styles
   - Ensure animation actually starts

2. **CSS not injected**
   - Check browser DevTools for CSS
   - Verify `useMotionStyles` or `MotionStage` is used

3. **Animation not starting**
   - Check `autoStart` prop on `MotionSequence`
   - Verify animation class is applied

---

## Best Practices

### ✅ Do

1. **Use `MotionStage` for automatic handling**
   ```typescript
   <MotionStage animation={{ className, css }}>
     Content
   </MotionStage>
   ```

2. **Inject CSS synchronously**
   ```typescript
   useMotionStyles([animation]); // Synchronous injection
   ```

3. **Match initial values to `from` state**
   ```typescript
   const opacity = useMotionValue(0, { property: 'opacity' });
   // Matches: from: { opacity: 0 }
   ```

4. **Use `animation-fill-mode: backwards`** (automatic in Cascade Motion)

### ❌ Don't

1. **Don't inject CSS in `useEffect`**
   ```typescript
   // ❌ Too late - causes flash
   useEffect(() => {
     const style = document.createElement('style');
     style.textContent = animation.css;
     document.head.appendChild(style);
   }, []);
   ```

2. **Don't use default values that differ from `from`**
   ```typescript
   // ❌ Flash: starts at 1, jumps to 0
   const opacity = useMotionValue(1, { property: 'opacity' });
   // Animation: from: { opacity: 0 }
   ```

3. **Don't apply animation class manually in `useEffect`**
   ```typescript
   // ❌ Too late - causes flash
   useEffect(() => {
     element.classList.add(animation.className);
   }, []);
   ```

---

## Technical Details

### Browser Rendering Pipeline

Understanding the rendering pipeline helps explain why timing matters:

1. **JavaScript Execution** - React renders components
2. **Style Calculation** - CSS is calculated
3. **Layout** - Element positions calculated
4. **Paint** - Elements painted to screen
5. **Composite** - Layers composited

**Key Point:** CSS must be available before Paint to prevent flash.

### useLayoutEffect vs useEffect

- **`useLayoutEffect`**: Runs synchronously **before** browser paint
- **`useEffect`**: Runs **after** browser paint

**For animations:**
- Use `useLayoutEffect` when applying animation classes
- Use `useEffect` for non-critical operations

Cascade Motion uses `useLayoutEffect` internally to ensure classes are applied before paint.

---

## See Also

- [How to Inject Animation CSS](./inject-animation-css.md) - CSS injection patterns
- [Animation Timing Considerations](./animation-timing-considerations.md) - useLayoutEffect vs useEffect
- [Troubleshooting Guide](./troubleshooting.md) - Common issues and solutions


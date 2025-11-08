# How to Inject Animation CSS

This guide explains the recommended patterns for injecting CSS from `defineMotion` animations.

## Overview

When you use `defineMotion` to create animations, you get a `MotionOutput` object with:
- `className` - The CSS class name to apply
- `css` - The CSS keyframes and animation rules

The CSS must be injected into the document `<head>` before the animation can run. This guide covers the recommended patterns.

---

## Pattern 1: Automatic Injection (Recommended)

**Use this when**: You're using `MotionStage` or `MotionSequence` components.

`MotionStage` automatically injects CSS when you pass an animation object with `css`:

```typescript
import { MotionStage } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';

const fadeIn = defineMotion({
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});

function MyComponent() {
  return (
    <MotionStage
      animation={{
        className: fadeIn.className,
        css: fadeIn.css,  // MotionStage injects this automatically
      }}
    >
      <div>Content</div>
    </MotionStage>
  );
}
```

**Benefits**:
- ✅ Automatic - no manual CSS injection needed
- ✅ Handles timing correctly (synchronous injection before paint)
- ✅ Deduplicates styles automatically
- ✅ Works with `MotionSequence` for multi-stage animations

---

## Pattern 2: Manual Injection with Hook

**Use this when**: You're applying animation classes directly (not using `MotionStage`).

Use the `useMotionStyles` hook for manual CSS injection:

```typescript
import { useMotionStyles } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';

const fadeIn = defineMotion({
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});

function MyComponent() {
  // Inject CSS manually
  useMotionStyles([fadeIn], 'my-animations');
  
  return (
    <div className={fadeIn.className}>
      Content
    </div>
  );
}
```

**For multiple animations**:

```typescript
const fadeIn = defineMotion({ from: { opacity: 0 }, to: { opacity: 1 } });
const slideIn = defineMotion({ from: { transform: 'translateY(20px)' }, to: { transform: 'translateY(0)' } });

function MyComponent() {
  // Inject multiple animations at once
  useMotionStyles([fadeIn, slideIn], 'my-animations');
  
  return (
    <div className={`${fadeIn.className} ${slideIn.className}`}>
      Content
    </div>
  );
}
```

**Benefits**:
- ✅ Centralized CSS injection
- ✅ Automatic deduplication
- ✅ Synchronous injection prevents flash
- ✅ Works with direct className usage

---

## Pattern 3: Single Animation Hook

**Use this when**: You only need one animation and prefer a simpler API.

```typescript
import { useMotionStyle } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';

const fadeIn = defineMotion({
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});

function MyComponent() {
  // Convenience hook for single animation
  useMotionStyle(fadeIn);
  
  return (
    <div className={fadeIn.className}>
      Content
    </div>
  );
}
```

---

## When to Use Which Pattern

| Scenario | Recommended Pattern | Why |
|----------|-------------------|-----|
| Using `MotionStage` | Pattern 1 (Automatic) | `MotionStage` handles injection automatically |
| Using `MotionSequence` | Pattern 1 (Automatic) | Stages handle injection automatically |
| Direct className usage | Pattern 2 (Manual Hook) | Need manual injection for direct class application |
| Multiple animations | Pattern 2 (Manual Hook) | Can inject multiple at once |
| Single animation, direct usage | Pattern 3 (Single Hook) | Simpler API for single animation |

---

## Important Notes

### CSS Injection Timing

Both `MotionStage` and `useMotionStyles` inject CSS:
1. **Synchronously during render** - Prevents flash on initial load
2. **In useEffect/useLayoutEffect** - Fallback for SSR/hydration

This ensures CSS is available before the element renders, preventing visual flash.

### Deduplication

Both patterns automatically deduplicate CSS by checking if a style element with the same ID already exists. You don't need to worry about injecting the same CSS multiple times.

### Style IDs

- `MotionStage`: Uses `motion-style-{className}` as the style ID
- `useMotionStyles`: Uses `motion-styles-{className}` or custom ID if provided

---

## Anti-Patterns (Don't Do This)

### ❌ Manual DOM Manipulation

```typescript
// DON'T: Manual DOM manipulation
useEffect(() => {
  const style = document.createElement('style');
  style.textContent = fadeIn.css;
  document.head.appendChild(style);
}, []);
```

**Why**: Doesn't handle deduplication, timing, or SSR properly.

### ❌ Injecting CSS Multiple Times

```typescript
// DON'T: Injecting CSS in multiple places
function Component1() {
  useMotionStyles([fadeIn]); // Injected here
}

function Component2() {
  useMotionStyles([fadeIn]); // And here - redundant but safe (deduplicated)
}
```

**Why**: While safe (deduplication prevents issues), it's redundant. Inject once at a higher level if multiple components use the same animation.

### ❌ Mixing Patterns Unnecessarily

```typescript
// DON'T: Using MotionStage AND manual injection
function MyComponent() {
  useMotionStyles([fadeIn]); // Manual injection
  
  return (
    <MotionStage animation={{ className: fadeIn.className, css: fadeIn.css }}>
      {/* MotionStage will also inject - redundant */}
    </MotionStage>
  );
}
```

**Why**: `MotionStage` already handles injection. Manual injection is redundant.

---

## Examples

### Example 1: Hero Section with Sequence

```typescript
import { MotionSequence, MotionStage } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';

const titleAnimation = defineMotion({ from: { opacity: 0 }, to: { opacity: 1 } });
const subtitleAnimation = defineMotion({ from: { opacity: 0 }, to: { opacity: 1 } });

function HeroSection() {
  // No manual injection needed - MotionStage handles it
  return (
    <MotionSequence autoStart>
      <MotionStage animation={{ className: titleAnimation.className, css: titleAnimation.css }}>
        <h1>Title</h1>
      </MotionStage>
      <MotionStage animation={{ className: subtitleAnimation.className, css: subtitleAnimation.css }} delay={200}>
        <p>Subtitle</p>
      </MotionStage>
    </MotionSequence>
  );
}
```

### Example 2: Scroll-Triggered Animation

```typescript
import { useMotionStyles } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';
import { useEffect, useRef } from 'react';

const fadeIn = defineMotion({ from: { opacity: 0 }, to: { opacity: 1 } });

function ScrollCard() {
  const ref = useRef<HTMLDivElement>(null);
  
  // Inject CSS manually since we're using className directly
  useMotionStyles([fadeIn]);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          ref.current?.classList.add(fadeIn.className);
        }
      });
    });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return <div ref={ref}>Content</div>;
}
```

### Example 3: Shared Animation Library

```typescript
// animations.ts
import { defineMotion } from '@cascade/compiler';

export const animations = {
  fadeIn: defineMotion({ from: { opacity: 0 }, to: { opacity: 1 } }),
  slideIn: defineMotion({ from: { transform: 'translateY(20px)' }, to: { transform: 'translateY(0)' } }),
  scaleIn: defineMotion({ from: { transform: 'scale(0.8)' }, to: { transform: 'scale(1)' } }),
};

// App.tsx
import { useMotionStyles } from '@cascade/motion-runtime';
import { animations } from './animations';

function App() {
  // Inject all animations once at app level
  useMotionStyles(Object.values(animations), 'app-animations');
  
  return (
    // Use animations throughout app
  );
}
```

---

## Summary

- **Use `MotionStage`** for automatic CSS injection (recommended)
- **Use `useMotionStyles`** for manual injection when applying classes directly
- **Don't mix patterns** unnecessarily
- **Inject once** at the highest level if multiple components use the same animation
- Both patterns handle timing and deduplication automatically


# Viewport Animation Patterns

This guide covers best practices for creating scroll-triggered animations with Cascade Motion.

## Overview

Viewport animations trigger when elements enter or leave the viewport. Cascade Motion provides several hooks and patterns for implementing these animations effectively.

---

## Core Hooks

### useViewportAnimationWithRef

The recommended hook for viewport animations. Provides full control over element ref and animation behavior.

```typescript
import { useViewportAnimationWithRef } from '@cascade/motion-runtime';
import { useMotionValue, useTranslateY } from '@cascade/motion-runtime';
import { useRef } from 'react';

function ScrollCard() {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(0, { property: 'opacity' });
  const y = useTranslateY(30);
  
  useViewportAnimationWithRef(ref, opacity, {
    initial: 0,
    threshold: 0.2,
    onEnter: {
      target: 1,
      config: { duration: 500, easing: 'ease-out' },
    },
    onExit: {
      target: 0,
      config: { duration: 300, easing: 'ease-in' },
    },
    once: false, // Re-animate when scrolling back into view
    pauseWhenOffScreen: true, // Default: true - pauses animations when off-screen
  });
  
  useViewportAnimationWithRef(ref, y, {
    initial: 30,
    threshold: 0.2,
    onEnter: {
      target: 0,
      config: { duration: 500, easing: 'ease-out' },
    },
    onExit: {
      target: 30,
      config: { duration: 300, easing: 'ease-in' },
    },
  });
  
  return (
    <div
      ref={ref}
      style={{
        opacity: `var(${opacity.cssVarName})`,
        transform: `translateY(var(${y.cssVarName}px))`,
      }}
    >
      Content
    </div>
  );
}
```

### Convenience Hooks

For common patterns, use convenience hooks:

```typescript
import { useFadeInOnScroll, useSlideInOnScroll } from '@cascade/motion-runtime';
import { useRef } from 'react';

function SimpleCard() {
  const ref = useRef<HTMLDivElement>(null);
  
  // Fade in on scroll
  useFadeInOnScroll(ref, {
    duration: 500,
    threshold: 0.2,
  });
  
  return <div ref={ref}>Content</div>;
}
```

---

## MotionSequence with Viewport Triggers

### Basic Pattern

Use `MotionSequence` with reactive `autoStart` prop:

```typescript
import { MotionSequence, MotionStage } from '@cascade/motion-runtime';
import { useInView } from '@cascade/motion-runtime';
import { useRef } from 'react';
import { defineMotion } from '@cascade/compiler';

const fadeIn = defineMotion({
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 500,
});

function AnimatedSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { threshold: 0.2 });
  
  return (
    <div ref={ref}>
      <MotionSequence autoStart={isInView}>
        <MotionStage
          animation={{
            className: fadeIn.className,
            css: fadeIn.css,
          }}
        >
          <h2>Title</h2>
        </MotionStage>
        <MotionStage
          animation={{
            className: fadeIn.className,
            css: fadeIn.css,
          }}
          delay={200}
        >
          <p>Subtitle</p>
        </MotionStage>
      </MotionSequence>
    </div>
  );
}
```

**Key Points:**
- `autoStart` prop is now **reactive** (fixed in v1.1+)
- Sequence starts when `isInView` becomes `true`
- Sequence resets when `isInView` becomes `false`
- Works perfectly with scroll triggers

### Staggered Animations

Create staggered animations with delays:

```typescript
function StaggeredList() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { threshold: 0.1 });
  
  return (
    <div ref={ref}>
      <MotionSequence autoStart={isInView}>
        {items.map((item, index) => (
          <MotionStage
            key={item.id}
            animation={{
              className: fadeIn.className,
              css: fadeIn.css,
            }}
            delay={index * 100} // Stagger by 100ms
          >
            <div>{item.content}</div>
          </MotionStage>
        ))}
      </MotionSequence>
    </div>
  );
}
```

---

## Common Patterns

### Pattern 1: Fade In on Scroll

```typescript
import { useFadeInOnScroll } from '@cascade/motion-runtime';
import { useRef } from 'react';

function FadeInCard() {
  const ref = useRef<HTMLDivElement>(null);
  
  useFadeInOnScroll(ref, {
    duration: 500,
    threshold: 0.2,
    once: true, // Only animate once
  });
  
  return <div ref={ref}>Content</div>;
}
```

### Pattern 2: Slide Up on Scroll

```typescript
import { useSlideInOnScroll } from '@cascade/motion-runtime';
import { useRef } from 'react';

function SlideUpCard() {
  const ref = useRef<HTMLDivElement>(null);
  
  useSlideInOnScroll(ref, {
    direction: 'up',
    distance: 30,
    duration: 500,
    threshold: 0.2,
  });
  
  return <div ref={ref}>Content</div>;
}
```

### Pattern 3: Fade Out on Scroll Up

```typescript
import { useViewportAnimationWithRef } from '@cascade/motion-runtime';
import { useMotionValue } from '@cascade/motion-runtime';
import { useRef } from 'react';

function FadeOutCard() {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(1, { property: 'opacity' });
  
  useViewportAnimationWithRef(ref, opacity, {
    initial: 1,
    threshold: 0.5,
    onEnter: {
      target: 1, // Visible when in view
      config: { duration: 300 },
    },
    onExit: {
      target: 0, // Fade out when leaving view
      config: { duration: 300 },
    },
    once: false,
  });
  
  return (
    <div
      ref={ref}
      style={{ opacity: `var(${opacity.cssVarName})` }}
    >
      Content
    </div>
  );
}
```

### Pattern 4: Parallax Effect

```typescript
import { usePauseWhenOffScreen } from '@cascade/motion-runtime';
import { useTranslateY } from '@cascade/motion-runtime';
import { useRef, useEffect } from 'react';

function ParallaxSection() {
  const ref = useRef<HTMLDivElement>(null);
  const y = useTranslateY(0);
  
  // Pause parallax updates when off-screen (performance optimization)
  usePauseWhenOffScreen(ref, {
    motionValues: [y],
    threshold: 0.1,
  });
  
  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const scrollProgress = (window.innerHeight - rect.top) / window.innerHeight;
      const parallaxOffset = scrollProgress * 100;
      
      y.set(parallaxOffset);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [y]);
  
  return (
    <div
      ref={ref}
      style={{ transform: `translateY(var(${y.cssVarName}px))` }}
    >
      Parallax Content
    </div>
  );
}
```

### Pattern 5: Combined MotionSequence + Motion Values

```typescript
import { MotionSequence, MotionStage, usePauseWhenOffScreen } from '@cascade/motion-runtime';
import { useInView, useTranslateY, useRotate } from '@cascade/motion-runtime';
import { useRef, useEffect } from 'react';
import { defineMotion } from '@cascade/compiler';

const spinIn = defineMotion({
  from: { transform: 'rotate(0deg) scale(0.8)', opacity: 0 },
  to: { transform: 'rotate(360deg) scale(1)', opacity: 1 },
  duration: 1000,
});

function ComplexCard() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { threshold: 0.2 });
  const parallaxY = useTranslateY(0);
  const rotation = useRotate(0);
  
  // Pause animations when off-screen (performance optimization)
  usePauseWhenOffScreen(ref, {
    motionValues: [parallaxY, rotation],
    threshold: 0.1,
  });
  
  // Parallax effect
  useEffect(() => {
    if (!isInView) return;
    
    const handleScroll = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      
      const progress = (window.innerHeight - rect.top) / window.innerHeight;
      parallaxY.set(progress * 50);
      rotation.set(progress * 10);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isInView, parallaxY, rotation]);
  
  return (
    <div ref={ref}>
      <MotionSequence autoStart={isInView}>
        <MotionStage
          animation={{
            className: spinIn.className,
            css: spinIn.css,
          }}
        >
          <div
            style={{
              transform: `
                translateY(var(${parallaxY.cssVarName}px))
                rotate(var(${rotation.cssVarName}deg))
              `,
            }}
          >
            Complex Animation
          </div>
        </MotionStage>
      </MotionSequence>
    </div>
  );
}
```

**Note**: The `autoStart` prop on `MotionSequence` is reactive - it automatically starts when `isInView` becomes `true` and resets when it becomes `false`.

---

## Best Practices

### ✅ Do

1. **Use `useViewportAnimationWithRef` for control**
   ```typescript
   const ref = useRef<HTMLDivElement>(null);
   useViewportAnimationWithRef(ref, motionValue, config);
   ```

2. **Set appropriate thresholds**
   ```typescript
   useViewportAnimationWithRef(ref, opacity, {
     threshold: 0.2, // Trigger at 20% visibility
   });
   ```

3. **Match initial values to `from` state**
   ```typescript
   const opacity = useMotionValue(0, { property: 'opacity' });
   // Matches: from: { opacity: 0 }
   ```

4. **Use `MotionSequence` with reactive `autoStart`**
   ```typescript
   <MotionSequence autoStart={isInView}>
     {/* Properly reacts to viewport changes */}
   </MotionSequence>
   ```

5. **Inject CSS before element renders**
   ```typescript
   useMotionStyles([animation]); // Synchronous injection
   ```

### ❌ Don't

1. **Don't use old `autoStart` pattern (pre-v1.1)**
   ```typescript
   // ❌ Old: autoStart only checked on mount
   <MotionSequence autoStart={isInView}>
     {/* Doesn't react to changes */}
   </MotionSequence>
   ```

2. **Don't apply classes manually**
   ```typescript
   // ❌ Wrong: Manual class application
   useEffect(() => {
     if (isInView) {
       element.classList.add(animation.className);
     }
   }, [isInView]);
   ```

3. **Don't use high thresholds**
   ```typescript
   // ❌ Too high: May never trigger
   useViewportAnimationWithRef(ref, opacity, {
     threshold: 1.0, // Requires 100% visibility
   });
   ```

4. **Don't forget to attach refs**
   ```typescript
   // ❌ Missing ref
   const ref = useRef<HTMLDivElement>(null);
   useViewportAnimationWithRef(ref, opacity, config);
   return <div>Content</div>; // Missing ref={ref}
   ```

---

## Performance Considerations

### 1. Use GPU-Accelerated Properties

```typescript
// ✅ GPU-accelerated
const opacity = useMotionValue(0, { property: 'opacity' });
const y = useTranslateY(0);

// ❌ Layout-triggering
const height = useMotionValue(0, { property: 'height' });
```

### 2. Debounce Scroll Handlers

```typescript
import { useRef, useCallback } from 'react';

function useDebouncedScroll(callback: () => void, delay = 16) {
  const timeoutRef = useRef<number>();
  
  return useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(callback, delay);
  }, [callback, delay]);
}
```

### 3. Use `once: true` When Appropriate

```typescript
// ✅ Only animate once if you don't need re-animation
useFadeInOnScroll(ref, {
  once: true, // Don't re-animate when scrolling back
});
```

---

## Troubleshooting

### Animations Not Triggering

**Check:**
1. ✅ Ref is attached to element
2. ✅ Threshold is appropriate (not too high)
3. ✅ `autoStart` prop is reactive (v1.1+)
4. ✅ CSS is injected before element renders
5. ✅ Initial values match `from` state

### Animations Triggering Too Early/Late

**Adjust threshold:**
```typescript
// Lower threshold = triggers earlier
useViewportAnimationWithRef(ref, opacity, {
  threshold: 0.1, // Triggers at 10% visibility
});

// Higher threshold = triggers later
useViewportAnimationWithRef(ref, opacity, {
  threshold: 0.5, // Triggers at 50% visibility
});
```

### Performance Issues

**Solutions:**
- Use GPU-accelerated properties (`transform`, `opacity`)
- Debounce scroll handlers
- Use `once: true` when re-animation isn't needed
- Avoid layout-triggering properties

---

## See Also

- [How to Animate on Scroll](./animate-on-scroll.md) - Basic scroll animation guide
- [How to Prevent Animation Flash](./prevent-animation-flash.md) - Preventing visual flash
- [Troubleshooting Guide](./troubleshooting.md) - Common issues and solutions
- [MotionSequence Reference](../reference/sequences.md) - MotionSequence API


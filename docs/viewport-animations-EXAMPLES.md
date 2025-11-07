# Viewport Animations Examples

Complete code examples for common viewport animation patterns.

## Basic Examples

### Fade In

```tsx
import { useRef } from 'react';
import { useFadeInOnScroll } from '@cascade/motion-runtime';

function FadeInExample() {
  const ref = useRef<HTMLDivElement>(null);
  
  useFadeInOnScroll(ref, {
    threshold: 0.2,
    duration: 500,
    once: true,
  });
  
  return (
    <div ref={ref}>
      Content that fades in
    </div>
  );
}
```

### Slide Up

```tsx
import { useRef } from 'react';
import { useSlideInOnScroll } from '@cascade/motion-runtime';

function SlideUpExample() {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = useSlideInOnScroll(ref, {
    direction: 'up',
    distance: 50,
    duration: 600,
    threshold: 0.2,
    once: true,
  });
  
  return (
    <div
      ref={ref}
      style={{
        transform: `translate(${x.get()}px, ${y.get()}px)`,
      }}
    >
      Content that slides up
    </div>
  );
}
```

## Advanced Examples

### Multi-Property Animation

```tsx
import { useRef } from 'react';
import { useMotionValue, useViewportAnimationWithRef } from '@cascade/motion-runtime';

function MultiPropertyExample() {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(0);
  const scale = useMotionValue(0.8);
  const rotate = useMotionValue(-10);
  
  useViewportAnimationWithRef(ref, opacity, {
    initial: 0,
    onEnter: { target: 1, config: { duration: 600 } },
  });
  
  useViewportAnimationWithRef(ref, scale, {
    initial: 0.8,
    onEnter: { target: 1, config: { stiffness: 300, damping: 25 } },
  });
  
  useViewportAnimationWithRef(ref, rotate, {
    initial: -10,
    onEnter: { target: 0, config: { duration: 600 } },
  });
  
  return (
    <div
      ref={ref}
      style={{
        opacity: opacity.get(),
        transform: `scale(${scale.get()}) rotate(${rotate.get()}deg)`,
      }}
    >
      Multi-property animation
    </div>
  );
}
```

### Staggered Animations

```tsx
import { useRef } from 'react';
import { useFadeInOnScroll } from '@cascade/motion-runtime';

function StaggeredExample() {
  const items = Array.from({ length: 5 }, (_, i) => i);
  
  return (
    <div>
      {items.map((i) => (
        <AnimatedItem key={i} index={i} />
      ))}
    </div>
  );
}

function AnimatedItem({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useFadeInOnScroll(ref, {
    threshold: 0.1,
    duration: 400,
    once: true,
  });
  
  return (
    <div ref={ref} style={{ marginBottom: '2rem' }}>
      Item {index + 1}
    </div>
  );
}
```

### Conditional Animation

```tsx
import { useRef, useState } from 'react';
import { useInView } from '@cascade/motion-runtime';

function ConditionalExample() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { threshold: 0.5 });
  
  return (
    <div
      ref={ref}
      style={{
        backgroundColor: isInView ? '#4ade80' : '#f87171',
        padding: '2rem',
        transition: 'background-color 0.3s',
      }}
    >
      {isInView ? 'In view!' : 'Out of view'}
    </div>
  );
}
```

### Spring Animation

```tsx
import { useRef } from 'react';
import { useFadeInOnScroll } from '@cascade/motion-runtime';

function SpringExample() {
  const ref = useRef<HTMLDivElement>(null);
  
  useFadeInOnScroll(ref, {
    threshold: 0.2,
    useSpring: true,
    spring: {
      stiffness: 300,
      damping: 30,
    },
    once: true,
  });
  
  return (
    <div ref={ref}>
      Content with spring animation
    </div>
  );
}
```

### Exit Animation

```tsx
import { useRef } from 'react';
import { useMotionValue, useViewportAnimationWithRef } from '@cascade/motion-runtime';

function ExitAnimationExample() {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(1);
  
  useViewportAnimationWithRef(ref, opacity, {
    initial: 1,
    onEnter: {
      target: 1,
      config: { duration: 500 },
    },
    onExit: {
      target: 0,
      config: { duration: 300 },
    },
  });
  
  return (
    <div
      ref={ref}
      style={{
        opacity: opacity.get(),
      }}
    >
      Fades out when leaving viewport
    </div>
  );
}
```

## Real-World Examples

### Card Grid with Fade-In

```tsx
import { useRef } from 'react';
import { useFadeInOnScroll } from '@cascade/motion-runtime';

function CardGrid() {
  const cards = [
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
  ];
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
      {cards.map((card) => (
        <Card key={card.id} title={card.title} />
      ))}
    </div>
  );
}

function Card({ title }: { title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useFadeInOnScroll(ref, {
    threshold: 0.2,
    duration: 500,
    once: true,
  });
  
  return (
    <div
      ref={ref}
      style={{
        padding: '2rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
      }}
    >
      <h3>{title}</h3>
    </div>
  );
}
```

### Section Reveal

```tsx
import { useRef } from 'react';
import { useSlideInOnScroll } from '@cascade/motion-runtime';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { x, y } = useSlideInOnScroll(ref, {
    direction: 'up',
    distance: 50,
    duration: 600,
    threshold: 0.1,
    once: true,
  });
  
  return (
    <section
      ref={ref}
      style={{
        transform: `translate(${x.get()}px, ${y.get()}px)`,
        padding: '4rem 0',
      }}
    >
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

### Progress Indicator

```tsx
import { useRef } from 'react';
import { useInViewState } from '@cascade/motion-runtime';

function ProgressIndicator() {
  const ref = useRef<HTMLDivElement>(null);
  const { entry } = useInViewState(ref, {
    threshold: [0, 0.25, 0.5, 0.75, 1],
  });
  
  const progress = entry ? entry.intersectionRatio * 100 : 0;
  
  return (
    <div ref={ref} style={{ position: 'relative', height: '200px' }}>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: `${progress}%`,
          height: '4px',
          backgroundColor: '#3b82f6',
          transition: 'width 0.1s',
        }}
      />
      <p>Progress: {progress.toFixed(1)}%</p>
    </div>
  );
}
```

## Performance Tips

### Use `once: true` for Static Content

```tsx
// Good: Only animate once for static content
useFadeInOnScroll(ref, { once: true });

// Avoid: Re-animating on every scroll for static content
useFadeInOnScroll(ref, { once: false });
```

### Optimize Threshold

```tsx
// Good: Trigger early for better UX
useFadeInOnScroll(ref, { threshold: 0.1 });

// Avoid: Waiting until fully visible
useFadeInOnScroll(ref, { threshold: 1 });
```

### Use Transform for Animations

```tsx
// Good: GPU-accelerated
useSlideInOnScroll(ref, { direction: 'up' });

// Avoid: Layout-triggering properties
// (opacity is fine, but avoid width/height animations)
```

## See Also

- 📚 [API Reference](./viewport-animations-API.md) - Complete API documentation
- 🚀 [Getting Started](./viewport-animations-GETTING_STARTED.md) - Step-by-step guide


# Getting Started with Cascade Motion

A step-by-step tutorial to get you up and running with Cascade Motion.

---

## What You'll Learn

By the end of this tutorial, you'll:
- ✅ Install Cascade Motion in your project
- ✅ Create your first animated component
- ✅ Understand how motion values work
- ✅ Know where to go next

---

## Prerequisites

- Basic knowledge of React
- A React project set up (Vite, Next.js, Create React App, etc.)
- Familiarity with TypeScript (recommended)

---

## Step 1: Installation

Install Cascade Motion packages:

```bash
# Using npm
npm install @cascade/motion-runtime @cascade/motion-gestures

# Using pnpm
pnpm add @cascade/motion-runtime @cascade/motion-gestures

# Using yarn
yarn add @cascade/motion-runtime @cascade/motion-gestures
```

---

## Step 2: Your First Animation

Let's create a simple fade-in animation.

### 2.1 Create a Component

Create a new component file:

```typescript
// FadeIn.tsx
import { useMotionValue } from '@cascade/motion-runtime';
import { useEffect } from 'react';

export function FadeIn() {
  const opacity = useMotionValue(0, { property: 'opacity' });
  
  useEffect(() => {
    // Animate to full opacity when component mounts
    opacity.animateTo(1, {
      duration: 500,
      easing: 'ease-out',
    });
  }, [opacity]);
  
  return (
    <div
      style={{
        opacity: `var(${opacity.cssVarName})`,
      }}
    >
      Hello, Cascade Motion!
    </div>
  );
}
```

### 2.2 Use the Component

```typescript
// App.tsx
import { FadeIn } from './FadeIn';

function App() {
  return <FadeIn />;
}
```

**What happened?**
- We created a motion value for opacity starting at `0`
- We animated it to `1` when the component mounts
- The CSS custom property `--motion-value-{id}` is updated automatically
- The element fades in smoothly!

---

## Step 3: Understanding Motion Values

Motion values are reactive values that control CSS custom properties. They bridge JavaScript state and CSS animations.

### Key Concepts

1. **Motion values are reactive**: They update CSS custom properties automatically
2. **CSS-first approach**: Animations happen in CSS, not JavaScript
3. **Type-safe**: Full TypeScript support

### Creating Motion Values

```typescript
// Basic motion value
const opacity = useMotionValue(1, { property: 'opacity' });

// Transform motion value (automatically uses transform)
const x = useMotionValue(0, { property: 'x', unit: 'px' });
const scale = useMotionValue(1, { property: 'scale' });
```

### Using Motion Values in CSS

```typescript
<div
  style={{
    opacity: `var(${opacity.cssVarName})`,
    transform: `translateX(var(${x.cssVarName})) scale(var(${scale.cssVarName}))`,
  }}
>
  Content
</div>
```

---

## Step 4: Your First Interactive Animation

Let's add a hover effect:

```typescript
// HoverCard.tsx
import { useHoverAnimation } from '@cascade/motion-gestures';
import { useScale } from '@cascade/motion-runtime';

export function HoverCard() {
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
  
  return (
    <div
      ref={hoverRef}
      style={{
        transform: `scale(var(${scale.cssVarName}))`,
        transition: 'transform 0.2s',
      }}
    >
      Hover me!
    </div>
  );
}
```

**What happened?**
- We used `useScale` helper for a scale motion value
- `useHoverAnimation` automatically animates on hover
- Spring physics makes it feel natural

---

## Step 5: Common Patterns

### Pattern 1: Fade In on Mount

```typescript
const opacity = useMotionValue(0, { property: 'opacity' });

useEffect(() => {
  opacity.animateTo(1, { duration: 300 });
}, [opacity]);
```

### Pattern 2: Slide In

```typescript
const x = useTranslateX(-100);

useEffect(() => {
  x.animateTo(0, { duration: 400, easing: 'ease-out' });
}, [x]);
```

### Pattern 3: Spring Animation

```typescript
const y = useTranslateY(0);

const handleClick = () => {
  y.animateTo(100, {
    stiffness: 300,
    damping: 30,
  });
};
```

---

## Step 6: Next Steps

Now that you've created your first animations, here's where to go next:

### Learn More

1. **Motion Values Tutorial** - Deep dive into motion values
   - [Motion Values Tutorial](./motion-values.md)

2. **Gestures Tutorial** - Learn about drag, hover, and scroll gestures
   - [Gestures Tutorial](./gestures.md)

3. **How-to Guides** - Solve specific problems
   - [How to Create Fade Animation](../how-to/create-fade-animation.md)
   - [How to Add Drag Gesture](../how-to/add-drag-gesture.md)

### Reference Documentation

- [Motion Values API Reference](../reference/motion-values.md)
- [Gestures API Reference](../reference/gestures.md)

### Understand the Design

- [CSS-First Philosophy](../explanations/css-first-philosophy.md) - Why CSS-first?
- [Motion Values Explained](../explanations/motion-values.md) - Conceptual overview

---

## Common Questions

### Q: Do I need to inject CSS?

No! Motion values automatically update CSS custom properties. Just use `var(${motionValue.cssVarName})` in your styles.

### Q: Can I use this with CSS-in-JS libraries?

Yes! Motion values work with any CSS-in-JS solution that supports CSS custom properties.

### Q: How does this compare to Framer Motion?

Cascade Motion uses a CSS-first approach, meaning animations run in CSS rather than JavaScript. This provides better performance and smaller bundle sizes. See the [comparison guide](../explanations/comparison-framer-motion.md) for details.

---

## Troubleshooting

### Animation not working?

1. Make sure you're using the CSS custom property: `var(${motionValue.cssVarName})`
2. Check that the motion value is being updated (use `onChange` to debug)
3. Verify the CSS property supports CSS custom properties

### Type errors?

Make sure you have TypeScript configured and `@cascade/motion-runtime` types are installed.

---

## Summary

You've learned:
- ✅ How to install Cascade Motion
- ✅ How to create motion values
- ✅ How to animate values
- ✅ How to add hover effects
- ✅ Common animation patterns

**Ready for more?** Check out the [tutorials](./) and [how-to guides](../how-to/)!


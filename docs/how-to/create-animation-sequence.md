# How to Create an Animation Sequence

A step-by-step guide to creating multi-stage animation sequences.

---

## Goal

Create a sequence of animations that play one after another (or overlapping).

---

## Solution

### Step 1: Define Animations

```typescript
import { defineMotion } from '@cascade/compiler';

const fadeIn = defineMotion({
  type: 'spring',
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});

const slideIn = defineMotion({
  type: 'spring',
  from: { transform: 'translateY(20px)' },
  to: { transform: 'translateY(0)' },
  duration: 400,
});
```

### Step 2: Create Sequence with CSS Injection

**Recommended**: Pass CSS to `MotionStage` for automatic injection:

```typescript
import { MotionSequence, MotionStage } from '@cascade/motion-runtime';

<MotionSequence autoStart>
  <MotionStage 
    animation={{
      className: fadeIn.className,
      css: fadeIn.css,  // CSS automatically injected
    }}
  >
    Stage 1
  </MotionStage>
  <MotionStage 
    animation={{
      className: slideIn.className,
      css: slideIn.css,  // CSS automatically injected
    }}
    delay="until-previous-completes"
  >
    Stage 2
  </MotionStage>
</MotionSequence>
```

**Alternative**: Use `useMotionStyles` hook for manual injection:

```typescript
import { useMotionStyles } from '@cascade/motion-runtime';

function MySequence() {
  useMotionStyles([fadeIn, slideIn]); // Inject CSS once
  
  return (
    <MotionSequence autoStart>
      <MotionStage animation={fadeIn.className}>
        Stage 1
      </MotionStage>
      <MotionStage 
        animation={slideIn.className}
        delay="until-previous-completes"
      >
        Stage 2
      </MotionStage>
    </MotionSequence>
  );
}
```

**Note**: The `autoStart` prop is reactive - it will start/stop the sequence when the prop value changes. This makes it perfect for viewport-triggered animations:

```typescript
import { MotionSequence, MotionStage } from '@cascade/motion-runtime';
import { useInView } from '@cascade/motion-runtime';
import { useRef } from 'react';

function ViewportSequence() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { threshold: 0.2 });
  
  return (
    <div ref={ref}>
      <MotionSequence autoStart={isInView}>
        <MotionStage animation={{ className: fadeIn.className, css: fadeIn.css }}>
          Stage 1 (starts when in view)
        </MotionStage>
        <MotionStage 
          animation={{ className: slideIn.className, css: slideIn.css }}
          delay="until-previous-completes"
        >
          Stage 2
        </MotionStage>
      </MotionSequence>
    </div>
  );
}
```

See [How to Inject Animation CSS](./inject-animation-css.md) for detailed patterns.

---

## Complete Example

```typescript
import { MotionSequence, MotionStage } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';
import { useEffect } from 'react';

function AnimatedSequence() {
  const fadeIn = defineMotion({
    type: 'spring',
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 300,
  });
  
  const slideIn = defineMotion({
    type: 'spring',
    from: { transform: 'translateY(20px)' },
    to: { transform: 'translateY(0)' },
    duration: 400,
  });
  
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fadeIn.css + slideIn.css;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <MotionSequence
      autoStart
      onComplete={() => console.log('Sequence complete')}
    >
      <MotionStage
        animation={fadeIn.className}
        onComplete={(e) => {
          console.log('Stage 1 complete');
          e.next();
        }}
      >
        <h2>Title</h2>
      </MotionStage>
      <MotionStage
        animation={slideIn.className}
        delay="until-previous-completes"
        onComplete={(e) => {
          console.log('Stage 2 complete');
          e.next();
        }}
      >
        <p>Content</p>
      </MotionStage>
    </MotionSequence>
  );
}
```

---

## Variations

### Overlapping Stages

```typescript
<MotionSequence autoStart>
  <MotionStage animation={fadeIn}>
    Stage 1
  </MotionStage>
  <MotionStage 
    animation={slideIn}
    delay={200}  // Start 200ms after Stage 1 starts
  >
    Stage 2 (overlaps)
  </MotionStage>
</MotionSequence>
```

### Programmatic Control

```typescript
import { useMotionSequence } from '@cascade/motion-runtime';

function ControlledSequence() {
  const { start, pause, resume, reset, state } = useMotionSequence(3, {
    autoStart: false,
    onComplete: () => console.log('Done!'),
  });
  
  return (
    <div>
      <button onClick={start}>Start</button>
      <button onClick={pause}>Pause</button>
      <button onClick={resume}>Resume</button>
      <button onClick={reset}>Reset</button>
      <p>Stage: {state.currentStage + 1} / 3</p>
    </div>
  );
}
```

### With Layout Transitions

```typescript
<MotionSequence
  autoStart
  layoutTransition={{ duration: 300 }}
>
  <MotionStage animation={fadeIn}>
    Stage 1
  </MotionStage>
  <MotionStage 
    animation={slideIn}
    delay="until-previous-completes"
  >
    Stage 2
  </MotionStage>
</MotionSequence>
```

---

## Related Guides

- [Sequences API Reference](../reference/sequences.md)
- [Motion Values Tutorial](../tutorials/motion-values.md)

---

## See Also

- [MotionSequence API Reference](../reference/sequences.md#motionsequence)
- [MotionStage API Reference](../reference/sequences.md#motionstage)
- [useMotionSequence API Reference](../reference/sequences.md#usemotionsequence)


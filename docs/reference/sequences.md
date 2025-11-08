# Motion Sequences API Reference

Complete technical reference for animation sequences in Cascade Motion.

---

## Overview

Motion sequences allow you to orchestrate multiple animation stages, creating complex, multi-step animations with precise timing control.

---

## Components

### `<MotionSequence>`

Orchestrates multiple animation stages.

**Props:**
```typescript
interface MotionSequenceProps {
  children: ReactNode;
  onComplete?: () => void;
  autoStart?: boolean;
  respectReducedMotion?: boolean;
  pauseOnHover?: boolean;
  layoutTransition?: boolean | LayoutTransitionConfig;
}
```

**Properties:**

- `children`: React children (should be `MotionStage` components)
- `onComplete`: Callback when all stages complete
- `autoStart`: Start automatically on mount (default: `false`)
- `respectReducedMotion`: Respect `prefers-reduced-motion` (default: `true`)
- `pauseOnHover`: Pause animation on hover (default: `false`)
- `layoutTransition`: Enable layout transitions for stages (default: `false`)

**Example:**
```typescript
import { MotionSequence, MotionStage } from '@cascade/motion-runtime';

function MySequence() {
  return (
    <MotionSequence
      autoStart
      onComplete={() => console.log('Sequence complete')}
    >
      <MotionStage animation={stage1Animation}>
        Stage 1 content
      </MotionStage>
      <MotionStage 
        animation={stage2Animation}
        delay="until-previous-completes"
      >
        Stage 2 content
      </MotionStage>
    </MotionSequence>
  );
}
```

---

### `<MotionStage>`

Individual animation stage component.

**Props:**
```typescript
interface MotionStageProps {
  animation: string | { className: string; css?: string };
  delay?: number | 'until-previous-completes';
  onComplete?: (event: { next: () => void }) => void;
  onStart?: () => void;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
  layoutTransition?: boolean | LayoutTransitionConfig;
}
```

**Properties:**

- `animation`: Animation class name or object with `className` and optional `css`
- `delay`: Delay before starting (ms) or `'until-previous-completes'`
- `onComplete`: Callback when stage completes (receives `{ next: () => void }`)
- `onStart`: Callback when stage starts
- `style`: Additional inline styles
- `className`: Additional CSS classes
- `children`: Stage content
- `layoutTransition`: Enable layout transition for this stage

**Example:**
```typescript
import { MotionStage } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';

const fadeIn = defineMotion({
  type: 'spring',
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});

function MyStage() {
  return (
    <MotionStage
      animation={{
        className: fadeIn.className,
        css: fadeIn.css,
      }}
      onComplete={(e) => {
        console.log('Stage complete');
        e.next(); // Trigger next stage
      }}
    >
      Stage content
    </MotionStage>
  );
}
```

---

## Hooks

### `useMotionSequence(stageCount, options?): MotionSequenceControls`

Hook for programmatic sequence control.

**Signature:**
```typescript
function useMotionSequence(
  stageCount: number,
  options?: UseMotionSequenceOptions
): MotionSequenceControls
```

**Parameters:**

- `stageCount`: Number of stages in the sequence
- `options?`: Optional configuration (see `UseMotionSequenceOptions` below)

**Returns:**
```typescript
interface MotionSequenceControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  goToStage: (index: number) => void;
  state: SequenceState;
}
```

**Example:**
```typescript
import { useMotionSequence } from '@cascade/motion-runtime';

function MyComponent() {
  const { start, pause, state } = useMotionSequence(3, {
    autoStart: true,
    onComplete: () => console.log('Done!'),
  });
  
  return (
    <div>
      <button onClick={pause}>Pause</button>
      <p>Current stage: {state.currentStage}</p>
    </div>
  );
}
```

---

## Configuration Types

### `UseMotionSequenceOptions`

Configuration for `useMotionSequence` hook.

```typescript
interface UseMotionSequenceOptions {
  autoStart?: boolean;              // Start automatically (default: false)
  respectReducedMotion?: boolean;   // Respect prefers-reduced-motion (default: true)
  onComplete?: () => void;          // Completion callback
}
```

---

### `SequenceState`

State object returned by `useMotionSequence`.

```typescript
interface SequenceState {
  currentStage: number;      // Current stage index (0-based)
  isPlaying: boolean;        // Whether sequence is playing
  isPaused: boolean;         // Whether sequence is paused
  isComplete: boolean;       // Whether sequence is complete
  stageStates: MotionStageState[]; // State of each stage
}
```

---

### `MotionStageState`

State of an individual stage.

```typescript
interface MotionStageState {
  index: number;
  state: AnimationState;    // 'idle' | 'running' | 'paused' | 'completed'
  progress: number;          // 0-1
}
```

---

### `AnimationState`

Animation state type.

```typescript
type AnimationState = 'idle' | 'running' | 'paused' | 'completed';
```

---

## Utilities

### `prefersReducedMotion(): boolean`

Checks if user prefers reduced motion.

**Returns:** `true` if `(prefers-reduced-motion: reduce)` matches

**Example:**
```typescript
import { prefersReducedMotion } from '@cascade/motion-runtime';

if (prefersReducedMotion()) {
  // Skip animations or use instant transitions
}
```

---

## Usage Patterns

### Pattern 1: Sequential Stages

```typescript
<MotionSequence autoStart>
  <MotionStage animation={fadeIn}>
    Stage 1
  </MotionStage>
  <MotionStage 
    animation={slideIn}
    delay="until-previous-completes"
  >
    Stage 2
  </MotionStage>
  <MotionStage 
    animation={scaleIn}
    delay="until-previous-completes"
  >
    Stage 3
  </MotionStage>
</MotionSequence>
```

### Pattern 2: Overlapping Stages

```typescript
<MotionSequence autoStart>
  <MotionStage animation={fadeIn}>
    Stage 1
  </MotionStage>
  <MotionStage 
    animation={slideIn}
    delay={200}  // Start 200ms after Stage 1 starts
  >
    Stage 2 (overlaps with Stage 1)
  </MotionStage>
</MotionSequence>
```

### Pattern 3: Programmatic Control

```typescript
function ControlledSequence() {
  const { start, pause, resume, reset, state } = useMotionSequence(3);
  
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

---

## Performance Considerations

1. **CSS Animations**: Stages use CSS animations for optimal performance
2. **Batching**: Multiple stages are batched efficiently
3. **Reduced Motion**: Automatically respects user preferences
4. **Cleanup**: Properly cleans up on unmount

---

## See Also

- [How to Create Animation Sequence](../how-to/create-animation-sequence.md) - Practical guide
- [Motion Values Reference](./motion-values.md) - Understanding motion values
- [Layout Transitions Reference](./layout-transitions.md) - Related features


# Layout Transitions

FLIP (First, Last, Invert, Play) animations for Cascade Motion. This package provides React hooks and utilities for creating smooth layout transitions when elements change position or size.

## Features

- **Single Element Transitions**: Automatically animate layout changes on individual elements
- **Shared Element Transitions**: Animate elements that appear in different components/pages
- **Batch Transitions**: Animate multiple elements simultaneously (perfect for lists and grids)
- **GPU Accelerated**: Uses CSS transforms for smooth 60fps animations
- **Automatic Detection**: Detects layout changes automatically with configurable thresholds
- **Zero Configuration**: Works out of the box with sensible defaults
- **TypeScript**: Full type safety and IntelliSense support

## Installation

Layout transitions are part of `@cascade/motion-runtime`:

```bash
pnpm add @cascade/motion-runtime
```

## Quick Start

### Single Element Transition

Animate a single element when its layout changes:

```tsx
import { useLayoutTransition } from '@cascade/motion-runtime';
import { useRef } from 'react';

function AnimatedCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  
  useLayoutTransition(ref, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });
  
  return (
    <div
      ref={ref}
      onClick={() => setExpanded(!expanded)}
      style={{
        width: expanded ? '400px' : '200px',
        height: expanded ? '300px' : '150px',
      }}
    >
      Click to expand
    </div>
  );
}
```

### Shared Element Transition

Animate elements that appear in different components:

```tsx
import { useSharedLayoutTransition } from '@cascade/motion-runtime';
import { useRef } from 'react';

function CollapsedCard({ layoutId }: { layoutId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useSharedLayoutTransition(ref, { layoutId });
  
  return (
    <div ref={ref} className="card-small">
      Click to expand
    </div>
  );
}

function ExpandedCard({ layoutId }: { layoutId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useSharedLayoutTransition(ref, { layoutId });
  
  return (
    <div ref={ref} className="card-large">
      Expanded content
    </div>
  );
}
```

### Batch Transition

Animate multiple elements simultaneously (perfect for lists):

```tsx
import { useBatchLayoutTransition } from '@cascade/motion-runtime';
import { useRef } from 'react';

function ReorderableList({ items }: { items: number[] }) {
  const itemRefs = useRef(items.map(() => useRef<HTMLDivElement>(null)));
  
  useBatchLayoutTransition(
    itemRefs.current.map(ref => ref),
    { duration: 300 }
  );
  
  return (
    <ul>
      {items.map((item, i) => (
        <li key={item} ref={itemRefs.current[i]}>
          {item}
        </li>
      ))}
    </ul>
  );
}
```

## Hooks

### `useLayoutTransition`

Automatically animate layout changes on a single element.

```tsx
const ref = useRef<HTMLDivElement>(null);
useLayoutTransition(ref, {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  origin: 'center',
  onComplete: () => console.log('Animation complete'),
});
```

### `useSharedLayoutTransition`

Animate shared elements between different components/pages.

```tsx
const ref = useRef<HTMLDivElement>(null);
useSharedLayoutTransition(ref, {
  layoutId: 'unique-id',
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
});
```

### `useBatchLayoutTransition`

Animate multiple elements simultaneously.

```tsx
const refs = [ref1, ref2, ref3];
useBatchLayoutTransition(refs, {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
});
```

## Core Concepts

### FLIP Technique

FLIP stands for:
- **First**: Measure the element's initial position and size
- **Last**: Measure the element's final position and size
- **Invert**: Apply a transform to make it appear in the initial position
- **Play**: Animate the transform to identity, revealing the final position

This technique ensures smooth animations even when layout changes are unpredictable.

### Transform Origin

Control where scaling originates from:

- `'center'` (default): Scale from the center
- `'top-left'`: Scale from the top-left corner
- `'top-right'`: Scale from the top-right corner
- `'bottom-left'`: Scale from the bottom-left corner
- `'bottom-right'`: Scale from the bottom-right corner

### Threshold Detection

Layout changes are only animated if they exceed a threshold:
- Position: 1 pixel
- Scale: 1% change

This prevents jitter from sub-pixel rendering differences.

## Examples

See the [Examples Guide](./layout-transitions-EXAMPLES.md) for complete code examples including:
- List reordering
- Grid layout changes
- Card expand/collapse
- Modal transitions
- Shared elements between pages

## API Reference

See the [API Reference](./layout-transitions-API.md) for complete API documentation.

## Browser Support

- **getBoundingClientRect**: Supported in all modern browsers
- **CSS Transforms**: Excellent support
- **requestAnimationFrame**: Supported in all modern browsers

## Performance Considerations

- Uses CSS transforms (GPU accelerated) instead of `left`/`top`
- Batches measurements using `requestAnimationFrame`
- Caches generated keyframes to avoid regeneration
- Only animates significant changes (threshold: 1px)
- Automatically cleans up injected CSS after animations complete

## Integration with MotionStage

Layout transitions integrate seamlessly with `MotionStage`:

```tsx
import { MotionStage } from '@cascade/motion-runtime';

function AnimatedStage() {
  return (
    <MotionStage
      animation={myAnimation}
      layoutTransition={{ duration: 300 }}
    >
      Content
    </MotionStage>
  );
}
```

The layout transition automatically disables when CSS animations are active to avoid conflicts.

## License

MIT


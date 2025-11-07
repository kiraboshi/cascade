# Getting Started with Layout Transitions

A quick guide to get you started with FLIP animations in Cascade Motion.

## Installation

```bash
pnpm add @cascade/motion-runtime
```

## Animating a Single Element

The simplest use case: animate an element when its position or size changes.

```tsx
import { useLayoutTransition } from '@cascade/motion-runtime';
import { useRef, useState } from 'react';

function ExpandableCard() {
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
        backgroundColor: '#3b82f6',
        borderRadius: '8px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
    >
      {expanded ? 'Click to collapse' : 'Click to expand'}
    </div>
  );
}
```

**What happens:**
1. The hook measures the element's bounds on each render
2. When the size changes, it generates a FLIP animation
3. The element smoothly animates from the old size to the new size

## Shared Element Transitions

Animate elements that appear in different components or pages. Perfect for modals, cards, and detail views.

```tsx
import { useSharedLayoutTransition } from '@cascade/motion-runtime';
import { useRef, useState } from 'react';

function CardGallery() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  return (
    <div>
      {selectedId ? (
        <ExpandedCard
          layoutId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[1, 2, 3].map(id => (
            <CollapsedCard
              key={id}
              layoutId={String(id)}
              onClick={() => setSelectedId(String(id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CollapsedCard({ layoutId, onClick }: { layoutId: string; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useSharedLayoutTransition(ref, { layoutId });
  
  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        width: '200px',
        height: '150px',
        backgroundColor: '#3b82f6',
        borderRadius: '8px',
        cursor: 'pointer',
      }}
    >
      Card {layoutId}
    </div>
  );
}

function ExpandedCard({ layoutId, onClose }: { layoutId: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useSharedLayoutTransition(ref, { layoutId });
  
  return (
    <div
      ref={ref}
      style={{
        width: '600px',
        height: '400px',
        backgroundColor: '#3b82f6',
        borderRadius: '8px',
        padding: '24px',
      }}
    >
      <button onClick={onClose}>Close</button>
      <h2>Card {layoutId} - Expanded</h2>
      <p>This card smoothly animated from its collapsed position.</p>
    </div>
  );
}
```

**Key points:**
- Use the same `layoutId` for elements that should animate together
- The hook automatically tracks elements and animates between them
- Works even when elements unmount and remount

## Batch Layout Transitions

Animate multiple elements simultaneously. Perfect for list reordering and grid layout changes.

```tsx
import { useBatchLayoutTransition } from '@cascade/motion-runtime';
import { useRef, useState } from 'react';

function ReorderableList() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);
  const itemRefs = useRef<Array<React.RefObject<HTMLDivElement>>>([]);
  
  // Initialize refs
  items.forEach((_, i) => {
    if (!itemRefs.current[i]) {
      itemRefs.current[i] = React.createRef();
    }
  });
  
  useBatchLayoutTransition(
    itemRefs.current.map(ref => ref),
    { duration: 300 }
  );
  
  const moveToTop = (index: number) => {
    const newItems = [...items];
    const [removed] = newItems.splice(index, 1);
    newItems.unshift(removed);
    setItems(newItems);
  };
  
  return (
    <div>
      <button onClick={() => moveToTop(items.length - 1)}>
        Move Last to Top
      </button>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item, i) => (
          <li key={item} ref={itemRefs.current[i]}>
            <div
              style={{
                padding: '12px',
                margin: '8px 0',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
              }}
            >
              Item {item}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**What happens:**
1. The hook measures all elements on each render
2. It detects which elements moved
3. All moved elements animate simultaneously to their new positions

## Integration with MotionStage

Use layout transitions with `MotionStage` for combined animations:

```tsx
import { MotionStage, defineMotion } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';

const fadeIn = defineMotion({
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});

function AnimatedCard() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <MotionStage
      animation={fadeIn}
      layoutTransition={{ duration: 300 }}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          width: expanded ? '400px' : '200px',
          height: expanded ? '300px' : '150px',
        }}
      >
        Content
      </div>
    </MotionStage>
  );
}
```

**Note:** Layout transitions automatically disable when CSS animations are active to avoid conflicts.

## Customizing Animations

### Duration and Easing

```tsx
useLayoutTransition(ref, {
  duration: 500, // milliseconds
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // CSS easing function
});
```

### Transform Origin

Control where scaling originates from:

```tsx
useLayoutTransition(ref, {
  origin: 'top-left', // 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
});
```

### Callbacks

```tsx
useLayoutTransition(ref, {
  onComplete: () => {
    console.log('Animation finished!');
  },
});
```

### Enable/Disable

```tsx
useLayoutTransition(ref, {
  enabled: isAnimating, // boolean
});
```

## Common Patterns

### List Reordering

```tsx
function SortableList({ items }: { items: Item[] }) {
  const refs = useRef(items.map(() => useRef<HTMLElement>(null)));
  
  useBatchLayoutTransition(
    refs.current.map(r => r),
    { duration: 300 }
  );
  
  return (
    <ul>
      {items.map((item, i) => (
        <li key={item.id} ref={refs.current[i]}>
          {item.content}
        </li>
      ))}
    </ul>
  );
}
```

### Grid Layout Changes

```tsx
function ResponsiveGrid({ columns }: { columns: number }) {
  const itemRefs = useRef<Array<RefObject<HTMLElement>>>([]);
  
  useBatchLayoutTransition(
    itemRefs.current.map(r => r),
    { duration: 300 }
  );
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {items.map((item, i) => (
        <div key={item.id} ref={itemRefs.current[i]}>
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

## Next Steps

- Check out [Examples](./layout-transitions-EXAMPLES.md) for more patterns
- Read the [API Reference](./layout-transitions-API.md) for advanced usage
- Explore [Performance Tips](./layout-transitions-API.md#performance-tips)


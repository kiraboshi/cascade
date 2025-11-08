# How to Animate Layout Changes

A step-by-step guide to animating layout changes (position, size) with Cascade Motion.

---

## Goal

Create smooth animations when elements change position or size in the layout.

---

## Solution

### Step 1: Import Required Hook

```typescript
import { useLayoutTransition } from '@cascade/motion-runtime';
```

### Step 2: Create Element Ref

```typescript
const ref = useRef<HTMLDivElement>(null);
```

### Step 3: Apply Layout Transition

```typescript
useLayoutTransition(ref, {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
});
```

### Step 4: Change Layout

```typescript
<div ref={ref} style={{ order: isFirst ? -1 : 0 }}>
  Content
</div>
```

---

## Complete Example: Reorder List

```typescript
import { useLayoutTransition } from '@cascade/motion-runtime';
import { useState } from 'react';

function ReorderableList() {
  const [items, setItems] = useState(['A', 'B', 'C']);
  const refs = items.map(() => useRef<HTMLDivElement>(null));
  
  // Apply layout transition to all items
  refs.forEach(ref => {
    useLayoutTransition(ref, {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    });
  });
  
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
  };
  
  return (
    <div>
      {items.map((item, i) => (
        <div
          key={item}
          ref={refs[i]}
          onClick={() => moveUp(i)}
          style={{
            padding: '10px',
            margin: '5px',
            backgroundColor: 'lightblue',
            cursor: 'pointer',
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
```

---

## Variations

### Position Change

```typescript
function PositionChange({ position }: { position: 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useLayoutTransition(ref, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });
  
  return (
    <div
      ref={ref}
      style={{
        float: position === 'left' ? 'left' : 'right',
        width: '100px',
        height: '100px',
        backgroundColor: 'blue',
      }}
    >
      Box
    </div>
  );
}
```

### Size Change

```typescript
function SizeChange({ isExpanded }: { isExpanded: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useLayoutTransition(ref, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });
  
  return (
    <div
      ref={ref}
      style={{
        width: isExpanded ? '300px' : '100px',
        height: isExpanded ? '300px' : '100px',
        backgroundColor: 'blue',
      }}
    >
      {isExpanded ? 'Expanded' : 'Collapsed'}
    </div>
  );
}
```

### Grid Reordering

```typescript
function GridReorder({ items }: { items: string[] }) {
  const refs = items.map(() => useRef<HTMLDivElement>(null));
  
  useBatchLayoutTransition(refs, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
      {items.map((item, i) => (
        <div
          key={item}
          ref={refs[i]}
          style={{
            padding: '20px',
            backgroundColor: 'lightblue',
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
```

### Conditional Layout

```typescript
function ConditionalLayout({ showSidebar }: { showSidebar: boolean }) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useLayoutTransition(sidebarRef, { duration: 300 });
  useLayoutTransition(contentRef, { duration: 300 });
  
  return (
    <div style={{ display: 'flex' }}>
      {showSidebar && (
        <div ref={sidebarRef} style={{ width: '200px' }}>
          Sidebar
        </div>
      )}
      <div ref={contentRef} style={{ flex: 1 }}>
        Content
      </div>
    </div>
  );
}
```

### Flexbox Reordering

```typescript
function FlexReorder({ items }: { items: string[] }) {
  const refs = items.map(() => useRef<HTMLDivElement>(null));
  
  useBatchLayoutTransition(refs, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });
  
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      {items.map((item, i) => (
        <div
          key={item}
          ref={refs[i]}
          style={{
            padding: '10px',
            backgroundColor: 'lightblue',
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
```

### Batch Layout Transition

```typescript
import { useBatchLayoutTransition } from '@cascade/motion-runtime';

function BatchTransition({ items }: { items: string[] }) {
  const refs = items.map(() => useRef<HTMLDivElement>(null));
  
  // More efficient than individual transitions
  useBatchLayoutTransition(refs, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });
  
  return (
    <div>
      {items.map((item, i) => (
        <div key={item} ref={refs[i]}>
          {item}
        </div>
      ))}
    </div>
  );
}
```

### With Transform Origin

```typescript
function TransformOrigin({ origin }: { origin: TransformOrigin }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useLayoutTransition(ref, {
    duration: 300,
    origin: origin, // 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  });
  
  return (
    <div
      ref={ref}
      style={{
        width: '100px',
        height: '100px',
        backgroundColor: 'blue',
      }}
    >
      Box
    </div>
  );
}
```

### Disable When Not Needed

```typescript
function ConditionalTransition({ shouldAnimate }: { shouldAnimate: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useLayoutTransition(ref, {
    enabled: shouldAnimate,
    duration: 300,
  });
  
  return (
    <div ref={ref}>
      Content
    </div>
  );
}
```

---

## Performance Tips

1. **Use batch transitions** - `useBatchLayoutTransition` is more efficient
2. **Limit concurrent transitions** - Don't animate too many at once
3. **Use appropriate durations** - 300ms is usually good
4. **Disable when not needed** - Use `enabled` prop

---

## Common Issues

### Animation doesn't trigger

- Check that ref is properly attached
- Verify layout actually changed
- Ensure element is in DOM
- Check `enabled` prop isn't false

### Animation is janky

- Reduce duration
- Limit concurrent transitions
- Check for layout-triggering properties
- Use GPU-accelerated properties

### Elements jump

- Check measurement timing
- Disable conflicting CSS transitions
- Verify transform origin
- Check for transform conflicts

---

## Best Practices

1. **Use stable keys** - For list items
2. **Batch related transitions** - More efficient
3. **Use appropriate durations** - Shorter is usually better
4. **Handle edge cases** - Missing elements, rapid changes

---

## Related Guides

- [How to Animate List Reorder](./animate-list-reorder.md) - List reordering
- [How to Create Shared Element Transition](./create-shared-element-transition.md) - Shared elements
- [Layout Transitions Tutorial](../tutorials/layout-transitions.md) - Layout transitions

---

## See Also

- [useLayoutTransition API Reference](../reference/layout-transitions.md#uselayouttransition)
- [useBatchLayoutTransition API Reference](../reference/layout-transitions.md#usebatchlayouttransition)
- [Layout Transitions Reference](../reference/layout-transitions.md) - Complete API


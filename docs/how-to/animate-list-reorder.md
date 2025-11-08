# How to Animate List Reorder

A step-by-step guide to animating list items when they're reordered.

---

## Goal

Create a list where items smoothly animate to their new positions when reordered.

---

## Solution

### Step 1: Import Required Hooks

```typescript
import { useBatchLayoutTransition } from '@cascade/motion-runtime';
import { useRef } from 'react';
```

### Step 2: Create Refs for List Items

```typescript
function ReorderableList({ items }: { items: string[] }) {
  const refs = items.map(() => useRef<HTMLDivElement>(null));
  
  // ... rest of component
}
```

### Step 3: Apply Batch Layout Transition

```typescript
useBatchLayoutTransition(refs, {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
});
```

### Step 4: Render List with Refs

```typescript
return (
  <div>
    {items.map((item, i) => (
      <div key={item} ref={refs[i]}>
        {item}
      </div>
    ))}
  </div>
);
```

---

## Complete Example

```typescript
import { useBatchLayoutTransition } from '@cascade/motion-runtime';
import { useState, useRef } from 'react';

function ReorderableList() {
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4']);
  const refs = items.map(() => useRef<HTMLDivElement>(null));
  
  useBatchLayoutTransition(refs, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });
  
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
  };
  
  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
  };
  
  return (
    <div>
      {items.map((item, i) => (
        <div
          key={item}
          ref={refs[i]}
          style={{
            padding: '1rem',
            margin: '0.5rem 0',
            background: '#f0f0f0',
            borderRadius: '4px',
          }}
        >
          <span>{item}</span>
          <button onClick={() => moveUp(i)} disabled={i === 0}>
            ↑
          </button>
          <button onClick={() => moveDown(i)} disabled={i === items.length - 1}>
            ↓
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Variations

### Drag to Reorder

Combine with drag gestures for drag-to-reorder:

```typescript
import { useDrag } from '@cascade/motion-gestures';
import { useTranslateY } from '@cascade/motion-runtime';
import { useBatchLayoutTransition } from '@cascade/motion-runtime';

function DraggableList() {
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3']);
  const refs = items.map(() => useRef<HTMLDivElement>(null));
  
  // Batch layout transition for reordering
  useBatchLayoutTransition(refs, { duration: 300 });
  
  return (
    <div>
      {items.map((item, i) => {
        const y = useTranslateY(0);
        const dragRef = useDrag({ y }, {
          onEnd: () => {
            // Calculate new position and reorder
            const newIndex = calculateNewIndex(i, y.get());
            reorderItems(i, newIndex);
            y.set(0); // Reset position
          },
        });
        
        return (
          <div
            key={item}
            ref={(el) => {
              refs[i].current = el;
              if (dragRef.current) {
                dragRef.current = el;
              }
            }}
            style={{
              transform: `translateY(var(${y.cssVarName}))`,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}
```

### Filter with Animation

Animate items when filtering:

```typescript
function FilterableList({ allItems }: { allItems: string[] }) {
  const [filter, setFilter] = useState('');
  const filteredItems = allItems.filter(item => 
    item.toLowerCase().includes(filter.toLowerCase())
  );
  const refs = filteredItems.map(() => useRef<HTMLDivElement>(null));
  
  useBatchLayoutTransition(refs, { duration: 300 });
  
  return (
    <>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter items..."
      />
      <div>
        {filteredItems.map((item, i) => (
          <div key={item} ref={refs[i]}>
            {item}
          </div>
        ))}
      </div>
    </>
  );
}
```

### Sort with Animation

Animate when sorting:

```typescript
function SortableList() {
  const [items, setItems] = useState(['Zebra', 'Apple', 'Banana']);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const refs = items.map(() => useRef<HTMLDivElement>(null));
  
  useBatchLayoutTransition(refs, { duration: 300 });
  
  const sortedItems = [...items].sort((a, b) => {
    return sortOrder === 'asc' 
      ? a.localeCompare(b)
      : b.localeCompare(a);
  });
  
  return (
    <>
      <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
        Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
      </button>
      <div>
        {sortedItems.map((item, i) => (
          <div key={item} ref={refs[i]}>
            {item}
          </div>
        ))}
      </div>
    </>
  );
}
```

---

## Performance Tips

1. **Use batch transitions**: Always use `useBatchLayoutTransition` for multiple elements
2. **Stable keys**: Use stable, unique keys for list items
3. **Limit items**: For very long lists, consider virtualizing
4. **Debounce rapid changes**: Debounce if items change very rapidly

---

## Common Issues

### Items jump instead of animating

- Ensure refs array matches items array length
- Check that keys are stable and unique
- Verify `useBatchLayoutTransition` is called with the correct refs

### Animation doesn't trigger

- Changes must exceed 1px threshold
- Ensure refs are properly attached to elements
- Check that `enabled` is not `false`

### Performance issues with many items

- Consider virtualizing for lists with 100+ items
- Reduce animation duration for faster updates
- Use `will-change: transform` CSS hint

---

## Related Guides

- [How to Create Shared Element Transition](./create-shared-element-transition.md)
- [Layout Transitions Tutorial](../tutorials/layout-transitions.md)
- [Layout Transitions API Reference](../reference/layout-transitions.md)

---

## See Also

- [useBatchLayoutTransition API Reference](../reference/layout-transitions.md#usebatchlayouttransition)


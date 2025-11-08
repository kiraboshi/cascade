# Layout Transitions Tutorial

A step-by-step tutorial to master layout transitions in Cascade Motion.

---

## What You'll Learn

By the end of this tutorial, you'll:
- ✅ Understand what layout transitions are and how they work
- ✅ Create smooth layout animations using FLIP technique
- ✅ Animate list reordering
- ✅ Handle shared element transitions
- ✅ Optimize layout transition performance

---

## Prerequisites

- Completed [Getting Started Tutorial](./getting-started.md)
- Completed [Motion Values Tutorial](./motion-values.md)
- Basic understanding of CSS layout
- Familiarity with React refs

---

## Step 1: Understanding Layout Transitions

### What are Layout Transitions?

Layout transitions animate changes in element position and size. When an element moves or resizes, layout transitions create smooth animations between the old and new positions.

### The FLIP Technique

Cascade Motion uses the FLIP technique:

1. **First** - Measure initial position/size
2. **Last** - Measure final position/size
3. **Invert** - Apply transform to make it look like it's still in first position
4. **Play** - Animate transform to final position

This creates smooth animations without layout thrashing.

---

## Step 2: Basic Layout Transition

### Simple Position Change

```typescript
import { useLayoutTransition } from '@cascade/motion-runtime';
import { useRef } from 'react';

function MovingBox({ position }: { position: 'left' | 'right' }) {
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

### How It Works

1. Element moves from left to right
2. Layout transition detects the change
3. Measures old and new positions
4. Applies transform to animate smoothly

---

## Step 3: List Reordering

### Animate List Item Movement

```typescript
import { useBatchLayoutTransition } from '@cascade/motion-runtime';
import { useState } from 'react';

function ReorderableList({ items: initialItems }: { items: string[] }) {
  const [items, setItems] = useState(initialItems);
  const refs = items.map(() => useRef<HTMLDivElement>(null));
  
  // Animate all items when list changes
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

### Key Points

- Use `useBatchLayoutTransition` for multiple elements
- Each element needs a ref
- Elements must have stable keys
- Animation happens automatically when layout changes

---

## Step 4: Size Changes

### Animate Width/Height Changes

```typescript
function ResizableBox({ isExpanded }: { isExpanded: boolean }) {
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
        transition: 'width 0.3s, height 0.3s', // Fallback
      }}
    >
      {isExpanded ? 'Expanded' : 'Collapsed'}
    </div>
  );
}
```

**Note:** Layout transitions handle position changes. For size changes, you may want to combine with CSS transitions or use transform scale.

---

## Step 5: Shared Element Transitions

### Animate Element Between Views

```typescript
import { useSharedLayoutTransition } from '@cascade/motion-runtime';

function SharedElement({ layoutId, children }: { layoutId: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useSharedLayoutTransition(ref, {
    layoutId,
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });
  
  return (
    <div ref={ref}>
      {children}
    </div>
  );
}

// Use in different views
function View1() {
  return (
    <SharedElement layoutId="card-1">
      <Card />
    </SharedElement>
  );
}

function View2() {
  return (
    <SharedElement layoutId="card-1">
      <ExpandedCard />
    </SharedElement>
  );
}
```

### How It Works

1. Elements with same `layoutId` are tracked
2. When one appears/disappears, transition animates
3. Creates smooth shared element effect
4. Similar to Material Design shared element transitions

---

## Step 6: Advanced Patterns

### Pattern 1: Grid Reordering

```typescript
function Grid({ items }: { items: string[] }) {
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

### Pattern 2: Conditional Layout

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

### Pattern 3: Drag and Drop

```typescript
function DraggableList({ items }: { items: string[] }) {
  const [order, setOrder] = useState(items);
  const refs = order.map(() => useRef<HTMLDivElement>(null));
  
  useBatchLayoutTransition(refs, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });
  
  // Use drag library (e.g., react-beautiful-dnd)
  // Layout transitions handle the reordering animation
  
  return (
    <div>
      {order.map((item, i) => (
        <div key={item} ref={refs[i]}>
          {item}
        </div>
      ))}
    </div>
  );
}
```

---

## Step 7: Performance Optimization

### Use Transform Origin

```typescript
useLayoutTransition(ref, {
  duration: 300,
  origin: 'top-left', // Animation origin
});
```

**Available origins:**
- `'center'` (default)
- `'top-left'`
- `'top-right'`
- `'bottom-left'`
- `'bottom-right'`

### Batch Operations

```typescript
// ✅ Good: Batch all transitions
useBatchLayoutTransition(refs, { duration: 300 });

// ⚠️ Less efficient: Individual transitions
refs.forEach(ref => useLayoutTransition(ref, { duration: 300 }));
```

### Disable When Not Needed

```typescript
useLayoutTransition(ref, {
  enabled: shouldAnimate, // Disable when not needed
  duration: 300,
});
```

---

## Step 8: Common Issues and Solutions

### Issue: Animation doesn't trigger

**Causes:**
- Element doesn't have a ref
- Layout change is too fast
- Element is removed before animation

**Solutions:**
- Ensure ref is properly attached
- Use `useLayoutEffect` for measurements
- Check element is still in DOM

### Issue: Animation is janky

**Causes:**
- Too many simultaneous transitions
- Layout-triggering properties
- Missing GPU acceleration

**Solutions:**
- Limit concurrent transitions
- Use `transform` instead of position
- Check performance with DevTools

### Issue: Elements jump

**Causes:**
- Measurement timing issues
- Transform conflicts
- CSS transitions interfering

**Solutions:**
- Use `useLayoutEffect` for measurements
- Disable conflicting CSS transitions
- Check transform origin

---

## Best Practices

### 1. Use Stable Keys

```typescript
// ✅ Good: Stable keys
{items.map(item => (
  <div key={item.id} ref={refs[item.id]}>
    {item.name}
  </div>
))}

// ⚠️ Avoid: Index keys
{items.map((item, i) => (
  <div key={i} ref={refs[i]}>
    {item.name}
  </div>
))}
```

### 2. Batch Related Transitions

```typescript
// ✅ Good: Batch related elements
useBatchLayoutTransition([ref1, ref2, ref3], { duration: 300 });

// ⚠️ Less efficient: Individual transitions
useLayoutTransition(ref1, { duration: 300 });
useLayoutTransition(ref2, { duration: 300 });
useLayoutTransition(ref3, { duration: 300 });
```

### 3. Use Appropriate Durations

```typescript
// ✅ Good: Short duration for quick changes
useLayoutTransition(ref, { duration: 200 });

// ⚠️ Avoid: Very long durations
useLayoutTransition(ref, { duration: 2000 });
```

### 4. Handle Edge Cases

```typescript
useLayoutTransition(ref, {
  duration: 300,
  onComplete: () => {
    // Cleanup or next step
  },
});
```

---

## Real-World Examples

### Example 1: Todo List Reordering

```typescript
function TodoList({ todos }: { todos: Todo[] }) {
  const [sortedTodos, setSortedTodos] = useState(todos);
  const refs = sortedTodos.map(() => useRef<HTMLLIElement>(null));
  
  useBatchLayoutTransition(refs, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });
  
  const reorder = (fromIndex: number, toIndex: number) => {
    const newTodos = [...sortedTodos];
    const [removed] = newTodos.splice(fromIndex, 1);
    newTodos.splice(toIndex, 0, removed);
    setSortedTodos(newTodos);
  };
  
  return (
    <ul>
      {sortedTodos.map((todo, i) => (
        <li key={todo.id} ref={refs[i]}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

### Example 2: Card Expansion

```typescript
function ExpandableCard({ isExpanded }: { isExpanded: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useLayoutTransition(cardRef, { duration: 300 });
  useLayoutTransition(contentRef, { duration: 300 });
  
  return (
    <div ref={cardRef}>
      <h3>Card Title</h3>
      {isExpanded && (
        <div ref={contentRef}>
          Expanded content
        </div>
      )}
    </div>
  );
}
```

### Example 3: Modal Transition

```typescript
function Modal({ isOpen }: { isOpen: boolean }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  
  useLayoutTransition(modalRef, { duration: 300 });
  useLayoutTransition(backdropRef, { duration: 300 });
  
  if (!isOpen) return null;
  
  return (
    <>
      <div ref={backdropRef} className="backdrop" />
      <div ref={modalRef} className="modal">
        Modal content
      </div>
    </>
  );
}
```

---

## Performance Tips

1. **Use batch transitions** - More efficient than individual
2. **Limit concurrent transitions** - Don't animate too many at once
3. **Use appropriate durations** - Shorter is usually better
4. **Disable when not needed** - Use `enabled` prop
5. **Check DevTools** - Monitor performance

---

## Troubleshooting

### Animation doesn't work

- Check ref is attached
- Verify element is in DOM
- Check `enabled` prop isn't false
- Verify layout actually changed

### Animation is slow

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

## Next Steps

- [Layout Transitions API Reference](../reference/layout-transitions.md) - Complete API documentation
- [How to Animate List Reorder](../how-to/animate-list-reorder.md) - Practical examples
- [Motion Values Tutorial](./motion-values.md) - Understanding motion values
- [How to Optimize Performance](../how-to/optimize-performance.md) - Performance tips

---

## Summary

You've learned:
- ✅ What layout transitions are and how they work
- ✅ How to create basic layout transitions
- ✅ How to animate list reordering
- ✅ How to handle shared element transitions
- ✅ Advanced patterns and best practices
- ✅ Performance optimization tips
- ✅ Common issues and solutions

**Ready for more?** Check out the [layout transitions API reference](../reference/layout-transitions.md) or [how-to guides](../how-to/)!


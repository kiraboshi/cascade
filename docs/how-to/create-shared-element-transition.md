# How to Create a Shared Element Transition

A step-by-step guide to creating shared element transitions between views.

---

## Goal

Create smooth transitions where an element appears to move between different views or states.

---

## Solution

### Step 1: Import Required Hook

```typescript
import { useSharedLayoutTransition } from '@cascade/motion-runtime';
```

### Step 2: Create Shared Elements

```typescript
const ref1 = useRef<HTMLDivElement>(null);
const ref2 = useRef<HTMLDivElement>(null);
```

### Step 3: Apply Shared Transition

```typescript
useSharedLayoutTransition(ref1, {
  layoutId: 'shared-card',
  duration: 300,
});

useSharedLayoutTransition(ref2, {
  layoutId: 'shared-card',
  duration: 300,
});
```

### Step 4: Switch Between Views

```typescript
{isDetailView ? (
  <div ref={ref2}>Expanded Card</div>
) : (
  <div ref={ref1}>Card</div>
)}
```

---

## Complete Example: Card to Detail View

```typescript
import { useSharedLayoutTransition } from '@cascade/motion-runtime';
import { useState } from 'react';

function CardDetailTransition() {
  const [isDetail, setIsDetail] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  
  useSharedLayoutTransition(cardRef, {
    layoutId: 'card-1',
    duration: 300,
  });
  
  useSharedLayoutTransition(detailRef, {
    layoutId: 'card-1',
    duration: 300,
  });
  
  return (
    <div>
      {isDetail ? (
        <div
          ref={detailRef}
          onClick={() => setIsDetail(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            padding: '20px',
          }}
        >
          <h1>Detail View</h1>
          <p>Expanded content</p>
        </div>
      ) : (
        <div
          ref={cardRef}
          onClick={() => setIsDetail(true)}
          style={{
            width: '200px',
            height: '150px',
            backgroundColor: 'lightblue',
            padding: '10px',
            cursor: 'pointer',
          }}
        >
          <h3>Card</h3>
          <p>Click to expand</p>
        </div>
      )}
    </div>
  );
}
```

---

## Variations

### Image Transition

```typescript
function ImageTransition({ isExpanded }: { isExpanded: boolean }) {
  const thumbnailRef = useRef<HTMLImageElement>(null);
  const fullRef = useRef<HTMLImageElement>(null);
  
  useSharedLayoutTransition(thumbnailRef, {
    layoutId: 'image-1',
    duration: 300,
  });
  
  useSharedLayoutTransition(fullRef, {
    layoutId: 'image-1',
    duration: 300,
  });
  
  return (
    <div>
      {isExpanded ? (
        <img
          ref={fullRef}
          src="/image.jpg"
          style={{ width: '100%', height: 'auto' }}
        />
      ) : (
        <img
          ref={thumbnailRef}
          src="/image.jpg"
          style={{ width: '200px', height: '150px', objectFit: 'cover' }}
        />
      )}
    </div>
  );
}
```

### List to Detail

```typescript
function ListDetailTransition({ selectedId }: { selectedId: string | null }) {
  const itemRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());
  const detailRef = useRef<HTMLDivElement>(null);
  
  // Create refs for list items
  const items = ['item-1', 'item-2', 'item-3'];
  
  items.forEach(id => {
    if (!itemRefs.current.has(id)) {
      itemRefs.current.set(id, React.createRef<HTMLDivElement>());
    }
  });
  
  // Apply shared transition to selected item
  const selectedRef = selectedId ? itemRefs.current.get(selectedId) : null;
  
  if (selectedRef) {
    useSharedLayoutTransition(selectedRef, {
      layoutId: 'selected-item',
      duration: 300,
    });
  }
  
  useSharedLayoutTransition(detailRef, {
    layoutId: 'selected-item',
    duration: 300,
  });
  
  return (
    <div>
      {selectedId ? (
        <div ref={detailRef} style={{ padding: '20px' }}>
          <h2>Detail for {selectedId}</h2>
        </div>
      ) : (
        <div>
          {items.map(id => (
            <div
              key={id}
              ref={itemRefs.current.get(id)}
              onClick={() => setSelectedId(id)}
            >
              {id}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Modal Transition

```typescript
function ModalTransition({ isOpen }: { isOpen: boolean }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  useSharedLayoutTransition(triggerRef, {
    layoutId: 'modal-trigger',
    duration: 300,
  });
  
  useSharedLayoutTransition(modalRef, {
    layoutId: 'modal-trigger',
    duration: 300,
  });
  
  return (
    <div>
      {isOpen ? (
        <div
          ref={modalRef}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            padding: '20px',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <h2>Modal</h2>
          <p>Modal content</p>
        </div>
      ) : (
        <button ref={triggerRef} onClick={() => setIsOpen(true)}>
          Open Modal
        </button>
      )}
    </div>
  );
}
```

### Grid to Fullscreen

```typescript
function GridFullscreenTransition({ selectedIndex }: { selectedIndex: number | null }) {
  const gridRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  
  const items = Array.from({ length: 9 }, (_, i) => i);
  
  items.forEach((_, i) => {
    if (!gridRefs.current[i]) {
      gridRefs.current[i] = React.createRef<HTMLDivElement>();
    }
  });
  
  if (selectedIndex !== null) {
    useSharedLayoutTransition(gridRefs.current[selectedIndex], {
      layoutId: 'grid-item',
      duration: 300,
    });
  }
  
  useSharedLayoutTransition(fullscreenRef, {
    layoutId: 'grid-item',
    duration: 300,
  });
  
  return (
    <div>
      {selectedIndex !== null ? (
        <div
          ref={fullscreenRef}
          onClick={() => setSelectedIndex(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1>Fullscreen Item {selectedIndex}</h1>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {items.map((item, i) => (
            <div
              key={item}
              ref={gridRefs.current[i]}
              onClick={() => setSelectedIndex(i)}
              style={{
                width: '100px',
                height: '100px',
                backgroundColor: 'lightblue',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### With AnimatePresence

```typescript
import { AnimatePresence } from '@cascade/motion-runtime';

function AnimatePresenceTransition({ isOpen }: { isOpen: boolean }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useSharedLayoutTransition(triggerRef, {
    layoutId: 'content',
    duration: 300,
  });
  
  useSharedLayoutTransition(contentRef, {
    layoutId: 'content',
    duration: 300,
  });
  
  return (
    <div>
      <button ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </button>
      <AnimatePresence>
        {isOpen && (
          <div
            ref={contentRef}
            exit={{ opacity: 0, config: { duration: 300 } }}
            enter={{ opacity: 0, config: { duration: 300 } }}
          >
            Content
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## Performance Tips

1. **Use stable layoutIds** - Same ID for related elements
2. **Limit concurrent transitions** - Don't animate too many at once
3. **Use appropriate durations** - 300ms is usually good
4. **Ensure elements are measurable** - Elements need bounds

---

## Common Issues

### Transition doesn't work

- Check that `layoutId` matches between elements
- Verify refs are properly attached
- Ensure elements are in DOM when transition starts
- Check that elements have measurable bounds

### Transition is janky

- Reduce duration
- Check for layout-triggering properties
- Ensure elements are positioned correctly
- Verify transform origin

### Elements don't align

- Check element positions
- Verify transform origin
- Ensure parent containers don't interfere
- Check for conflicting CSS

---

## Best Practices

1. **Use descriptive layoutIds** - `'card-1'` not `'a'`
2. **Ensure elements are similar** - Same content helps
3. **Handle edge cases** - Missing elements, rapid switches
4. **Test on different screen sizes** - Responsive behavior

---

## Related Guides

- [How to Animate Layout Changes](./animate-layout-changes.md) - Layout animations
- [Layout Transitions Tutorial](../tutorials/layout-transitions.md) - Layout transitions
- [Layout Transitions API Reference](../reference/layout-transitions.md) - Complete API

---

## See Also

- [useSharedLayoutTransition API Reference](../reference/layout-transitions.md#usesharedlayouttransition)
- [Layout Transitions Reference](../reference/layout-transitions.md) - Complete API
- [AnimatePresence Reference](../reference/animate-presence.md) - Enter/exit animations


# Layout Transitions Examples

Complete code examples for using layout transitions in Cascade Motion.

## Table of Contents

1. [List Reordering](#list-reordering)
2. [Grid Layout Changes](#grid-layout-changes)
3. [Card Expand/Collapse](#card-expandcollapse)
4. [Modal Transitions](#modal-transitions)
5. [Shared Element Between Pages](#shared-element-between-pages)
6. [Sortable List](#sortable-list)
7. [Responsive Grid](#responsive-grid)
8. [Accordion](#accordion)
9. [Image Gallery](#image-gallery)

---

## List Reordering

Animate items when they change position in a list.

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
  
  const shuffle = () => {
    const newItems = [...items].sort(() => Math.random() - 0.5);
    setItems(newItems);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={shuffle} style={{ marginRight: '8px' }}>
          Shuffle
        </button>
        <button onClick={() => moveToTop(items.length - 1)}>
          Move Last to Top
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item, i) => (
          <li key={item} ref={itemRefs.current[i]}>
            <div
              style={{
                padding: '12px',
                margin: '8px 0',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => moveToTop(i)}
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

---

## Grid Layout Changes

Animate items when grid columns change.

```tsx
import { useBatchLayoutTransition } from '@cascade/motion-runtime';
import { useRef, useState } from 'react';

function ResponsiveGrid() {
  const [columns, setColumns] = useState(3);
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const itemRefs = useRef<Array<React.RefObject<HTMLDivElement>>>([]);
  
  items.forEach((_, i) => {
    if (!itemRefs.current[i]) {
      itemRefs.current[i] = React.createRef();
    }
  });
  
  useBatchLayoutTransition(
    itemRefs.current.map(ref => ref),
    { duration: 300 }
  );
  
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => setColumns(2)}>2 Columns</button>
        <button onClick={() => setColumns(3)} style={{ margin: '0 8px' }}>3 Columns</button>
        <button onClick={() => setColumns(4)}>4 Columns</button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '16px',
        }}
      >
        {items.map((item, i) => (
          <div
            key={item}
            ref={itemRefs.current[i]}
            style={{
              padding: '24px',
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              color: 'white',
            }}
          >
            Item {item}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Card Expand/Collapse

Animate a card when it expands or collapses.

```tsx
import { useLayoutTransition } from '@cascade/motion-runtime';
import { useRef, useState } from 'react';

function ExpandableCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  
  useLayoutTransition(ref, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    origin: 'center',
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
        color: 'white',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#2563eb';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#3b82f6';
      }}
    >
      <h3>{expanded ? 'Expanded' : 'Collapsed'}</h3>
      {expanded && (
        <p>
          This is the expanded content. The card smoothly animates
          from its collapsed size to this expanded size.
        </p>
      )}
    </div>
  );
}
```

---

## Modal Transitions

Animate a modal when it opens/closes using shared element transitions.

```tsx
import { useSharedLayoutTransition } from '@cascade/motion-runtime';
import { useRef, useState } from 'react';

function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Open Modal
      </button>
      {isOpen ? (
        <Modal onClose={() => setIsOpen(false)} />
      ) : (
        <TriggerButton onClick={() => setIsOpen(true)} />
      )}
    </div>
  );
}

function TriggerButton({ onClick }: { onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useSharedLayoutTransition(ref, {
    layoutId: 'modal-trigger',
    duration: 300,
  });
  
  return (
    <button
      ref={ref}
      onClick={onClick}
      style={{
        padding: '12px 24px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
      }}
    >
      Open Modal
    </button>
  );
}

function Modal({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useSharedLayoutTransition(ref, {
    layoutId: 'modal-trigger',
    duration: 300,
  });
  
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
        }}
      >
        <h2>Modal Content</h2>
        <p>This modal smoothly animates from the trigger button.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

---

## Shared Element Between Pages

Animate an element that appears on different pages/views.

```tsx
import { useSharedLayoutTransition } from '@cascade/motion-runtime';
import { useRef, useState } from 'react';

function PageTransitionExample() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  return (
    <div>
      {view === 'list' ? (
        <ListView
          onSelect={(id) => {
            setSelectedId(id);
            setView('detail');
          }}
        />
      ) : (
        <DetailView
          id={selectedId!}
          onBack={() => setView('list')}
        />
      )}
    </div>
  );
}

function ListView({ onSelect }: { onSelect: (id: string) => void }) {
  const items = ['1', '2', '3'];
  
  return (
    <div style={{ padding: '24px' }}>
      <h1>List View</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {items.map(id => (
          <ListItem key={id} id={id} onClick={() => onSelect(id)} />
        ))}
      </div>
    </div>
  );
}

function ListItem({ id, onClick }: { id: string; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useSharedLayoutTransition(ref, {
    layoutId: `item-${id}`,
    duration: 300,
  });
  
  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        padding: '16px',
        backgroundColor: '#3b82f6',
        borderRadius: '8px',
        color: 'white',
        cursor: 'pointer',
      }}
    >
      <h3>Item {id}</h3>
      <p>Click to view details</p>
    </div>
  );
}

function DetailView({ id, onBack }: { id: string; onBack: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useSharedLayoutTransition(ref, {
    layoutId: `item-${id}`,
    duration: 300,
  });
  
  return (
    <div style={{ padding: '24px' }}>
      <button onClick={onBack}>Back</button>
      <div
        ref={ref}
        style={{
          marginTop: '24px',
          padding: '32px',
          backgroundColor: '#3b82f6',
          borderRadius: '8px',
          color: 'white',
        }}
      >
        <h1>Detail View - Item {id}</h1>
        <p>This card smoothly animated from the list view.</p>
      </div>
    </div>
  );
}
```

---

## Sortable List

Animate items when they're sorted.

```tsx
import { useBatchLayoutTransition } from '@cascade/motion-runtime';
import { useRef, useState } from 'react';

function SortableList() {
  const [items, setItems] = useState([
    { id: 1, name: 'Apple', priority: 3 },
    { id: 2, name: 'Banana', priority: 1 },
    { id: 3, name: 'Cherry', priority: 2 },
  ]);
  
  const itemRefs = useRef<Array<React.RefObject<HTMLDivElement>>>([]);
  items.forEach((_, i) => {
    if (!itemRefs.current[i]) {
      itemRefs.current[i] = React.createRef();
    }
  });
  
  useBatchLayoutTransition(
    itemRefs.current.map(ref => ref),
    { duration: 300 }
  );
  
  const sortByPriority = () => {
    setItems([...items].sort((a, b) => a.priority - b.priority));
  };
  
  const sortByName = () => {
    setItems([...items].sort((a, b) => a.name.localeCompare(b.name)));
  };
  
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={sortByPriority} style={{ marginRight: '8px' }}>
          Sort by Priority
        </button>
        <button onClick={sortByName}>Sort by Name</button>
      </div>
      <div>
        {items.map((item, i) => (
          <div
            key={item.id}
            ref={itemRefs.current[i]}
            style={{
              padding: '12px',
              margin: '8px 0',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>{item.name}</span>
            <span>Priority: {item.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Responsive Grid

Animate items when grid becomes responsive.

```tsx
import { useBatchLayoutTransition } from '@cascade/motion-runtime';
import { useRef, useState, useEffect } from 'react';

function ResponsiveGrid() {
  const [columns, setColumns] = useState(3);
  const items = Array.from({ length: 12 }, (_, i) => i + 1);
  const itemRefs = useRef<Array<React.RefObject<HTMLDivElement>>>([]);
  
  items.forEach((_, i) => {
    if (!itemRefs.current[i]) {
      itemRefs.current[i] = React.createRef();
    }
  });
  
  useBatchLayoutTransition(
    itemRefs.current.map(ref => ref),
    { duration: 300 }
  );
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumns(1);
      } else if (width < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div style={{ padding: '24px' }}>
      <h2>Responsive Grid ({columns} columns)</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '16px',
        }}
      >
        {items.map((item, i) => (
          <div
            key={item}
            ref={itemRefs.current[i]}
            style={{
              padding: '24px',
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              color: 'white',
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Accordion

Animate accordion items when they expand/collapse.

```tsx
import { useLayoutTransition } from '@cascade/motion-runtime';
import { useRef, useState } from 'react';

function Accordion() {
  const items = [
    { id: 1, title: 'Section 1', content: 'Content for section 1' },
    { id: 2, title: 'Section 2', content: 'Content for section 2' },
    { id: 3, title: 'Section 3', content: 'Content for section 3' },
  ];
  
  return (
    <div>
      {items.map(item => (
        <AccordionItem key={item.id} item={item} />
      ))}
    </div>
  );
}

function AccordionItem({ item }: { item: { id: number; title: string; content: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  
  useLayoutTransition(ref, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });
  
  return (
    <div style={{ marginBottom: '8px', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '12px',
          textAlign: 'left',
          backgroundColor: '#f3f4f6',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {item.title}
      </button>
      {expanded && (
        <div
          ref={ref}
          style={{
            padding: '12px',
            backgroundColor: 'white',
          }}
        >
          {item.content}
        </div>
      )}
    </div>
  );
}
```

---

## Image Gallery

Animate images when gallery layout changes.

```tsx
import { useBatchLayoutTransition } from '@cascade/motion-runtime';
import { useRef, useState } from 'react';

function ImageGallery() {
  const [layout, setLayout] = useState<'grid' | 'masonry'>('grid');
  const images = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    src: `https://picsum.photos/200/200?random=${i + 1}`,
  }));
  
  const imageRefs = useRef<Array<React.RefObject<HTMLDivElement>>>([]);
  images.forEach((_, i) => {
    if (!imageRefs.current[i]) {
      imageRefs.current[i] = React.createRef();
    }
  });
  
  useBatchLayoutTransition(
    imageRefs.current.map(ref => ref),
    { duration: 300 }
  );
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => setLayout('grid')}
          style={{ marginRight: '8px' }}
        >
          Grid Layout
        </button>
        <button onClick={() => setLayout('masonry')}>
          Masonry Layout
        </button>
      </div>
      <div
        style={{
          display: layout === 'grid' ? 'grid' : 'flex',
          gridTemplateColumns: layout === 'grid' ? 'repeat(3, 1fr)' : undefined,
          flexDirection: layout === 'masonry' ? 'column' : undefined,
          flexWrap: layout === 'masonry' ? 'wrap' : undefined,
          gap: '16px',
          maxHeight: layout === 'masonry' ? '600px' : undefined,
        }}
      >
        {images.map((image, i) => (
          <div
            key={image.id}
            ref={imageRefs.current[i]}
            style={{
              width: layout === 'grid' ? '100%' : '200px',
              height: layout === 'grid' ? '200px' : Math.random() * 200 + 150 + 'px',
            }}
          >
            <img
              src={image.src}
              alt={`Image ${image.id}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## See Also

- [API Reference](./layout-transitions-API.md) - Complete API documentation
- [Getting Started](./layout-transitions-GETTING_STARTED.md) - Quick start guide
- [README](./layout-transitions-README.md) - Overview and features


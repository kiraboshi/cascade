# @cascade/motion-gestures Examples

Complete code examples for using `@cascade/motion-gestures`.

## Table of Contents

1. [Basic Drag](#basic-drag)
2. [Drag with Constraints](#drag-with-constraints)
3. [Drag with Spring Animation](#drag-with-spring-animation)
4. [Pan Gesture](#pan-gesture)
5. [Scroll-Driven Animation](#scroll-driven-animation)
6. [Wheel Zoom](#wheel-zoom)
7. [Axis Locking](#axis-locking)
8. [Custom Callbacks](#custom-callbacks)
9. [Combined Gestures](#combined-gestures)

---

## Basic Drag

Simple draggable element.

```tsx
import { useDrag } from '@cascade/motion-gestures';
import { useMotionValue } from '@cascade/motion-runtime';
import { useState, useEffect } from 'react';

function BasicDrag() {
  const x = useMotionValue(0, { unit: 'px' });
  const y = useMotionValue(0, { unit: 'px' });
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  
  const dragRef = useDrag({ x, y });
  
  useEffect(() => {
    const unsubscribeX = x.onChange((value: number) => {
      setCurrentX(value);
    });
    const unsubscribeY = y.onChange((value: number) => {
      setCurrentY(value);
    });
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y]);
  
  return (
    <div style={{ position: 'relative', height: '300px', border: '1px dashed #ccc' }}>
      <div
        ref={dragRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '100px',
          height: '100px',
          backgroundColor: '#3b82f6',
          borderRadius: '8px',
          transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`,
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        Drag Me
      </div>
    </div>
  );
}
```

---

## Drag with Constraints

Limit drag movement to specific bounds.

```tsx
function ConstrainedDrag() {
  const x = useMotionValue(0, { unit: 'px' });
  const y = useMotionValue(0, { unit: 'px' });
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  
  const dragRef = useDrag(
    { x, y },
    {
      constraints: {
        min: { x: -150, y: -150 },
        max: { x: 150, y: 150 },
      },
    }
  );
  
  useEffect(() => {
    const unsubscribeX = x.onChange((value: number) => setCurrentX(value));
    const unsubscribeY = y.onChange((value: number) => setCurrentY(value));
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y]);
  
  return (
    <div style={{ position: 'relative', height: '300px', border: '1px dashed #ccc' }}>
      <div
        ref={dragRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '80px',
          height: '80px',
          backgroundColor: '#10b981',
          borderRadius: '8px',
          transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`,
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        Constrained
      </div>
    </div>
  );
}
```

---

## Drag with Spring Animation

Element springs back to center when released, using gesture velocity.

```tsx
import type { SpringConfig } from '@cascade/compiler';

function SpringDrag() {
  const x = useMotionValue(0, { unit: 'px' });
  const y = useMotionValue(0, { unit: 'px' });
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  
  const springConfig: SpringConfig = {
    stiffness: 300,
    damping: 30,
    mass: 1,
    from: 0,
    to: 0,
  };
  
  const dragRef = useDrag(
    { x, y },
    {
      spring: springConfig,
      constraints: {
        min: { x: -200, y: -200 },
        max: { x: 200, y: 200 },
      },
    }
  );
  
  useEffect(() => {
    const unsubscribeX = x.onChange((value: number) => setCurrentX(value));
    const unsubscribeY = y.onChange((value: number) => setCurrentY(value));
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y]);
  
  return (
    <div style={{ position: 'relative', height: '300px', border: '1px dashed #ccc' }}>
      <div
        ref={dragRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '100px',
          height: '100px',
          backgroundColor: '#8b5cf6',
          borderRadius: '8px',
          transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`,
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        Spring Back
      </div>
    </div>
  );
}
```

---

## Pan Gesture

Touch-optimized pan gesture with lower threshold.

```tsx
function PanExample() {
  const x = useMotionValue(0, { unit: 'px' });
  const y = useMotionValue(0, { unit: 'px' });
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  
  const panRef = usePan(
    { x, y },
    {
      constraints: {
        min: { x: -150, y: -150 },
        max: { x: 150, y: 150 },
      },
    }
  );
  
  useEffect(() => {
    const unsubscribeX = x.onChange((value: number) => setCurrentX(value));
    const unsubscribeY = y.onChange((value: number) => setCurrentY(value));
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y]);
  
  return (
    <div style={{ position: 'relative', height: '300px', border: '1px dashed #ccc' }}>
      <div
        ref={panRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '120px',
          height: '120px',
          backgroundColor: '#10b981',
          borderRadius: '8px',
          transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`,
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        Pan Me
      </div>
    </div>
  );
}
```

---

## Scroll-Driven Animation

Element moves based on scroll position.

```tsx
function ScrollAnimation() {
  const scrollY = useMotionValue(0);
  const [currentY, setCurrentY] = useState(0);
  
  useScrollMotion(scrollY, { axis: 'y', multiplier: 1 });
  
  useEffect(() => {
    const unsubscribe = scrollY.onChange((value: number) => {
      setCurrentY(value);
    });
    return unsubscribe;
  }, [scrollY]);
  
  return (
    <div>
      <div
        style={{
          height: '200px',
          backgroundColor: '#10b981',
          borderRadius: '8px',
          transform: `translateY(${Math.min(currentY * 0.2, 200)}px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          marginBottom: '1rem',
        }}
      >
        Scroll the page to move me
      </div>
      
      {/* Add scrollable content */}
      <div style={{ height: '200vh', padding: '2rem' }}>
        <p>Scroll down to see the animation...</p>
        <div style={{ height: '50vh' }}></div>
        <p>Keep scrolling...</p>
        <div style={{ height: '50vh' }}></div>
        <p>Scroll back up!</p>
      </div>
    </div>
  );
}
```

---

## Wheel Zoom

Zoom element using mouse wheel.

```tsx
function WheelZoom() {
  const scale = useMotionValue(1);
  const [currentScale, setCurrentScale] = useState(1);
  
  const wheelRef = useWheel(
    { y: scale },
    {
      axis: 'y',
      multiplier: 0.005,
    }
  );
  
  useEffect(() => {
    const unsubscribe = scale.onChange((value: number) => {
      const clamped = Math.max(0.5, Math.min(value, 3));
      setCurrentScale(clamped);
    });
    return unsubscribe;
  }, [scale]);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        Hover over the box and use your mouse wheel to zoom
      </div>
      <div
        ref={wheelRef}
        style={{
          display: 'inline-block',
          cursor: 'zoom-in',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: '200px',
            height: '200px',
            backgroundColor: '#8b5cf6',
            borderRadius: '8px',
            transform: `scale(${currentScale})`,
            transformOrigin: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            transition: 'transform 0.05s ease-out',
          }}
        >
          Wheel Zoom
        </div>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        Scale: {currentScale.toFixed(2)}x
      </div>
    </div>
  );
}
```

---

## Axis Locking

Lock drag to a single axis.

```tsx
function AxisLockedDrag() {
  const x = useMotionValue(0, { unit: 'px' });
  const [currentX, setCurrentX] = useState(0);
  
  const dragRef = useDrag(
    { x },
    {
      axis: 'x', // Only allow horizontal movement
      constraints: {
        min: { x: -200 },
        max: { x: 200 },
      },
    }
  );
  
  useEffect(() => {
    const unsubscribe = x.onChange((value: number) => setCurrentX(value));
    return unsubscribe;
  }, [x]);
  
  return (
    <div style={{ position: 'relative', height: '300px', border: '1px dashed #ccc' }}>
      <div
        ref={dragRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '100px',
          height: '100px',
          backgroundColor: '#f59e0b',
          borderRadius: '8px',
          transform: `translateX(calc(-50% + ${currentX}px))`,
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        Horizontal Only
      </div>
    </div>
  );
}
```

---

## Custom Callbacks

Use callbacks to respond to gesture events.

```tsx
function CallbackExample() {
  const x = useMotionValue(0, { unit: 'px' });
  const y = useMotionValue(0, { unit: 'px' });
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  
  const dragRef = useDrag(
    { x, y },
    {
      onStart: (state) => {
        setIsDragging(true);
        console.log('Drag started at:', state.startPoint);
      },
      onMove: (state) => {
        setVelocity(state.velocity);
      },
      onEnd: (state) => {
        setIsDragging(false);
        console.log('Drag ended with velocity:', state.velocity);
      },
    }
  );
  
  useEffect(() => {
    const unsubscribeX = x.onChange((value: number) => setCurrentX(value));
    const unsubscribeY = y.onChange((value: number) => setCurrentY(value));
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y]);
  
  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <div>Status: {isDragging ? 'Dragging' : 'Idle'}</div>
        <div>Velocity: X: {velocity.x.toFixed(0)} px/s, Y: {velocity.y.toFixed(0)} px/s</div>
      </div>
      <div style={{ position: 'relative', height: '300px', border: '1px dashed #ccc' }}>
        <div
          ref={dragRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '100px',
            height: '100px',
            backgroundColor: isDragging ? '#ef4444' : '#3b82f6',
            borderRadius: '8px',
            transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`,
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: 'none',
            transition: 'background-color 0.2s',
          }}
        >
          Drag Me
        </div>
      </div>
    </div>
  );
}
```

---

## Combined Gestures

Combine multiple gestures on the same element.

```tsx
function CombinedGestures() {
  const x = useMotionValue(0, { unit: 'px' });
  const y = useMotionValue(0, { unit: 'px' });
  const scale = useMotionValue(1);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [currentScale, setCurrentScale] = useState(1);
  
  const dragRef = useDrag(
    { x, y },
    {
      spring: { stiffness: 300, damping: 30 },
      constraints: {
        min: { x: -150, y: -150 },
        max: { x: 150, y: 150 },
      },
    }
  );
  
  const wheelRef = useWheel(
    { y: scale },
    {
      axis: 'y',
      multiplier: 0.01,
    }
  );
  
  // Combine refs - attach both to the same element
  const combinedRef = (element: HTMLElement | null) => {
    (dragRef as any).current = element;
    (wheelRef as any).current = element;
  };
  
  useEffect(() => {
    const unsubscribeX = x.onChange((value: number) => setCurrentX(value));
    const unsubscribeY = y.onChange((value: number) => setCurrentY(value));
    const unsubscribeScale = scale.onChange((value: number) => {
      const clamped = Math.max(0.5, Math.min(value, 2));
      setCurrentScale(clamped);
    });
    return () => {
      unsubscribeX();
      unsubscribeY();
      unsubscribeScale();
    };
  }, [x, y, scale]);
  
  return (
    <div style={{ position: 'relative', height: '300px', border: '1px dashed #ccc' }}>
      <div
        ref={combinedRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '100px',
          height: '100px',
          backgroundColor: '#8b5cf6',
          borderRadius: '8px',
          transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) scale(${currentScale})`,
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        Drag & Zoom
      </div>
    </div>
  );
}
```

---

## Tips

1. **Always use `touchAction: 'none'`** on draggable elements to prevent browser touch gestures
2. **Use `userSelect: 'none'`** to prevent text selection during drag
3. **Subscribe to motion values** using `onChange` to update React state for rendering
4. **Clamp values** in wheel/scroll handlers to prevent extreme values
5. **Use `requestAnimationFrame`** for reading motion values if you need immediate updates
6. **Clean up subscriptions** in `useEffect` return functions


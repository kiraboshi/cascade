# AnimatePresence API Reference

Complete technical reference for enter/exit animations in Cascade Motion.

---

## Overview

AnimatePresence enables smooth enter/exit animations for components that mount and unmount. It tracks children by key and applies animations when elements are added or removed.

---

## Components

### `<AnimatePresence>`

Component for animating mount/unmount of children.

**Props:**
```typescript
interface AnimatePresenceProps {
  children: ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
  onExitComplete?: () => void;
  exit?: ExitAnimationConfig;
  enter?: EnterAnimationConfig;
  layout?: boolean;
}
```

**Properties:**

- `children`: React children to animate (must have stable keys)
- `mode`: Animation mode (default: `'sync'`)
  - `'sync'`: Animate all children simultaneously
  - `'wait'`: Wait for exit animation before entering next
  - `'popLayout'`: Remove element from layout immediately
- `initial`: Skip initial animation on mount (default: `true`)
- `onExitComplete`: Callback when all exit animations complete
- `exit`: Custom exit animation config
- `enter`: Custom enter animation config
- `layout`: Use layout transitions for exit (default: `false`)

**Example:**
```typescript
import { AnimatePresence } from '@cascade/motion-runtime';
import { useState } from 'react';

function List() {
  const [items, setItems] = useState([1, 2, 3]);
  
  return (
    <AnimatePresence
      exit={{
        opacity: 0,
        transform: 'translateX(-100px)',
        config: { duration: 300, easing: 'ease-out' },
      }}
      enter={{
        opacity: 0,
        config: { duration: 300, easing: 'ease-in' },
      }}
    >
      {items.map(item => (
        <div key={item}>Item {item}</div>
      ))}
    </AnimatePresence>
  );
}
```

**Modes:**

- `sync` (default): Animate all children simultaneously
- `wait`: Wait for exit animation before entering next
- `popLayout`: Remove element from layout immediately, then animate

**With Layout Transitions:**
```typescript
<AnimatePresence
  layout
  exit={{ opacity: 0, config: { duration: 300 } }}
>
  {items.map(item => (
    <div key={item}>Item {item}</div>
  ))}
</AnimatePresence>
```

---

## Hooks

### `useAnimatePresence(isPresent, config?): UseAnimatePresenceReturn`

Hook version of AnimatePresence for programmatic control of single elements.

**Signature:**
```typescript
function useAnimatePresence(
  isPresent: boolean,
  config?: UseAnimatePresenceConfig
): UseAnimatePresenceReturn
```

**Parameters:**

- `isPresent`: Boolean indicating if element should be present
- `config?`: Optional configuration (same as AnimatePresence props)

**Returns:**
```typescript
interface UseAnimatePresenceReturn {
  ref: (el: HTMLElement | null) => void;
  isExiting: boolean;
  isEntering: boolean;
  shouldRender: boolean;
}
```

**Example:**
```typescript
import { useAnimatePresence } from '@cascade/motion-runtime';

function Modal({ isOpen }: { isOpen: boolean }) {
  const { ref, isExiting, shouldRender } = useAnimatePresence(isOpen, {
    exit: { opacity: 0, config: { duration: 200 } },
    enter: { opacity: 0, config: { duration: 200 } },
  });
  
  if (!shouldRender) return null;
  
  return (
    <div
      ref={ref}
      style={{ opacity: isExiting ? 0 : 1 }}
    >
      Modal content
    </div>
  );
}
```

---

## Configuration Types

### `ExitAnimationConfig`

Configuration for exit animations.

```typescript
interface ExitAnimationConfig {
  opacity?: number;
  transform?: string;
  config?: SpringConfig | MotionValueKeyframeConfig;
}
```

**Properties:**

- `opacity`: Target opacity (0-1)
- `transform`: Transform string (e.g., `"translateX(-100px)"`)
- `config`: Animation configuration (spring or keyframe)

**Example:**
```typescript
{
  opacity: 0,
  transform: 'translateX(-100px)',
  config: { duration: 300, easing: 'ease-out' },
}
```

---

### `EnterAnimationConfig`

Configuration for enter animations.

```typescript
interface EnterAnimationConfig {
  opacity?: number;
  transform?: string;
  config?: SpringConfig | MotionValueKeyframeConfig;
}
```

**Properties:**

- `opacity`: Target opacity (0-1)
- `transform`: Transform string
- `config`: Animation configuration

**Example:**
```typescript
{
  opacity: 0,
  transform: 'translateY(20px)',
  config: { duration: 300, easing: 'ease-out' },
}
```

---

### `UseAnimatePresenceConfig`

Configuration for `useAnimatePresence` hook.

```typescript
interface UseAnimatePresenceConfig {
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
  exit?: ExitAnimationConfig;
  enter?: EnterAnimationConfig;
  layout?: boolean;
}
```

---

## Utilities

### `applyExitAnimation(element, config, onComplete): () => void`

Apply exit animation to an element (used internally).

**Signature:**
```typescript
function applyExitAnimation(
  element: HTMLElement,
  config: ExitAnimationConfig,
  onComplete: () => void
): () => void
```

**Returns:** Cleanup function

---

### `applyEnterAnimation(element, config): () => void`

Apply enter animation to an element (used internally).

**Signature:**
```typescript
function applyEnterAnimation(
  element: HTMLElement,
  config: EnterAnimationConfig
): () => void
```

**Returns:** Cleanup function

---

## Usage Patterns

### Pattern 1: Basic Fade In/Out

```typescript
<AnimatePresence
  exit={{ opacity: 0, config: { duration: 200 } }}
  enter={{ opacity: 0, config: { duration: 200 } }}
>
  {items.map(item => (
    <div key={item}>Item {item}</div>
  ))}
</AnimatePresence>
```

### Pattern 2: Slide Out

```typescript
<AnimatePresence
  exit={{
    opacity: 0,
    transform: 'translateX(-100px)',
    config: { duration: 300, easing: 'ease-out' },
  }}
>
  {items.map(item => (
    <div key={item}>Item {item}</div>
  ))}
</AnimatePresence>
```

### Pattern 3: Spring Animation

```typescript
<AnimatePresence
  exit={{
    opacity: 0,
    transform: 'scale(0.8)',
    config: { stiffness: 300, damping: 30 },
  }}
  enter={{
    opacity: 0,
    transform: 'scale(0.8)',
    config: { stiffness: 300, damping: 30 },
  }}
>
  {items.map(item => (
    <div key={item}>Item {item}</div>
  ))}
</AnimatePresence>
```

### Pattern 4: Wait Mode

```typescript
<AnimatePresence
  mode="wait"
  exit={{ opacity: 0, config: { duration: 300 } }}
  enter={{ opacity: 0, config: { duration: 300 } }}
>
  {currentItem && <div key={currentItem}>{currentItem}</div>}
</AnimatePresence>
```

### Pattern 5: With Layout Transitions

```typescript
<AnimatePresence
  layout
  exit={{ opacity: 0, config: { duration: 300 } }}
>
  {items.map(item => (
    <div key={item}>Item {item}</div>
  ))}
</AnimatePresence>
```

---

## Performance Considerations

1. **CSS Animations**: Uses CSS animations for optimal performance
2. **Layout Transitions**: When `layout={true}`, uses FLIP technique for smooth layout changes
3. **Cleanup**: Properly cleans up animations and event listeners
4. **Key Stability**: Requires stable keys for proper tracking

---

## Troubleshooting

### Animations not triggering

- Ensure children have stable, unique keys
- Check that `exit` or `enter` config is provided
- Verify element is actually mounting/unmounting

### Exit animation doesn't complete

- Ensure `onExitComplete` callback is provided if needed
- Check that animation duration matches config
- Verify element isn't being removed too quickly

### Layout transitions not working

- Ensure `layout={true}` is set
- Check that elements have measurable bounds
- Verify layout transition config is valid

---

## See Also

- [How to Create Fade Animation](../how-to/create-fade-animation.md) - Practical examples
- [Layout Transitions Reference](./layout-transitions.md) - Related features
- [Motion Values Reference](./motion-values.md) - Understanding motion values


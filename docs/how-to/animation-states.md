# Animation States Guide

Learn how to use Cascade's animation states system for reusable, variants-like animation definitions.

---

## Overview

Animation states allow you to define reusable sets of animation states (like Framer Motion's variants) that work seamlessly with Cascade's hook-based, CSS-first architecture.

**Key Benefits:**
- ✅ Define animation states once, reuse across components
- ✅ Automatic gesture integration (hover, tap, focus)
- ✅ Compile-time optimization for static states
- ✅ Type-safe state management
- ✅ Works with existing Cascade patterns

---

## Basic Usage

### 1. Define Animation States

```typescript
import { defineAnimationStates } from '@cascade/compiler';

const buttonStates = defineAnimationStates({
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 300,
      easing: 'ease-out',
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 200,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 100,
    },
  },
});
```

### 2. Use with Hook

```typescript
import { useAnimationStates } from '@cascade/motion-runtime';

function Button() {
  const animation = useAnimationStates(buttonStates, {
    initial: 'initial',
    animate: 'animate',
  });
  
  return (
    <button className={animation.className}>
      Click me
    </button>
  );
}
```

### 3. Manual State Management

```typescript
function Button() {
  const animation = useAnimationStates(buttonStates);
  
  return (
    <button
      className={animation.className}
      onMouseEnter={() => animation.set('hover')}
      onMouseLeave={() => animation.set('animate')}
      onMouseDown={() => animation.set('tap')}
      onMouseUp={() => animation.set('hover')}
    >
      Click me
    </button>
  );
}
```

---

## Gesture Integration

Use `useAnimationStatesWithGestures` for automatic gesture handling:

```typescript
import { useAnimationStatesWithGestures } from '@cascade/motion-runtime';

function Button() {
  const animation = useAnimationStatesWithGestures(buttonStates, {
    initial: 'initial',
    animate: 'animate',
    hover: true,  // Auto-handle hover
    tap: true,    // Auto-handle tap
    focus: true,  // Auto-handle focus
  });
  
  // Attach ref to element
  return (
    <button
      ref={(el) => {
        if (el && (animation.ref as any).callback) {
          (animation.ref as any).callback(el);
        }
      }}
      className={animation.className}
    >
      Click me
    </button>
  );
}
```

**Gesture Integration Features:**
- Automatically transitions to `hover` state on hover
- Automatically transitions to `tap` state on tap/press
- Automatically transitions to `focus` state on focus
- Returns to `animate` state when gestures end
- Can be disabled per gesture: `hover: false`

---

## State Transitions

### Immediate State Change

```typescript
animation.set('hover'); // Changes immediately
```

### Animated State Change

```typescript
await animation.animateTo('hover'); // Uses transition config
```

### Custom Transition

```typescript
await animation.animateTo('hover', {
  duration: 500,
  easing: 'ease-in-out',
});
```

---

## Semantic State Names

Semantic state names get special handling:

- **`initial`** - Applied on mount before `animate`
- **`animate`** - Default animated state
- **`hover`** - Auto-integrates with `useHover`
- **`tap`** - Auto-integrates with `useTap`
- **`focus`** - Auto-integrates with `useFocus`
- **`exit`** - Used with `AnimatePresence`

### Arbitrary State Names

You can also use arbitrary state names:

```typescript
const modalStates = defineAnimationStates({
  closed: { opacity: 0, scale: 0.9 },
  open: { opacity: 1, scale: 1 },
  loading: { opacity: 0.5 },
  error: { opacity: 1, color: 'red' },
});
```

---

## Compile-Time vs Runtime States

### Compile-Time States (Default)

```typescript
const states = defineAnimationStates({
  animate: {
    opacity: 1,
    scale: 1,
  },
});
// ✅ Generates CSS classes - zero runtime cost
```

### Runtime States

```typescript
const states = defineAnimationStates({
  dynamic: {
    x: 'var(--motion-x)',  // CSS custom property
    opacity: 'var(--dynamic-opacity)',
  },
});
// ⚠️ Uses CSS custom properties - requires runtime updates
```

### Explicit Mode Override

```typescript
const states = defineAnimationStates({
  forceRuntime: {
    opacity: 1,
    _mode: 'runtime' as const,  // Force runtime
  },
});
```

---

## Transitions

### Per-State Transitions

```typescript
const states = defineAnimationStates({
  animate: {
    opacity: 1,
    transition: {
      duration: 300,
      easing: 'ease-out',
      delay: 100,
    },
  },
});
```

### Transition Options

- `duration` - Animation duration in milliseconds
- `delay` - Delay before animation starts
- `easing` - CSS easing function
- `type` - `'spring' | 'tween' | 'keyframes'`
- `stiffness` / `damping` / `mass` - Spring physics (when `type: 'spring'`)

---

## Integration with MotionStage

`MotionStage` now supports animation state sets:

```typescript
import { MotionSequence, MotionStage } from '@cascade/motion-runtime';

const itemStates = defineAnimationStates({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
});

<MotionSequence autoStart>
  <MotionStage animation={itemStates}>
    Item 1
  </MotionStage>
  <MotionStage 
    animation={{ stateSet: itemStates, state: 'animate' }}
    delay={100}
  >
    Item 2
  </MotionStage>
</MotionSequence>
```

---

## State Validation

The system validates state definitions and provides helpful errors:

```typescript
// ❌ Error: State must be an object
defineAnimationStates({
  invalid: 'not an object',
});

// ⚠️ Warning: Too many properties (dev mode)
defineAnimationStates({
  complex: {
    prop1: 1,
    prop2: 2,
    // ... 10+ properties
  },
});

// ⚠️ Warning: Layout-triggering property (dev mode)
defineAnimationStates({
  slow: {
    width: '100px', // Consider using transform instead
  },
});
```

---

## Performance Considerations

### Recommended Limits

- **States per component:** 5-10 states
- **Properties per state:** 3-5 properties
- **CSS size:** < 10KB per state set

### Performance Metrics

```typescript
const states = defineAnimationStates({ ... });
console.log(states.metadata.performance);
// {
//   stateCount: 5,
//   totalProperties: 12,
//   cssSize: 2048,
//   compileTimeStates: 4,
//   runtimeStates: 1,
// }
```

---

## Examples

### Button with All States

```typescript
const buttonStates = defineAnimationStates({
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  focus: { outline: '2px solid blue' },
});

function Button() {
  const animation = useAnimationStatesWithGestures(buttonStates, {
    hover: true,
    tap: true,
    focus: true,
  });
  
  return (
    <button
      ref={(el) => {
        if (el && (animation.ref as any).callback) {
          (animation.ref as any).callback(el);
        }
      }}
      className={animation.className}
    >
      Click me
    </button>
  );
}
```

### Modal with Custom States

```typescript
const modalStates = defineAnimationStates({
  closed: {
    opacity: 0,
    scale: 0.9,
  },
  open: {
    opacity: 1,
    scale: 1,
    transition: { duration: 300 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 200 },
  },
});

function Modal({ isOpen }: { isOpen: boolean }) {
  const animation = useAnimationStates(modalStates, {
    initial: 'closed',
  });
  
  useEffect(() => {
    if (isOpen) {
      animation.animateTo('open');
    } else {
      animation.animateTo('exit');
    }
  }, [isOpen, animation]);
  
  return (
    <div className={animation.className}>
      Modal content
    </div>
  );
}
```

### List with Staggered Children

```typescript
import { useAnimationStatesWithChildren } from '@cascade/motion-runtime';

const containerStates = defineAnimationStates({
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 100,  // Stagger each child by 100ms
      delayChildren: 200,     // Wait 200ms before starting children
    },
  },
});

const itemStates = defineAnimationStates({
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
});

function List({ items }: { items: string[] }) {
  const container = useAnimationStatesWithChildren(containerStates, {
    initial: 'initial',
    animate: 'animate',
    autoOrchestrate: true, // Automatically orchestrate children
  });
  
  return (
    <div className={container.className}>
      {items.map((item, index) => (
        <ListItem
          key={index}
          item={item}
          index={index}
          container={container}
        />
      ))}
    </div>
  );
}

function ListItem({ item, index, container }) {
  const childAnimation = useAnimationStates(itemStates, {
    initial: 'initial',
    animate: false, // Controlled by parent
  });
  
  // Register with parent for orchestration
  useEffect(() => {
    container.registerChild(`item-${index}`, childAnimation);
    return () => container.unregisterChild(`item-${index}`);
  }, [container, childAnimation, index]);
  
  return <div className={childAnimation.className}>{item}</div>;
}
```

---

## API Reference

### `defineAnimationStates(config, options?)`

Defines a set of animation states.

**Parameters:**
- `config` - Object mapping state names to state definitions
- `options` - Optional configuration (parent, inheritTransitions, mode)

**Returns:** `AnimationStateSet`

### `useAnimationStates(stateSet, options?)`

React hook for managing animation states.

**Parameters:**
- `stateSet` - Animation state set from `defineAnimationStates`
- `options` - Configuration options

**Returns:** `AnimationStatesControls`

### `useAnimationStatesWithGestures(stateSet, options?)`

React hook that integrates animation states with gesture hooks.

**Parameters:**
- `stateSet` - Animation state set
- `options` - Configuration including gesture options

**Returns:** `AnimationStatesWithGesturesResult`

---

## Migration from Framer Motion

### Framer Motion

```tsx
const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

<motion.div
  initial="hidden"
  animate="visible"
  variants={variants}
/>
```

### Cascade Motion

```tsx
const states = defineAnimationStates({
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
});

function Component() {
  const animation = useAnimationStates(states, {
    initial: 'hidden',
    animate: 'visible',
  });
  
  return <div className={animation.className}>Content</div>;
}
```

---

## Best Practices

1. **Define states at module level** - Reuse across components
2. **Use semantic names** - Better IDE support and auto-integration
3. **Keep states focused** - 3-5 properties per state
4. **Prefer compile-time** - Use static values when possible
5. **Use gesture integration** - Less boilerplate, better UX

---

## Parent-Child Orchestration

Use `useAnimationStatesWithChildren` to coordinate animations between parent and children with stagger/delay effects:

```typescript
import { useAnimationStatesWithChildren } from '@cascade/motion-runtime';

const parentStates = defineAnimationStates({
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 100,  // 100ms between each child
      delayChildren: 200,     // 200ms before first child starts
    },
  },
});

function Parent() {
  const parent = useAnimationStatesWithChildren(parentStates, {
    autoOrchestrate: true, // Auto-orchestrate when parent state changes
  });
  
  return (
    <div className={parent.className}>
      {children.map((child, i) => (
        <Child key={i} index={i} parent={parent} />
      ))}
    </div>
  );
}

function Child({ index, parent }) {
  const childAnimation = useAnimationStates(childStates, {
    animate: false, // Controlled by parent
  });
  
  useEffect(() => {
    parent.registerChild(`child-${index}`, childAnimation);
    return () => parent.unregisterChild(`child-${index}`);
  }, [parent, childAnimation, index]);
  
  return <div className={childAnimation.className}>Child {index}</div>;
}
```

**Orchestration Features:**
- `staggerChildren` - Delay between each child animation (in milliseconds)
- `delayChildren` - Initial delay before first child starts (in milliseconds)
- `autoOrchestrate` - Automatically trigger children when parent state changes
- Manual control via `animateChildrenTo()` and `setChildren()`

## Related Documentation

- [Motion Values](./motion-values.md) - Runtime animation control
- [Compile-Time Animations](./compile-time-vs-runtime.md) - CSS-first approach
- [Gesture Hooks](../reference/gestures.md) - User interaction handling


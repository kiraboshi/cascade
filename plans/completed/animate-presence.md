---
title: AnimatePresence
type: plan
status: completed
created_at: 2025-01-11
completed_at: 2025-01-11
scope: motion-runtime
priority: medium
timeline: medium-term
---

# Implementation Plan: AnimatePresence

## Overview

Implement an `AnimatePresence` component similar to Framer Motion's, enabling smooth enter/exit animations for components that mount and unmount. This is essential for route transitions, list item animations, and modal/dialog animations.

---

## Goals

1. **`<AnimatePresence>` component** - Wrapper for exit animations
2. **Exit animations** - Animate elements when they unmount
3. **Mode support** - `wait`, `sync`, `popLayout` modes
4. **Initial prop** - Skip initial animation
5. **Integration** - Works with layout transitions and motion values

---

## Phase 1: Core AnimatePresence Component

### 1.1 Component API

**File**: `packages/motion-runtime/src/AnimatePresence.tsx`

**API Design**:
```typescript
export interface AnimatePresenceProps {
  /**
   * Children to animate
   */
  children: ReactNode;
  
  /**
   * Animation mode
   * - 'sync': Animate all children simultaneously (default)
   * - 'wait': Wait for exit animation before entering next
   * - 'popLayout': Remove element from layout immediately
   */
  mode?: 'sync' | 'wait' | 'popLayout';
  
  /**
   * Skip initial animation on mount
   */
  initial?: boolean;
  
  /**
   * Callback when all exit animations complete
   */
  onExitComplete?: () => void;
  
  /**
   * Custom exit animation config
   */
  exit?: {
    opacity?: number;
    transform?: string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  
  /**
   * Custom enter animation config
   */
  enter?: {
    opacity?: number;
    transform?: string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  
  /**
   * Use layout transitions for exit
   */
  layout?: boolean;
}

/**
 * Component for animating mount/unmount of children
 */
export function AnimatePresence({
  children,
  mode = 'sync',
  initial = true,
  onExitComplete,
  exit,
  enter,
  layout = false,
}: AnimatePresenceProps): JSX.Element;
```

**Implementation Steps**:

1. **Create AnimatePresence component**
   ```typescript
   export function AnimatePresence({
     children,
     mode = 'sync',
     initial = true,
     onExitComplete,
     exit,
     enter,
     layout = false,
   }: AnimatePresenceProps): JSX.Element {
     const [displayedChildren, setDisplayedChildren] = useState<Map<string, ReactNode>>(new Map());
     const exitingChildrenRef = useRef<Set<string>>(new Set());
     const exitCallbacksRef = useRef<Map<string, () => void>>(new Map());
     const isInitialMountRef = useRef(true);
     
     // Track children by key
     useEffect(() => {
       const currentKeys = new Set<string>();
       const newChildren = new Map<string, ReactNode>();
       
       Children.forEach(children, (child, index) => {
         if (!isValidElement(child)) return;
         
         const key = child.key ?? `presence-${index}`;
         currentKeys.add(key);
         
         // Check if this is a new child
         if (!displayedChildren.has(key)) {
           // New child entering
           newChildren.set(key, child);
         } else {
           // Existing child
           newChildren.set(key, displayedChildren.get(key));
         }
       });
       
       // Find children that are exiting
       for (const [key, child] of displayedChildren.entries()) {
         if (!currentKeys.has(key)) {
           // Child is exiting
           exitingChildrenRef.current.add(key);
           newChildren.set(key, child); // Keep in DOM for exit animation
         }
       }
       
       setDisplayedChildren(newChildren);
       
       // Clean up if no exiting children
       if (exitingChildrenRef.current.size === 0 && onExitComplete) {
         onExitComplete();
       }
     }, [children, displayedChildren, onExitComplete]);
     
     return (
       <>
         {Array.from(displayedChildren.entries()).map(([key, child]) => {
           if (!isValidElement(child)) return null;
           
           return (
             <AnimatePresenceChild
               key={key}
               presenceKey={key}
               child={child}
               mode={mode}
               initial={initial && isInitialMountRef.current}
               exit={exit}
               enter={enter}
               layout={layout}
               onExitComplete={() => {
                 exitingChildrenRef.current.delete(key);
                 setDisplayedChildren(prev => {
                   const next = new Map(prev);
                   next.delete(key);
                   return next;
                 });
                 
                 if (exitingChildrenRef.current.size === 0 && onExitComplete) {
                   onExitComplete();
                 }
               }}
             />
           );
         })}
       </>
     );
   }
   ```

2. **Create child wrapper component**
   ```typescript
   interface AnimatePresenceChildProps {
     presenceKey: string;
     child: ReactElement;
     mode: 'sync' | 'wait' | 'popLayout';
     initial: boolean;
     exit?: AnimatePresenceProps['exit'];
     enter?: AnimatePresenceProps['enter'];
     layout?: boolean;
     onExitComplete: () => void;
   }
   
   function AnimatePresenceChild({
     presenceKey,
     child,
     mode,
     initial,
     exit,
     enter,
     layout,
     onExitComplete,
   }: AnimatePresenceChildProps): JSX.Element {
     const elementRef = useRef<HTMLElement>(null);
     const [isExiting, setIsExiting] = useState(false);
     const [shouldRender, setShouldRender] = useState(true);
     const hasAnimatedRef = useRef(!initial);
     
     // Detect if child is exiting
     useEffect(() => {
       // Check if this child is in the exiting set
       // This would be passed from parent or detected via key comparison
       // For now, we'll use a simpler approach with refs
     }, []);
     
     // Apply exit animation
     useEffect(() => {
       if (isExiting && exit) {
         const element = elementRef.current;
         if (!element) return;
         
         // Apply exit animation
         applyExitAnimation(element, exit, () => {
           setShouldRender(false);
           onExitComplete();
         });
       }
     }, [isExiting, exit, onExitComplete]);
     
     // Apply enter animation
     useEffect(() => {
       if (!hasAnimatedRef.current && enter && !isExiting) {
         const element = elementRef.current;
         if (!element) return;
         
         applyEnterAnimation(element, enter);
         hasAnimatedRef.current = true;
       }
     }, [enter, isExiting]);
     
     if (!shouldRender) {
       return null;
     }
     
     return cloneElement(child, {
       ref: (el: HTMLElement) => {
         elementRef.current = el;
         // Call original ref if it exists
         if (typeof child.ref === 'function') {
           child.ref(el);
         } else if (child.ref) {
           (child.ref as any).current = el;
         }
       },
     });
   }
   ```

---

## Phase 2: Exit Animation System

### 2.1 Exit Animation Utilities

**File**: `packages/motion-runtime/src/animate-presence-utils.ts`

**API Design**:
```typescript
export interface ExitAnimationConfig {
  opacity?: number;
  transform?: string;
  config?: SpringConfig | MotionValueKeyframeConfig;
}

export interface EnterAnimationConfig {
  opacity?: number;
  transform?: string;
  config?: SpringConfig | MotionValueKeyframeConfig;
}

/**
 * Apply exit animation to element
 */
export function applyExitAnimation(
  element: HTMLElement,
  config: ExitAnimationConfig,
  onComplete: () => void
): () => void;

/**
 * Apply enter animation to element
 */
export function applyEnterAnimation(
  element: HTMLElement,
  config: EnterAnimationConfig
): () => void;
```

**Implementation**:
```typescript
export function applyExitAnimation(
  element: HTMLElement,
  config: ExitAnimationConfig,
  onComplete: () => void
): () => void {
  // Create motion values for exit animation
  const opacity = createMotionValue(1);
  const x = createMotionValue(0);
  const y = createMotionValue(0);
  
  // Set target values
  if (config.opacity !== undefined) {
    opacity.animateTo(config.opacity, config.config);
  }
  
  // Parse transform if provided
  if (config.transform) {
    // Parse transform string (e.g., "translateX(100px)")
    // Apply to appropriate motion values
  }
  
  // Apply to element
  const unsubscribeOpacity = opacity.onChange((value) => {
    element.style.opacity = String(value);
  });
  
  // Wait for animation to complete
  Promise.all([
    config.opacity !== undefined ? opacity.animateTo(config.opacity, config.config) : Promise.resolve(),
    // ... other animations
  ]).then(() => {
    onComplete();
  });
  
  return () => {
    unsubscribeOpacity();
    opacity.stop();
  };
}
```

---

## Phase 3: Mode Support

### 3.1 Wait Mode

**Implementation**: Wait for all exit animations to complete before starting enter animations.

```typescript
function useWaitMode(
  children: ReactNode,
  onExitComplete: () => void
) {
  const [isWaiting, setIsWaiting] = useState(false);
  const pendingExitsRef = useRef<Set<string>>(new Set());
  
  // Track exiting children
  // Wait for all to complete before allowing new children to enter
}
```

### 3.2 Sync Mode

**Implementation**: Animate all children simultaneously (default behavior).

### 3.3 PopLayout Mode

**Implementation**: Remove element from layout immediately, then animate.

```typescript
function usePopLayoutMode(element: HTMLElement) {
  // Measure element
  // Remove from layout (position: absolute)
  // Animate from original position
  // Remove from DOM when complete
}
```

---

## Phase 4: Integration with Layout Transitions

### 4.1 Layout-Aware Exit

**File**: `packages/motion-runtime/src/AnimatePresence.tsx` (extend)

**Implementation**:
```typescript
// Use layout transitions for exit if layout prop is true
if (layout && isExiting) {
  // Measure element before removal
  // Use FLIP animation for exit
  useLayoutTransition(elementRef, {
    duration: exit?.config?.duration || 300,
    easing: exit?.config?.easing,
  });
}
```

---

## Phase 5: Hook API

### 5.1 useAnimatePresence Hook

**File**: `packages/motion-runtime/src/useAnimatePresence.ts`

**API Design**:
```typescript
export interface UseAnimatePresenceConfig {
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
  exit?: ExitAnimationConfig;
  enter?: EnterAnimationConfig;
  layout?: boolean;
}

/**
 * Hook version of AnimatePresence for programmatic control
 */
export function useAnimatePresence(
  isPresent: boolean,
  config?: UseAnimatePresenceConfig
): {
  ref: RefObject<HTMLElement>;
  isExiting: boolean;
  isEntering: boolean;
};
```

---

## Usage Examples

### Basic Usage
```typescript
import { AnimatePresence } from '@cascade/motion-runtime';
import { useState } from 'react';

function List() {
  const [items, setItems] = useState([1, 2, 3]);
  
  return (
    <AnimatePresence mode="sync">
      {items.map(item => (
        <div key={item}>
          Item {item}
        </div>
      ))}
    </AnimatePresence>
  );
}
```

### With Exit Animation
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

### Wait Mode
```typescript
<AnimatePresence
  mode="wait"
  onExitComplete={() => {
    console.log('Exit complete, entering next');
  }}
>
  {currentView === 'home' && <HomeView key="home" />}
  {currentView === 'about' && <AboutView key="about" />}
</AnimatePresence>
```

### With Layout Transitions
```typescript
<AnimatePresence
  layout
  exit={{
    opacity: 0,
    config: { duration: 300 },
  }}
>
  {items.map(item => (
    <div key={item}>Item {item}</div>
  ))}
</AnimatePresence>
```

---

## Testing Strategy

### Unit Tests

1. **AnimatePresence component**
   - Test child tracking
   - Test exit detection
   - Test mode behavior
   - Test initial prop

2. **Exit animations**
   - Test animation application
   - Test completion callbacks
   - Test cleanup

3. **Modes**
   - Test wait mode
   - Test sync mode
   - Test popLayout mode

### Integration Tests

- Test with real DOM
- Test with multiple children
- Test with layout transitions
- Test performance

---

## Implementation Checklist

### Phase 1: Core Component
- [x] Create `AnimatePresence.tsx`
- [x] Implement child tracking
- [x] Implement exit detection
- [x] Add unit tests

### Phase 2: Exit Animations
- [x] Create exit animation utilities
- [x] Implement exit animation application
- [x] Add completion callbacks
- [x] Add unit tests

### Phase 3: Modes
- [x] Implement wait mode
- [x] Implement sync mode
- [x] Implement popLayout mode
- [x] Add unit tests

### Phase 4: Layout Integration
- [x] Integrate with layout transitions
- [x] Test layout-aware exits
- [x] Add unit tests

### Phase 5: Hook API
- [x] Create `useAnimatePresence` hook
- [x] Add unit tests

### Phase 6: Integration
- [x] Update package exports
- [x] Add to documentation
- [x] Create demo examples
- [x] Integration tests

---

## Timeline Estimate

- **Phase 1**: 4-5 days (Core component)
- **Phase 2**: 3-4 days (Exit animations)
- **Phase 3**: 3-4 days (Modes)
- **Phase 4**: 2-3 days (Layout integration)
- **Phase 5**: 2-3 days (Hook API)
- **Phase 6**: 2-3 days (Integration)

**Total**: 16-22 days

---

## Dependencies

- `@cascade/motion-runtime` (MotionValue, layout transitions)
- `@cascade/compiler` (SpringConfig)
- React (hooks, refs)

---

## Challenges & Solutions

### Challenge 1: Detecting Exiting Children

**Solution**: Track children by key, compare previous and current children sets.

### Challenge 2: Keeping Exiting Elements in DOM

**Solution**: Keep exiting elements in a separate map, render them until animation completes.

### Challenge 3: Layout Transitions on Exit

**Solution**: Measure element before removal, use FLIP animation.

### Challenge 4: Performance with Many Children

**Solution**: Batch updates, use `requestAnimationFrame`, optimize re-renders.

---

## Future Enhancements

1. **Custom exit animations per child** - Allow different exit animations
2. **Stagger animations** - Animate children with delay
3. **Shared element transitions** - Animate between different components
4. **Route transitions** - Special handling for route changes


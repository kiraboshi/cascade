---
title: Layout Transitions (FLIP)
type: plan
status: completed
completed_at: 2025-01-11
scope: motion-runtime
---

# Implementation Plan: Layout Transitions (FLIP)

## Overview

Implement FLIP (First, Last, Invert, Play) pattern for layout transitions, measuring element bounds before/after changes and generating keyframes on-demand while maintaining GPU acceleration through CSS transforms.

---

## Phase 1: Layout Measurement Utilities

### 1.1 Bounding Box Utilities

**File**: `packages/motion-runtime/src/layout-utils.ts`

**API Design**:
```typescript
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TransformDelta {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

export function measureElement(element: HTMLElement): BoundingBox
export function calculateTransformDelta(from: BoundingBox, to: BoundingBox): TransformDelta
export function measureElements(elements: HTMLElement[]): BoundingBox[]
```

**Implementation Steps**:

1. **Measure single element**
   ```typescript
   export function measureElement(element: HTMLElement): BoundingBox {
     const rect = element.getBoundingClientRect();
     const scrollX = window.scrollX || window.pageXOffset || 0;
     const scrollY = window.scrollY || window.pageYOffset || 0;
     
     return {
       x: rect.left + scrollX,
       y: rect.top + scrollY,
       width: rect.width,
       height: rect.height,
     };
   }
   ```

2. **Calculate transform delta**
   ```typescript
   export function calculateTransformDelta(
     from: BoundingBox,
     to: BoundingBox
   ): TransformDelta {
     // Calculate position delta
     const deltaX = to.x - from.x;
     const deltaY = to.y - from.y;
     
     // Calculate scale delta
     const scaleX = from.width > 0 ? to.width / from.width : 1;
     const scaleY = from.height > 0 ? to.height / from.height : 1;
     
     return {
       x: deltaX,
       y: deltaY,
       scaleX,
       scaleY,
     };
   }
   ```

3. **Measure multiple elements**
   ```typescript
   export function measureElements(elements: HTMLElement[]): BoundingBox[] {
     return elements.map(measureElement);
   }
   ```

---

### 1.2 Layout Change Detection

**File**: `packages/motion-runtime/src/layout-detector.ts`

**Purpose**: Detect when layout changes occur

**API Design**:
```typescript
export interface LayoutChange {
  element: HTMLElement;
  from: BoundingBox;
  to: BoundingBox;
  delta: TransformDelta;
}

export function detectLayoutChanges(
  elements: HTMLElement[],
  previousBounds: Map<HTMLElement, BoundingBox>
): LayoutChange[]
```

**Implementation**:
```typescript
export function detectLayoutChanges(
  elements: HTMLElement[],
  previousBounds: Map<HTMLElement, BoundingBox>
): LayoutChange[] {
  const changes: LayoutChange[] = [];
  
  for (const element of elements) {
    const currentBounds = measureElement(element);
    const previousBounds = previousBounds.get(element);
    
    if (previousBounds) {
      const delta = calculateTransformDelta(previousBounds, currentBounds);
      
      // Only create change if delta is significant (avoid jitter)
      const threshold = 1; // pixels
      if (
        Math.abs(delta.x) > threshold ||
        Math.abs(delta.y) > threshold ||
        Math.abs(delta.scaleX - 1) > 0.01 ||
        Math.abs(delta.scaleY - 1) > 0.01
      ) {
        changes.push({
          element,
          from: previousBounds,
          to: currentBounds,
          delta,
        });
      }
    }
  }
  
  return changes;
}
```

---

## Phase 2: FLIP Keyframe Generator

### 2.1 FLIP Keyframe Generation

**File**: `packages/motion-runtime/src/flip-generator.ts`

**API Design**:
```typescript
import { generateKeyframes, type KeyframeConfig } from '@cascade/compiler';

export interface FLIPConfig {
  from: BoundingBox;
  to: BoundingBox;
  duration?: number;
  easing?: string;
  origin?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function generateFLIPKeyframes(
  name: string,
  config: FLIPConfig
): { css: string; className: string }
```

**Implementation Steps**:

1. **Calculate transform values**
   ```typescript
   export function generateFLIPKeyframes(
     name: string,
     config: FLIPConfig
   ): { css: string; className: string } {
     const delta = calculateTransformDelta(config.from, config.to);
     const origin = config.origin || 'center';
     
     // Calculate transform origin offset for scaling
     let originX = 0;
     let originY = 0;
     
     if (origin === 'center') {
       originX = config.from.width / 2;
       originY = config.from.height / 2;
     } else if (origin === 'top-left') {
       originX = 0;
       originY = 0;
     }
     // ... other origins
     
     // Generate keyframes
     // FROM: Invert the delta (move element back to original position visually)
     // TO: Transform to identity (element is now in correct position)
     const keyframeConfig: KeyframeConfig = {
       from: {
         transform: `translate(${-delta.x}px, ${-delta.y}px) scale(${1 / delta.scaleX}, ${1 / delta.scaleY})`,
         transformOrigin: `${originX}px ${originY}px`,
       },
       to: {
         transform: 'translate(0, 0) scale(1, 1)',
         transformOrigin: `${originX}px ${originY}px`,
       },
       duration: `${config.duration || 300}ms`,
       easing: config.easing || 'cubic-bezier(0.4, 0, 0.2, 1)',
     };
     
     return generateKeyframes(name, keyframeConfig);
   }
   ```

2. **Handle edge cases**
   ```typescript
   // Handle zero dimensions
   if (config.from.width === 0 || config.from.height === 0) {
     // Use opacity fade instead
     return generateKeyframes(name, {
       from: { opacity: 0 },
       to: { opacity: 1 },
       duration: `${config.duration || 300}ms`,
       easing: config.easing,
     });
   }
   ```

---

### 2.2 Keyframe Caching

**File**: `packages/motion-runtime/src/flip-generator.ts` (extend)

**Purpose**: Cache generated keyframes to avoid regeneration

**Implementation**:
```typescript
const keyframeCache = new Map<string, { css: string; className: string }>();

function getCacheKey(config: FLIPConfig): string {
  return `${config.from.x},${config.from.y},${config.from.width},${config.from.height}-${config.to.x},${config.to.y},${config.to.width},${config.to.height}-${config.duration || 300}`;
}

export function generateFLIPKeyframes(
  name: string,
  config: FLIPConfig
): { css: string; className: string } {
  const cacheKey = getCacheKey(config);
  
  if (keyframeCache.has(cacheKey)) {
    // Return cached version but with new name
    const cached = keyframeCache.get(cacheKey)!;
    return {
      css: cached.css.replace(cached.className, name),
      className: name,
    };
  }
  
  // Generate new keyframes
  const result = generateFLIPKeyframesInternal(name, config);
  keyframeCache.set(cacheKey, result);
  
  return result;
}
```

---

## Phase 3: Layout Transition Hook

### 3.1 useLayoutTransition Hook

**File**: `packages/motion-runtime/src/useLayoutTransition.ts`

**API Design**:
```typescript
export interface LayoutTransitionConfig {
  duration?: number;
  easing?: string;
  onComplete?: () => void;
  enabled?: boolean;
}

export function useLayoutTransition(
  elementRef: RefObject<HTMLElement>,
  config?: LayoutTransitionConfig
): void
```

**Implementation Steps**:

1. **Track previous bounds**
   ```typescript
   export function useLayoutTransition(
     elementRef: RefObject<HTMLElement>,
     config?: LayoutTransitionConfig
   ): void {
     const previousBoundsRef = useRef<BoundingBox | null>(null);
     const animationRef = useRef<Animation | null>(null);
     const enabled = config?.enabled !== false;
     
     useEffect(() => {
       if (!enabled) return;
       
       const element = elementRef.current;
       if (!element) return;
       
       // Measure current bounds
       const currentBounds = measureElement(element);
       
       if (previousBoundsRef.current) {
         // Generate and apply FLIP animation
         applyFLIPAnimation(element, previousBoundsRef.current, currentBounds, config);
       }
       
       // Update previous bounds for next render
       previousBoundsRef.current = currentBounds;
     });
   }
   ```

2. **Apply FLIP animation**
   ```typescript
   function applyFLIPAnimation(
     element: HTMLElement,
     from: BoundingBox,
     to: BoundingBox,
     config?: LayoutTransitionConfig
   ): void {
     // Generate keyframes
     const animationName = `flip-${Math.random().toString(36).substr(2, 9)}`;
     const { css, className } = generateFLIPKeyframes(animationName, {
       from,
       to,
       duration: config?.duration,
       easing: config?.easing,
     });
     
     // Inject CSS
     const styleId = `flip-style-${animationName}`;
     if (!document.getElementById(styleId)) {
       const styleElement = document.createElement('style');
       styleElement.id = styleId;
       styleElement.textContent = css;
       document.head.appendChild(styleElement);
     }
     
     // Apply animation class
     element.classList.add(className);
     
     // Clean up after animation
     const handleAnimationEnd = () => {
       element.classList.remove(className);
       config?.onComplete?.();
     };
     
     element.addEventListener('animationend', handleAnimationEnd, { once: true });
   }
   ```

---

### 3.2 Shared Element Transitions

**File**: `packages/motion-runtime/src/useSharedLayoutTransition.ts`

**API Design**:
```typescript
export interface SharedLayoutTransitionConfig {
  layoutId: string;
  duration?: number;
  easing?: string;
  onComplete?: () => void;
}

export function useSharedLayoutTransition(
  elementRef: RefObject<HTMLElement>,
  config: SharedLayoutTransitionConfig
): void
```

**Implementation Steps**:

1. **Create global registry**
   ```typescript
   interface SharedElement {
     element: HTMLElement;
     bounds: BoundingBox;
     timestamp: number;
   }
   
   const sharedLayoutRegistry = new Map<string, SharedElement>();
   ```

2. **Implement hook**
   ```typescript
   export function useSharedLayoutTransition(
     elementRef: RefObject<HTMLElement>,
     config: SharedLayoutTransitionConfig
   ): void {
     const { layoutId, duration, easing, onComplete } = config;
     
     useEffect(() => {
       const element = elementRef.current;
       if (!element) return;
       
       const currentBounds = measureElement(element);
       const previous = sharedLayoutRegistry.get(layoutId);
       
       if (previous && previous.element !== element) {
         // Generate FLIP animation from previous element to this one
         const { css, className } = generateFLIPKeyframes(
           `shared-flip-${layoutId}-${Date.now()}`,
           {
             from: previous.bounds,
             to: currentBounds,
             duration,
             easing,
           }
         );
         
         // Inject CSS
         injectCSS(css);
         
         // Apply animation
         element.classList.add(className);
         
         const handleAnimationEnd = () => {
           element.classList.remove(className);
           onComplete?.();
         };
         
         element.addEventListener('animationend', handleAnimationEnd, { once: true });
         
         // Clean up previous entry
         sharedLayoutRegistry.delete(layoutId);
       }
       
       // Register this element
       sharedLayoutRegistry.set(layoutId, {
         element,
         bounds: currentBounds,
         timestamp: Date.now(),
       });
       
       // Clean up old entries (older than 1 second)
       const now = Date.now();
       for (const [id, entry] of sharedLayoutRegistry.entries()) {
         if (now - entry.timestamp > 1000) {
           sharedLayoutRegistry.delete(id);
         }
       }
       
       return () => {
         sharedLayoutRegistry.delete(layoutId);
       };
     }, [layoutId, duration, easing, onComplete]);
   }
   ```

---

## Phase 4: Batch Layout Measurements

### 4.1 Batch Measurement Hook

**File**: `packages/motion-runtime/src/useBatchLayoutTransition.ts`

**Purpose**: Measure multiple elements and animate them together

**API Design**:
```typescript
export function useBatchLayoutTransition(
  elementRefs: RefObject<HTMLElement>[],
  config?: LayoutTransitionConfig
): void
```

**Implementation**:
```typescript
export function useBatchLayoutTransition(
  elementRefs: RefObject<HTMLElement>[],
  config?: LayoutTransitionConfig
): void {
  const previousBoundsRef = useRef<Map<HTMLElement, BoundingBox>>(new Map());
  
  useEffect(() => {
     const elements = elementRefs
       .map(ref => ref.current)
       .filter((el): el is HTMLElement => el !== null);
     
     if (elements.length === 0) return;
     
     // Measure all elements
     const currentBounds = new Map<HTMLElement, BoundingBox>();
     for (const element of elements) {
       currentBounds.set(element, measureElement(element));
     }
     
     // Detect changes
     const changes = detectLayoutChanges(elements, previousBoundsRef.current);
     
     // Animate each change
     for (const change of changes) {
       applyFLIPAnimation(
         change.element,
         change.from,
         change.to,
         config
       );
     }
     
     // Update previous bounds
     previousBoundsRef.current = currentBounds;
   });
}
```

---

## Phase 5: Integration with MotionSequence

### 5.1 Layout Transition Stage

**File**: `packages/motion-runtime/src/MotionStage.tsx` (extend)

**Purpose**: Add layout transition support to MotionStage

**Implementation**:
```typescript
export interface MotionStageProps {
  // ... existing props
  layoutTransition?: boolean | LayoutTransitionConfig;
}

export const MotionStage = forwardRef<HTMLDivElement, MotionStageProps>(
  function MotionStage(props, ref) {
    const { layoutTransition, ...otherProps } = props;
    const elementRef = useRef<HTMLDivElement>(null);
    
    // Apply layout transition if enabled
    useLayoutTransition(
      elementRef,
      typeof layoutTransition === 'boolean'
        ? { enabled: layoutTransition }
        : layoutTransition
    );
    
    // ... rest of implementation
  }
);
```

---

## Phase 6: Testing

### 6.1 Unit Tests

**File**: `packages/motion-runtime/src/__tests__/layout-utils.test.ts`

**Test Cases**:

1. **Measure element bounds**
   ```typescript
   test('measureElement returns correct bounds', () => {
     const element = document.createElement('div');
     element.style.width = '100px';
     element.style.height = '50px';
     document.body.appendChild(element);
     
     const bounds = measureElement(element);
     expect(bounds.width).toBe(100);
     expect(bounds.height).toBe(50);
     
     document.body.removeChild(element);
   });
   ```

2. **Calculate transform delta**
   ```typescript
   test('calculateTransformDelta computes correct delta', () => {
     const from: BoundingBox = { x: 0, y: 0, width: 100, height: 50 };
     const to: BoundingBox = { x: 100, y: 50, width: 200, height: 100 };
     
     const delta = calculateTransformDelta(from, to);
     expect(delta.x).toBe(100);
     expect(delta.y).toBe(50);
     expect(delta.scaleX).toBe(2);
     expect(delta.scaleY).toBe(2);
   });
   ```

---

### 6.2 Integration Tests

**File**: `packages/motion-runtime/src/__tests__/useLayoutTransition.test.tsx`

**Test Cases**:

1. **Layout transition animates on change**
   ```typescript
   test('animates when element position changes', async () => {
     const { rerender } = render(
       <div ref={elementRef} style={{ position: 'absolute', left: '0px' }}>
         Content
       </div>
     );
     
     useLayoutTransition(elementRef);
     
     // Change position
     rerender(
       <div ref={elementRef} style={{ position: 'absolute', left: '100px' }}>
         Content
       </div>
     );
     
     // Verify animation is applied
     await waitFor(() => {
       expect(elementRef.current?.classList.contains(/flip-/)).toBe(true);
     });
   });
   ```

2. **Shared layout transition**
   ```typescript
   test('shared layout transition animates between elements', () => {
     // Test shared element transition
   });
   ```

---

## Phase 7: Documentation and Examples

### 7.1 Usage Examples

**File**: `apps/demo/src/pages/LayoutTransitionDemo.tsx`

**Example 1: List reordering**
```typescript
function ReorderableList() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());
  
  const handleReorder = () => {
    setItems([5, 1, 2, 3, 4]); // Move last to first
  };
  
  return (
    <div>
      <button onClick={handleReorder}>Reorder</button>
      <ul>
        {items.map((item) => (
          <li
            key={item}
            ref={(el) => {
              if (el) itemRefs.current.set(item, el);
            }}
          >
            <AnimatedItem id={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnimatedItem({ id }: { id: number }) {
  const ref = useRef<HTMLElement>(null);
  useLayoutTransition(ref, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });
  
  return <div ref={ref}>Item {id}</div>;
}
```

**Example 2: Shared element transition**
```typescript
function SharedElementDemo() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div>
      {expanded ? (
        <ExpandedCard
          layoutId="card"
          onClose={() => setExpanded(false)}
        />
      ) : (
        <CollapsedCard
          layoutId="card"
          onClick={() => setExpanded(true)}
        />
      )}
    </div>
  );
}

function CollapsedCard({ layoutId, onClick }: Props) {
  const ref = useRef<HTMLElement>(null);
  useSharedLayoutTransition(ref, { layoutId });
  
  return (
    <div ref={ref} onClick={onClick} className="card-small">
      Click to expand
    </div>
  );
}

function ExpandedCard({ layoutId, onClose }: Props) {
  const ref = useRef<HTMLElement>(null);
  useSharedLayoutTransition(ref, { layoutId });
  
  return (
    <div ref={ref} className="card-large">
      <button onClick={onClose}>Close</button>
      Expanded content
    </div>
  );
}
```

**Example 3: Grid layout changes**
```typescript
function GridLayout() {
  const [columns, setColumns] = useState(3);
  const itemRefs = useRef<HTMLElement[]>([]);
  
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={(el) => {
            if (el) itemRefs.current[index] = el;
          }}
        >
          <AnimatedGridItem item={item} />
        </div>
      ))}
    </div>
  );
}

function AnimatedGridItem({ item }: Props) {
  const ref = useRef<HTMLElement>(null);
  useLayoutTransition(ref);
  
  return <div ref={ref}>{item.content}</div>;
}
```

---

## Implementation Checklist

### Phase 1: Measurement Utilities
- [ ] Create `layout-utils.ts` with `measureElement`
- [ ] Implement `calculateTransformDelta`
- [ ] Add `measureElements` for batch measurement
- [ ] Create `layout-detector.ts` for change detection

### Phase 2: FLIP Generator
- [ ] Create `flip-generator.ts` with `generateFLIPKeyframes`
- [ ] Implement transform calculation
- [ ] Handle edge cases (zero dimensions, etc.)
- [ ] Add keyframe caching

### Phase 3: Layout Transition Hook
- [ ] Create `useLayoutTransition.ts` hook
- [ ] Implement bounds tracking
- [ ] Add CSS injection and cleanup
- [ ] Create `useSharedLayoutTransition.ts` hook
- [ ] Implement shared element registry

### Phase 4: Batch Measurements
- [ ] Create `useBatchLayoutTransition.ts` hook
- [ ] Implement batch change detection

### Phase 5: Integration
- [ ] Extend `MotionStage` to support layout transitions
- [ ] Add layout transition config to `MotionSequence`

### Phase 6: Testing
- [ ] Unit tests for layout utilities
- [ ] Unit tests for FLIP generator
- [ ] Integration tests for hooks
- [ ] Visual regression tests

### Phase 7: Documentation
- [ ] Update README with layout transition docs
- [ ] Create demo examples
- [ ] Document shared element transitions
- [ ] Add performance tips

---

## Estimated Timeline

- **Phase 1**: 1 day
- **Phase 2**: 1-2 days
- **Phase 3**: 2 days
- **Phase 4**: 1 day
- **Phase 5**: 0.5 days
- **Phase 6**: 1-2 days
- **Phase 7**: 1 day

**Total**: 7.5-9.5 days

---

## Dependencies

- `@cascade/compiler` - For `generateKeyframes` function
- `@cascade/motion-runtime` - For `MotionValue` (if needed for advanced features)
- React - For hooks

---

## Performance Considerations

1. **Batch Measurements**: Use `requestAnimationFrame` to batch layout measurements
2. **Keyframe Caching**: Cache generated keyframes to avoid regeneration
3. **Transform Only**: Use `transform` (not `left`/`top`) for GPU acceleration
4. **Cleanup**: Remove injected CSS after animation completes
5. **Threshold**: Only animate if delta exceeds threshold (avoid jitter)

---

## Browser Compatibility

- **getBoundingClientRect**: Supported in all modern browsers
- **CSS Transforms**: Excellent support
- **requestAnimationFrame**: Supported in all modern browsers

---

## Future Enhancements

1. **Staggered Animations**: Animate multiple elements with stagger
2. **Morphing**: Animate between different shapes
3. **Path Animations**: Animate along a path
4. **3D Transforms**: Support 3D layout transitions



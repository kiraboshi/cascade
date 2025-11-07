---
title: Gesture & Scroll Bridges
type: plan
status: completed
completed_at: 2025-01-11
scope: motion-gestures
---

# Implementation Plan: Gesture & Scroll Bridges

## Overview

Create an optional `@cascade/motion-gestures` package that maps pointer/scroll events to MotionValues, enabling gesture-driven animations while maintaining CSS performance through CSS custom properties.

---

## Package Structure

```
packages/motion-gestures/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # Public API exports
│   ├── gesture-handler.ts          # Core gesture handling logic
│   ├── spring-bridge.ts            # Runtime spring animation bridge
│   ├── useDrag.ts                  # Drag gesture hook
│   ├── usePan.ts                   # Pan gesture hook
│   ├── useScroll.ts                # Scroll gesture hook
│   ├── useWheel.ts                 # Wheel gesture hook
│   ├── velocity-tracker.ts         # Velocity calculation utility
│   └── __tests__/
│       ├── gesture-handler.test.ts
│       ├── useDrag.test.tsx
│       └── spring-bridge.test.ts
```

---

## Phase 1: Core Gesture Handler

### 1.1 Gesture Handler Base

**File**: `packages/motion-gestures/src/gesture-handler.ts`

**API Design**:
```typescript
import { MotionValue } from '@cascade/motion-runtime';

export interface GestureState {
  isActive: boolean;
  delta: { x: number; y: number };
  velocity: { x: number; y: number };
  startPoint: { x: number; y: number };
  currentPoint: { x: number; y: number };
}

export interface GestureConfig {
  onStart?: (state: GestureState, event: PointerEvent | WheelEvent) => void;
  onMove?: (state: GestureState, event: Event) => void;
  onEnd?: (state: GestureState) => void;
  spring?: SpringConfig;
  constraints?: {
    min?: { x?: number; y?: number };
    max?: { x?: number; y?: number };
  };
  axis?: 'x' | 'y' | 'both';
  threshold?: number; // Minimum movement to start gesture
}

export interface GestureHandler {
  start(): void;
  stop(): void;
  isActive(): boolean;
  getState(): GestureState;
}
```

**Implementation Steps**:

1. **Create gesture handler class**
   ```typescript
   export class GestureHandler implements GestureHandler {
     private element: HTMLElement;
     private motionValues: { x?: MotionValue<number>; y?: MotionValue<number> };
     private config: GestureConfig;
     private state: GestureState;
     private velocityTracker: VelocityTracker;
     private rafId: number | null = null;
     
     constructor(
       element: HTMLElement,
       motionValues: { x?: MotionValue<number>; y?: MotionValue<number> },
       config: GestureConfig = {}
     ) {
       this.element = element;
       this.motionValues = motionValues;
       this.config = config;
       this.state = this.createInitialState();
       this.velocityTracker = new VelocityTracker();
     }
   }
   ```

2. **Implement pointer event handlers**
   ```typescript
   private handlePointerDown = (event: PointerEvent) => {
     if (this.state.isActive) return;
     
     this.element.setPointerCapture(event.pointerId);
     this.state.isActive = true;
     this.state.startPoint = { x: event.clientX, y: event.clientY };
     this.state.currentPoint = { ...this.state.startPoint };
     
     this.config.onStart?.(this.state, event);
     this.attachMoveListeners();
   };
   
   private handlePointerMove = (event: PointerEvent) => {
     if (!this.state.isActive) return;
     
     const deltaX = event.clientX - this.state.startPoint.x;
     const deltaY = event.clientY - this.state.startPoint.y;
     
     // Apply axis constraint
     const delta = {
       x: this.config.axis === 'y' ? 0 : deltaX,
       y: this.config.axis === 'x' ? 0 : deltaY,
     };
     
     // Apply constraints
     const constrained = this.applyConstraints(delta);
     
     this.state.delta = constrained;
     this.state.currentPoint = { x: event.clientX, y: event.clientY };
     
     // Track velocity
     this.velocityTracker.addPoint({
       x: event.clientX,
       y: event.clientY,
       timestamp: event.timeStamp,
     });
     
     // Update motion values
     if (this.motionValues.x) {
       this.motionValues.x.set(constrained.x);
     }
     if (this.motionValues.y) {
       this.motionValues.y.set(constrained.y);
     }
     
     this.config.onMove?.(this.state, event);
   };
   
   private handlePointerUp = (event: PointerEvent) => {
     if (!this.state.isActive) return;
     
     this.element.releasePointerCapture(event.pointerId);
     this.state.isActive = false;
     
     // Get final velocity
     this.state.velocity = this.velocityTracker.getVelocity();
     
     this.config.onEnd?.(this.state);
     this.detachMoveListeners();
     
     // Apply spring animation if configured
     if (this.config.spring) {
       this.applySpringAnimation();
     }
   };
   ```

3. **Implement constraint application**
   ```typescript
   private applyConstraints(delta: { x: number; y: number }): { x: number; y: number } {
     const { constraints } = this.config;
     if (!constraints) return delta;
     
     let x = delta.x;
     let y = delta.y;
     
     if (constraints.min) {
       x = Math.max(x, constraints.min.x ?? -Infinity);
       y = Math.max(y, constraints.min.y ?? -Infinity);
     }
     
     if (constraints.max) {
       x = Math.min(x, constraints.max.x ?? Infinity);
       y = Math.min(y, constraints.max.y ?? Infinity);
     }
     
     return { x, y };
   }
   ```

4. **Implement spring animation on release**
   ```typescript
   private applySpringAnimation() {
     const { spring } = this.config;
     if (!spring) return;
     
     // Determine target based on constraints or return to origin
     const targetX = this.config.constraints?.min?.x ?? 0;
     const targetY = this.config.constraints?.min?.y ?? 0;
     
     // Use velocity from gesture
     const springConfig = {
       ...spring,
       initialVelocity: this.state.velocity.x, // Use x velocity for spring
     };
     
     if (this.motionValues.x) {
       this.motionValues.x.animateTo(targetX, springConfig);
     }
     if (this.motionValues.y) {
       this.motionValues.y.animateTo(targetY, springConfig);
     }
   }
   ```

5. **Implement start/stop methods**
   ```typescript
   start(): void {
     this.element.addEventListener('pointerdown', this.handlePointerDown, {
       passive: false,
     });
   }
   
   stop(): void {
     this.element.removeEventListener('pointerdown', this.handlePointerDown);
     this.detachMoveListeners();
     if (this.rafId !== null) {
       cancelAnimationFrame(this.rafId);
     }
   }
   ```

---

### 1.2 Velocity Tracker

**File**: `packages/motion-gestures/src/velocity-tracker.ts`

**Purpose**: Track velocity over recent points for spring physics

**Implementation**:
```typescript
interface Point {
  x: number;
  y: number;
  timestamp: number;
}

export class VelocityTracker {
  private points: Point[] = [];
  private readonly maxPoints = 10;
  private readonly timeWindow = 100; // ms
  
  addPoint(point: Point): void {
    this.points.push(point);
    
    // Remove old points
    const now = point.timestamp;
    this.points = this.points.filter(
      p => now - p.timestamp < this.timeWindow
    );
    
    // Limit to max points
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }
  }
  
  getVelocity(): { x: number; y: number } {
    if (this.points.length < 2) {
      return { x: 0, y: 0 };
    }
    
    const first = this.points[0];
    const last = this.points[this.points.length - 1];
    
    const dt = (last.timestamp - first.timestamp) / 1000; // Convert to seconds
    if (dt === 0) return { x: 0, y: 0 };
    
    return {
      x: (last.x - first.x) / dt,
      y: (last.y - first.y) / dt,
    };
  }
  
  reset(): void {
    this.points = [];
  }
}
```

---

## Phase 2: React Hooks

### 2.1 useDrag Hook

**File**: `packages/motion-gestures/src/useDrag.ts`

**API Design**:
```typescript
export function useDrag(
  motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
  },
  config?: GestureConfig
): RefObject<HTMLElement>
```

**Implementation**:
```typescript
export function useDrag(
  motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
  },
  config?: GestureConfig
): RefObject<HTMLElement> {
  const elementRef = useRef<HTMLElement>(null);
  const handlerRef = useRef<GestureHandler | null>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    handlerRef.current = new GestureHandler(element, motionValues, config || {});
    handlerRef.current.start();
    
    return () => {
      handlerRef.current?.stop();
    };
  }, [motionValues, config]);
  
  return elementRef;
}
```

---

### 2.2 usePan Hook

**File**: `packages/motion-gestures/src/usePan.ts`

**Purpose**: Similar to drag but for touch/pointer pan gestures

**Implementation**:
```typescript
export function usePan(
  motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
  },
  config?: GestureConfig
): RefObject<HTMLElement> {
  // Similar to useDrag but optimized for pan gestures
  // May use touch events instead of pointer events
  return useDrag(motionValues, {
    ...config,
    threshold: config?.threshold ?? 5, // Lower threshold for pan
  });
}
```

---

### 2.3 useScroll Hook

**File**: `packages/motion-gestures/src/useScroll.ts`

**API Design**:
```typescript
export interface ScrollConfig {
  axis?: 'x' | 'y' | 'both';
  multiplier?: number;
  spring?: SpringConfig;
  container?: HTMLElement | Window;
}

export function useScrollMotion(
  motionValue: MotionValue<number>,
  config?: ScrollConfig
): void
```

**Implementation**:
```typescript
export function useScrollMotion(
  motionValue: MotionValue<number>,
  config?: ScrollConfig
): void {
  const container = config?.container || window;
  const axis = config?.axis || 'y';
  const multiplier = config?.multiplier || 1;
  
  useEffect(() => {
    const handleScroll = () => {
      let scrollValue = 0;
      
      if (container === window) {
        scrollValue = axis === 'x' ? window.scrollX : window.scrollY;
      } else {
        const element = container as HTMLElement;
        scrollValue = axis === 'x' ? element.scrollLeft : element.scrollTop;
      }
      
      motionValue.set(scrollValue * multiplier);
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [motionValue, config]);
}
```

---

### 2.4 useWheel Hook

**File**: `packages/motion-gestures/src/useWheel.ts`

**API Design**:
```typescript
export interface WheelConfig {
  axis?: 'x' | 'y' | 'both';
  multiplier?: number;
  spring?: SpringConfig;
}

export function useWheel(
  motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
  },
  config?: WheelConfig
): RefObject<HTMLElement>
```

**Implementation**:
```typescript
export function useWheel(
  motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
  },
  config?: WheelConfig
): RefObject<HTMLElement> {
  const elementRef = useRef<HTMLElement>(null);
  const multiplier = config?.multiplier || 1;
  const axis = config?.axis || 'y';
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      
      const deltaX = axis !== 'y' ? event.deltaX * multiplier : 0;
      const deltaY = axis !== 'x' ? event.deltaY * multiplier : 0;
      
      if (motionValues.x) {
        motionValues.x.set(motionValues.x.get() + deltaX);
      }
      if (motionValues.y) {
        motionValues.y.set(motionValues.y.get() + deltaY);
      }
    };
    
    element.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [motionValues, config]);
  
  return elementRef;
}
```

---

## Phase 3: Runtime Spring Bridge

### 3.1 Spring Bridge for Gestures

**File**: `packages/motion-gestures/src/spring-bridge.ts`

**Purpose**: Bridge between gesture velocity and spring animations

**Implementation**:
```typescript
import { MotionValue } from '@cascade/motion-runtime';
import { solveSpring, type SpringConfig } from '@cascade/compiler';

export interface GestureSpringConfig extends SpringConfig {
  initialVelocity?: number;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

export function animateSpringWithVelocity(
  motionValue: MotionValue<number>,
  target: number,
  config: GestureSpringConfig
): () => void {
  const currentValue = motionValue.get();
  const initialVelocity = config.initialVelocity || 0;
  
  // For velocity-based springs, we need runtime solver
  // Use existing solveSpring but adjust for initial velocity
  const springConfig: SpringConfig = {
    stiffness: config.stiffness,
    damping: config.damping,
    mass: config.mass || 1,
    from: currentValue,
    to: target,
  };
  
  // Run animation with velocity consideration
  return animateSpringRuntime(motionValue, {
    ...springConfig,
    initialVelocity,
    onUpdate: config.onUpdate,
    onComplete: config.onComplete,
  });
}
```

**Note**: This may require extending the spring solver to handle initial velocity, or using a runtime RK4 implementation.

---

## Phase 4: Package Setup

### 4.1 Package Configuration

**File**: `packages/motion-gestures/package.json`

```json
{
  "name": "@cascade/motion-gestures",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "dependencies": {
    "@cascade/motion-runtime": "workspace:*",
    "@cascade/compiler": "workspace:*"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

### 4.2 Public API Exports

**File**: `packages/motion-gestures/src/index.ts`

```typescript
export { useDrag } from './useDrag';
export { usePan } from './usePan';
export { useScrollMotion } from './useScroll';
export { useWheel } from './useWheel';
export { GestureHandler, type GestureConfig, type GestureState } from './gesture-handler';
export { VelocityTracker } from './velocity-tracker';
export { animateSpringWithVelocity, type GestureSpringConfig } from './spring-bridge';
```

---

## Phase 5: Testing

### 5.1 Unit Tests

**File**: `packages/motion-gestures/src/__tests__/gesture-handler.test.ts`

**Test Cases**:

1. **Pointer down starts gesture**
   ```typescript
   test('pointer down activates gesture', () => {
     const handler = new GestureHandler(element, motionValues);
     handler.start();
     
     const event = new PointerEvent('pointerdown', { clientX: 0, clientY: 0 });
     element.dispatchEvent(event);
     
     expect(handler.isActive()).toBe(true);
   });
   ```

2. **Pointer move updates delta**
   ```typescript
   test('pointer move updates delta', () => {
     // Test delta calculation
   });
   ```

3. **Constraints are applied**
   ```typescript
   test('constraints limit movement', () => {
     // Test min/max constraints
   });
   ```

4. **Velocity is calculated**
   ```typescript
   test('velocity tracker calculates velocity', () => {
     // Test velocity calculation
   });
   ```

---

### 5.2 Integration Tests

**File**: `packages/motion-gestures/src/__tests__/useDrag.test.tsx`

**Test Cases**:

1. **Hook attaches to element**
   ```typescript
   test('useDrag attaches handler to element', () => {
     const { result } = renderHook(() => {
       const x = useMotionValue(0);
       return useDrag({ x });
     });
     // Verify handler is attached
   });
   ```

2. **Drag updates motion value**
   ```typescript
   test('dragging updates motion value', () => {
     // Simulate drag and verify motion value updates
   });
   ```

---

## Phase 6: Documentation and Examples

### 6.1 Usage Examples

**File**: `apps/demo/src/pages/GestureDemo.tsx`

**Example 1: Draggable card**
```typescript
function DraggableCard() {
  const x = useMotionValue(0, { unit: 'px' });
  const y = useMotionValue(0, { unit: 'px' });
  const dragRef = useDrag(
    { x, y },
    {
      spring: { stiffness: 300, damping: 30 },
      constraints: {
        min: { x: -200, y: -200 },
        max: { x: 200, y: 200 },
      },
    }
  );
  
  return (
    <div
      ref={dragRef}
      style={{
        transform: `translate(${x.get()}px, ${y.get()}px)`,
      }}
    >
      Drag me!
    </div>
  );
}
```

**Example 2: Scroll-driven animation**
```typescript
function ScrollAnimation() {
  const scrollY = useMotionValue(0);
  useScrollMotion(scrollY, { axis: 'y', multiplier: 0.5 });
  
  return (
    <div
      style={{
        transform: `translateY(${scrollY.get()}px)`,
      }}
    >
      Scroll me!
    </div>
  );
}
```

**Example 3: Wheel zoom**
```typescript
function ZoomableImage() {
  const scale = useMotionValue(1);
  const wheelRef = useWheel(
    { y: scale },
    {
      axis: 'y',
      multiplier: 0.01,
      spring: { stiffness: 200, damping: 25 },
    }
  );
  
  return (
    <img
      ref={wheelRef}
      src="..."
      style={{
        transform: `scale(${scale.get()})`,
      }}
    />
  );
}
```

---

## Implementation Checklist

### Phase 1: Core Handler
- [ ] Create `gesture-handler.ts` with GestureHandler class
- [ ] Implement pointer event handlers (down, move, up)
- [ ] Implement constraint application
- [ ] Create `velocity-tracker.ts` utility
- [ ] Implement spring animation on release

### Phase 2: React Hooks
- [ ] Create `useDrag.ts` hook
- [ ] Create `usePan.ts` hook
- [ ] Create `useScroll.ts` hook
- [ ] Create `useWheel.ts` hook

### Phase 3: Spring Bridge
- [ ] Create `spring-bridge.ts` for velocity-based springs
- [ ] Integrate with runtime spring animator

### Phase 4: Package Setup
- [ ] Create `package.json`
- [ ] Set up TypeScript config
- [ ] Create `index.ts` with exports
- [ ] Add to workspace

### Phase 5: Testing
- [ ] Unit tests for gesture handler
- [ ] Unit tests for velocity tracker
- [ ] Integration tests for hooks
- [ ] Performance tests

### Phase 6: Documentation
- [ ] Create README
- [ ] Add usage examples
- [ ] Document API
- [ ] Create demo page

---

## Estimated Timeline

- **Phase 1**: 2-3 days
- **Phase 2**: 1-2 days
- **Phase 3**: 1 day
- **Phase 4**: 0.5 days
- **Phase 5**: 1-2 days
- **Phase 6**: 1 day

**Total**: 6.5-9.5 days

---

## Dependencies

- `@cascade/motion-runtime` - For `MotionValue` and `useMotionValue`
- `@cascade/compiler` - For `SpringConfig` type and `solveSpring`
- React - For hooks

---

## Performance Considerations

1. **Passive Listeners**: Use `{ passive: true }` for scroll events
2. **Throttling**: Throttle gesture updates to `requestAnimationFrame`
3. **Velocity Calculation**: Limit points tracked for velocity (max 10, 100ms window)
4. **Constraint Checking**: Use efficient bounds checking

---

## Browser Compatibility

- **Pointer Events**: Modern browsers (Chrome 55+, Firefox 59+, Safari 13+)
- **Touch Events**: Fallback for older browsers (if needed)
- **Passive Listeners**: Supported in modern browsers

---

## Future Enhancements

1. **Pinch/Zoom**: Add pinch gesture support
2. **Multi-touch**: Support multiple simultaneous gestures
3. **Gesture Recognition**: Recognize swipe, tap, long-press patterns
4. **Momentum Scrolling**: Add momentum scrolling simulation



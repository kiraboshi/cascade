---
title: Reactive Motion Values
type: plan
status: completed
completed_at: 2025-01-11
scope: motion-runtime
---

# Implementation Plan: Reactive Motion Values

## Overview

Implement `createMotionValue` API that enables runtime control of animations via CSS custom properties, maintaining Cascade's CSS-first performance while adding Framer Motion-like reactivity.

---

## Phase 1: Core MotionValue API

### 1.1 Create MotionValue Core Module

**File**: `packages/motion-runtime/src/motion-value.ts`

**API Design**:
```typescript
export interface MotionValueConfig {
  initialValue: number | string;
  property?: string; // CSS property name (e.g., 'transform', 'opacity')
  unit?: string;    // Unit suffix (e.g., 'px', 'deg', '%')
  element?: HTMLElement; // Optional: scope CSS var to element
}

export interface MotionValue<T = number | string> {
  get(): T;
  set(value: T): void;
  onChange(callback: (value: T) => void): () => void;
  animateTo(
    target: T,
    config?: SpringConfig | KeyframeConfig
  ): Promise<void>;
  stop(): void;
  readonly id: string;
  readonly cssVarName: string;
}

export function createMotionValue<T extends number | string>(
  config: MotionValueConfig
): MotionValue<T>
```

**Implementation Steps**:

1. **Generate unique ID and CSS variable name**
   ```typescript
   const id = `mv-${Math.random().toString(36).substr(2, 9)}`;
   const cssVarName = `--motion-value-${id}`;
   ```

2. **Store value in memory and CSS variable**
   ```typescript
   let currentValue: T = config.initialValue;
   const updateCSSVar = (value: T) => {
     const formattedValue = typeof value === 'number' && config.unit
       ? `${value}${config.unit}`
       : String(value);
     
     if (config.element) {
       config.element.style.setProperty(cssVarName, formattedValue);
     } else {
       document.documentElement.style.setProperty(cssVarName, formattedValue);
     }
   };
   ```

3. **Implement getter/setter**
   ```typescript
   const get = (): T => currentValue;
   const set = (value: T) => {
     if (currentValue !== value) {
       currentValue = value;
       updateCSSVar(value);
       // Trigger onChange callbacks
       onChangeCallbacks.forEach(cb => cb(value));
     }
   };
   ```

4. **Implement onChange subscription**
   ```typescript
   const onChangeCallbacks = new Set<(value: T) => void>();
   const onChange = (callback: (value: T) => void): (() => void) => {
     onChangeCallbacks.add(callback);
     return () => onChangeCallbacks.delete(callback);
   };
   ```

5. **Implement animateTo with spring physics**
   ```typescript
   const animateTo = async (
     target: T,
     config?: SpringConfig | KeyframeConfig
   ): Promise<void> => {
     return new Promise((resolve) => {
       // Stop any existing animation
       stop();
       
       if (typeof currentValue === 'number' && typeof target === 'number') {
         // Use spring animation
         const springConfig = config as SpringConfig || {
           stiffness: 300,
           damping: 20,
           mass: 1,
           from: currentValue as number,
           to: target as number,
         };
         
         // Run spring animation in requestAnimationFrame
         animateSpringRuntime(this, springConfig, resolve);
       } else {
         // Fallback to simple interpolation
         // ...
       }
     });
   };
   ```

**Dependencies**:
- Import `SpringConfig` from `@cascade/compiler`
- Create runtime spring animator (see Phase 1.2)

---

### 1.2 Runtime Spring Animator

**File**: `packages/motion-runtime/src/spring-animator.ts`

**Purpose**: Run spring physics at runtime using RK4 solver

**API Design**:
```typescript
import { solveSpring, type SpringConfig } from '@cascade/compiler';

export interface RuntimeSpringConfig extends SpringConfig {
  duration?: number;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

export function animateSpringRuntime(
  motionValue: MotionValue<number>,
  config: RuntimeSpringConfig,
  onComplete?: () => void
): () => void // Returns cancel function
```

**Implementation Steps**:

1. **Pre-compute spring values if duration is short**
   ```typescript
   const duration = config.duration || 1000;
   const shouldPrecompute = duration < 300;
   
   let keyframeValues: number[] = [];
   if (shouldPrecompute) {
     // Use compile-time solver
     keyframeValues = solveSpring(config, duration, 60);
   }
   ```

2. **Set up animation loop**
   ```typescript
   let startTime: number | null = null;
   let animationFrameId: number | null = null;
   let isCancelled = false;
   
   const animate = (timestamp: number) => {
     if (isCancelled) return;
     
     if (startTime === null) {
       startTime = timestamp;
     }
     
     const elapsed = timestamp - startTime;
     const progress = Math.min(elapsed / duration, 1);
     
     if (shouldPrecompute) {
       // Use pre-computed values
       const index = Math.floor(progress * (keyframeValues.length - 1));
       const value = keyframeValues[index];
       motionValue.set(value);
       config.onUpdate?.(value);
     } else {
       // Run RK4 solver per-frame (for longer animations or velocity)
       // This requires a runtime RK4 implementation
       const value = solveSpringRuntime(config, progress);
       motionValue.set(value);
       config.onUpdate?.(value);
     }
     
     if (progress < 1) {
       animationFrameId = requestAnimationFrame(animate);
     } else {
       config.onComplete?.();
       onComplete?.();
     }
   };
   
   animationFrameId = requestAnimationFrame(animate);
   ```

3. **Return cancel function**
   ```typescript
   return () => {
     isCancelled = true;
     if (animationFrameId !== null) {
       cancelAnimationFrame(animationFrameId);
     }
   };
   ```

**Note**: For runtime RK4 solver, we may need to port `solveSpring` to runtime or create a lighter version.

---

### 1.3 React Hook Integration

**File**: `packages/motion-runtime/src/useMotionValue.ts`

**API Design**:
```typescript
export function useMotionValue<T extends number | string>(
  initialValue: T,
  config?: Omit<MotionValueConfig, 'initialValue'>
): MotionValue<T>
```

**Implementation Steps**:

1. **Create ref to store MotionValue instance**
   ```typescript
   const valueRef = useRef<MotionValue<T> | null>(null);
   ```

2. **Initialize on first render**
   ```typescript
   if (!valueRef.current) {
     valueRef.current = createMotionValue({
       initialValue,
       ...config,
     });
   }
   ```

3. **Cleanup on unmount**
   ```typescript
   useEffect(() => {
     return () => {
       valueRef.current?.stop();
     };
   }, []);
   ```

4. **Return stable reference**
   ```typescript
   return valueRef.current;
   ```

---

### 1.4 Compiler Integration: CSS Variable Keyframes

**File**: `packages/compiler/src/motion-compiler.ts` (extend)

**New Function**:
```typescript
export interface MotionValueKeyframeConfig {
  values: Record<string, {
    from: string; // CSS variable name or value
    to: string;   // CSS variable name or value
  }>;
  duration?: number | string;
  easing?: string;
}

export function defineMotionWithValues(
  config: MotionValueKeyframeConfig
): MotionOutput
```

**Implementation Steps**:

1. **Generate keyframes that reference CSS variables**
   ```typescript
   const name = `motion-values-${Math.random().toString(36).substr(2, 9)}`;
   const duration = typeof config.duration === 'number'
     ? `${config.duration}ms`
     : config.duration || '300ms';
   const easing = config.easing || 'ease';
   
   const keyframeRules = `
     0% {
       ${Object.entries(config.values).map(([prop, { from }]) => {
         return `${prop}: ${from.startsWith('--') ? `var(${from})` : from};`;
       }).join('\n       ')}
     }
     100% {
       ${Object.entries(config.values).map(([prop, { to }]) => {
         return `${prop}: ${to.startsWith('--') ? `var(${to})` : to};`;
       }).join('\n       ')}
     }
   `;
   ```

2. **Generate CSS**
   ```typescript
   const css = `
   @keyframes ${name} {
     ${keyframeRules}
   }
   
   .${name} {
     animation: ${name} ${duration} ${easing};
   }
   `.trim();
   ```

3. **Return output**
   ```typescript
   return {
     css,
     className: name,
   };
   ```

---

## Phase 2: Batching and Performance

**Status**: Batching is complete. Property-specific optimizations need implementation.

### 2.1 Batch Updates ✅ COMPLETE

**File**: `packages/motion-runtime/src/motion-value.ts`

**Status**: Already implemented with global batching queue and requestAnimationFrame scheduling.

---

### 2.2 GPU Acceleration Detection and Warnings

**File**: `packages/motion-runtime/src/motion-value.ts` (extend)

**Goal**: Detect when properties are GPU-accelerated and provide developer feedback for non-accelerated properties.

**Implementation Steps**:

1. **Import acceleration utilities**
   ```typescript
   import { isAccelerated, isLayoutTriggering, ACCELERATED_PROPERTIES } from '@cascade/core';
   ```

2. **Extend MotionValueConfig interface**
   ```typescript
   export interface MotionValueConfig {
     initialValue: number | string;
     property?: string;
     unit?: string;
     element?: HTMLElement;
     // New: Performance hints
     warnOnLayoutTrigger?: boolean; // Default: true in dev mode
   }
   ```

3. **Detect property characteristics in createMotionValue**
   ```typescript
   const propertyName = config.property || '';
   const isGPUAccelerated = propertyName ? isAccelerated(propertyName) : false;
   const triggersLayout = propertyName ? isLayoutTriggering(propertyName) : false;
   
   // Development warning for layout-triggering properties
   if (process.env.NODE_ENV === 'development' && triggersLayout && config.warnOnLayoutTrigger !== false) {
     console.warn(
       `[MotionValue] Property "${propertyName}" triggers layout. Consider using transform/opacity for better performance.`
     );
   }
   ```

4. **Extend MotionValue interface with metadata**
   ```typescript
   export interface MotionValue<T = number | string> {
     // ... existing methods
     readonly isGPUAccelerated: boolean;
     readonly triggersLayout: boolean;
   }
   ```

5. **Expose metadata in returned instance**
   ```typescript
   const motionValueInstance = {
     // ... existing properties
     isGPUAccelerated,
     triggersLayout,
   } as MotionValue<T> & { flushCSSUpdate: () => void };
   ```

**Benefits**:
- Developer awareness of performance implications
- Helps identify optimization opportunities
- Can be used for future automatic optimizations

---

### 2.3 Transform Helpers for Position Properties

**File**: `packages/motion-runtime/src/motion-value.ts` (extend)

**Goal**: Automatically use `transform` instead of `left`/`top` for x/y position properties to leverage GPU acceleration.

**Implementation Steps**:

1. **Extend MotionValueConfig with transform mode**
   ```typescript
   export interface MotionValueConfig {
     // ... existing fields
     transformMode?: 'auto' | 'transform' | 'position'; // Default: 'auto'
   }
   ```

2. **Create property mapping for position properties**
   ```typescript
   // Property mapping for position properties
   const POSITION_TO_TRANSFORM: Record<string, { transform: string; defaultUnit: string }> = {
     'x': { transform: 'translateX', defaultUnit: 'px' },
     'y': { transform: 'translateY', defaultUnit: 'px' },
     'z': { transform: 'translateZ', defaultUnit: 'px' },
     'rotate': { transform: 'rotate', defaultUnit: 'deg' },
     'rotateX': { transform: 'rotateX', defaultUnit: 'deg' },
     'rotateY': { transform: 'rotateY', defaultUnit: 'deg' },
     'rotateZ': { transform: 'rotateZ', defaultUnit: 'deg' },
     'scale': { transform: 'scale', defaultUnit: '' },
     'scaleX': { transform: 'scaleX', defaultUnit: '' },
     'scaleY': { transform: 'scaleY', defaultUnit: '' },
   };
   ```

3. **Detect transform properties and mode**
   ```typescript
   // In createMotionValue:
   const transformConfig = config.property && POSITION_TO_TRANSFORM[config.property];
   const useTransform = transformConfig && (
     config.transformMode === 'auto' || 
     config.transformMode === 'transform'
   );
   ```

4. **Update CSS variable format for transform properties**
   ```typescript
   const updateCSSVar = (value: T): void => {
     let formattedValue: string;
     
     if (useTransform && typeof value === 'number') {
       // Format as transform function: translateX(100px)
       const unit = config.unit || transformConfig!.defaultUnit;
       formattedValue = `${transformConfig!.transform}(${value}${unit})`;
     } else if (typeof value === 'number' && config.unit) {
       formattedValue = `${value}${config.unit}`;
     } else {
       formattedValue = String(value);
     }
     
     // Store in CSS variable
     if (config.element) {
       config.element.style.setProperty(cssVarName, formattedValue);
     } else {
       document.documentElement.style.setProperty(cssVarName, formattedValue);
     }
   };
   ```

5. **Add helper method to get transform-ready value**
   ```typescript
   export interface MotionValue<T = number | string> {
     // ... existing methods
     getTransformValue(): string; // Returns formatted transform string if applicable
   }
   
   // Implementation:
   const getTransformValue = (): string => {
     if (useTransform && typeof currentValue === 'number') {
       const unit = config.unit || transformConfig!.defaultUnit;
       return `${transformConfig!.transform}(${currentValue}${unit})`;
     }
     return String(currentValue);
   };
   
   // Add to motionValueInstance:
   getTransformValue,
   ```

**Usage Example**:
```typescript
// Automatic transform mode (default)
const x = useMotionValue(0, { property: 'x', unit: 'px' });
// CSS var: --motion-value-xxx = "translateX(100px)"

// Explicit transform mode
const y = useMotionValue(0, { property: 'y', transformMode: 'transform' });

// Force position mode (not recommended)
const left = useMotionValue(0, { property: 'left', transformMode: 'position' });
```

---

### 2.4 Multi-Transform Support

**File**: `packages/motion-runtime/src/motion-value.ts` (extend)

**Goal**: Support combining multiple transform values (x, y, z, rotate, scale) into a single transform CSS variable for better performance.

**Implementation Steps**:

1. **Create transform value registry system**
   ```typescript
   // Track transform values per element
   const transformRegistries = new WeakMap<HTMLElement, Map<string, MotionValue<number>>>();
   const globalTransformRegistry = new Map<string, MotionValue<number>>();
   
   // Helper to get element ID for CSS variable naming
   function getElementId(element: HTMLElement): string {
     if (!element.dataset.motionElementId) {
       element.dataset.motionElementId = `el-${Math.random().toString(36).substr(2, 9)}`;
     }
     return element.dataset.motionElementId;
   }
   ```

2. **Register transform values when created**
   ```typescript
   // In createMotionValue, after creating instance:
   if (useTransform && config.element) {
     let registry = transformRegistries.get(config.element);
     if (!registry) {
       registry = new Map();
       transformRegistries.set(config.element, registry);
     }
     registry.set(config.property!, motionValueInstance);
   } else if (useTransform) {
     globalTransformRegistry.set(config.property!, motionValueInstance);
   }
   ```

3. **Create combined transform updater**
   ```typescript
   function updateCombinedTransform(element: HTMLElement | null): void {
     const registry = element 
       ? transformRegistries.get(element) || new Map()
       : globalTransformRegistry;
     
     if (!registry || registry.size === 0) return;
     
     const transforms: string[] = [];
     
     // Order: translate, rotate, scale (CSS transform order matters)
     const x = registry.get('x');
     const y = registry.get('y');
     const z = registry.get('z');
     if (x || y || z) {
       const tx = x?.get() || 0;
       const ty = y?.get() || 0;
       const tz = z?.get() || 0;
       transforms.push(`translate3d(${tx}px, ${ty}px, ${tz}px)`);
     }
     
     const rotate = registry.get('rotate');
     const rotateX = registry.get('rotateX');
     const rotateY = registry.get('rotateY');
     const rotateZ = registry.get('rotateZ');
     if (rotate) transforms.push(`rotate(${rotate.get()}deg)`);
     if (rotateX) transforms.push(`rotateX(${rotateX.get()}deg)`);
     if (rotateY) transforms.push(`rotateY(${rotateY.get()}deg)`);
     if (rotateZ) transforms.push(`rotateZ(${rotateZ.get()}deg)`);
     
     const scale = registry.get('scale');
     const scaleX = registry.get('scaleX');
     const scaleY = registry.get('scaleY');
     if (scale) {
       transforms.push(`scale(${scale.get()})`);
     } else {
       if (scaleX) transforms.push(`scaleX(${scaleX.get()})`);
       if (scaleY) transforms.push(`scaleY(${scaleY.get()})`);
     }
     
     const combinedTransform = transforms.join(' ') || 'none';
     const cssVarName = element 
       ? `--motion-transform-${getElementId(element)}`
       : '--motion-transform-global';
     
     if (element) {
       element.style.setProperty(cssVarName, combinedTransform);
     } else {
       document.documentElement.style.setProperty(cssVarName, combinedTransform);
     }
   }
   ```

4. **Hook into value updates to rebuild combined transform**
   ```typescript
   // In flushCSSUpdate, after updating individual value:
   if (useTransform) {
     updateCombinedTransform(config.element || null);
   }
   ```

5. **Cleanup on motion value destruction**
   ```typescript
   // Add cleanup method to MotionValue
   export interface MotionValue<T = number | string> {
     // ... existing methods
     destroy(): void; // Clean up registries
   }
   
   // Implementation:
   const destroy = (): void => {
     stop(); // Stop any animations
     onChangeCallbacks.clear();
     
     // Remove from registry
     if (useTransform && config.element) {
       const registry = transformRegistries.get(config.element);
       registry?.delete(config.property!);
       if (registry && registry.size === 0) {
         transformRegistries.delete(config.element);
       }
     } else if (useTransform) {
       globalTransformRegistry.delete(config.property!);
     }
   };
   ```

**Benefits**:
- Single transform property instead of multiple CSS variables
- Better browser optimization (single transform is more efficient)
- Easier to use in CSS: `transform: var(--motion-transform-xxx)`
- Proper transform order (translate → rotate → scale)

---

### 2.5 Performance Optimizations

**File**: `packages/motion-runtime/src/motion-value.ts` (extend)

**Goal**: Additional performance improvements for high-frequency updates.

**Implementation Steps**:

1. **Debounce rapid non-animated updates**
   ```typescript
   // For non-animating values, debounce rapid sets
   let lastUpdateTime = 0;
   const DEBOUNCE_THRESHOLD = 16; // ~60fps
   
   const set = (value: T): void => {
     if (currentValue !== value) {
       currentValue = value;
       
       // If not animating and updates are too frequent, throttle
       if (!cancelAnimation && typeof window !== 'undefined') {
         const now = performance.now();
         if (now - lastUpdateTime < DEBOUNCE_THRESHOLD) {
           // Update already scheduled, skip duplicate
           if (motionValueInstanceRef) {
             updateQueue.add(motionValueInstanceRef);
           }
           return;
         }
         lastUpdateTime = now;
       }
       
       // ... rest of existing set logic
     }
   };
   ```

2. **Separate batching queue for transform updates**
   ```typescript
   // Separate batching for transform properties to avoid double work
   const transformUpdateQueue = new Set<HTMLElement | null>();
   let transformRafScheduled = false;
   
   function flushTransformUpdates(): void {
     transformUpdateQueue.forEach(element => {
       updateCombinedTransform(element);
     });
     transformUpdateQueue.clear();
     transformRafScheduled = false;
   }
   
   // In flushCSSUpdate, if transform:
   if (useTransform) {
     transformUpdateQueue.add(config.element || null);
     if (!transformRafScheduled && typeof window !== 'undefined') {
       transformRafScheduled = true;
       requestAnimationFrame(flushTransformUpdates);
     }
   }
   ```

3. **Use will-change hint for animated properties**
   ```typescript
   // Automatically set will-change for GPU-accelerated properties during animation
   let willChangeSet = false;
   
   // In animateTo, before starting animation:
   if (config.element && isGPUAccelerated && !willChangeSet) {
     config.element.style.willChange = 'transform, opacity';
     willChangeSet = true;
   }
   
   // Clean up after animation completes
   const cleanupWillChange = () => {
     if (config.element && willChangeSet && !cancelAnimation) {
       // Delay cleanup to allow for potential rapid re-animations
       setTimeout(() => {
         if (config.element && !cancelAnimation) {
           config.element.style.willChange = '';
           willChangeSet = false;
         }
       }, 1000);
     }
   };
   
   // Call cleanupWillChange in animateTo completion handlers
   ```

**Benefits**:
- Reduced layout thrashing from rapid updates
- Better browser optimization hints
- Smoother animations with will-change

---

### 2.6 Helper Functions for Common Transform Properties

**File**: `packages/motion-runtime/src/motion-value-helpers.ts` (NEW)

**Goal**: Provide convenience functions for common transform properties.

**Implementation**:

```typescript
import { createMotionValue, type MotionValueConfig } from './motion-value';
import type { MotionValue } from './motion-value';

export function createTranslateX(
  initialValue: number = 0,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return createMotionValue({
    initialValue,
    property: 'x',
    unit: 'px',
    transformMode: 'transform',
    ...config,
  });
}

export function createTranslateY(
  initialValue: number = 0,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return createMotionValue({
    initialValue,
    property: 'y',
    unit: 'px',
    transformMode: 'transform',
    ...config,
  });
}

export function createRotate(
  initialValue: number = 0,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return createMotionValue({
    initialValue,
    property: 'rotate',
    unit: 'deg',
    transformMode: 'transform',
    ...config,
  });
}

export function createScale(
  initialValue: number = 1,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return createMotionValue({
    initialValue,
    property: 'scale',
    unit: '',
    transformMode: 'transform',
    ...config,
  });
}
```

**React Hook Versions**:

**File**: `packages/motion-runtime/src/useMotionValueHelpers.ts` (NEW)

```typescript
import { useMotionValue, type MotionValueConfig } from './useMotionValue';
import type { MotionValue } from './motion-value';

export function useTranslateX(
  initialValue: number = 0,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return useMotionValue(initialValue, { 
    property: 'x', 
    unit: 'px', 
    transformMode: 'transform', 
    ...config 
  });
}

export function useTranslateY(
  initialValue: number = 0,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return useMotionValue(initialValue, { 
    property: 'y', 
    unit: 'px', 
    transformMode: 'transform', 
    ...config 
  });
}

export function useRotate(
  initialValue: number = 0,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return useMotionValue(initialValue, { 
    property: 'rotate', 
    unit: 'deg', 
    transformMode: 'transform', 
    ...config 
  });
}

export function useScale(
  initialValue: number = 1,
  config?: Omit<MotionValueConfig, 'initialValue' | 'property' | 'unit'>
): MotionValue<number> {
  return useMotionValue(initialValue, { 
    property: 'scale', 
    unit: '', 
    transformMode: 'transform', 
    ...config 
  });
}
```

**Export from index.ts**:
```typescript
// In packages/motion-runtime/src/index.ts
export { 
  createTranslateX, 
  createTranslateY, 
  createRotate, 
  createScale 
} from './motion-value-helpers';

export { 
  useTranslateX, 
  useTranslateY, 
  useRotate, 
  useScale 
} from './useMotionValueHelpers';
```

---

## Phase 2 Implementation Checklist

### 2.1 GPU Acceleration Detection
- [ ] Import `isAccelerated` and `isLayoutTriggering` from `@cascade/core`
- [ ] Add `warnOnLayoutTrigger` option to `MotionValueConfig`
- [ ] Detect GPU acceleration in `createMotionValue`
- [ ] Add development warnings for layout-triggering properties
- [ ] Expose `isGPUAccelerated` and `triggersLayout` on MotionValue interface

### 2.2 Transform Helpers for Position Properties
- [ ] Add `transformMode` option to `MotionValueConfig`
- [ ] Create `POSITION_TO_TRANSFORM` mapping
- [ ] Detect position properties (x, y, z, rotate, scale variants)
- [ ] Format CSS variables as transform functions
- [ ] Add `getTransformValue()` method to MotionValue
- [ ] Update documentation with transform mode examples

### 2.3 Multi-Transform Support
- [ ] Create transform registry system (WeakMap for elements)
- [ ] Implement `getElementId` helper
- [ ] Register transform values when created
- [ ] Implement `updateCombinedTransform` function
- [ ] Hook into value updates to rebuild combined transform
- [ ] Generate combined transform CSS variable
- [ ] Add `destroy()` method for cleanup
- [ ] Handle cleanup when motion values are destroyed

### 2.4 Performance Optimizations
- [ ] Implement debouncing for rapid non-animated updates
- [ ] Create separate batching queue for transform updates
- [ ] Add `will-change` hint for GPU-accelerated properties
- [ ] Clean up `will-change` after animations complete
- [ ] Add performance tests

### 2.5 Helper Functions
- [ ] Create `motion-value-helpers.ts` file
- [ ] Implement `createTranslateX`, `createTranslateY`, `createRotate`, `createScale`
- [ ] Create `useMotionValueHelpers.ts` file
- [ ] Implement React hook versions: `useTranslateX`, `useTranslateY`, `useRotate`, `useScale`
- [ ] Export helpers from `index.ts`
- [ ] Add usage examples to demo

---

## Phase 2 Testing Requirements

### Unit Tests
- [ ] Test GPU acceleration detection
- [ ] Test layout-triggering warnings (dev mode only)
- [ ] Test transform mode for x/y properties
- [ ] Test combined transform generation
- [ ] Test helper functions
- [ ] Test debouncing behavior
- [ ] Test will-change cleanup
- [ ] Test transform registry cleanup

### Integration Tests
- [ ] Test multiple transform values on same element
- [ ] Test transform values on different elements
- [ ] Test CSS variable output format
- [ ] Test performance with rapid updates
- [ ] Test combined transform CSS variable usage

---

## Phase 2 Estimated Timeline

- **2.1 GPU Acceleration Detection**: 2-3 hours
- **2.2 Transform Helpers**: 3-4 hours
- **2.3 Multi-Transform Support**: 4-6 hours
- **2.4 Performance Optimizations**: 2-3 hours
- **2.5 Helper Functions**: 1-2 hours
- **Testing**: 3-4 hours

**Total**: 15-22 hours (2-3 days)

---

## Phase 3: Testing

### 3.1 Unit Tests

**File**: `packages/motion-runtime/src/__tests__/motion-value.test.ts`

**Test Cases**:

1. **Basic get/set**
   ```typescript
   test('get returns initial value', () => {
     const mv = createMotionValue({ initialValue: 0 });
     expect(mv.get()).toBe(0);
   });
   
   test('set updates value', () => {
     const mv = createMotionValue({ initialValue: 0 });
     mv.set(100);
     expect(mv.get()).toBe(100);
   });
   ```

2. **CSS variable creation**
   ```typescript
   test('creates CSS variable', () => {
     const mv = createMotionValue({ initialValue: 0 });
     const varValue = getComputedStyle(document.documentElement)
       .getPropertyValue(mv.cssVarName);
     expect(varValue.trim()).toBe('0');
   });
   ```

3. **onChange callbacks**
   ```typescript
   test('onChange fires on set', () => {
     const mv = createMotionValue({ initialValue: 0 });
     const callback = jest.fn();
     mv.onChange(callback);
     mv.set(100);
     expect(callback).toHaveBeenCalledWith(100);
   });
   ```

4. **animateTo with spring**
   ```typescript
   test('animateTo animates to target', async () => {
     const mv = createMotionValue({ initialValue: 0 });
     const promise = mv.animateTo(100, {
       stiffness: 300,
       damping: 20,
       from: 0,
       to: 100,
     });
     await promise;
     expect(mv.get()).toBeCloseTo(100, 1);
   });
   ```

---

### 3.2 Integration Tests

**File**: `packages/motion-runtime/src/__tests__/motion-value.integration.test.tsx`

**Test Cases**:

1. **React hook integration**
   ```typescript
   test('useMotionValue creates stable reference', () => {
     const { result } = renderHook(() => useMotionValue(0));
     const mv1 = result.current;
     rerender();
     const mv2 = result.current;
     expect(mv1).toBe(mv2);
   });
   ```

2. **CSS variable updates in DOM**
   ```typescript
   test('updates CSS variable in DOM', () => {
     const { result } = renderHook(() => useMotionValue(0));
     act(() => {
       result.current.set(100);
     });
     // Check DOM for CSS variable update
   });
   ```

---

## Phase 4: Documentation and Examples

### 4.1 API Documentation

**File**: `packages/motion-runtime/README.md` (update)

Add section:
```markdown
## Reactive Motion Values

### createMotionValue

Creates a reactive motion value that writes to CSS custom properties.

### useMotionValue

React hook for creating motion values in components.
```

### 4.2 Usage Examples

**File**: `apps/demo/src/pages/MotionValueDemo.tsx`

**Example 1: Basic usage**
```typescript
function BasicMotionValue() {
  const x = useMotionValue(0, { property: 'transform', unit: 'px' });
  
  useEffect(() => {
    x.animateTo(400, { stiffness: 300, damping: 20 });
  }, []);
  
  return (
    <div style={{ transform: `translateX(${x.get()}px)` }}>
      Animated
    </div>
  );
}
```

**Example 2: Multiple values**
```typescript
function MultiValueAnimation() {
  const x = useMotionValue(0, { unit: 'px' });
  const opacity = useMotionValue(1);
  
  useEffect(() => {
    Promise.all([
      x.animateTo(400),
      opacity.animateTo(0.5),
    ]);
  }, []);
  
  return (
    <div
      style={{
        transform: `translateX(${x.get()}px)`,
        opacity: opacity.get(),
      }}
    >
      Multi-value animation
    </div>
  );
}
```

**Example 3: onChange subscription**
```typescript
function ValueTracking() {
  const x = useMotionValue(0);
  const [log, setLog] = useState<number[]>([]);
  
  useEffect(() => {
    const unsubscribe = x.onChange((value) => {
      setLog(prev => [...prev, value]);
    });
    return unsubscribe;
  }, []);
  
  return (
    <div>
      <div>Value: {x.get()}</div>
      <div>Log: {log.join(', ')}</div>
    </div>
  );
}
```

---

## Implementation Checklist

### Phase 1: Core API
- [ ] Create `motion-value.ts` with `createMotionValue` function
- [ ] Implement get/set/onChange methods
- [ ] Generate unique CSS variable names
- [ ] Write CSS variables to DOM
- [ ] Create `spring-animator.ts` for runtime spring physics
- [ ] Implement `animateTo` with spring solver
- [ ] Create `useMotionValue` React hook
- [ ] Add compiler function `defineMotionWithValues`

### Phase 2: Performance
- [ ] Implement batching for CSS variable updates
- [ ] Add property-specific optimizations
- [ ] Detect GPU-accelerated properties
- [ ] Use transform for position properties

### Phase 3: Testing
- [ ] Unit tests for MotionValue core API
- [ ] Unit tests for spring animator
- [ ] Unit tests for React hook
- [ ] Integration tests for DOM updates
- [ ] Performance tests for batching

### Phase 4: Documentation
- [ ] Update README with API docs
- [ ] Create demo examples
- [ ] Add JSDoc comments
- [ ] Write migration guide

---

## Estimated Timeline

- **Phase 1**: 2-3 days
- **Phase 2**: 1 day
- **Phase 3**: 1-2 days
- **Phase 4**: 1 day

**Total**: 5-7 days

---

## Dependencies

- `@cascade/compiler` - For `SpringConfig` type and `solveSpring` function
- `@cascade/core` - For `isAccelerated` utility
- React - For `useMotionValue` hook

---

## Breaking Changes

None - this is a new feature, fully additive.

---

## Future Enhancements

1. **Velocity tracking**: Track velocity for spring animations
2. **Interruptible animations**: Allow interrupting animations mid-flight
3. **Animation composition**: Combine multiple motion values
4. **Transform helpers**: Helper functions for transform properties (translateX, rotate, etc.)



---
title: Hover & Tap Gestures
type: plan
status: completed
created_at: 2025-01-11
scope: motion-gestures
priority: high
timeline: short-term
---

# Implementation Plan: Hover & Tap Gestures

## Overview

Add hover and tap gesture handlers to complement the existing drag/pan gestures, providing a complete set of interaction handlers similar to Framer Motion's `whileHover`, `onTap`, and related props.

---

## Goals

1. **`useHover()` hook** - Detect hover state
2. **`useTap()` hook** - Detect tap/click gestures
3. **`useFocus()` hook** - Detect focus state
4. **Integration with motion values** - Animate on hover/tap/focus
5. **Performance** - Efficient event handling

---

## Phase 1: Hover Gestures

### 1.1 Hover Detection Hook

**File**: `packages/motion-gestures/src/useHover.ts`

**API Design**:
```typescript
export interface HoverConfig {
  /**
   * Callback when hover starts
   */
  onHoverStart?: (event: MouseEvent) => void;
  
  /**
   * Callback when hover ends
   */
  onHoverEnd?: (event: MouseEvent) => void;
  
  /**
   * Callback when hover state changes
   */
  onHoverChange?: (isHovering: boolean) => void;
  
  /**
   * Disable hover detection
   */
  disabled?: boolean;
}

export interface HoverState {
  isHovering: boolean;
}

/**
 * Hook to detect hover state on an element
 */
export function useHover(
  config?: HoverConfig
): [RefObject<HTMLElement>, boolean];

/**
 * Hook that returns detailed hover state
 */
export function useHoverState(
  config?: HoverConfig
): [RefObject<HTMLElement>, HoverState];
```

**Implementation Steps**:

1. **Create hover detection hook**
   ```typescript
   export function useHover(
     config: HoverConfig = {}
   ): [RefObject<HTMLElement>, boolean] {
     const elementRef = useRef<HTMLElement>(null);
     const [isHovering, setIsHovering] = useState(false);
     const configRef = useRef(config);
     
     configRef.current = config;
     
     useEffect(() => {
       const element = elementRef.current;
       if (!element || config.disabled) return;
       
       const handleMouseEnter = (event: MouseEvent) => {
         setIsHovering(true);
         configRef.current.onHoverStart?.(event);
         configRef.current.onHoverChange?.(true);
       };
       
       const handleMouseLeave = (event: MouseEvent) => {
         setIsHovering(false);
         configRef.current.onHoverEnd?.(event);
         configRef.current.onHoverChange?.(false);
       };
       
       element.addEventListener('mouseenter', handleMouseEnter);
       element.addEventListener('mouseleave', handleMouseLeave);
       
       return () => {
         element.removeEventListener('mouseenter', handleMouseEnter);
         element.removeEventListener('mouseleave', handleMouseLeave);
       };
     }, [config.disabled]);
     
     return [elementRef, isHovering];
   }
   ```

2. **Create detailed state hook**
   ```typescript
   export function useHoverState(
     config: HoverConfig = {}
   ): [RefObject<HTMLElement>, HoverState] {
     const elementRef = useRef<HTMLElement>(null);
     const [state, setState] = useState<HoverState>({
       isHovering: false,
     });
     const configRef = useRef(config);
     
     configRef.current = config;
     
     useEffect(() => {
       const element = elementRef.current;
       if (!element || config.disabled) return;
       
       const handleMouseEnter = (event: MouseEvent) => {
         setState({ isHovering: true });
         configRef.current.onHoverStart?.(event);
         configRef.current.onHoverChange?.(true);
       };
       
       const handleMouseLeave = (event: MouseEvent) => {
         setState({ isHovering: false });
         configRef.current.onHoverEnd?.(event);
         configRef.current.onHoverChange?.(false);
       };
       
       element.addEventListener('mouseenter', handleMouseEnter);
       element.addEventListener('mouseleave', handleMouseLeave);
       
       return () => {
         element.removeEventListener('mouseenter', handleMouseEnter);
         element.removeEventListener('mouseleave', handleMouseLeave);
       };
     }, [config.disabled]);
     
     return [elementRef, state];
   }
   ```

### 1.2 Hover Animation Hook

**File**: `packages/motion-gestures/src/useHoverAnimation.ts`

**API Design**:
```typescript
import type { MotionValue } from '@cascade/motion-runtime';
import type { SpringConfig, MotionValueKeyframeConfig } from '@cascade/motion-runtime';

export interface HoverAnimationConfig {
  /**
   * Animation when hover starts
   */
  onHoverStart?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  
  /**
   * Animation when hover ends
   */
  onHoverEnd?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  
  /**
   * Disable hover detection
   */
  disabled?: boolean;
}

/**
 * Hook to animate motion values on hover
 */
export function useHoverAnimation(
  motionValue: MotionValue<number | string>,
  config: HoverAnimationConfig
): RefObject<HTMLElement>;
```

**Implementation**:
```typescript
export function useHoverAnimation(
  motionValue: MotionValue<number | string>,
  config: HoverAnimationConfig
): RefObject<HTMLElement> {
  const [hoverRef, isHovering] = useHover({
    disabled: config.disabled,
    onHoverChange: (hovering) => {
      if (hovering && config.onHoverStart) {
        motionValue.animateTo(config.onHoverStart.target, config.onHoverStart.config);
      } else if (!hovering && config.onHoverEnd) {
        motionValue.animateTo(config.onHoverEnd.target, config.onHoverEnd.config);
      }
    },
  });
  
  return hoverRef;
}
```

---

## Phase 2: Tap Gestures

### 2.1 Tap Detection Hook

**File**: `packages/motion-gestures/src/useTap.ts`

**API Design**:
```typescript
export interface TapConfig {
  /**
   * Callback when tap starts
   */
  onTapStart?: (event: MouseEvent | TouchEvent) => void;
  
  /**
   * Callback when tap completes
   */
  onTap?: (event: MouseEvent | TouchEvent) => void;
  
  /**
   * Callback when tap is cancelled (e.g., drag starts)
   */
  onTapCancel?: (event: MouseEvent | TouchEvent) => void;
  
  /**
   * Maximum distance (in px) for a tap (prevents tap on drag)
   */
  tapThreshold?: number;
  
  /**
   * Maximum time (in ms) for a tap
   */
  tapTimeout?: number;
  
  /**
   * Disable tap detection
   */
  disabled?: boolean;
}

export interface TapState {
  isTapping: boolean;
  tapCount: number;
}

/**
 * Hook to detect tap gestures on an element
 */
export function useTap(
  config?: TapConfig
): RefObject<HTMLElement>;

/**
 * Hook that returns detailed tap state
 */
export function useTapState(
  config?: TapConfig
): [RefObject<HTMLElement>, TapState];
```

**Implementation Steps**:

1. **Create tap detection hook**
   ```typescript
   export function useTap(
     config: TapConfig = {}
   ): RefObject<HTMLElement> {
     const elementRef = useRef<HTMLElement>(null);
     const configRef = useRef(config);
     const startPointRef = useRef<{ x: number; y: number } | null>(null);
     const startTimeRef = useRef<number | null>(null);
     const hasMovedRef = useRef(false);
     
     configRef.current = config;
     const tapThreshold = config.tapThreshold ?? 10; // pixels
     const tapTimeout = config.tapTimeout ?? 300; // ms
     
     useEffect(() => {
       const element = elementRef.current;
       if (!element || config.disabled) return;
       
       const handleStart = (event: MouseEvent | TouchEvent) => {
         const point = getEventPoint(event);
         startPointRef.current = point;
         startTimeRef.current = Date.now();
         hasMovedRef.current = false;
         
         configRef.current.onTapStart?.(event as any);
       };
       
       const handleMove = (event: MouseEvent | TouchEvent) => {
         if (!startPointRef.current) return;
         
         const point = getEventPoint(event);
         const distance = Math.sqrt(
           Math.pow(point.x - startPointRef.current.x, 2) +
           Math.pow(point.y - startPointRef.current.y, 2)
         );
         
         if (distance > tapThreshold) {
           hasMovedRef.current = true;
         }
       };
       
       const handleEnd = (event: MouseEvent | TouchEvent) => {
         if (!startPointRef.current || !startTimeRef.current) return;
         
         const elapsed = Date.now() - startTimeRef.current;
         const point = getEventPoint(event);
         const distance = Math.sqrt(
           Math.pow(point.x - startPointRef.current.x, 2) +
           Math.pow(point.y - startPointRef.current.y, 2)
         );
         
         if (hasMovedRef.current || distance > tapThreshold || elapsed > tapTimeout) {
           configRef.current.onTapCancel?.(event as any);
         } else {
           configRef.current.onTap?.(event as any);
         }
         
         startPointRef.current = null;
         startTimeRef.current = null;
         hasMovedRef.current = false;
       };
       
       // Mouse events
       element.addEventListener('mousedown', handleStart);
       element.addEventListener('mousemove', handleMove);
       element.addEventListener('mouseup', handleEnd);
       element.addEventListener('mouseleave', handleEnd);
       
       // Touch events
       element.addEventListener('touchstart', handleStart, { passive: true });
       element.addEventListener('touchmove', handleMove, { passive: true });
       element.addEventListener('touchend', handleEnd, { passive: true });
       element.addEventListener('touchcancel', handleEnd, { passive: true });
       
       return () => {
         element.removeEventListener('mousedown', handleStart);
         element.removeEventListener('mousemove', handleMove);
         element.removeEventListener('mouseup', handleEnd);
         element.removeEventListener('mouseleave', handleEnd);
         element.removeEventListener('touchstart', handleStart);
         element.removeEventListener('touchmove', handleMove);
         element.removeEventListener('touchend', handleEnd);
         element.removeEventListener('touchcancel', handleEnd);
       };
     }, [config.disabled, tapThreshold, tapTimeout]);
     
     return elementRef;
   }
   
   function getEventPoint(event: MouseEvent | TouchEvent): { x: number; y: number } {
     if ('touches' in event && event.touches.length > 0) {
       return {
         x: event.touches[0].clientX,
         y: event.touches[0].clientY,
       };
     }
     return {
       x: (event as MouseEvent).clientX,
       y: (event as MouseEvent).clientY,
     };
   }
   ```

2. **Create detailed state hook**
   ```typescript
   export function useTapState(
     config: TapConfig = {}
   ): [RefObject<HTMLElement>, TapState] {
     const elementRef = useRef<HTMLElement>(null);
     const [state, setState] = useState<TapState>({
       isTapping: false,
       tapCount: 0,
     });
     const configRef = useRef(config);
     
     configRef.current = config;
     
     const tapRef = useTap({
       ...config,
       onTapStart: (event) => {
         setState(prev => ({ ...prev, isTapping: true }));
         config.onTapStart?.(event);
       },
       onTap: (event) => {
         setState(prev => ({
           isTapping: false,
           tapCount: prev.tapCount + 1,
         }));
         config.onTap?.(event);
       },
       onTapCancel: (event) => {
         setState(prev => ({ ...prev, isTapping: false }));
         config.onTapCancel?.(event);
       },
     });
     
     // Sync refs
     useEffect(() => {
       elementRef.current = tapRef.current;
     }, [tapRef]);
     
     return [elementRef, state];
   }
   ```

### 2.2 Tap Animation Hook

**File**: `packages/motion-gestures/src/useTapAnimation.ts`

**API Design**:
```typescript
export interface TapAnimationConfig {
  /**
   * Animation when tap starts
   */
  onTapStart?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  
  /**
   * Animation when tap ends
   */
  onTapEnd?: {
    target: number | string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  
  /**
   * Disable tap detection
   */
  disabled?: boolean;
}

/**
 * Hook to animate motion values on tap
 */
export function useTapAnimation(
  motionValue: MotionValue<number | string>,
  config: TapAnimationConfig
): RefObject<HTMLElement>;
```

---

## Phase 3: Focus Gestures

### 3.1 Focus Detection Hook

**File**: `packages/motion-gestures/src/useFocus.ts`

**API Design**:
```typescript
export interface FocusConfig {
  /**
   * Callback when focus starts
   */
  onFocusStart?: (event: FocusEvent) => void;
  
  /**
   * Callback when focus ends
   */
  onFocusEnd?: (event: FocusEvent) => void;
  
  /**
   * Callback when focus state changes
   */
  onFocusChange?: (isFocused: boolean) => void;
  
  /**
   * Disable focus detection
   */
  disabled?: boolean;
}

export interface FocusState {
  isFocused: boolean;
}

/**
 * Hook to detect focus state on an element
 */
export function useFocus(
  config?: FocusConfig
): [RefObject<HTMLElement>, boolean];

/**
 * Hook that returns detailed focus state
 */
export function useFocusState(
  config?: FocusConfig
): [RefObject<HTMLElement>, FocusState];
```

**Implementation**:
```typescript
export function useFocus(
  config: FocusConfig = {}
): [RefObject<HTMLElement>, boolean] {
  const elementRef = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const configRef = useRef(config);
  
  configRef.current = config;
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || config.disabled) return;
    
    const handleFocus = (event: FocusEvent) => {
      setIsFocused(true);
      configRef.current.onFocusStart?.(event);
      configRef.current.onFocusChange?.(true);
    };
    
    const handleBlur = (event: FocusEvent) => {
      setIsFocused(false);
      configRef.current.onFocusEnd?.(event);
      configRef.current.onFocusChange?.(false);
    };
    
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);
    
    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [config.disabled]);
  
  return [elementRef, isFocused];
}
```

---

## Phase 4: Integration & Exports

### 4.1 Update Package Exports

**File**: `packages/motion-gestures/src/index.ts`

Add exports:
```typescript
// Hover Gestures
export { useHover, useHoverState, useHoverAnimation, type HoverConfig, type HoverState } from './useHover';
export { type HoverAnimationConfig } from './useHoverAnimation';

// Tap Gestures
export { useTap, useTapState, useTapAnimation, type TapConfig, type TapState } from './useTap';
export { type TapAnimationConfig } from './useTapAnimation';

// Focus Gestures
export { useFocus, useFocusState, useFocusAnimation, type FocusConfig, type FocusState } from './useFocus';
export { type FocusAnimationConfig } from './useFocusAnimation';
```

---

## Usage Examples

### Hover Animation
```typescript
import { useMotionValue, useHoverAnimation } from '@cascade/motion-gestures';
import { useTranslateY } from '@cascade/motion-runtime';

function HoverableCard() {
  const scale = useMotionValue(1);
  const y = useTranslateY(0);
  
  const hoverRef = useHoverAnimation(scale, {
    onHoverStart: {
      target: 1.05,
      config: { stiffness: 300, damping: 20 },
    },
    onHoverEnd: {
      target: 1,
      config: { stiffness: 300, damping: 20 },
    },
  });
  
  useHoverAnimation(y, {
    onHoverStart: {
      target: -5,
      config: { stiffness: 300, damping: 20 },
    },
    onHoverEnd: {
      target: 0,
      config: { stiffness: 300, damping: 20 },
    },
  });
  
  return (
    <div
      ref={hoverRef}
      style={{
        transform: `scale(${scale.get()}) translateY(${y.get()}px)`,
        transition: 'transform 0.2s ease-out',
      }}
    >
      Hover me!
    </div>
  );
}
```

### Tap Animation
```typescript
import { useMotionValue, useTapAnimation } from '@cascade/motion-gestures';

function TappableButton() {
  const scale = useMotionValue(1);
  
  const tapRef = useTapAnimation(scale, {
    onTapStart: {
      target: 0.95,
      config: { duration: 100 },
    },
    onTapEnd: {
      target: 1,
      config: { stiffness: 400, damping: 25 },
    },
  });
  
  return (
    <button
      ref={tapRef}
      style={{
        transform: `scale(${scale.get()})`,
      }}
    >
      Tap me!
    </button>
  );
}
```

### Focus Animation
```typescript
import { useMotionValue, useFocusAnimation } from '@cascade/motion-gestures';

function FocusableInput() {
  const scale = useMotionValue(1);
  
  const focusRef = useFocusAnimation(scale, {
    onFocusStart: {
      target: 1.02,
      config: { stiffness: 300, damping: 20 },
    },
    onFocusEnd: {
      target: 1,
      config: { stiffness: 300, damping: 20 },
    },
  });
  
  return (
    <input
      ref={focusRef}
      style={{
        transform: `scale(${scale.get()})`,
      }}
    />
  );
}
```

---

## Testing Strategy

### Unit Tests

1. **Hover hooks**
   - Test hover detection
   - Test callbacks
   - Test disabled state

2. **Tap hooks**
   - Test tap detection
   - Test tap threshold
   - Test tap cancellation on drag
   - Test callbacks

3. **Focus hooks**
   - Test focus detection
   - Test callbacks
   - Test disabled state

### Integration Tests

- Test with real DOM events
- Test multiple elements
- Test event propagation

### Performance Tests

- Event listener overhead
- Memory usage with many handlers

---

## Implementation Checklist

### Phase 1: Hover Gestures ✅
- [x] Create `useHover.ts`
- [x] Create `useHoverState.ts` (included in useHover.ts)
- [x] Create `useHoverAnimation.ts`
- [x] Add unit tests

### Phase 2: Tap Gestures ✅
- [x] Create `useTap.ts`
- [x] Create `useTapState.ts` (included in useTap.ts)
- [x] Create `useTapAnimation.ts`
- [x] Add unit tests

### Phase 3: Focus Gestures ✅
- [x] Create `useFocus.ts`
- [x] Create `useFocusState.ts` (included in useFocus.ts)
- [x] Create `useFocusAnimation.ts`
- [x] Add unit tests

### Phase 4: Integration ✅
- [x] Update package exports
- [x] Add to documentation
- [x] Create demo examples
- [x] Integration tests (covered by unit tests)

---

## Timeline Estimate

- **Phase 1**: 2-3 days
- **Phase 2**: 3-4 days (more complex due to tap threshold logic)
- **Phase 3**: 1-2 days
- **Phase 4**: 1 day

**Total**: 7-10 days

---

## Dependencies

- `@cascade/motion-runtime` (MotionValue)
- `@cascade/compiler` (SpringConfig)
- React hooks
- DOM events (mouse, touch, focus)

---

## Browser Support

All features use standard DOM events supported in all modern browsers:
- Mouse events: All browsers
- Touch events: Mobile browsers
- Focus events: All browsers

---

## Future Enhancements

1. **Double-tap detection** - Detect double-tap gestures
2. **Long-press detection** - Detect long-press gestures
3. **Gesture combinations** - Combine hover + tap, etc.
4. **Accessibility** - Keyboard equivalents for hover/tap


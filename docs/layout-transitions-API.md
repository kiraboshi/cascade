# Layout Transitions API Reference

Complete API documentation for layout transitions in Cascade Motion.

## Hooks

### `useLayoutTransition`

React hook for animating layout changes on a single element.

```tsx
function useLayoutTransition(
  elementRef: RefObject<HTMLElement>,
  config?: LayoutTransitionConfig
): void
```

**Parameters:**

- `elementRef`: A React ref object pointing to the element to animate
- `config`: Optional configuration object (see `LayoutTransitionConfig` below)

**Returns:**

Nothing. The hook applies animations directly to the element.

**Example:**

```tsx
const ref = useRef<HTMLDivElement>(null);
useLayoutTransition(ref, {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  origin: 'center',
  onComplete: () => console.log('Done'),
});
```

**Behavior:**

- Measures element bounds on each render using `useLayoutEffect`
- Compares current bounds with previous bounds
- Animates if change exceeds threshold (1px position, 1% scale)
- Does not animate on initial mount

---

### `useSharedLayoutTransition`

React hook for animating shared elements between different components/pages.

```tsx
function useSharedLayoutTransition(
  elementRef: RefObject<HTMLElement>,
  config: SharedLayoutTransitionConfig
): void
```

**Parameters:**

- `elementRef`: A React ref object pointing to the element to animate
- `config`: Configuration object (see `SharedLayoutTransitionConfig` below)
  - `layoutId` (required): Unique identifier for shared elements

**Returns:**

Nothing. The hook applies animations directly to the element.

**Example:**

```tsx
const ref = useRef<HTMLDivElement>(null);
useSharedLayoutTransition(ref, {
  layoutId: 'card-123',
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
});
```

**Behavior:**

- Uses a global registry to track elements with the same `layoutId`
- When an element with the same `layoutId` mounts, animates from the previous element's position
- Works even when the previous element has unmounted (preserves bounds)
- Automatically cleans up old registry entries (older than 1 second)

---

### `useBatchLayoutTransition`

React hook for animating layout changes on multiple elements simultaneously.

```tsx
function useBatchLayoutTransition(
  elementRefs: RefObject<HTMLElement>[],
  config?: LayoutTransitionConfig
): void
```

**Parameters:**

- `elementRefs`: Array of React ref objects pointing to elements to animate
- `config`: Optional configuration object (see `LayoutTransitionConfig` below)

**Returns:**

Nothing. The hook applies animations directly to the elements.

**Example:**

```tsx
const refs = [ref1, ref2, ref3];
useBatchLayoutTransition(refs, {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
});
```

**Behavior:**

- Measures all elements on each render
- Detects which elements moved using `detectLayoutChanges`
- Animates all moved elements simultaneously
- Handles element count changes (additions/removals) gracefully
- Uses triple `requestAnimationFrame` for stable initialization

---

## Configuration Types

### `LayoutTransitionConfig`

Configuration for single element and batch layout transitions.

```tsx
interface LayoutTransitionConfig {
  duration?: number;        // Animation duration in milliseconds (default: 300)
  easing?: string;          // CSS easing function (default: 'cubic-bezier(0.4, 0, 0.2, 1)')
  origin?: TransformOrigin; // Transform origin for scaling (default: 'center')
  onComplete?: () => void;   // Callback when animation completes
  enabled?: boolean;        // Enable/disable transitions (default: true)
}
```

**Properties:**

- `duration`: Animation duration in milliseconds. Default: `300`
- `easing`: CSS easing function. Default: `'cubic-bezier(0.4, 0, 0.2, 1)'`
- `origin`: Transform origin for scaling. Options: `'center'`, `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`. Default: `'center'`
- `onComplete`: Callback function called when animation completes
- `enabled`: Enable or disable layout transitions. When `false`, no animations are applied. Default: `true`

---

### `SharedLayoutTransitionConfig`

Configuration for shared element transitions.

```tsx
interface SharedLayoutTransitionConfig {
  layoutId: string;         // Required: Unique identifier for shared elements
  duration?: number;        // Animation duration in milliseconds (default: 300)
  easing?: string;         // CSS easing function (default: 'cubic-bezier(0.4, 0, 0.2, 1)')
  origin?: TransformOrigin; // Transform origin for scaling (default: 'center')
  onComplete?: () => void;  // Callback when animation completes
}
```

**Properties:**

- `layoutId`: **Required.** Unique identifier that links elements together. Elements with the same `layoutId` will animate between each other.
- `duration`: Animation duration in milliseconds. Default: `300`
- `easing`: CSS easing function. Default: `'cubic-bezier(0.4, 0, 0.2, 1)'`
- `origin`: Transform origin for scaling. Options: `'center'`, `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`. Default: `'center'`
- `onComplete`: Callback function called when animation completes

---

### `TransformOrigin`

Transform origin options for scaling animations.

```tsx
type TransformOrigin = 
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
```

Controls where scaling originates from:
- `'center'`: Scale from the center (default)
- `'top-left'`: Scale from the top-left corner
- `'top-right'`: Scale from the top-right corner
- `'bottom-left'`: Scale from the bottom-left corner
- `'bottom-right'`: Scale from the bottom-right corner

---

## Layout Utilities

### `measureElement`

Measure a single element's bounding box.

```tsx
function measureElement(element: HTMLElement): BoundingBox
```

**Parameters:**

- `element`: The HTML element to measure

**Returns:**

A `BoundingBox` object with `x`, `y`, `width`, and `height` properties.

**Example:**

```tsx
const bounds = measureElement(element);
console.log(bounds); // { x: 100, y: 200, width: 300, height: 150 }
```

---

### `measureElements`

Measure multiple elements' bounding boxes.

```tsx
function measureElements(elements: HTMLElement[]): BoundingBox[]
```

**Parameters:**

- `elements`: Array of HTML elements to measure

**Returns:**

Array of `BoundingBox` objects in the same order as input elements.

---

### `calculateTransformDelta`

Calculate the transform delta between two bounding boxes.

```tsx
function calculateTransformDelta(
  from: BoundingBox,
  to: BoundingBox
): TransformDelta
```

**Parameters:**

- `from`: Initial bounding box
- `to`: Final bounding box

**Returns:**

A `TransformDelta` object with `x`, `y`, `scaleX`, and `scaleY` properties.

**Example:**

```tsx
const from = { x: 0, y: 0, width: 100, height: 100 };
const to = { x: 100, y: 50, width: 200, height: 200 };
const delta = calculateTransformDelta(from, to);
// { x: 100, y: 50, scaleX: 2, scaleY: 2 }
```

---

### `detectLayoutChanges`

Detect layout changes by comparing current bounds with previous bounds.

```tsx
function detectLayoutChanges(
  elements: HTMLElement[],
  previousBounds: Map<HTMLElement, BoundingBox>
): LayoutChange[]
```

**Parameters:**

- `elements`: Array of elements to check
- `previousBounds`: Map of elements to their previous bounding boxes

**Returns:**

Array of `LayoutChange` objects for elements that changed significantly.

**Thresholds:**

- Position: 1 pixel
- Scale: 1% change

---

## FLIP Generator

### `generateFLIPKeyframes`

Generate CSS keyframes for FLIP animation.

```tsx
function generateFLIPKeyframes(
  name: string,
  config: FLIPConfig
): { css: string; className: string }
```

**Parameters:**

- `name`: Unique name for the animation
- `config`: FLIP configuration (see `FLIPConfig` below)

**Returns:**

Object with `css` (CSS string) and `className` (CSS class name).

**Example:**

```tsx
const { css, className } = generateFLIPKeyframes('my-animation', {
  from: { x: 0, y: 0, width: 100, height: 100 },
  to: { x: 100, y: 50, width: 200, height: 200 },
  duration: 300,
  easing: 'ease-out',
});
```

---

### `FLIPConfig`

Configuration for FLIP keyframe generation.

```tsx
interface FLIPConfig {
  from: BoundingBox;        // Initial bounding box
  to: BoundingBox;          // Final bounding box
  duration?: number;        // Animation duration in milliseconds (default: 300)
  easing?: string;         // CSS easing function (default: 'cubic-bezier(0.4, 0, 0.2, 1)')
  origin?: TransformOrigin; // Transform origin for scaling (default: 'center')
}
```

---

### `clearFLIPCache`

Clear the keyframe cache.

```tsx
function clearFLIPCache(): void
```

Useful for testing or memory management.

---

### `getFLIPCacheSize`

Get the current cache size.

```tsx
function getFLIPCacheSize(): number
```

Returns the number of cached keyframes.

---

## Types

### `BoundingBox`

Element bounding box.

```tsx
interface BoundingBox {
  x: number;      // X position relative to document
  y: number;      // Y position relative to document
  width: number;  // Element width
  height: number; // Element height
}
```

---

### `TransformDelta`

Transform delta between two bounding boxes.

```tsx
interface TransformDelta {
  x: number;      // X translation in pixels
  y: number;      // Y translation in pixels
  scaleX: number; // X scale factor
  scaleY: number; // Y scale factor
}
```

---

### `LayoutChange`

Detected layout change.

```tsx
interface LayoutChange {
  element: HTMLElement;  // Element that changed
  from: BoundingBox;     // Previous bounding box
  to: BoundingBox;       // Current bounding box
  delta: TransformDelta; // Transform delta
}
```

---

## Performance Tips

### 1. Use Transform Origin Wisely

Choose the transform origin that matches your use case:
- `'center'`: Best for most cases, especially cards and modals
- `'top-left'`: Good for expanding from a corner
- `'top-right'`: Good for expanding from top-right corner

### 2. Batch Operations

When animating multiple elements, use `useBatchLayoutTransition` instead of multiple `useLayoutTransition` hooks:

```tsx
// ✅ Good: Single batch operation
useBatchLayoutTransition(refs, { duration: 300 });

// ❌ Less efficient: Multiple individual operations
refs.forEach(ref => useLayoutTransition(ref, { duration: 300 }));
```

### 3. Disable When Not Needed

Disable layout transitions when they're not needed:

```tsx
useLayoutTransition(ref, {
  enabled: shouldAnimate, // Only animate when needed
});
```

### 4. Avoid Rapid Changes

Layout transitions work best when changes are intentional and spaced out. Avoid rapid, continuous changes that might cause performance issues.

### 5. Use Appropriate Durations

- **Fast interactions**: 200-300ms
- **Moderate transitions**: 300-500ms
- **Slow, dramatic transitions**: 500-800ms

---

## Browser Compatibility

- **getBoundingClientRect**: Supported in all modern browsers
- **CSS Transforms**: Excellent support (IE9+)
- **requestAnimationFrame**: Supported in all modern browsers
- **CSS Custom Properties**: Supported in all modern browsers

---

## Troubleshooting

### Animation Not Triggering

1. **Check threshold**: Changes must exceed 1px position or 1% scale
2. **Check enabled flag**: Ensure `enabled` is not `false`
3. **Check element ref**: Ensure ref is properly attached to element
4. **Check for conflicts**: Layout transitions disable when CSS animations are active

### Animation Looks Janky

1. **Check transform origin**: Try different origin values
2. **Check duration**: Longer durations can help with complex animations
3. **Check easing**: Try different easing functions
4. **Check for layout thrashing**: Avoid rapid layout changes

### Shared Elements Not Animating

1. **Check layoutId**: Ensure both elements use the same `layoutId`
2. **Check timing**: Elements must mount/unmount within 1 second
3. **Check bounds**: Ensure elements have measurable bounds

---

## See Also

- [Examples](./layout-transitions-EXAMPLES.md) - Complete code examples
- [Getting Started](./layout-transitions-GETTING_STARTED.md) - Quick start guide
- [README](./layout-transitions-README.md) - Overview and features


# Motion Values Demo Examples - Phase 2 Features

## Overview
This document outlines additional examples that should be added to the Motion Values demo tab to fully showcase Phase 2 capabilities.

---

## 1. Transform Helpers Showcase

**Purpose**: Demonstrate the convenience helper functions (`useTranslateX`, `useTranslateY`, `useRotate`, `useScale`)

**Example**: Interactive card that can be moved, rotated, and scaled using helper hooks

```tsx
function TransformHelpersDemo() {
  const x = useTranslateX(0);
  const y = useTranslateY(0);
  const rotate = useRotate(0);
  const scale = useScale(1);
  
  // Show how helpers automatically configure transform mode
  // Display CSS variable names and values
  // Interactive controls for each transform
}
```

**Features Demonstrated**:
- Helper function convenience
- Automatic transform formatting
- CSS variable generation
- `getTransformValue()` method

---

## 2. Multi-Transform Combination

**Purpose**: Show how multiple transform values combine into a single CSS variable

**Example**: 3D card with x, y, rotate, and scale that all animate together

```tsx
function MultiTransformDemo() {
  const elementRef = useRef<HTMLDivElement>(null);
  const x = useTranslateX(0, { element: elementRef.current! });
  const y = useTranslateY(0, { element: elementRef.current! });
  const rotate = useRotate(0, { element: elementRef.current! });
  const scale = useScale(1, { element: elementRef.current! });
  
  // Show combined transform CSS variable
  // Display: transform: var(--motion-transform-xxx)
  // Real-time inspector showing the combined value
}
```

**Features Demonstrated**:
- Multi-transform registry system
- Combined transform CSS variable
- Element-scoped transforms
- Transform order (translate → rotate → scale)

---

## 3. GPU Acceleration Comparison

**Purpose**: Visual demonstration of performance differences between GPU-accelerated and layout-triggering properties

**Example**: Side-by-side comparison of `transform` vs `left/top` animations

```tsx
function GPUAccelerationDemo() {
  // GPU-accelerated version (transform)
  const xGPU = useTranslateX(0);
  
  // Layout-triggering version (left)
  const leftLayout = useMotionValue(0, { 
    property: 'left', 
    unit: 'px',
    transformMode: 'position' 
  });
  
  // Show performance metrics
  // Display isGPUAccelerated and triggersLayout flags
  // Show console warnings in dev mode
}
```

**Features Demonstrated**:
- GPU acceleration detection
- Layout-triggering warnings
- Performance implications
- `isGPUAccelerated` and `triggersLayout` properties

---

## 4. Transform Mode Options

**Purpose**: Demonstrate the different transform modes (auto, transform, position)

**Example**: Three boxes showing different modes for the same property

```tsx
function TransformModeDemo() {
  // Auto mode (default) - uses transform for x/y
  const auto = useMotionValue(0, { property: 'x', unit: 'px' });
  
  // Explicit transform mode
  const transform = useMotionValue(0, { 
    property: 'x', 
    unit: 'px',
    transformMode: 'transform' 
  });
  
  // Position mode (not recommended)
  const position = useMotionValue(0, { 
    property: 'left', 
    unit: 'px',
    transformMode: 'position' 
  });
  
  // Show CSS variable outputs for each
}
```

**Features Demonstrated**:
- Transform mode options
- CSS variable format differences
- When to use each mode

---

## 5. Performance Optimizations Demo

**Purpose**: Show batching, debouncing, and will-change optimizations

**Example**: Rapid update test with performance visualization

```tsx
function PerformanceDemo() {
  const x = useTranslateX(0);
  const [updateCount, setUpdateCount] = useState(0);
  const [fps, setFps] = useState(60);
  
  // Rapid updates test
  const handleRapidUpdates = () => {
    for (let i = 0; i < 1000; i++) {
      x.set(i);
    }
  };
  
  // Show batching in action
  // Display will-change hint during animation
  // Performance metrics
}
```

**Features Demonstrated**:
- Update batching
- Debouncing for rapid updates
- will-change hint
- Performance monitoring

---

## 6. Interactive 3D Card

**Purpose**: Complex real-world example combining all transform features

**Example**: 3D card that can be dragged, rotated, and scaled

```tsx
function Interactive3DCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useTranslateX(0, { element: cardRef.current! });
  const y = useTranslateY(0, { element: cardRef.current! });
  const rotateX = useMotionValue(0, { property: 'rotateX', unit: 'deg', element: cardRef.current! });
  const rotateY = useMotionValue(0, { property: 'rotateY', unit: 'deg', element: cardRef.current! });
  const scale = useScale(1, { element: cardRef.current! });
  
  // Mouse/touch interaction
  // Show combined transform
  // Real-time CSS variable display
}
```

**Features Demonstrated**:
- Complex multi-transform setup
- Element-scoped transforms
- Combined transform CSS variable
- Real-world use case

---

## 7. Spring Physics Playground

**Purpose**: Interactive spring configuration tester

**Example**: Sliders for stiffness, damping, mass with live preview

```tsx
function SpringPlayground() {
  const [stiffness, setStiffness] = useState(300);
  const [damping, setDamping] = useState(20);
  const [mass, setMass] = useState(1);
  
  const x = useTranslateX(0);
  
  const animate = () => {
    x.animateTo(400, { stiffness, damping, mass, from: 0, to: 400 });
  };
  
  // Visual spring preview
  // Real-time parameter adjustment
  // Animation curve visualization
}
```

**Features Demonstrated**:
- Spring configuration
- Runtime spring physics
- Interactive parameter tuning

---

## 8. Transform Chain Animation

**Purpose**: Sequential animations using multiple transforms

**Example**: Card that translates, then rotates, then scales in sequence

```tsx
function TransformChainDemo() {
  const x = useTranslateX(0);
  const rotate = useRotate(0);
  const scale = useScale(1);
  
  const animateSequence = async () => {
    await x.animateTo(200, { stiffness: 300, damping: 20 });
    await rotate.animateTo(180, { stiffness: 200, damping: 25 });
    await scale.animateTo(1.5, { stiffness: 400, damping: 30 });
  };
  
  // Show sequential animation
  // Promise-based chaining
}
```

**Features Demonstrated**:
- Sequential animations
- Promise-based animation API
- Multiple transform coordination

---

## 9. Real-time Value Inspector

**Purpose**: Developer tool showing CSS variables, metadata, and performance info

**Example**: Inspector panel displaying all motion value details

```tsx
function ValueInspectorDemo() {
  const x = useTranslateX(0);
  const y = useTranslateY(0);
  const opacity = useMotionValue(1, { property: 'opacity' });
  
  // Display:
  // - CSS variable names
  // - Current values
  // - isGPUAccelerated flag
  // - triggersLayout flag
  // - Transform value format
  // - Combined transform (if applicable)
}
```

**Features Demonstrated**:
- MotionValue metadata
- CSS variable inspection
- Performance flags
- Developer tools integration

---

## 10. CSS Variable Usage Example

**Purpose**: Show how to use the generated CSS variables in CSS

**Example**: Pure CSS animation using motion value CSS variables

```tsx
function CSSVariableUsageDemo() {
  const x = useTranslateX(0, { element: someElement });
  const y = useTranslateY(0, { element: someElement });
  
  // Show CSS like:
  // .element {
  //   transform: var(--motion-transform-xxx);
  // }
  
  // Demonstrate CSS-first approach
  // Show generated CSS variables
}
```

**Features Demonstrated**:
- CSS variable integration
- CSS-first philosophy
- Combined transform usage in CSS

---

## 11. Helper vs Manual Comparison

**Purpose**: Show the difference between using helpers and manual setup

**Example**: Side-by-side code comparison

```tsx
function HelperComparisonDemo() {
  // Helper approach
  const xHelper = useTranslateX(0);
  
  // Manual approach
  const xManual = useMotionValue(0, { 
    property: 'x', 
    unit: 'px',
    transformMode: 'transform' 
  });
  
  // Show code comparison
  // Explain when to use each
}
```

**Features Demonstrated**:
- Helper function benefits
- Code comparison
- Best practices

---

## 12. Destroy and Cleanup Demo

**Purpose**: Show proper cleanup and memory management

**Example**: Component that creates/destroys motion values

```tsx
function CleanupDemo() {
  const [mounted, setMounted] = useState(true);
  
  return (
    <div>
      <button onClick={() => setMounted(!mounted)}>
        {mounted ? 'Unmount' : 'Mount'}
      </button>
      {mounted && <AnimatedComponent />}
      {/* Show cleanup in action */}
      {/* Display registry cleanup */}
    </div>
  );
}
```

**Features Demonstrated**:
- Destroy method
- Cleanup on unmount
- Registry management
- Memory management

---

## Implementation Priority

### High Priority (Core Phase 2 Features)
1. ✅ **Transform Helpers Showcase** - Essential for demonstrating convenience
2. ✅ **Multi-Transform Combination** - Core Phase 2 feature
3. ✅ **GPU Acceleration Comparison** - Performance awareness
4. ✅ **Transform Mode Options** - Configuration flexibility

### Medium Priority (Advanced Features)
5. **Performance Optimizations Demo** - Show batching/will-change
6. **Interactive 3D Card** - Real-world complex example
7. **Spring Physics Playground** - Interactive configuration
8. **Real-time Value Inspector** - Developer tool

### Nice to Have (Polish)
9. **Transform Chain Animation** - Sequential patterns
10. **CSS Variable Usage Example** - CSS integration
11. **Helper vs Manual Comparison** - Best practices
12. **Destroy and Cleanup Demo** - Memory management

---

## Suggested Demo Structure

```tsx
export function MotionValueDemo() {
  return (
    <Stack spacing="lg">
      <div>
        <h2>Reactive Motion Values</h2>
        <p>Runtime-controlled animations using CSS custom properties and spring physics</p>
      </div>
      
      {/* Existing examples */}
      <section><BasicMotionValue /></section>
      <section><MultiValueAnimation /></section>
      <section><ValueTracking /></section>
      <section><SpringAnimation /></section>
      
      {/* New Phase 2 examples */}
      <section>
        <h3>Transform Helpers</h3>
        <p>Convenient helper functions for common transforms</p>
        <TransformHelpersDemo />
      </section>
      
      <section>
        <h3>Multi-Transform Support</h3>
        <p>Combine multiple transforms into a single CSS variable</p>
        <MultiTransformDemo />
      </section>
      
      <section>
        <h3>GPU Acceleration</h3>
        <p>Performance comparison between GPU-accelerated and layout properties</p>
        <GPUAccelerationDemo />
      </section>
      
      <section>
        <h3>Transform Modes</h3>
        <p>Different transform mode configurations</p>
        <TransformModeDemo />
      </section>
      
      <section>
        <h3>Performance Optimizations</h3>
        <p>Batching, debouncing, and will-change hints</p>
        <PerformanceDemo />
      </section>
      
      <section>
        <h3>Interactive 3D Card</h3>
        <p>Complex multi-transform example</p>
        <Interactive3DCard />
      </section>
      
      <section>
        <h3>Spring Physics Playground</h3>
        <p>Interactive spring configuration tester</p>
        <SpringPlayground />
      </section>
      
      <section>
        <h3>Value Inspector</h3>
        <p>Developer tool for inspecting motion values</p>
        <ValueInspectorDemo />
      </section>
    </Stack>
  );
}
```

---

## Key Features to Highlight

1. **Automatic Transform Formatting**: Show how x/y properties automatically become translateX/translateY
2. **Combined CSS Variables**: Demonstrate the `--motion-transform-xxx` variable
3. **Performance Flags**: Display `isGPUAccelerated` and `triggersLayout` in UI
4. **Helper Functions**: Show the convenience of `useTranslateX` vs manual setup
5. **Element Scoping**: Demonstrate element-scoped vs global CSS variables
6. **Cleanup**: Show proper destroy/cleanup patterns
7. **CSS Integration**: Show how to use CSS variables in stylesheets
8. **Real-time Updates**: Show onChange subscriptions and value tracking

---

## Visual Design Suggestions

- **Code Snippets**: Show actual code for each example
- **CSS Variable Display**: Real-time display of generated CSS variables
- **Performance Metrics**: FPS counter, update count, etc.
- **Metadata Panel**: Show isGPUAccelerated, triggersLayout, cssVarName
- **Inspector Panel**: Collapsible developer tool showing all motion values
- **Comparison Views**: Side-by-side comparisons where applicable
- **Interactive Controls**: Sliders, buttons, drag handles for testing


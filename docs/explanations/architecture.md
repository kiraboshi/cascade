# System Architecture

Understanding the architecture and design decisions behind Cascade Motion.

---

## Overview

Cascade Motion is built on a **CSS-first architecture** that leverages the browser's compositor thread for optimal performance. The system is organized as a monorepo with interconnected packages, each serving a specific purpose.

---

## Core Principles

### 1. CSS-First Design

Cascade Motion prioritizes CSS for animation rendering:

```
React Component → Motion Value → CSS Custom Property → CSS Animation → Browser Compositor
```

**Benefits:**
- Animations run on compositor thread (GPU-accelerated)
- Minimal JavaScript overhead
- Better battery life
- Smooth 60fps animations

### 2. Compile-Time Optimization

Static animations are compiled to CSS at build time:

```typescript
const fadeIn = defineMotion({
  type: 'spring',
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});
// Generates CSS @keyframes at build time
```

**Benefits:**
- Zero runtime cost
- Smaller bundle size
- Better performance

### 3. Runtime Flexibility

Dynamic animations use runtime motion values:

```typescript
const opacity = useMotionValue(0, { property: 'opacity' });
opacity.animateTo(1, { duration: 300 });
// Updates CSS custom property at runtime
```

**Benefits:**
- Full programmatic control
- Responds to user input
- Dynamic values

---

## Package Architecture

### Package Structure

```
cascade/
├── packages/
│   ├── tokens/          # Design tokens (DTCG JSON + TypeScript)
│   ├── core/            # Foundation CSS generator
│   ├── compiler/        # Token compiler, StyleX integration, motion compiler
│   ├── motion-runtime/  # Runtime orchestrator for sequences
│   ├── motion-gestures/ # Gesture-driven animations
│   └── react/           # Layout primitives (optional)
└── apps/
    └── demo/            # Demo application
```

### Dependency Graph

```
@cascade/react → @cascade/motion-runtime → @cascade/compiler → @cascade/core → @cascade/tokens
@cascade/motion-gestures → @cascade/motion-runtime
```

**Design:** Layered architecture with clear separation of concerns.

---

## Package Responsibilities

### @cascade/tokens

**Purpose:** Design token definitions

**Responsibilities:**
- Dual-format tokens (DTCG JSON + TypeScript)
- Token resolution and aliasing
- Type-safe token access

**Key Features:**
- DTCG-compliant format for tooling
- TypeScript format for type safety
- Unified export supporting both formats

---

### @cascade/core

**Purpose:** Foundation CSS generation

**Responsibilities:**
- CSS `@layer` architecture
- Token-to-CSS custom property generation
- Hardware acceleration detection
- Foundation CSS generation

**Key Features:**
- 8-layer cascade system
- GPU-accelerated property detection
- Layout-triggering property warnings
- Token resolution with aliases

**Layer Order:**
1. `reset` - CSS reset
2. `tokens` - CSS custom properties
3. `base` - Base styles
4. `layouts` - Layout utilities
5. `components` - Component styles
6. `utilities` - Utility classes
7. `motion` - Animation styles
8. `overrides` - Override layer

---

### @cascade/compiler

**Purpose:** Build-time compilation

**Responsibilities:**
- Token compilation and resolution
- Spring physics solver (RK4)
- CSS keyframe generation
- Sequence compilation
- Type generation

**Key Features:**
- Spring physics solver (Runge-Kutta 4th order)
- Keyframe generation from spring configs
- Sequence compilation (overlapping stages)
- DTCG and TypeScript token parsing
- Vite plugin integration

**Compilation Process:**
1. Parse tokens (DTCG + TypeScript)
2. Resolve aliases and references
3. Generate CSS custom properties
4. Compile motion configs to CSS keyframes
5. Generate TypeScript types

---

### @cascade/motion-runtime

**Purpose:** Runtime animation orchestration

**Responsibilities:**
- Motion value management
- CSS custom property updates
- Animation timeline control
- Layout transition coordination
- Viewport animation detection

**Key Features:**
- Motion values with CSS custom properties
- Transform registry (combines transforms)
- Animation timeline API
- Layout transition hooks (FLIP)
- Viewport animation hooks (IntersectionObserver)

**Core Concepts:**
- **Motion Values**: Reactive values that update CSS custom properties
- **Transform Registry**: Automatically combines transform values
- **FLIP Technique**: Layout transition algorithm
- **IntersectionObserver**: Viewport detection

---

### @cascade/motion-gestures

**Purpose:** Gesture-driven animations

**Responsibilities:**
- Pointer event handling
- Gesture state management
- Velocity tracking
- Spring animation integration
- Constraint enforcement

**Key Features:**
- Drag, pan, scroll, wheel gestures
- Hover, tap, focus detection
- Velocity-based spring animations
- Gesture constraints and axis locking
- Passive event listeners

**Gesture Flow:**
1. Event capture (pointer/touch/scroll)
2. Gesture state calculation
3. Motion value updates
4. CSS custom property updates
5. CSS handles visual animation

---

## Data Flow

### Animation Flow

```
1. User Action / State Change
   ↓
2. Motion Value Update (JavaScript)
   ↓
3. CSS Custom Property Update
   ↓
4. CSS Animation / Transition
   ↓
5. Browser Compositor (GPU)
   ↓
6. Visual Update (60fps)
```

### Compile-Time Flow

```
1. defineMotion() Call
   ↓
2. Spring Physics Solver (RK4)
   ↓
3. Keyframe Generation
   ↓
4. CSS @keyframes Output
   ↓
5. Build-Time CSS Injection
```

### Runtime Flow

```
1. useMotionValue() Hook
   ↓
2. Motion Value Instance Created
   ↓
3. CSS Custom Property Registered
   ↓
4. animateTo() Called
   ↓
5. CSS Custom Property Updated
   ↓
6. CSS Transition/Animation Triggered
```

---

## Key Algorithms

### FLIP (First, Last, Invert, Play)

Used for layout transitions:

1. **First**: Measure initial position/size
2. **Last**: Measure final position/size
3. **Invert**: Apply transform to appear in first position
4. **Play**: Animate transform to identity

**Benefits:**
- Smooth animations without layout thrashing
- Works with unpredictable layout changes
- GPU-accelerated (uses transform)

---

### Spring Physics Solver

Uses RK4 (Runge-Kutta 4th order) method:

```typescript
// Spring differential equation
// x'' = -k/m * x - c/m * x'
// Solved using RK4 numerical integration
```

**Process:**
1. Define spring config (stiffness, damping, mass)
2. Solve differential equation
3. Generate keyframe values
4. Output CSS @keyframes

**Optimization:**
- Precomputes for durations < 300ms
- Generates keyframes at build time
- Zero runtime cost for static animations

---

### Transform Registry

Automatically combines transform values:

```typescript
const x = useTranslateX(0);
const y = useTranslateY(0);
const rotate = useRotate(0);
const scale = useScale(1);

// All combined into single CSS variable:
// --motion-transform-{elementId}
// transform: var(--motion-transform-{elementId})
```

**Benefits:**
- Single CSS variable update
- Reduced style recalculations
- Better performance

---

## Integration Points

### React Integration

**Hooks:**
- `useMotionValue` - Create motion values
- `useDrag`, `useHover`, etc. - Gesture hooks
- `useLayoutTransition` - Layout transitions
- `useViewportAnimation` - Viewport animations

**Components:**
- `<MotionSequence>` - Animation sequences
- `<MotionStage>` - Sequence stages
- `<AnimatePresence>` - Enter/exit animations

---

### CSS Integration

**Custom Properties:**
- `--motion-value-{id}` - Motion value properties
- `--motion-transform-{id}` - Combined transforms
- `--cascade-{token}` - Design tokens

**Keyframes:**
- Generated at build time
- Injected via `<style>` tag
- Class-based application

---

## Design Decisions

### Why CSS-First?

**Performance:**
- CSS animations run on compositor thread
- GPU-accelerated by default
- Minimal JavaScript overhead

**Battery Life:**
- Less CPU usage
- More efficient rendering
- Better mobile performance

**Compatibility:**
- Works with all CSS-capable browsers
- No proprietary runtime required
- Standard web technologies

---

### Why Monorepo?

**Benefits:**
- Shared types and utilities
- Coordinated releases
- Easier development
- Better testing

**Structure:**
- Clear package boundaries
- Independent versioning (can be split)
- Workspace dependencies

---

### Why Motion Values?

**Flexibility:**
- Can be used independently
- Composable with gestures
- Works with any CSS property
- Programmatic control

**Performance:**
- Updates batched automatically
- CSS custom properties efficient
- Transform registry optimization

---

## Extension Points

### Custom Gestures

Create custom gesture handlers:

```typescript
import { createGestureHandler } from '@cascade/motion-gestures';

const customGesture = createGestureHandler({
  onStart: (state) => { /* ... */ },
  onMove: (state) => { /* ... */ },
  onEnd: (state) => { /* ... */ },
});
```

---

### Custom Animations

Define custom animations:

```typescript
import { defineMotion } from '@cascade/compiler';

const customAnimation = defineMotion({
  type: 'spring',
  from: { /* ... */ },
  to: { /* ... */ },
  // ... config
});
```

---

### Custom Motion Values

Create custom motion value types:

```typescript
import { createMotionValue } from '@cascade/motion-runtime';

const customValue = createMotionValue(0, {
  property: 'custom-property',
  unit: 'px',
});
```

---

## Performance Characteristics

### GPU Acceleration

**Automatic:**
- `transform` properties
- `opacity` property
- CSS animations/transitions

**Detection:**
```typescript
const opacity = useMotionValue(1, { property: 'opacity' });
console.log(opacity.isGPUAccelerated); // true
```

---

### Layout Optimization

**Avoids:**
- Layout-triggering properties (`width`, `height`, `margin`, etc.)
- Reflows and repaints
- Main thread blocking

**Uses:**
- Transform for position
- Opacity for visibility
- CSS custom properties for values

---

## Future Architecture Considerations

### Potential Enhancements

1. **Web Animations API** - Native browser animation API
2. **CSS Houdini** - Custom properties and animations
3. **OffscreenCanvas** - Off-thread rendering
4. **SharedArrayBuffer** - Shared memory for animations

---

## See Also

- [CSS-First Philosophy](./css-first-philosophy.md) - Design rationale
- [Compile-Time vs Runtime](./compile-time-vs-runtime.md) - When to use each
- [Performance Characteristics](./performance-characteristics.md) - Performance details
- [Technical Documentation](../technical-documentation.md) - Low-level details


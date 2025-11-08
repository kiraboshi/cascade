# Cascade Motion

A production-ready, CSS-first animation and layout system that leverages the browser's compositor thread for optimal performance. Combines compile-time optimization with runtime flexibility for smooth, GPU-accelerated animations.

## At a Glance

### Layout Primitives (`@cascade/react`)

**Container Components:**
- `Stack` - Vertical stacking with configurable spacing
- `Cluster` - Horizontal flex container with wrapping
- `Grid` - CSS Grid wrapper with token-based gaps
- `Flex` - Flexible box layout with alignment controls
- `Frame` - Aspect-ratio container
- `Center` - Centered content container
- `Cover` - Full-bleed overlay container
- `Sidebar` - Responsive sidebar layout
- `Split` - Two-column split layout
- `Switcher` - Responsive container that switches between horizontal/vertical
- `Reel` - Horizontal scrolling container with snap points
- `Imposter` - Absolutely positioned overlay

**Utility Component:**
- `Box` - Generic container with padding, margin, and styling props

All layout primitives support:
- Design token-based spacing
- Layout transition animations
- Responsive breakpoints
- Accessibility features (ARIA labels, keyboard navigation)

### Motion Components (`@cascade/motion-runtime`)

**Animation Components:**
- `MotionSequence` - Orchestrates multi-stage animation sequences
- `MotionStage` - Individual stage within a sequence
- `AnimatePresence` - Enter/exit animations for mounting/unmounting

**Motion Values:**
- `useMotionValue` - Reactive values that update CSS custom properties
- `useTranslateX`, `useTranslateY` - Transform helpers
- `useRotate`, `useScale` - Additional transform helpers

**Layout Transitions:**
- `useLayoutTransition` - FLIP-based layout change animations
- `useSharedLayoutTransition` - Shared element transitions
- `useBatchLayoutTransition` - Efficient multi-element transitions

**Viewport Animations:**
- `useInView` - IntersectionObserver-based visibility detection
- `useViewportAnimation` - Scroll-triggered animations
- `useFadeInOnScroll`, `useSlideInOnScroll` - Common scroll patterns

**Animation States:**
- `useAnimationStates` - State-based animation sets (variants-like)
- `useAnimationStatesWithGestures` - Animation states with gesture integration
- `useAnimationStatesWithChildren` - Animation states for child components

### Gesture Hooks (`@cascade/motion-gestures`)

**Pointer Gestures:**
- `useDrag` - Drag interactions with constraints
- `usePan` - Pan gestures with velocity tracking
- `useHover` - Hover state detection
- `useTap` - Tap/press detection
- `useFocus` - Focus state management

**Scroll Gestures:**
- `useScrollMotion` - Scroll-driven animations
- `useWheel` - Wheel event handling

**Animation Helpers:**
- `useHoverAnimation`, `useTapAnimation`, `useFocusAnimation` - Gesture-driven animations

### Compiler (`@cascade/compiler`)

**Build-Time Tools:**
- `defineMotion` - Compile animations to CSS keyframes
- `defineAnimationStates` - Define state-based animation sets
- Spring physics solver (RK4) for natural motion
- Token compilation and resolution
- Vite plugin integration

## Architecture

### Core Principles

**CSS-First Design:**
```
React Component → Motion Value → CSS Custom Property → CSS Animation → Browser Compositor
```

- Animations run on compositor thread (GPU-accelerated)
- Minimal JavaScript overhead
- Better battery life and smooth 60fps animations

**Compile-Time + Runtime Hybrid:**
- Static animations compile to CSS at build time (zero runtime cost)
- Dynamic animations use runtime motion values (full programmatic control)
- Best of both worlds: performance + flexibility

### Package Structure

```
@cascade/tokens          # Design tokens (DTCG JSON + TypeScript)
@cascade/core            # Foundation CSS with @layer architecture
@cascade/compiler        # Token resolver, StyleX integration, motion compiler
@cascade/motion-runtime  # Runtime orchestrator for sequences and motion values
@cascade/motion-gestures # Gesture-driven animations
@cascade/react           # Layout primitives (Stack, Cluster, Frame, etc.)
```

**Dependency Flow:**
```
@cascade/react → @cascade/motion-runtime → @cascade/compiler → @cascade/core → @cascade/tokens
@cascade/motion-gestures → @cascade/motion-runtime
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start demo app
pnpm dev
```

## Development

See [plans/completed/foundation.md](./plans/completed/foundation.md) for detailed implementation specifications.

## Integration

Cascade Motion can be integrated into other projects via:

- **npm Publishing** - Publish packages to npm registry
- **Git Submodule** - Use source directly from repository

See [docs/INTEGRATION_STRATEGIES.md](./docs/INTEGRATION_STRATEGIES.md) for detailed integration guides.


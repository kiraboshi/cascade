---
title: Cascade CSS Foundation - Implementation Plan
type: plan
status: completed
completed_at: 2025-01-11
scope: foundation
---

# Cascade CSS Foundation: Implementation Plan

## Architecture Overview

Monorepo structure with interconnected packages:
- `@cascade/tokens` - Token definitions (DTCG JSON + TypeScript)
- `@cascade/core` - Foundation CSS with @layer architecture, token CSS variables
- `@cascade/compiler` - Token resolver, StyleX integration, motion compiler (CSS + JS configs)
- `@cascade/motion-runtime` - Optional runtime orchestrator for complex animation sequences
- `@cascade/react` - Layout primitives (Stack, Cluster, Frame)
- `apps/demo` - Vite demo application

**Design Philosophy:** CSS-first with zero-runtime for simple animations, optional runtime orchestrator for complex sequences. All packages are TypeScript-first with tree-shakeable exports.

## Phase 1: Monorepo Setup & Token System

### 1.1 Root Monorepo Configuration
**Files:**
- `package.json` - Root workspace config with pnpm workspaces
- `pnpm-workspace.yaml` - Workspace definitions
- `tsconfig.json` - Base TypeScript config
- `.gitignore` - Standard monorepo ignores

**Structure:**
```
cascade/
├── packages/
│   ├── tokens/
│   ├── core/
│   ├── compiler/
│   ├── motion-runtime/
│   └── react/
├── apps/
│   └── demo/
└── package.json
```

### 1.2 Token Package (`@cascade/tokens`)
**Purpose:** Dual-format token definitions (DTCG JSON + TypeScript)

**Files:**
- `tokens.json` - DTCG-compliant token definitions
- `tokens.ts` - TypeScript token definitions with types
- `index.ts` - Unified export supporting both formats
- `package.json` - Package manifest

**Token Categories:**
- Colors (oklch format)
- Spacing (scale-based)
- Typography (fluid scales)
- Motion (duration, easing, spring configs)
- Layout (breakpoints, container queries)

**Key Implementation:**
- DTCG JSON format for interoperability
- TypeScript definitions for type safety and autocomplete
- Token resolver that merges both formats
- Support for token aliases and references

### 1.3 Core Package (`@cascade/core`)
**Purpose:** Foundation CSS with @layer architecture

**Files:**
- `src/foundation.css` - Generated CSS with @layer structure
- `src/token-resolver.ts` - Resolves tokens to CSS custom properties
- `src/layers.ts` - Layer definitions and ordering
- `index.ts` - Public API exports
- `package.json` - Package manifest

**CSS Layer Order:**
```css
@layer reset, tokens, base, layouts, components, utilities, motion, overrides;
```

**Key Implementation:**
- Generate CSS custom properties from tokens
- Use CSS Color 4 (oklch) for colors
- Use CSS Values 4 (calc, clamp) for fluid typography/spacing
- Hardware acceleration rules (warn on layout-triggering animations)

## Phase 2: Compiler Package (`@cascade/compiler`)

### 2.1 Token Compiler
**Files:**
- `src/token-compiler.ts` - Compiles tokens to CSS + TypeScript
- `src/dtcg-parser.ts` - Parses DTCG JSON format
- `src/ts-token-loader.ts` - Loads TypeScript token definitions

**Key Functions:**
- `compileTokens(tokens: TokenTree): { css: string, ts: string }`
- Resolves token aliases at build-time
- Generates TypeScript types for autocomplete
- Computes clamp() for fluid values

### 2.2 StyleX Integration
**Files:**
- `src/stylex-config.ts` - StyleX configuration
- `src/stylex-helpers.ts` - Token-aware StyleX utilities
- `src/atomic-generator.ts` - Generates atomic CSS classes

**Key Implementation:**
- Integrate with `@stylexjs/stylex`
- Token-aware StyleX create() wrapper
- Generate atomic classes with :where() for flat specificity
- Merge shorthand/longhand properties deterministically

### 2.3 Motion Compiler
**Files:**
- `src/motion-compiler.ts` - Spring physics to CSS keyframes + JS configs
- `src/spring-solver.ts` - RK4 spring solver (build-time)
- `src/keyframe-generator.ts` - Generates @keyframes CSS
- `src/motion-config-generator.ts` - Generates JS animation configs for orchestrator

**Key Functions:**
- `defineMotion(config: SpringConfig): MotionOutput` - Single animation
- `defineMotionSequence(config: SequenceConfig): SequenceOutput` - Multi-stage animations
- Pre-compute keyframes for durations < 300ms
- Generate JS solver for longer animations
- Support spring physics (stiffness, damping, mass)
- Dual output: CSS keyframes (simple) + JS config (orchestrator)

**Output Types:**
```typescript
// Simple animation (CSS-only)
const slide = defineMotion({ 
  type: 'spring', 
  stiffness: 300,
  damping: 20,
  from: { transform: 'translateX(0)' },
  to: { transform: 'translateX(400px)' }
});
// Output: CSS @keyframes + className

// Complex sequence (CSS + JS config)
const slideAndFade = defineMotionSequence({
  stages: [
    { 
      name: 'slide', 
      from: { transform: 'translateX(0)' }, 
      to: { transform: 'translateX(400px)' }, 
      duration: '800ms',
      easing: 'ease-out'
    },
    { 
      name: 'fade', 
      startAt: '60%', // Percentage-based timing
      from: { opacity: 1 }, 
      to: { opacity: 0 }, 
      duration: '400ms',
      easing: 'ease-in'
    }
  ],
  onComplete: 'next-animation' // Signal for orchestrator
});
// Output: CSS @keyframes + JS sequence config for orchestrator
```

**Algorithm:**
- Use RK4 solver at build-time for short animations
- Generate CSS keyframes with spring overshoot
- Generate JS config objects for runtime orchestrator
- Support percentage-based and absolute timing for stage coordination
- Coordinate multiple properties (transform + opacity) in single keyframe

## Phase 3: Motion Runtime (`@cascade/motion-runtime`)

### 3.1 Motion Orchestrator Components
**Files:**
- `src/MotionSequence.tsx` - Root orchestrator component
- `src/MotionStage.tsx` - Individual animation stage component
- `src/useMotionSequence.ts` - Hook for programmatic sequence control
- `src/motion-state.ts` - Animation state management
- `src/motion-config-loader.ts` - Loads JS configs from compiler
- `src/css-keyframe-bridge.ts` - Bridges CSS keyframes to orchestrator
- `index.ts` - Public API exports
- `package.json` - Package manifest

**MotionSequence Component:**
```typescript
interface MotionSequenceProps {
  children: React.ReactNode;
  onComplete?: () => void;
  autoStart?: boolean;
  respectReducedMotion?: boolean;
  pauseOnHover?: boolean;
}
```

**MotionStage Component:**
```typescript
interface MotionStageProps {
  animation: MotionConfig | string; // CSS keyframe name or JS config
  delay?: number | 'until-previous-completes';
  onComplete?: (event: { next: () => void }) => void;
  onStart?: () => void;
  style?: React.CSSProperties;
  className?: string;
}
```

**Usage Example:**
```typescript
import { MotionSequence, MotionStage } from '@cascade/motion-runtime';
import { slideAndFade, nextAnimation } from './animations';

function AnimatedComponent() {
  return (
    <MotionSequence onComplete={() => console.log('Sequence complete')}>
      <MotionStage
        animation={slideAndFade}
        onComplete={(e) => e.next()} // Trigger next stage
      />
      <MotionStage
        animation={nextAnimation}
        delay="until-previous-completes"
      />
    </MotionSequence>
  );
}
```

**Key Features:**
- Coordinate multiple animation stages
- Support CSS keyframes (best performance) or JS animations (maximum control)
- Event-driven sequencing (onComplete callbacks)
- Pause/resume/rewind capabilities
- Respect `prefers-reduced-motion` media query
- Tree-shakeable (only import if used)
- Clean up event listeners on unmount

**Implementation Strategy:**
- Use CSS custom properties for animation progress when possible
- Fallback to inline styles for dynamic properties
- Listen to `animationend` events for CSS animations
- Use `requestAnimationFrame` for JS-based animations
- Coordinate transform + opacity changes during motion
- Support both percentage-based (`startAt: '60%'`) and absolute timing (`startAt: 500`)

### 3.2 Integration with Motion Compiler
**Files:**
- `src/motion-config-loader.ts` - Loads JS configs from compiler
- `src/css-keyframe-bridge.ts` - Bridges CSS keyframes to orchestrator

**Key Implementation:**
- Motion compiler generates both CSS and JS configs
- Runtime orchestrator can use either format
- Prefer CSS keyframes for performance, use JS configs for complex coordination
- Load sequence configs at runtime for orchestrator

## Phase 4: React Primitives (`@cascade/react`)

### 4.1 Stack Component
**Files:**
- `src/Stack.tsx` - Stack layout primitive
- `src/Stack.stylex.ts` - StyleX styles for Stack

**Props Interface:**
```typescript
interface StackProps {
  spacing: TokenKey<'space'>;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  responsive?: Record<string, Partial<StackProps>>;
  as?: keyof JSX.IntrinsicElements;
}
```

**Implementation:**
- Use StyleX for base styles
- CSS custom properties for runtime overrides
- Data attributes for responsive behavior
- Polymorphic `as` prop support

### 4.2 Cluster Component
**Files:**
- `src/Cluster.tsx` - Cluster layout primitive
- `src/Cluster.stylex.ts` - StyleX styles for Cluster

**Unique Features:**
- Algorithmic wrapping detection (optional JS runtime)
- Data-wrapping attribute for CSS-only styling
- Gap-based spacing using tokens

### 4.3 Frame Component
**Files:**
- `src/Frame.tsx` - Aspect ratio container
- `src/Frame.stylex.ts` - StyleX styles for Frame

**Props Interface:**
```typescript
interface FrameProps {
  ratio: `${number}/${number}`;
  objectFit?: 'cover' | 'contain';
}
```

**Implementation:**
- CSS aspect-ratio property
- Absolute positioning for content
- Object-fit support

## Phase 5: Demo Application (`apps/demo`)

### 5.1 Vite Configuration
**Files:**
- `vite.config.ts` - Vite config with StyleX plugin
- `tsconfig.json` - TypeScript config extending root

**Plugins:**
- `vite-plugin-stylex` for StyleX compilation
- Custom plugin for token compilation
- HMR support for token changes

### 5.2 Demo Pages
**Files:**
- `src/App.tsx` - Main app component
- `src/pages/FoundationDemo.tsx` - Foundation layer showcase
- `src/pages/PrimitivesDemo.tsx` - Layout primitives showcase
- `src/pages/MotionDemo.tsx` - Motion compiler showcase
- `src/pages/SequenceDemo.tsx` - Motion orchestrator showcase (slide + fade example)

**Features:**
- Interactive token editor
- Live preview of primitives
- Motion animation playground
- Complex sequence demonstrations (slide + fade + next animation)

## Phase 6: Build & Integration

### 6.1 Build Scripts
**Root `package.json` scripts:**
- `build` - Build all packages
- `dev` - Start demo app in dev mode
- `test` - Run tests across packages
- `lint` - Lint all packages

### 6.2 Package Dependencies
**Dependency Graph:**
```
@cascade/react → @cascade/motion-runtime → @cascade/compiler → @cascade/core → @cascade/tokens
apps/demo → @cascade/react + @cascade/core + @cascade/motion-runtime
```

**Note:** `@cascade/motion-runtime` is optional - only imported when complex sequences are needed.

### 6.3 Type Generation
**Files:**
- `packages/compiler/src/type-generator.ts` - Generates .d.ts files
- Output: Full TypeScript types for all tokens, components, and motion configs

## Testing Strategy

### Unit Tests
- Token resolver: Test DTCG JSON parsing, TypeScript loading, alias resolution
- Motion compiler: Test spring solver, keyframe generation, sequence config generation
- StyleX integration: Test atomic class generation, specificity flattening
- Motion runtime: Test sequence coordination, event handling, cleanup

### Integration Tests
- Stack/Cluster/Frame: Test rendering with tokens, responsive behavior
- Motion: Test CSS keyframe output, animation application
- Motion sequences: Test slide + fade coordination, next animation triggering

### Performance Benchmarks
- Build-time: < 200ms for 1000 StyleX calls
- Bundle-size: Atomic class deduplication
- Runtime: First paint < 50ms, interaction < 16ms
- Motion runtime: < 5KB gzipped (tree-shakeable)

## Key Technical Decisions

1. **Package Manager:** pnpm workspaces (fast, efficient)
2. **CSS-in-JS:** StyleX (zero-runtime, type-safe)
3. **CSS Architecture:** @layer for cascade management
4. **Token Format:** Dual support (DTCG JSON + TypeScript)
5. **Motion:** Build-time keyframe generation + optional runtime orchestrator
6. **Type Safety:** Full TypeScript coverage with generated types
7. **Runtime Strategy:** CSS-first, JS orchestrator only when needed (tree-shakeable)

## Deliverables

- ✅ Monorepo structure with pnpm workspaces
- ✅ Token system (DTCG JSON + TypeScript)
- ✅ Foundation CSS with @layer architecture
- ✅ Token compiler and resolver
- ✅ StyleX integration layer
- ✅ Motion compiler (spring → keyframes + JS configs)
- ✅ Motion runtime orchestrator (optional, for complex sequences)
- ✅ React primitives (Stack, Cluster, Frame)
- ✅ Demo Vite application with sequence examples
- ✅ TypeScript type generation
- ✅ Build scripts and tooling

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Setup monorepo structure
- Implement token system (DTCG + TypeScript)
- Create foundation CSS with @layer architecture
- Build token compiler

### Phase 2: Compiler & Motion (Week 3-4)
- Integrate StyleX
- Build motion compiler (single animations)
- Implement spring solver
- Generate CSS keyframes

### Phase 3: Motion Sequences (Week 5-6)
- Extend motion compiler for sequences
- Build motion runtime orchestrator
- Implement MotionSequence/MotionStage components
- Test complex sequences (slide + fade + next)

### Phase 4: Layout Primitives (Week 7-8)
- Implement Stack, Cluster, Frame components
- Add responsive behavior
- Integrate with tokens and StyleX

### Phase 5: Demo & Polish (Week 9-10)
- Build demo application
- Add interactive examples
- Write documentation
- Performance optimization

## Non-Functional Requirements

- **Browser Support:** Chrome 90+, Firefox 88+, Safari 15+ (CSS @layer, oklch)
- **Build Tool:** Vite (primary), Webpack loader (secondary)
- **Language:** TypeScript 5.2+, CSS Modules level 3
- **Package Size:** 
  - Core packages: < 50KB total (compiler + runtime)
  - Motion runtime: < 5KB gzipped (tree-shakeable)
- **Accessibility:** All components meet WCAG 2.2 AA by default (color contrast, focus management, prefers-reduced-motion)
- **Performance:** Zero-runtime for simple animations, minimal runtime for sequences

## Example: Complex Animation Sequence

```typescript
// 1. Define sequence in motion compiler
const slideAndFadeSequence = defineMotionSequence({
  stages: [
    {
      name: 'slide',
      from: { transform: 'translateX(0)' },
      to: { transform: 'translateX(400px)' },
      duration: '800ms',
      easing: 'ease-out'
    },
    {
      name: 'fade',
      startAt: '60%', // Fade starts at 60% of slide duration
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: '400ms',
      easing: 'ease-in'
    }
  ]
});

// 2. Use in component with orchestrator
function AnimatedElement() {
  return (
    <MotionSequence>
      <MotionStage
        animation={slideAndFadeSequence}
        onComplete={(e) => {
          console.log('Slide and fade complete');
          e.next(); // Trigger next animation
        }}
      />
      <MotionStage
        animation={nextAnimation}
        delay="until-previous-completes"
      />
    </MotionSequence>
  );
}
```

**Generated CSS:**
```css
@keyframes slide-and-fade-sequence {
  0% { transform: translateX(0); opacity: 1; }
  60% { transform: translateX(400px); opacity: 1; } /* Fade starts here */
  100% { transform: translateX(400px); opacity: 0; }
}
```

**Generated JS Config:**
```typescript
{
  stages: [
    { name: 'slide', startAt: 0, duration: 800 },
    { name: 'fade', startAt: 480, duration: 400 } // 60% of 800ms
  ],
  totalDuration: 880
}
```

This approach provides maximum flexibility while maintaining CSS-first performance for simple animations.


# Cascade CSS Foundation - Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build all packages:**
   ```bash
   pnpm build
   ```

3. **Start demo app:**
   ```bash
   pnpm dev
   ```

## Project Structure

```
cascade/
├── packages/
│   ├── tokens/          # Design tokens (DTCG JSON + TypeScript)
│   ├── core/            # Foundation CSS with @layer architecture
│   ├── compiler/         # Token compiler, StyleX integration, motion compiler
│   ├── motion-runtime/   # Optional runtime orchestrator for sequences
│   └── react/            # Layout primitives (Stack, Cluster, Frame)
├── apps/
│   └── demo/             # Vite demo application
└── package.json
```

## Package Details

### @cascade/tokens
- Dual-format token definitions (DTCG JSON + TypeScript)
- Supports colors (oklch), spacing, typography, motion, layout tokens
- Unified export supporting both formats

### @cascade/core
- Foundation CSS generator with @layer architecture
- Token-to-CSS custom property compiler
- Hardware acceleration rules and warnings

### @cascade/compiler
- StyleX integration helpers
- Motion compiler (spring physics → CSS keyframes)
- Sequence compiler (overlapping stages → combined keyframes)
- Token-aware StyleX wrapper

### @cascade/motion-runtime
- MotionSequence component for orchestrating animations
- MotionStage component for individual stages
- useMotionSequence hook for programmatic control
- Respects prefers-reduced-motion

### @cascade/react
- Stack: Vertical flex container with spacing
- Cluster: Horizontal flex container with wrapping
- Frame: Aspect ratio container

## Usage Examples

### Basic Layout Primitives

```tsx
import { Stack, Cluster, Frame } from '@cascade/react';

function App() {
  return (
    <Stack spacing="md" align="center">
      <Cluster spacing="sm">
        <div>Tag 1</div>
        <div>Tag 2</div>
      </Cluster>
      <Frame ratio="16/9">
        <img src="..." />
      </Frame>
    </Stack>
  );
}
```

### Simple Motion

```tsx
import { defineMotion } from '@cascade/compiler';

const fadeIn = defineMotion({
  type: 'spring',
  stiffness: 300,
  damping: 20,
  from: { opacity: 0, transform: 'translateY(20px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
  duration: 300,
});

// Inject CSS
useEffect(() => {
  const style = document.createElement('style');
  style.textContent = fadeIn.css;
  document.head.appendChild(style);
}, []);

// Use className
<div className={fadeIn.className}>Animated content</div>
```

### Complex Sequences

```tsx
import { MotionSequence, MotionStage } from '@cascade/motion-runtime';
import { defineMotionSequence, defineMotion } from '@cascade/compiler';

const slideAndFade = defineMotionSequence({
  stages: [
    {
      name: 'slide',
      from: { transform: 'translateX(0)' },
      to: { transform: 'translateX(400px)' },
      duration: '800ms',
    },
    {
      name: 'fade',
      startAt: '60%', // Starts at 60% of slide duration
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: '400ms',
    },
  ],
});

const nextAnimation = defineMotion({
  from: { transform: 'scale(0.8)', opacity: 0 },
  to: { transform: 'scale(1)', opacity: 1 },
  duration: '500ms',
});

function AnimatedComponent() {
  return (
    <MotionSequence autoStart onComplete={() => console.log('Done!')}>
      <MotionStage
        animation={{ className: slideAndFade.className, css: slideAndFade.css }}
        onComplete={(e) => e.next()}
      >
        <div>Slides and fades</div>
      </MotionStage>
      <MotionStage
        animation={{ className: nextAnimation.className, css: nextAnimation.css }}
        delay="until-previous-completes"
      >
        <div>Next animation</div>
      </MotionStage>
    </MotionSequence>
  );
}
```

## Development

### Building Individual Packages

```bash
pnpm --filter @cascade/tokens build
pnpm --filter @cascade/core build
pnpm --filter @cascade/compiler build
pnpm --filter @cascade/motion-runtime build
pnpm --filter @cascade/react build
```

### Type Checking

```bash
pnpm typecheck
```

## Notes

- Foundation CSS is generated at build time via `packages/core/scripts/generate-foundation.js`
- Motion compiler generates CSS keyframes at build/compile time
- StyleX integration provides zero-runtime CSS-in-JS
- Motion runtime orchestrator is tree-shakeable (only imported when needed)

## Next Steps

- [ ] Add comprehensive test suite
- [ ] Implement TypeScript type generation for better autocomplete
- [ ] Add Vite plugin for automatic CSS injection
- [ ] Create Storybook documentation
- [ ] Add E2E tests for demo app


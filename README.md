# Cascade CSS Foundation

A production-ready, universal layout system that treats CSS as a foundational rendering layer while providing type-safe abstractions through compile-time code generation.

## Architecture

- **CSS-first**: All styles compile to vanilla CSS; no proprietary runtime
- **Zero-runtime**: Static styles have zero runtime overhead
- **Type-safe**: Full TypeScript support with generated types
- **Framework-agnostic**: Components compile to framework-specific adapters

## Packages

- `@cascade/tokens` - Token definitions (DTCG JSON + TypeScript)
- `@cascade/core` - Foundation CSS with @layer architecture
- `@cascade/compiler` - Token resolver, StyleX integration, motion compiler
- `@cascade/motion-runtime` - Optional runtime orchestrator for complex sequences
- `@cascade/react` - Layout primitives (Stack, Cluster, Frame)

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


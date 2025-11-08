---
title: Layout Primitives Uplift
type: plan
status: in-progress
created_at: 2025-01-12
scope: react
priority: high
eval_reference: evals/motion-runtime/layout-primitives-gap-analysis.md
phase_1_status: completed
phase_2_status: completed
phase_2_5_status: completed
phase_3_status: completed
phase_4_status: completed
---

# Layout Primitives Uplift

## Overview

Cascade currently provides **3 layout primitives** (`Stack`, `Cluster`, `Frame`), covering ~30% of common layout patterns. This plan adds **6-8 additional primitives** to achieve comprehensive layout coverage comparable to Every Layout, Braid, and other modern design systems.

**Current State**: 3 primitives (Stack, Cluster, Frame)
**Target State**: 9-11 primitives total
**Coverage Goal**: ~85-95% of common layout needs

---

## Evaluation Summary

**Key Findings**:
- Current coverage: ~30% of common patterns
- Critical gaps: Box, Grid, Center
- High-value additions: Sidebar, Split
- Nice-to-have: Switcher, Reel, Cover, Imposter

**Priority Ranking**:
1. **Phase 1 (Critical)**: Box, Grid, Center
2. **Phase 2 (High Value)**: Sidebar, Split
3. **Phase 3 (Enhanced)**: Switcher, Reel
4. **Phase 4 (Specialized)**: Cover, Imposter

---

## Phase 1: Foundation Primitives (Critical) ✅ COMPLETE

**Status**: ✅ **COMPLETED** (2025-01-12)

All Phase 1 primitives have been implemented:
- ✅ Box component (`packages/react/src/Box.tsx`)
- ✅ Grid component (`packages/react/src/Grid.tsx`)
- ✅ Center component (`packages/react/src/Center.tsx`)
- ✅ Foundation CSS updated (`packages/core/src/foundation.ts`)
- ✅ Exports updated (`packages/react/src/index.ts`)
- ✅ Demo page updated (`apps/demo/src/pages/PrimitivesDemo.tsx`)

### 1.1 Box Component

**Purpose**: Basic container primitive for padding, margin, background, border

**Priority**: **HIGHEST** - Foundation primitive used in almost every component

**File**: `packages/react/src/Box.tsx`

**Props Interface**:
```typescript
export interface BoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Spacing (token-based)
  padding?: SpaceToken | SpaceToken[]; // Single value or [top/bottom, left/right]
  margin?: SpaceToken | SpaceToken[]; // Single value or [top/bottom, left/right]
  
  // Visual properties
  background?: string;
  border?: string;
  borderRadius?: SpaceToken | string;
  
  // Layout
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  
  // Responsive
  responsive?: Record<string, Partial<Omit<BoxProps, 'responsive'>>>;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}
```

**Implementation Steps**:

1. **Create StyleX styles** (`src/Box.stylex.ts`):
   ```typescript
   const boxStyles = stylex.create({
     base: {
       // Base styles
     },
   });
   ```

2. **Implement component** (`src/Box.tsx`):
   - Use StyleX for base styles
   - Resolve tokens to CSS custom properties
   - Handle padding/margin arrays (shorthand)
   - Generate responsive data-attributes
   - Support polymorphic `as` prop

3. **Add to foundation CSS** (`packages/core/src/foundation.ts`):
   - Add `.box` class styles
   - CSS custom properties for runtime values

4. **Add tests** (`src/__tests__/Box.test.tsx`):
   - Padding/margin prop handling
   - Token resolution
   - Responsive behavior
   - Polymorphic `as` prop

5. **Update exports** (`src/index.ts`):
   - Export `Box` and `BoxProps`

**Use Cases**:
- Card containers
- Section wrappers
- Spacing utilities
- Visual containers

**Estimated Effort**: 2-3 days

---

### 1.2 Grid Component

**Purpose**: CSS Grid container with token-based gaps

**Priority**: **HIGH** - Essential for modern two-dimensional layouts

**File**: `packages/react/src/Grid.tsx`

**Props Interface**:
```typescript
export interface GridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Grid configuration
  columns?: number | string | number[]; // e.g., 3, "repeat(3, 1fr)", [1, 2, 3]
  rows?: number | string | number[];
  
  // Spacing
  gap?: SpaceToken | SpaceToken[]; // Single or [row, column]
  
  // Alignment
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  alignContent?: 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around';
  justifyContent?: 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around';
  
  // Auto-fit/auto-fill
  autoFit?: boolean; // Use auto-fit instead of fixed columns
  minColumnWidth?: string; // Min width for auto-fit
  
  // Responsive
  responsive?: Record<string, Partial<Omit<GridProps, 'responsive'>>>;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}
```

**Implementation Steps**:

1. **Create StyleX styles**:
   - Base grid styles
   - Column/row configuration
   - Gap handling
   - Alignment utilities

2. **Implement component**:
   - Handle column/row configuration (number, string, array)
   - Resolve gap tokens
   - Generate grid-template-columns/rows CSS
   - Support auto-fit/auto-fill
   - Responsive data-attributes

3. **Add to foundation CSS**:
   - Grid utility classes
   - CSS custom properties

4. **Add tests**:
   - Column/row configuration
   - Gap handling
   - Responsive behavior
   - Auto-fit/auto-fill

5. **Update exports**

**Use Cases**:
- Card grids
- Image galleries
- Dashboard layouts
- Responsive form layouts

**Estimated Effort**: 3-4 days

---

### 1.3 Center Component

**Purpose**: Centering container (horizontal and/or vertical)

**Priority**: **HIGH** - Very common pattern

**File**: `packages/react/src/Center.tsx`

**Props Interface**:
```typescript
export interface CenterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Centering behavior
  centerText?: boolean; // Also center text-align
  centerChildren?: boolean; // Center child elements (default: true)
  
  // Sizing
  maxWidth?: string;
  minHeight?: string;
  
  // Padding
  padding?: SpaceToken | SpaceToken[];
  
  // Responsive
  responsive?: Record<string, Partial<Omit<CenterProps, 'responsive'>>>;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}
```

**Implementation Steps**:

1. **Create StyleX styles**:
   - Centering styles (margin: auto, flexbox centering)
   - Text centering
   - Max-width handling

2. **Implement component**:
   - Handle centering modes
   - Resolve padding tokens
   - Max-width support
   - Responsive data-attributes

3. **Add to foundation CSS**:
   - Center utility classes
   - CSS custom properties

4. **Add tests**:
   - Centering behavior
   - Text centering
   - Max-width
   - Responsive

5. **Update exports**

**Use Cases**:
- Centered content blocks
- Modal containers
- Hero sections
- Loading spinners

**Estimated Effort**: 1-2 days

---

## Phase 2: Common Patterns (High Value) ✅ COMPLETE

**Status**: ✅ **COMPLETED** (2025-01-12)

All Phase 2 primitives have been implemented:
- ✅ Sidebar component (`packages/react/src/Sidebar.tsx`)
- ✅ Split component (`packages/react/src/Split.tsx`)
- ✅ Foundation CSS updated with Sidebar and Split styles
- ✅ Exports updated
- ✅ Demo page updated with examples

### 2.1 Sidebar Component

**Purpose**: Sidebar layout pattern (main content + sidebar)

**Priority**: **MEDIUM-HIGH** - Common layout pattern

**File**: `packages/react/src/Sidebar.tsx`

**Props Interface**:
```typescript
export interface SidebarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Sidebar configuration
  side?: 'left' | 'right';
  sidebarWidth?: string; // e.g., "20rem", "300px"
  contentMin?: string; // Minimum content width
  
  // Spacing
  gap?: SpaceToken;
  
  // Behavior
  noStretch?: boolean; // Don't stretch sidebar to fill space
  sidebarFirst?: boolean; // Sidebar appears first in DOM (for mobile)
  
  // Responsive
  responsive?: Record<string, Partial<Omit<SidebarProps, 'responsive'>>>;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
  
  // Children (should be exactly 2)
  children: [ReactNode, ReactNode]; // [sidebar, content] or [content, sidebar]
}
```

**Implementation Steps**:

1. **Create StyleX styles**:
   - Grid-based layout (1fr auto or auto 1fr)
   - Sidebar width handling
   - Gap spacing
   - Responsive stacking

2. **Implement component**:
   - Handle side prop (left/right)
   - Grid template configuration
   - Responsive stacking (mobile)
   - Children validation (warn if not 2)

3. **Add to foundation CSS**:
   - Sidebar utility classes
   - CSS custom properties

4. **Add tests**:
   - Side configuration
   - Responsive stacking
   - Gap handling
   - Children validation

5. **Update exports**

**Use Cases**:
- Documentation layouts
- Dashboard sidebars
- Admin panels
- Article layouts

**Estimated Effort**: 2-3 days

---

### 2.2 Split Component

**Purpose**: Two-column responsive layout

**Priority**: **MEDIUM** - Useful but can be achieved with Grid

**File**: `packages/react/src/Split.tsx`

**Props Interface**:
```typescript
export interface SplitProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Split configuration
  fraction?: string; // e.g., '1/2', '1/3', '2/3', 'auto'
  gutter?: SpaceToken;
  
  // Responsive behavior
  switchTo?: 'stack' | 'none'; // Stack on mobile
  threshold?: string; // Breakpoint to switch (e.g., '768px')
  
  // Alignment
  align?: 'start' | 'center' | 'end' | 'stretch';
  
  // Responsive
  responsive?: Record<string, Partial<Omit<SplitProps, 'responsive'>>>;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
  
  // Children (should be exactly 2)
  children: [ReactNode, ReactNode];
}
```

**Implementation Steps**:

1. **Create StyleX styles**:
   - Grid-based split (fraction-based columns)
   - Gutter handling
   - Responsive stacking

2. **Implement component**:
   - Parse fraction prop
   - Generate grid-template-columns
   - Handle responsive stacking
   - Children validation

3. **Add to foundation CSS**:
   - Split utility classes
   - CSS custom properties

4. **Add tests**:
   - Fraction parsing
   - Responsive stacking
   - Gutter handling

5. **Update exports**

**Use Cases**:
- Two-column content
- Comparison views
- Split forms
- Responsive layouts

**Estimated Effort**: 2 days

---

## Phase 3: Enhanced Patterns (Nice-to-Have) ✅ COMPLETE

**Status**: ✅ **COMPLETED** (2025-01-12)

All Phase 3 primitives have been implemented:
- ✅ Switcher component (`packages/react/src/Switcher.tsx`)
- ✅ Reel component (`packages/react/src/Reel.tsx`)
- ✅ Foundation CSS updated (`packages/core/src/foundation.ts`)
- ✅ Exports updated (`packages/react/src/index.ts`)
- ✅ Animation support included

### 3.1 Switcher Component

**Purpose**: Responsive container that switches between horizontal/vertical

**Priority**: **MEDIUM** - Nice-to-have

**File**: `packages/react/src/Switcher.tsx`

**Props Interface**:
```typescript
export interface SwitcherProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Configuration
  threshold?: string; // Breakpoint to switch
  limit?: number; // Max items before wrapping
  
  // Spacing
  gap?: SpaceToken;
  
  // Alignment
  justify?: 'start' | 'center' | 'end' | 'between';
  
  // Responsive
  responsive?: Record<string, Partial<Omit<SwitcherProps, 'responsive'>>>;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}
```

**Implementation Steps**:

1. **Create StyleX styles**:
   - Flexbox with wrapping
   - Threshold-based switching
   - Gap handling

2. **Implement component**:
   - Handle threshold breakpoint
   - Limit-based wrapping
   - Responsive behavior

3. **Add to foundation CSS**:
   - Switcher utility classes

4. **Add tests**:
   - Threshold switching
   - Limit handling
   - Responsive behavior

5. **Update exports**

**Use Cases**:
- Responsive navigation
- Button groups
- Flexible card layouts

**Estimated Effort**: 2 days

---

### 3.2 Reel Component

**Purpose**: Horizontal scrolling container

**Priority**: **MEDIUM** - Useful for mobile patterns

**File**: `packages/react/src/Reel.tsx`

**Props Interface**:
```typescript
export interface ReelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Configuration
  itemWidth?: string; // Fixed width for items
  gap?: SpaceToken;
  
  // Scrolling behavior
  snap?: boolean; // Snap scrolling
  snapAlign?: 'start' | 'center' | 'end';
  
  // Responsive
  responsive?: Record<string, Partial<Omit<ReelProps, 'responsive'>>>;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}
```

**Implementation Steps**:

1. **Create StyleX styles**:
   - Horizontal scrolling
   - Snap scrolling
   - Gap handling
   - Item width

2. **Implement component**:
   - Handle scroll-snap
   - Item width configuration
   - Gap spacing

3. **Add to foundation CSS**:
   - Reel utility classes

4. **Add tests**:
   - Scroll behavior
   - Snap scrolling
   - Item width

5. **Update exports**

**Use Cases**:
- Image galleries
- Card carousels
- Horizontal navigation
- Mobile scrolling lists

**Estimated Effort**: 2 days

---

## Phase 4: Specialized Patterns (Low Priority) ✅ COMPLETE

**Status**: ✅ **COMPLETED** (2025-01-12)

All Phase 4 primitives have been implemented:
- ✅ Cover component (`packages/react/src/Cover.tsx`)
- ✅ Imposter component (`packages/react/src/Imposter.tsx`)
- ✅ Foundation CSS updated (`packages/core/src/foundation.ts`)
- ✅ Exports updated (`packages/react/src/index.ts`)
- ✅ Animation support included

### 4.1 Cover Component

**Purpose**: Full-height layout with header/footer

**Priority**: **LOW-MEDIUM** - Can be achieved with Stack + Center

**File**: `packages/react/src/Cover.tsx`

**Props Interface**:
```typescript
export interface CoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Content slots
  centered?: ReactNode; // Centered content
  header?: ReactNode;
  footer?: ReactNode;
  
  // Sizing
  minHeight?: string;
  
  // Spacing
  padding?: SpaceToken | SpaceToken[];
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}
```

**Estimated Effort**: 1-2 days

---

### 4.2 Imposter Component

**Purpose**: Centered overlay/modal container

**Priority**: **LOW** - Can be achieved with Center + positioning

**File**: `packages/react/src/Imposter.tsx`

**Props Interface**:
```typescript
export interface ImposterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Configuration
  margin?: SpaceToken;
  breakout?: boolean; // Break out of container
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}
```

**Estimated Effort**: 1 day

---

## Implementation Guidelines

### Consistency Requirements

All primitives must follow the same pattern as existing components:

1. **StyleX Integration**:
   - Use `stylex.create()` at module level
   - Compose styles with `stylex.props()`
   - Support className merging

2. **Token Integration**:
   - Resolve tokens to CSS custom properties
   - Use `tokens.space[spacing]` for spacing
   - Support token arrays for shorthand

3. **Responsive Support**:
   - Generate data-attributes for responsive props
   - Use `data-responsive` attribute
   - CSS matches with attribute selectors

4. **CSS Custom Properties**:
   - Use CSS variables for runtime values
   - Format: `--{component}-{property}`
   - Merge with inline styles

5. **Polymorphic `as` Prop**:
   - Support any HTML element
   - Forward refs correctly
   - Type-safe element selection

6. **TypeScript**:
   - Full type definitions
   - Extend `HTMLAttributes`
   - Omit conflicting props

### Testing Requirements

Each primitive needs:

1. **Unit Tests**:
   - Props handling
   - Token resolution
   - Responsive behavior
   - Polymorphic `as` prop
   - Edge cases

2. **Visual Tests**:
   - Visual regression tests
   - Responsive breakpoints
   - Different configurations

3. **Integration Tests**:
   - Motion-runtime integration
   - Styled-components compatibility
   - Real-world usage patterns

### Documentation Requirements

Each primitive needs:

1. **API Reference**:
   - Props interface
   - Usage examples
   - Default values

2. **Examples**:
   - Basic usage
   - Responsive examples
   - Motion-runtime integration
   - Real-world patterns

3. **Demo Page**:
   - Interactive examples
   - Code snippets
   - Visual demonstrations

---

## Foundation CSS Updates

### Update `packages/core/src/foundation.ts`

Add CSS for each new primitive:

```typescript
function generateLayoutsLayer(): string {
  return `
    /* Existing: .stack, .cluster, .frame */
    
    /* Box */
    .box {
      /* Box styles */
    }
    
    /* Grid */
    .grid {
      display: grid;
      gap: var(--grid-gap, var(--cascade-space-md));
      grid-template-columns: var(--grid-columns, repeat(3, 1fr));
    }
    
    /* Center */
    .center {
      margin-left: auto;
      margin-right: auto;
      max-width: var(--center-max-width, 100%);
    }
    
    /* Sidebar */
    .sidebar {
      display: grid;
      grid-template-columns: var(--sidebar-template);
      gap: var(--sidebar-gap);
    }
    
    /* Split */
    .split {
      display: grid;
      grid-template-columns: var(--split-template);
      gap: var(--split-gap);
    }
    
    /* Switcher */
    .switcher {
      display: flex;
      flex-wrap: wrap;
      gap: var(--switcher-gap);
    }
    
    /* Reel */
    .reel {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: var(--reel-snap);
      gap: var(--reel-gap);
    }
  `;
}
```

---

## Type Generation Updates

### Update `packages/compiler/src/type-generator.ts`

Add type definitions for each new primitive:

```typescript
if (generateComponentTypes) {
  declarations.push('declare module "@cascade/react" {');
  // ... existing types ...
  
  // Box
  declarations.push('  export interface BoxProps extends Omit<HTMLAttributes<HTMLDivElement>, "style"> {');
  declarations.push('    padding?: SpaceToken | SpaceToken[];');
  declarations.push('    margin?: SpaceToken | SpaceToken[];');
  // ... more props ...
  declarations.push('  }');
  declarations.push('  export const Box: React.ComponentType<BoxProps>;');
  
  // Grid
  // ... similar pattern ...
  
  // Continue for all primitives
}
```

---

## Demo Application Updates

### Update `apps/demo/src/pages/PrimitivesDemo.tsx`

Add examples for each new primitive:

```typescript
export function PrimitivesDemo() {
  return (
    <Stack spacing="xl">
      <h2>Layout Primitives</h2>
      
      {/* Existing: Stack, Cluster, Frame */}
      
      {/* Box */}
      <section>
        <h3>Box</h3>
        <Box padding="lg" background="blue" borderRadius="md">
          Box content
        </Box>
      </section>
      
      {/* Grid */}
      <section>
        <h3>Grid</h3>
        <Grid columns={3} gap="md">
          {/* Grid items */}
        </Grid>
      </section>
      
      {/* Continue for all primitives */}
    </Stack>
  );
}
```

---

## Timeline

### Phase 1: Foundation (Week 1-2)
- **Day 1-3**: Box component
- **Day 4-7**: Grid component
- **Day 8-9**: Center component
- **Day 10**: Testing and refinement

### Phase 2: Common Patterns (Week 3)
- **Day 11-13**: Sidebar component
- **Day 14-15**: Split component
- **Day 16**: Testing and refinement

### Phase 3: Enhanced Patterns (Week 4)
- **Day 17-18**: Switcher component
- **Day 19-20**: Reel component
- **Day 21**: Testing and refinement

### Phase 4: Specialized (Week 5)
- **Day 22-23**: Cover component
- **Day 24**: Imposter component
- **Day 25**: Final testing and documentation

**Total Estimated Time**: 5 weeks (Phases 1-4)

---

## Success Metrics

### Quantitative
- **Coverage**: 30% → 85-95% of common layout patterns
- **Primitives**: 3 → 9-11 primitives
- **Every Layout parity**: 27% → 80-90%

### Qualitative
- Comprehensive layout system
- Consistent API across primitives
- Good documentation and examples
- Motion-runtime integration works seamlessly

---

## Dependencies

### Required
- Existing `@cascade/react` infrastructure
- `@cascade/tokens` for spacing tokens
- `@cascade/core` for foundation CSS
- StyleX for styling

### Optional
- Motion-runtime for animation examples
- Demo app for visual examples

---

## Risks & Mitigations

### Risk 1: API Inconsistency
**Mitigation**: Follow established patterns from Stack/Cluster/Frame

### Risk 2: Bundle Size
**Mitigation**: Tree-shakeable exports, only import what you use

### Risk 3: Complexity
**Mitigation**: Keep APIs simple, well-documented, tested

### Risk 4: Maintenance Burden
**Mitigation**: Comprehensive tests, clear documentation, consistent patterns

---

## Open Questions

1. **Should we support CSS Grid subgrid?**
   - Pro: More powerful layouts
   - Con: Limited browser support
   - **Decision**: No, wait for better support

2. **Should we add container queries support?**
   - Pro: More flexible responsive design
   - Con: Additional complexity
   - **Decision**: Evaluate in Phase 2

3. **How to handle nested primitives?**
   - Pro: More flexible compositions
   - Con: Potential conflicts
   - **Decision**: Support nesting, document best practices

---

## Related Plans

- **Motion-Runtime Integration**: Primitives should work seamlessly with motion-runtime
- **Styled-Components Integration**: Primitives should be compatible with styled-components
- **Documentation**: Comprehensive docs needed for all primitives

---

## Phase 2.5: Animation Support Enhancement ✅ COMPLETE

**Status**: ✅ **COMPLETED** (2025-01-12)

Animation support has been added to most layout primitives, enabling smooth layout transitions when properties change.

### Completed Animation Support

- ✅ **Flex** (`packages/react/src/Flex.tsx`)
  - Container transitions for `direction`, `wrap` changes
  - Batch child transitions for `justify`, `align` changes
  - Uses `useLayoutTransition` + `useBatchLayoutTransition`
  
- ✅ **Stack** (`packages/react/src/Stack.tsx`)
  - Container transitions for spacing/gap changes
  - Batch child transitions for item reordering
  
- ✅ **Cluster** (`packages/react/src/Cluster.tsx`)
  - Container transitions for wrapping/spacing changes
  - Batch child transitions for item reordering
  
- ✅ **Grid** (`packages/react/src/Grid.tsx`)
  - Container transitions for column/row/gap changes
  - Batch child transitions for grid item reordering
  
- ✅ **Sidebar** (`packages/react/src/Sidebar.tsx`)
  - Container transitions for sidebar width/position changes
  - Batch child transitions for sidebar/content reordering
  
- ✅ **Split** (`packages/react/src/Split.tsx`)
  - Container transitions for fraction/gutter changes
  - Batch child transitions for split reordering
  
- ✅ **Center** (`packages/react/src/Center.tsx`)
  - Container transitions for max-width/padding changes
  
- ✅ **Box** (`packages/react/src/Box.tsx`)
  - Container transitions for padding/margin/size changes
  - Uses `useLayoutTransition`
  
- ✅ **Frame** (`packages/react/src/Frame.tsx`)
  - Container transitions for aspect ratio changes
  - Uses `useLayoutTransition`

### Implementation Pattern

All animated primitives follow this pattern:

```typescript
interface PrimitiveProps {
  animate?: boolean | LayoutTransitionConfig;
  // ... other props
}

// In component:
const internalRef = useRef<HTMLElement>(null);
const layoutTransitionConfig = animate ? (typeof animate === 'boolean' ? { enabled: animate } : animate) : undefined;

useLayoutTransition(internalRef, layoutTransitionConfig);

// For primitives with children:
useBatchLayoutTransition(childRefs, layoutTransitionConfig);
```

### API Design

- `animate?: boolean | LayoutTransitionConfig` prop on all animated primitives
- Supports boolean (enable/disable) or full config object
- Configurable duration, easing, origin, callbacks
- Zero-config defaults: 300ms duration, standard easing

---

## Next Steps

1. ✅ **Phase 1 Complete**: Box, Grid, and Center components implemented
2. ✅ **Phase 2 Complete**: Sidebar and Split components implemented
3. ✅ **Phase 2.5 Complete**: Animation support added to all 9 primitives (Flex, Stack, Cluster, Grid, Sidebar, Split, Center, Box, Frame)
4. ✅ **Phase 3 Complete**: Switcher and Reel components implemented with animation support
5. ✅ **Phase 4 Complete**: Cover and Imposter components implemented with animation support
6. ✅ **Showcase Updated**: Switcher and Reel examples added to layout showcase
7. **Gather feedback** on all phases and animation support
8. **Documentation**: Create comprehensive documentation for all primitives

---

*Plan Created: 2025-01-12*
*Phase 1 Completed: 2025-01-12*
*Phase 2 Completed: 2025-01-12*
*Phase 2.5 Completed: 2025-01-12*
*Phase 3 Completed: 2025-01-12*
*Phase 4 Completed: 2025-01-12*
*Based on: evals/motion-runtime/layout-primitives-gap-analysis.md*
*Status: Complete - All phases implemented with animation support*


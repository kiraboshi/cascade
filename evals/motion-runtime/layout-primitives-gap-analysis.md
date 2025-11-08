---
title: Layout Primitives Gap Analysis
type: evaluation
status: draft
created_at: 2025-01-12
scope: react
evaluator: ai-agent
subject: Missing layout primitives needed for comprehensive layout system
---

# Layout Primitives Gap Analysis

## Executive Summary

Cascade currently provides **3 layout primitives** (`Stack`, `Cluster`, `Frame`), which cover basic vertical/horizontal flex layouts and aspect ratios. To be a comprehensive layout system comparable to Every Layout, Braid, or other modern design systems, **6-8 additional primitives** should be added.

**Current Coverage**: ~30% of common layout patterns
**Recommended Coverage**: 9-11 primitives total

---

## Currently Implemented Primitives

### ✅ Stack
- **Purpose**: Vertical flex container with spacing
- **Status**: Complete
- **Use Cases**: Forms, lists, card layouts, vertical navigation

### ✅ Cluster
- **Purpose**: Horizontal flex container with wrapping
- **Status**: Complete
- **Use Cases**: Tags, buttons, horizontal navigation, inline lists

### ✅ Frame
- **Purpose**: Aspect ratio container
- **Status**: Complete
- **Use Cases**: Images, videos, responsive media containers

---

## Missing Primitives (High Priority)

### 1. Box ⚠️ **CRITICAL**

**Purpose**: Basic container primitive for padding, margin, background, border

**Why It's Needed**:
- Most fundamental primitive
- Used in almost every component
- Provides consistent spacing/visual treatment
- Foundation for other components

**Proposed API**:
```typescript
interface BoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  padding?: SpaceToken | SpaceToken[];
  margin?: SpaceToken | SpaceToken[];
  background?: string;
  border?: string;
  borderRadius?: string;
  as?: keyof JSX.IntrinsicElements;
}
```

**Use Cases**:
- Card containers
- Section wrappers
- Spacing utilities
- Visual containers

**Priority**: **HIGHEST** - Foundation primitive

---

### 2. Grid ⚠️ **HIGH PRIORITY**

**Purpose**: CSS Grid container with token-based gaps

**Why It's Needed**:
- Two-dimensional layouts
- Complex responsive grids
- Card grids, galleries
- Form layouts

**Proposed API**:
```typescript
interface GridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  columns?: number | string | number[]; // Responsive columns
  gap?: SpaceToken | SpaceToken[];
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  responsive?: Record<string, Partial<Omit<GridProps, 'responsive'>>>;
  as?: keyof JSX.IntrinsicElements;
}
```

**Use Cases**:
- Card grids
- Image galleries
- Dashboard layouts
- Responsive form layouts

**Priority**: **HIGH** - Essential for modern layouts

---

### 3. Center ⚠️ **HIGH PRIORITY**

**Purpose**: Centering container (horizontal and/or vertical)

**Why It's Needed**:
- Common centering pattern
- Modal dialogs
- Hero sections
- Loading states

**Proposed API**:
```typescript
interface CenterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  centerText?: boolean;
  maxWidth?: string;
  padding?: SpaceToken | SpaceToken[];
  as?: keyof JSX.IntrinsicElements;
}
```

**Use Cases**:
- Centered content blocks
- Modal containers
- Hero sections
- Loading spinners

**Priority**: **HIGH** - Very common pattern

---

### 4. Sidebar ⚠️ **MEDIUM-HIGH PRIORITY**

**Purpose**: Sidebar layout pattern (main content + sidebar)

**Why It's Needed**:
- Common layout pattern
- Documentation sites
- Dashboards
- Admin panels

**Proposed API**:
```typescript
interface SidebarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  side?: 'left' | 'right';
  sidebarWidth?: string;
  contentMin?: string; // Minimum content width
  gap?: SpaceToken;
  noStretch?: boolean; // Don't stretch sidebar to fill space
  responsive?: Record<string, Partial<Omit<SidebarProps, 'responsive'>>>;
  as?: keyof JSX.IntrinsicElements;
}
```

**Use Cases**:
- Documentation layouts
- Dashboard sidebars
- Admin panels
- Article layouts

**Priority**: **MEDIUM-HIGH** - Common but not universal

---

### 5. Split ⚠️ **MEDIUM PRIORITY**

**Purpose**: Two-column responsive layout

**Why It's Needed**:
- Two-column layouts
- Responsive split views
- Comparison views

**Proposed API**:
```typescript
interface SplitProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  fraction?: string; // e.g., '1/2', '1/3', '2/3'
  gutter?: SpaceToken;
  switchTo?: 'stack' | 'none'; // Stack on mobile
  threshold?: string; // Breakpoint to switch
  as?: keyof JSX.IntrinsicElements;
}
```

**Use Cases**:
- Two-column content
- Comparison views
- Split forms
- Responsive layouts

**Priority**: **MEDIUM** - Useful but can be achieved with Grid

---

## Missing Primitives (Medium Priority)

### 6. Switcher ⚠️ **MEDIUM PRIORITY**

**Purpose**: Responsive container that switches between horizontal/vertical

**Why It's Needed**:
- Responsive navigation
- Button groups
- Flexible layouts

**Proposed API**:
```typescript
interface SwitcherProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  threshold?: string; // Breakpoint to switch
  limit?: number; // Max items before wrapping
  gap?: SpaceToken;
  as?: keyof JSX.IntrinsicElements;
}
```

**Use Cases**:
- Responsive navigation
- Button groups
- Flexible card layouts

**Priority**: **MEDIUM** - Nice-to-have

---

### 7. Reel ⚠️ **MEDIUM PRIORITY**

**Purpose**: Horizontal scrolling container

**Why It's Needed**:
- Horizontal scrolling lists
- Image carousels
- Card reels
- Mobile-friendly scrolling

**Proposed API**:
```typescript
interface ReelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  itemWidth?: string; // Fixed width for items
  gap?: SpaceToken;
  snap?: boolean; // Snap scrolling
  as?: keyof JSX.IntrinsicElements;
}
```

**Use Cases**:
- Image galleries
- Card carousels
- Horizontal navigation
- Mobile scrolling lists

**Priority**: **MEDIUM** - Useful for mobile patterns

---

### 8. Cover ⚠️ **LOW-MEDIUM PRIORITY**

**Purpose**: Full-height layout with header/footer

**Why It's Needed**:
- Full-page layouts
- Hero sections
- App shell layouts

**Proposed API**:
```typescript
interface CoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  centered?: ReactNode; // Centered content
  header?: ReactNode;
  footer?: ReactNode;
  minHeight?: string;
  as?: keyof JSX.IntrinsicElements;
}
```

**Use Cases**:
- Full-page layouts
- Hero sections
- App shells
- Landing pages

**Priority**: **LOW-MEDIUM** - Can be achieved with Stack + Center

---

### 9. Imposter ⚠️ **LOW PRIORITY**

**Purpose**: Centered overlay/modal container

**Why It's Needed**:
- Modal dialogs
- Overlays
- Centered popups

**Proposed API**:
```typescript
interface ImposterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  margin?: SpaceToken;
  breakout?: boolean; // Break out of container
  as?: keyof JSX.IntrinsicElements;
}
```

**Use Cases**:
- Modal dialogs
- Overlays
- Popups
- Tooltips

**Priority**: **LOW** - Can be achieved with Center + positioning

---

## Priority Ranking

### Phase 1: Foundation (Critical)
1. **Box** - Foundation primitive
2. **Grid** - Essential for modern layouts
3. **Center** - Very common pattern

### Phase 2: Common Patterns (High Value)
4. **Sidebar** - Common layout pattern
5. **Split** - Two-column layouts

### Phase 3: Enhanced Patterns (Nice-to-Have)
6. **Switcher** - Responsive flexibility
7. **Reel** - Mobile scrolling patterns

### Phase 4: Specialized (Low Priority)
8. **Cover** - Full-page layouts
9. **Imposter** - Overlay/modal patterns

---

## Integration with Motion-Runtime

**All primitives should**:
- ✅ Accept `style` prop for motion-runtime CSS variables
- ✅ Support polymorphic `as` prop
- ✅ Use CSS custom properties internally
- ✅ Work with motion-runtime hooks
- ✅ Support responsive props

**Example Integration**:
```typescript
import { Grid } from '@cascade/react';
import { useMotionValue } from '@cascade/motion-runtime';

function AnimatedGrid() {
  const opacity = useMotionValue(0, { property: 'opacity' });
  
  useEffect(() => {
    opacity.animateTo(1, { duration: 300 });
  }, [opacity]);
  
  return (
    <Grid
      columns={3}
      gap="md"
      style={{ opacity: `var(${opacity.cssVarName})` }}
    >
      {/* Grid items */}
    </Grid>
  );
}
```

---

## Comparison to Other Systems

### Every Layout (Reference)
- ✅ Stack (implemented)
- ✅ Cluster (implemented)
- ✅ Frame (implemented)
- ❌ Box (missing)
- ❌ Center (missing)
- ❌ Sidebar (missing)
- ❌ Split (missing)
- ❌ Switcher (missing)
- ❌ Reel (missing)
- ❌ Cover (missing)
- ❌ Imposter (missing)

**Coverage**: 3/11 (27%)

### Braid Design System
- ✅ Stack (implemented)
- ✅ Cluster (similar to Inline)
- ✅ Frame (similar to AspectRatio)
- ❌ Box (missing)
- ❌ Grid (missing)
- ❌ Center (missing)
- ❌ Sidebar (missing)

**Coverage**: ~40% (estimated)

---

## Recommendations

### Immediate (Phase 1)
1. **Add Box primitive** - Foundation for all other components
2. **Add Grid primitive** - Essential for modern layouts
3. **Add Center primitive** - Very common pattern

**Impact**: Would cover ~70% of common layout needs

### Short-term (Phase 2)
4. **Add Sidebar primitive** - Common pattern
5. **Add Split primitive** - Two-column layouts

**Impact**: Would cover ~85% of common layout needs

### Long-term (Phase 3+)
6. **Add Switcher, Reel** - Enhanced patterns
7. **Add Cover, Imposter** - Specialized patterns

**Impact**: Would cover ~95% of layout needs

---

## Implementation Considerations

### Consistency
- All primitives should follow same pattern as Stack/Cluster/Frame
- Use StyleX for base styles
- CSS custom properties for runtime values
- Token-based spacing
- Responsive prop support
- Polymorphic `as` prop

### Testing
- Unit tests for each primitive
- Visual regression tests
- Responsive behavior tests
- Motion-runtime integration tests

### Documentation
- API reference for each primitive
- Usage examples
- Motion-runtime integration examples
- Responsive behavior guide

---

## Conclusion

Cascade has a **solid foundation** with Stack, Cluster, and Frame, but needs **6-8 additional primitives** to be a comprehensive layout system. The highest priority additions are:

1. **Box** (critical foundation)
2. **Grid** (essential for modern layouts)
3. **Center** (very common pattern)

Adding these three would significantly improve Cascade's layout capabilities and make it more viable as a complete layout system for styled-components and other CSS-in-JS solutions.

---

*Evaluation Date: 2025-01-12*
*Current Primitives: 3 (Stack, Cluster, Frame)*
*Recommended Total: 9-11 primitives*


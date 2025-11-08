# Native CSS Container Queries Viability Assessment

## Executive Summary

**Native CSS Container Queries are HIGHLY VIABLE** for Cascade, with excellent browser support and perfect architectural fit. The system can adopt native container queries with minimal changes and significant benefits.

**Verdict**: ✅ **RECOMMENDED** - Native container queries are production-ready and align perfectly with Cascade's architecture.

---

## Browser Support Analysis

### Current Browser Support (2025)

**Container Queries Support**:
- ✅ **Chrome/Edge**: 105+ (September 2022)
- ✅ **Firefox**: 110+ (February 2023)
- ✅ **Safari**: 16.0+ (September 2022)
- ✅ **Opera**: 91+ (September 2022)

**Global Support**: **~95%+** of users (as of 2025)

### Cascade's Browser Support Requirements

From documentation:
- Chrome 51+ (container queries: 105+)
- Firefox 55+ (container queries: 110+)
- Safari 12.1+ (container queries: 16.0+)
- Edge 15+ (container queries: 105+)

**Analysis**: Cascade's stated minimums are older than container query support. However:
- Container queries are **additive** - they don't break existing functionality
- Can be used with **progressive enhancement**
- Fallback to viewport-based responsive works fine

**Recommendation**: Use native container queries with viewport fallback for older browsers.

---

## Architectural Compatibility

### ✅ Perfect Fit with Cascade's Architecture

**1. Foundation CSS Generation**

Cascade generates CSS via `packages/core/src/foundation.ts`:

```typescript
function generateLayoutsLayer(): string {
  return `
    .grid {
      display: grid;
      container-type: inline-size;  // ✅ Can add this
      gap: var(--grid-gap, 0);
      grid-template-columns: var(--grid-columns, repeat(3, 1fr));
    }
    
    @container (min-width: 30rem) {
      .grid[data-container-min-width-30rem] {
        --grid-columns: repeat(2, 1fr);
      }
    }
  `;
}
```

**Compatibility**: ✅ **PERFECT**
- Foundation CSS is plain CSS strings
- Container queries are standard CSS
- No build tool changes needed
- No StyleX conflicts

**2. StyleX Integration**

StyleX handles component-level styles, not layout primitives CSS:

```typescript
// Component styles (StyleX)
const gridStyles = stylex.create({
  base: {
    display: 'grid',
    // StyleX doesn't need to know about container queries
  },
});

// Foundation CSS handles container queries
// ✅ No conflict
```

**Compatibility**: ✅ **NO CONFLICTS**
- StyleX compiles component styles
- Foundation CSS handles layout rules
- Container queries in foundation CSS don't affect StyleX

**3. CSS Custom Properties**

Cascade uses CSS custom properties extensively:

```css
.grid {
  --grid-columns: repeat(3, 1fr);
}

@container (min-width: 30rem) {
  .grid[data-container-min-width-30rem] {
    --grid-columns: repeat(2, 1fr);  /* ✅ Override via CSS variable */
  }
}
```

**Compatibility**: ✅ **PERFECT**
- Container queries can override CSS custom properties
- Matches existing pattern
- No changes needed to component code

**4. Data Attribute Pattern**

Cascade already uses data attributes for responsive:

```typescript
// Component generates data attributes
data-responsive="md:columns-2"

// CSS targets them
@media (width >= 64rem) {
  [data-responsive*="md:columns-2"] {
    --grid-columns: repeat(2, 1fr);
  }
}
```

**Container Query Pattern** (similar):
```typescript
// Component generates data attributes
data-container-min-width-30rem="true"

// CSS targets them
@container (min-width: 30rem) {
  .grid[data-container-min-width-30rem] {
    --grid-columns: repeat(2, 1fr);
  }
}
```

**Compatibility**: ✅ **CONSISTENT PATTERN**
- Same data-attribute approach
- Familiar to developers
- Easy to implement

---

## Implementation Approach

### Phase 1: Add Container Query Support (Non-Breaking)

**1. Update Foundation CSS Generation**

```typescript
// packages/core/src/foundation.ts

function generateLayoutsLayer(): string {
  return `
    .grid {
      display: grid;
      container-type: inline-size;  // ✅ Add container type
      gap: var(--grid-gap, 0);
      grid-template-columns: var(--grid-columns, repeat(3, 1fr));
    }
    
    /* Container query rules */
    @container (min-width: 20rem) {
      .grid[data-container-min-width-20rem] {
        --grid-columns: repeat(2, 1fr);
      }
    }
    
    @container (min-width: 40rem) {
      .grid[data-container-min-width-40rem] {
        --grid-columns: repeat(3, 1fr);
      }
    }
  `;
}
```

**2. Update Component Props**

```typescript
// packages/react/src/Grid.tsx

export interface GridProps {
  columns?: number | string;
  
  // New: Container query support
  containerQueries?: {
    minWidth?: Record<string, Partial<GridProps>>;
    maxWidth?: Record<string, Partial<GridProps>>;
  };
  
  // Existing: Viewport-based (still works)
  responsive?: Record<string, Partial<GridProps>>;
}
```

**3. Generate Data Attributes**

```typescript
// In Grid component
const containerAttrs: string[] = [];
if (containerQueries?.minWidth) {
  for (const [width, overrides] of Object.entries(containerQueries.minWidth)) {
    containerAttrs.push(`container-min-width-${width.replace(/\s+/g, '-')}`);
    // Generate responsive attrs for overrides
  }
}
const dataContainer = containerAttrs.length > 0 ? containerAttrs.join(' ') : undefined;
```

**4. Apply to Element**

```typescript
<Component
  data-container-min-width-30rem={containerQueries?.minWidth?.['30rem'] ? 'true' : undefined}
  // ... other props
/>
```

**Compatibility**: ✅ **BACKWARD COMPATIBLE**
- Existing `responsive` prop still works
- New `containerQueries` prop is optional
- No breaking changes

---

## Performance Considerations

### ✅ Native Container Queries Performance

**Advantages**:
- ✅ **Zero JavaScript overhead** - Pure CSS
- ✅ **Browser-optimized** - Native implementation
- ✅ **Better performance** than ResizeObserver
- ✅ **No memory leaks** - No observers to clean up
- ✅ **Works with CSS-only** - No JS required

**Comparison**:

| Approach | JavaScript | Performance | Memory |
|----------|-----------|-------------|--------|
| **Native Container Queries** | None | Excellent | None |
| **ResizeObserver** | Required | Good | Observer instances |
| **Media Queries** | None | Excellent | None (but viewport-based) |

**Verdict**: ✅ **SUPERIOR PERFORMANCE** - Native container queries are faster and more efficient than ResizeObserver.

---

## Fallback Strategy

### Progressive Enhancement Approach

**For Browsers Without Container Query Support**:

```css
/* Base styles (all browsers) */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

/* Container queries (modern browsers) */
@container (min-width: 30rem) {
  .grid[data-container-min-width-30rem] {
    --grid-columns: repeat(2, 1fr);
  }
}

/* Fallback: Viewport-based (older browsers) */
@media (min-width: 64rem) {
  .grid[data-responsive*="md:columns-2"] {
    --grid-columns: repeat(2, 1fr);
  }
}
```

**Component Code**:
```typescript
<Grid 
  columns={1}
  // Container queries (modern browsers)
  containerQueries={{
    minWidth: { '30rem': { columns: 2 } }
  }}
  // Fallback: Viewport-based (older browsers)
  responsive={{
    md: { columns: 2 }
  }}
/>
```

**Result**:
- Modern browsers: Use container queries (better behavior)
- Older browsers: Fall back to viewport queries (still works)

**Verdict**: ✅ **GRACEFUL DEGRADATION** - Works in all browsers with progressive enhancement.

---

## StyleX Compatibility

### ✅ No StyleX Conflicts

**StyleX Limitations** (if any):
- StyleX compiles component styles at build time
- Container queries are runtime CSS (in foundation CSS)
- **No conflict** - Different layers

**Foundation CSS** (where container queries live):
- Generated at build time
- Plain CSS strings
- No StyleX involvement
- ✅ **Fully compatible**

**Component Styles** (StyleX):
- Component-level styles
- Don't need container queries
- ✅ **No changes needed**

**Verdict**: ✅ **FULLY COMPATIBLE** - StyleX and container queries don't interact.

---

## Build System Compatibility

### ✅ No Build Tool Changes Needed

**Current Build Process**:
1. Foundation CSS generated via `foundation.ts`
2. CSS written to file
3. Injected into app

**With Container Queries**:
1. Foundation CSS generated via `foundation.ts` (same)
2. CSS includes `@container` rules (just more CSS)
3. Injected into app (same)

**No Changes Needed**:
- ✅ No Babel plugin changes
- ✅ No Vite config changes
- ✅ No build tool updates
- ✅ Just add CSS rules

**Verdict**: ✅ **ZERO BUILD CHANGES** - Container queries are just CSS.

---

## Comparison: Native vs ResizeObserver

### Native Container Queries (Option 1)

**Pros**:
- ✅ Zero JavaScript overhead
- ✅ Better performance
- ✅ Browser-optimized
- ✅ No memory management
- ✅ Works with CSS-only
- ✅ Standard web API

**Cons**:
- ⚠️ Requires modern browsers (95%+ support)
- ⚠️ Need fallback for older browsers

**Verdict**: ✅ **RECOMMENDED** - Better performance, cleaner code, standard API.

### ResizeObserver (Option 2 - Current Switcher)

**Pros**:
- ✅ Works in all browsers
- ✅ Proven approach (Switcher works)

**Cons**:
- ⚠️ JavaScript overhead
- ⚠️ More complex code
- ⚠️ Memory management needed
- ⚠️ Observer cleanup required
- ⚠️ Not standard CSS

**Verdict**: ⚠️ **FALLBACK ONLY** - Use only if native container queries aren't viable.

---

## Recommended Implementation Strategy

### Hybrid Approach (Best of Both Worlds)

**1. Use Native Container Queries** (Primary)
- For Grid, Sidebar, Split
- Modern browsers get optimal behavior
- Zero JavaScript overhead

**2. Provide Viewport Fallback** (Progressive Enhancement)
- Older browsers use viewport-based responsive
- Still works, just less optimal
- No breaking changes

**3. Keep ResizeObserver for Switcher** (Special Case)
- Switcher needs dynamic threshold detection
- Container queries work, but ResizeObserver is fine
- Can migrate later if desired

**Example Implementation**:

```typescript
// Grid component
export interface GridProps {
  columns?: number;
  
  // Container queries (preferred, modern browsers)
  containerQueries?: {
    minWidth?: Record<string, Partial<GridProps>>;
  };
  
  // Viewport fallback (older browsers)
  responsive?: Record<string, Partial<GridProps>>;
}

// Component generates both
const containerAttrs = generateContainerAttrs(containerQueries);
const responsiveAttrs = generateResponsiveAttrs(responsive);

<Component
  data-container-min-width-30rem={containerAttrs.includes('30rem') ? 'true' : undefined}
  data-responsive={responsiveAttrs.join(' ')}
/>
```

**CSS**:
```css
/* Container queries (modern browsers) */
@container (min-width: 30rem) {
  .grid[data-container-min-width-30rem] {
    --grid-columns: repeat(2, 1fr);
  }
}

/* Viewport fallback (older browsers) */
@media (min-width: 64rem) {
  .grid[data-responsive*="md:columns-2"] {
    --grid-columns: repeat(2, 1fr);
  }
}
```

---

## Migration Path

### Phase 1: Add Container Query Support (Non-Breaking)

**Timeline**: 1-2 weeks

**Steps**:
1. Update `foundation.ts` to generate container query CSS
2. Add `containerQueries` prop to Grid, Sidebar, Split
3. Generate container query data attributes
4. Test in modern browsers
5. Document usage

**Risk**: Low - Backward compatible, optional feature

### Phase 2: Enhance Documentation

**Timeline**: 3-5 days

**Steps**:
1. Document container query API
2. Add examples
3. Explain when to use container vs viewport queries
4. Update migration guide

### Phase 3: Consider Default Behavior (Future)

**Timeline**: Future consideration

**Options**:
- Make container queries default for certain primitives
- Provide prop to choose behavior
- Deprecate viewport-only approach (long-term)

---

## Conclusion

### ✅ Native CSS Container Queries are HIGHLY VIABLE

**Key Findings**:

1. **Browser Support**: ✅ **95%+** global support (2025)
2. **Architectural Fit**: ✅ **PERFECT** - Aligns with Cascade's CSS generation
3. **Performance**: ✅ **SUPERIOR** - Zero JavaScript overhead
4. **Compatibility**: ✅ **NO CONFLICTS** - Works with StyleX, foundation CSS
5. **Implementation**: ✅ **STRAIGHTFORWARD** - Just add CSS rules
6. **Backward Compatibility**: ✅ **MAINTAINED** - Can coexist with viewport queries

**Recommendation**: ✅ **IMPLEMENT NATIVE CONTAINER QUERIES**

**Priority Primitives**:
1. **Grid** - Highest value
2. **Sidebar** - High value
3. **Split** - High value

**Implementation Effort**: **LOW-MEDIUM** (1-2 weeks)
**Risk**: **LOW** (backward compatible, progressive enhancement)
**Impact**: **HIGH** (better performance, more flexible)

**Verdict**: Native container queries are **production-ready** and **highly recommended** for Cascade.

---

## Related

- [Container Queries Enhancement Rationale](./container-queries-enhancement-rationale.md)
- [Layout Primitives Reference](../reference/layout-primitives.md)
- [MDN: Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)


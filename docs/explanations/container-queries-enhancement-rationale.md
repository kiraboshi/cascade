# Container Queries Enhancement Rationale

## Why Expand Container Query Support Beyond Switcher?

Container queries enable components to respond to their **container's size** rather than the **viewport size**. This is a fundamental shift that makes components more reusable, flexible, and truly component-scoped.

---

## Current State

**Switcher** is the only primitive that uses container queries (via ResizeObserver):
- Responds to container width threshold
- Switches between horizontal/vertical layouts
- Component-scoped responsive behavior

**Other primitives** use viewport-based media queries:
- Grid, Sidebar, Split, etc. respond to viewport breakpoints
- Less flexible for reusable components
- Requires knowing viewport context

---

## The Problem with Viewport-Only Responsive Design

### Example: Grid Component in Different Contexts

**Current Behavior (Viewport-Based)**:
```tsx
// Grid always responds to viewport, not its container
<Grid columns={1} responsive={{ md: { columns: 2 } }}>
  {/* Always 2 columns when viewport > md, regardless of container size */}
</Grid>
```

**Problem Scenarios**:

1. **Sidebar Context**:
```tsx
<Sidebar sidebarWidth="20rem">
  <aside>Sidebar</aside>
  <main>
    {/* Grid in narrow sidebar content area */}
    <Grid columns={1} responsive={{ md: { columns: 2 } }}>
      {/* Problem: Grid thinks viewport is large, but container is narrow */}
      {/* Result: 2 columns crammed into narrow sidebar */}
    </Grid>
  </main>
</Sidebar>
```

2. **Modal/Dialog Context**:
```tsx
<Imposter maxWidth="600px">
  {/* Grid in narrow modal */}
  <Grid columns={1} responsive={{ md: { columns: 3 } }}>
    {/* Problem: Modal is 600px wide, but Grid uses viewport breakpoints */}
    {/* Result: 3 columns in 600px modal = too cramped */}
  </Grid>
</Imposter>
```

3. **Nested Layout Context**:
```tsx
<Split fraction="1/3">
  <div>
    {/* Grid in narrow split column */}
    <Grid columns={1} responsive={{ md: { columns: 2 } }}>
      {/* Problem: Column is ~33% of viewport, but Grid uses full viewport */}
      {/* Result: Layout doesn't adapt to actual available space */}
    </Grid>
  </div>
  <div>Other content</div>
</Split>
```

---

## Benefits of Container Query Support

### 1. True Component Reusability

**With Container Queries**:
```tsx
// Grid adapts to its container, not viewport
<Grid 
  columns={1} 
  containerQueries={{ 
    minWidth: { '30rem': { columns: 2 }, '60rem': { columns: 3 } }
  }}
>
  {/* Adapts based on container width, not viewport */}
</Grid>
```

**Benefits**:
- ✅ Works correctly in any container size
- ✅ No need to know parent context
- ✅ Truly reusable component
- ✅ Predictable behavior

### 2. Better Responsive Behavior

**Current (Viewport-Based)**:
```tsx
<Sidebar sidebarWidth="20rem">
  <aside>Sidebar</aside>
  <main>
    {/* Content area might be 800px wide on desktop */}
    {/* But Grid uses viewport breakpoints, not content area */}
    <Grid columns={1} responsive={{ md: { columns: 2 } }}>
      {/* Doesn't adapt to actual content area width */}
    </Grid>
  </main>
</Sidebar>
```

**With Container Queries**:
```tsx
<Sidebar sidebarWidth="20rem">
  <aside>Sidebar</aside>
  <main>
    {/* Grid adapts to content area width */}
    <Grid 
      columns={1} 
      containerQueries={{ 
        minWidth: { '40rem': { columns: 2 }, '60rem': { columns: 3 } }
      }}
    >
      {/* Adapts to actual content area, not viewport */}
    </Grid>
  </main>
</Sidebar>
```

### 3. More Flexible Layouts

**Example: Responsive Card Grid in Modal**:
```tsx
<Imposter maxWidth="800px">
  <Grid 
    columns={1}
    containerQueries={{
      minWidth: { 
        '30rem': { columns: 2 },
        '50rem': { columns: 3 }
      }
    }}
  >
    {/* Grid adapts to modal width (max 800px), not viewport */}
    {/* On mobile: 1 column */}
    {/* In 800px modal: 3 columns (if modal is wide enough) */}
  </Grid>
</Imposter>
```

**Without Container Queries**:
- Grid would use viewport breakpoints
- In 800px modal on desktop: might show 3 columns (viewport-based)
- But modal is only 800px wide = cramped layout

### 4. Better Sidebar Behavior

**Current Sidebar**:
```tsx
<Sidebar 
  sidebarWidth="20rem"
  responsive={{ md: { sidebarWidth: '0' } }}
>
  {/* Sidebar stacks on mobile (viewport-based) */}
</Sidebar>
```

**With Container Queries**:
```tsx
<Sidebar 
  sidebarWidth="20rem"
  containerQueries={{
    maxWidth: { '50rem': { sidebarWidth: '0' } }
  }}
>
  {/* Sidebar stacks when container is narrow */}
  {/* Works correctly even if Sidebar is nested in another container */}
</Sidebar>
```

### 5. Split Component Enhancement

**Current Split**:
```tsx
<Split 
  fraction="1/2"
  switchTo="stack"
  threshold="768px"  // Viewport-based
>
  {/* Stacks at viewport breakpoint, not container */}
</Split>
```

**With Container Queries**:
```tsx
<Split 
  fraction="1/2"
  containerQueries={{
    maxWidth: { '40rem': { switchTo: 'stack' } }
  }}
>
  {/* Stacks when container is narrow */}
  {/* Works correctly in nested contexts */}
</Split>
```

---

## Real-World Use Cases

### Use Case 1: Dashboard Widgets

```tsx
<Grid columns={2} gap="md">
  {/* Widget containers */}
  <Box>
    {/* Widget content - might be narrow */}
    <Grid 
      columns={1}
      containerQueries={{ minWidth: { '20rem': { columns: 2 } } }}
    >
      {/* Adapts to widget width, not dashboard width */}
    </Grid>
  </Box>
  <Box>
    {/* Another widget */}
  </Box>
</Grid>
```

**Benefit**: Widgets adapt to their container, not the dashboard viewport.

### Use Case 2: Article Layouts

```tsx
<Sidebar sidebarWidth="20rem">
  <aside>Table of Contents</aside>
  <article>
    {/* Article content area */}
    <Grid 
      columns={1}
      containerQueries={{ minWidth: { '40rem': { columns: 2 } } }}
    >
      {/* Image grid adapts to article width, not viewport */}
    </Grid>
  </article>
</Sidebar>
```

**Benefit**: Image grids adapt to article content width, not full viewport.

### Use Case 3: Nested Modals

```tsx
<Imposter maxWidth="600px">
  {/* First modal */}
  <Imposter maxWidth="400px">
    {/* Nested modal - only 400px wide */}
    <Grid 
      columns={1}
      containerQueries={{ minWidth: { '30rem': { columns: 2 } } }}
    >
      {/* Adapts to 400px modal, not viewport */}
    </Grid>
  </Imposter>
</Imposter>
```

**Benefit**: Layouts work correctly in nested contexts.

---

## Implementation Approach

### Option 1: Native CSS Container Queries (Preferred)

**When Available** (browser support improving):
```tsx
<Grid 
  columns={1}
  containerQueries={{
    minWidth: { 
      '30rem': { columns: 2 },
      '60rem': { columns: 3 }
    }
  }}
>
```

**CSS Generated**:
```css
.grid {
  container-type: inline-size;
}

@container (min-width: 30rem) {
  .grid[data-container-min-width-30rem] {
    --grid-columns: repeat(2, 1fr);
  }
}
```

**Benefits**:
- ✅ Native browser support
- ✅ Better performance
- ✅ No JavaScript overhead
- ✅ Works with CSS only

### Option 2: ResizeObserver Polyfill (Current Switcher Approach)

**For Broader Compatibility**:
- Use ResizeObserver (like Switcher)
- Set data attributes based on container size
- CSS targets data attributes

**Benefits**:
- ✅ Works in all browsers
- ✅ Proven approach (Switcher)
- ✅ Consistent with existing code

**Drawbacks**:
- ⚠️ JavaScript overhead
- ⚠️ More complex implementation

---

## Priority Primitives for Container Query Support

### High Priority

1. **Grid** ⚠️ **HIGHEST**
   - Most common use case
   - Often nested in containers
   - Would benefit significantly

2. **Sidebar** ⚠️ **HIGH**
   - Content area width varies
   - Nested components need container awareness
   - Common pattern

3. **Split** ⚠️ **HIGH**
   - Often nested
   - Stack behavior should be container-aware
   - Common pattern

### Medium Priority

4. **Box** ⚠️ **MEDIUM**
   - Less critical, but useful for padding/margin adjustments
   - Could adapt spacing based on container

5. **Center** ⚠️ **MEDIUM**
   - Max-width could adapt to container
   - Less critical use case

### Low Priority

6. **Stack, Cluster, Flex** ⚠️ **LOW**
   - Less common nested use cases
   - Viewport-based usually sufficient

---

## Migration Path

### Phase 1: Add Container Query Support (Non-Breaking)

```tsx
// Existing API still works
<Grid columns={1} responsive={{ md: { columns: 2 } }} />

// New container query API (optional)
<Grid 
  columns={1} 
  containerQueries={{ minWidth: { '30rem': { columns: 2 } } }}
/>
```

**Benefits**:
- ✅ Backward compatible
- ✅ Gradual adoption
- ✅ No breaking changes

### Phase 2: Enhance Documentation

- Document container query use cases
- Provide examples
- Explain when to use container vs viewport queries

### Phase 3: Consider Default Behavior

- Could make container queries default for certain primitives
- Or provide a prop to choose behavior

---

## Performance Considerations

### Native Container Queries
- ✅ Zero JavaScript overhead
- ✅ Browser-optimized
- ✅ Better performance than ResizeObserver

### ResizeObserver Approach
- ⚠️ JavaScript overhead
- ⚠️ More complex
- ✅ Works everywhere

**Recommendation**: Use native container queries when available, fallback to ResizeObserver.

---

## Conclusion

Expanding container query support beyond Switcher would:

1. ✅ **Improve component reusability** - Components work correctly in any container
2. ✅ **Enable better responsive behavior** - Adapt to actual available space
3. ✅ **Support nested layouts** - Work correctly in modals, sidebars, splits
4. ✅ **Provide more flexibility** - Component-scoped responsive design
5. ✅ **Match modern best practices** - Container queries are the future of responsive design

**Priority**: **HIGH** for Grid, Sidebar, Split
**Impact**: **SIGNIFICANT** - Would make Cascade primitives more flexible and reusable
**Effort**: **MEDIUM** - 1-2 weeks for high-priority primitives

---

## Related

- [Layout Primitives Reference](./reference/layout-primitives.md)
- [Container Queries MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [Every Layout - Container Queries](https://every-layout.dev/)


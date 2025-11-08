# Container Queries CSS Approach Issue Analysis

## Problem

The CSS-based container query approach is not working because of a fundamental misunderstanding of how CSS container queries work.

## Root Cause

### How CSS Container Queries Actually Work

CSS container queries evaluate container size **directly** - they don't need or use data attributes:

```css
@container (min-width: 30rem) {
  .grid {
    --grid-columns: repeat(2, 1fr);
  }
}
```

This rule fires automatically when the container is >= 30rem, regardless of any data attributes.

### What We Implemented (Incorrect)

We tried to combine container queries with data attributes:

```css
@container (min-width: 30rem) {
  .grid[data-container-min-width-30rem] {
    --grid-columns: var(--grid-columns-container-30rem);
  }
}
```

**Problems:**
1. **Data attributes are static** - They're set to "true" when the prop is provided, regardless of actual container size
2. **Container query already checks size** - The `@container` rule evaluates container size directly, so the data attribute is redundant
3. **CSS variables are set inline** - Inline styles have higher specificity than container query rules, so they override the container query styles

### Why Switcher Works

Switcher uses **ResizeObserver** to dynamically update data attributes based on actual container size:

```typescript
const resizeObserver = new ResizeObserver((entries) => {
  const width = entry.contentRect.width;
  setIsBelowThreshold(width < thresholdPx);
});
```

Then CSS uses the dynamically-set data attribute:

```css
.switcher[data-below-threshold="true"] {
  flex-direction: column;
}
```

## Solution: Use ResizeObserver (Like Switcher)

We need to implement container queries using ResizeObserver to dynamically set data attributes based on actual container size, then use regular CSS (not container queries) to apply styles based on those data attributes.

### Correct Approach

1. **Use ResizeObserver** to watch container size
2. **Dynamically set data attributes** based on actual container size
3. **Use regular CSS** (not container queries) to apply styles based on data attributes

This matches Switcher's proven approach and works in all browsers.

## Implementation Strategy

### Option 1: Pure CSS Container Queries (Not Viable)

**Why it doesn't work:**
- Can't dynamically specify breakpoints from props
- CSS container queries are static - they can't check for different breakpoints based on component props
- Would require generating CSS for every possible breakpoint combination (not feasible)

### Option 2: ResizeObserver + CSS (Recommended)

**How it works:**
1. Component uses ResizeObserver to watch container size
2. Dynamically sets data attributes based on actual container size
3. CSS uses data attributes to apply styles

**Benefits:**
- ✅ Works in all browsers
- ✅ Supports dynamic breakpoints from props
- ✅ Proven approach (Switcher)
- ✅ Consistent with existing code

**Drawbacks:**
- ⚠️ JavaScript overhead (minimal)
- ⚠️ More complex implementation

## Conclusion

The CSS-based container query approach doesn't work because:
1. CSS container queries can't dynamically check for different breakpoints based on props
2. Data attributes are static and don't reflect actual container size
3. We need ResizeObserver to dynamically update data attributes based on container size

**Recommendation:** Implement container queries using ResizeObserver (like Switcher) for Grid, Sidebar, and Split components.


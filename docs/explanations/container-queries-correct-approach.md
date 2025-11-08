# Container Queries Correct Approach

## The Problem with Current Implementation

We're using data attributes with container queries, but CSS container queries don't need data attributes - they check container size directly.

**Current (incorrect):**
```css
@container (min-width: 30rem) {
  .grid[data-container-min-width-30rem] {
    --grid-columns: var(--grid-columns-container-30rem);
  }
}
```

**Issues:**
1. Data attributes are static - they don't change based on container size
2. Container queries already check container size - data attributes are redundant
3. The CSS variable `--grid-columns-container-30rem` is set inline, but container queries need to override the base `--grid-columns` variable

## Correct Approach: Pure CSS Container Queries

CSS container queries work by checking container size directly. We should:

1. **Generate CSS container query rules for common breakpoints** (without data attributes)
2. **Use CSS custom properties that cascade** - container queries override base values
3. **Set CSS variables inline** based on props for the specific values needed
4. **Container queries automatically apply** when container size matches

### How It Should Work

**Foundation CSS:**
```css
.grid {
  container-type: inline-size;
  --grid-columns: repeat(3, 1fr); /* Base value */
}

/* Container query rules - no data attributes needed */
@container (min-width: 20rem) {
  .grid {
    --grid-columns: var(--grid-columns-20rem, var(--grid-columns));
  }
}

@container (min-width: 30rem) {
  .grid {
    --grid-columns: var(--grid-columns-30rem, var(--grid-columns-20rem, var(--grid-columns)));
  }
}

@container (min-width: 40rem) {
  .grid {
    --grid-columns: var(--grid-columns-40rem, var(--grid-columns-30rem, var(--grid-columns-20rem, var(--grid-columns))));
  }
}
```

**Component:**
```typescript
// When user specifies containerQueries, set CSS variables inline
if (containerQueries?.minWidth?.['30rem']) {
  style['--grid-columns-30rem'] = 'repeat(2, 1fr)';
}
```

**How it works:**
1. Base `--grid-columns` is `repeat(3, 1fr)`
2. When container is >= 20rem, container query checks for `--grid-columns-20rem` (if set)
3. When container is >= 30rem, container query checks for `--grid-columns-30rem` (if set), falling back to 20rem value
4. CSS variables cascade - larger breakpoints override smaller ones

## Implementation Strategy

1. **Generate CSS for common breakpoints** (20rem, 30rem, 40rem, 60rem, etc.) in foundation CSS
2. **Remove data attributes** from container query CSS rules
3. **Set CSS variables inline** based on props (component sets `--grid-columns-30rem` etc.)
4. **Container queries automatically apply** when container size matches

This approach:
- ✅ Uses pure CSS container queries (no JavaScript)
- ✅ Works with dynamic breakpoints from props
- ✅ No data attributes needed
- ✅ CSS automatically reloads/updates when container size changes


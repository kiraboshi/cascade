# Layout Primitives Philosophy

Understanding the design principles and philosophy behind Cascade's layout primitives.

---

## Why Layout Primitives?

Layout primitives solve common problems in web development:

1. **Consistency:** Standardized spacing, alignment, and layout patterns
2. **Efficiency:** Less custom CSS to write and maintain
3. **Responsiveness:** Built-in responsive behavior
4. **Accessibility:** Semantic HTML and proper structure

---

## Design Principles

### 1. CSS-First Approach

Layout primitives generate CSS custom properties (variables) rather than inline styles for most properties. This allows:

- CSS overrides and theming
- Better performance (CSS is faster than JavaScript)
- Separation of concerns

**Example:**

```tsx
<Stack spacing="md" />
// Generates: --stack-gap: var(--cascade-space-md);
```

### 2. Token-Based Spacing

All spacing uses design tokens from `@cascade/tokens`:

- Consistent spacing scale
- Easy theming
- Type-safe values

**Benefits:**
- No magic numbers
- Easy to update globally
- Consistent visual rhythm

### 3. Responsive by Default

All primitives support responsive behavior through data attributes:

```tsx
<Grid 
  columns={1}
  responsive={{ md: { columns: 2 } }}
/>
// Generates: data-responsive="md:columns-2"
```

**Why data attributes?**
- CSS can target them directly
- No JavaScript required for responsive behavior
- Better performance

### 4. Polymorphic Components

The `as` prop allows semantic HTML:

```tsx
<Stack as="nav" spacing="md">
  {/* Renders as <nav> instead of <div> */}
</Stack>
```

**Benefits:**
- Better accessibility
- Semantic HTML
- SEO-friendly

### 5. Progressive Enhancement

Layouts work without JavaScript:

- CSS handles responsive behavior
- Layouts degrade gracefully
- Core functionality doesn't depend on JS

---

## Architecture Decisions

### Why CSS Custom Properties?

CSS custom properties provide:

1. **Dynamic Values:** Can be changed at runtime
2. **Cascade:** Inherit and override naturally
3. **Performance:** Browser-optimized
4. **Theming:** Easy to create themes

### Why Data Attributes for Responsive?

Data attributes enable:

1. **CSS Targeting:** Direct CSS selectors
2. **No JavaScript:** Pure CSS responsive behavior
3. **Flexibility:** Multiple breakpoints in one attribute
4. **Performance:** No runtime JavaScript needed

### Why StyleX?

StyleX provides:

1. **Compile-time Optimization:** Styles compiled at build time
2. **Type Safety:** TypeScript support
3. **Zero Runtime:** No runtime CSS-in-JS overhead
4. **Scoped Styles:** Automatic style scoping

---

## Comparison with Alternatives

### vs. Custom CSS

**Layout Primitives:**
- ✅ Consistent patterns
- ✅ Less code to write
- ✅ Built-in responsive behavior
- ✅ Type-safe props

**Custom CSS:**
- ✅ Full control
- ✅ No component overhead
- ❌ More code to maintain
- ❌ Inconsistent patterns

### vs. CSS Frameworks (Bootstrap, Tailwind)

**Layout Primitives:**
- ✅ React components (not CSS classes)
- ✅ Type-safe props
- ✅ Composable
- ✅ Tree-shakeable

**CSS Frameworks:**
- ✅ Mature ecosystem
- ✅ Large community
- ❌ Larger bundle size
- ❌ Less flexible

### vs. CSS-in-JS Libraries

**Layout Primitives:**
- ✅ Compile-time optimization (StyleX)
- ✅ CSS custom properties
- ✅ Better performance
- ✅ No runtime overhead

**CSS-in-JS:**
- ✅ Dynamic styles
- ✅ Component-scoped
- ❌ Runtime overhead
- ❌ Larger bundle size

---

## Best Practices

### 1. Use Semantic HTML

```tsx
// Good
<Stack as="nav" spacing="md">
  <a href="/">Home</a>
</Stack>

// Avoid
<Stack spacing="md">
  <div onClick={handleClick}>Home</div>
</Stack>
```

### 2. Mobile-First Responsive Design

```tsx
// Good: Mobile-first
<Grid columns={1} responsive={{ md: { columns: 2 } }} />

// Avoid: Desktop-first
<Grid columns={3} responsive={{ sm: { columns: 1 } }} />
```

### 3. Combine Primitives for Complex Layouts

```tsx
// Good: Composed layout
<Stack spacing="lg">
  <Sidebar>...</Sidebar>
  <Grid columns={2}>...</Grid>
</Stack>

// Avoid: One giant custom component
<ComplexLayout>...</ComplexLayout>
```

### 4. Use Tokens, Not Magic Numbers

```tsx
// Good
<Stack spacing="md" />

// Avoid
<Stack spacing="1.5rem" />
```

---

## Future Considerations

### Planned Features

- Container queries support
- More layout patterns
- Enhanced animation options
- Better TypeScript inference

### Design Goals

1. **Performance:** Zero runtime overhead
2. **Flexibility:** Easy to extend and customize
3. **Accessibility:** WCAG compliant by default
4. **Developer Experience:** Great TypeScript support

---

## Related

- [Layout Primitives Reference](./reference/layout-primitives.md)
- [Layout Primitives Tutorial](./tutorials/layout-primitives.md)
- [CSS-First Philosophy](./css-first-philosophy.md)


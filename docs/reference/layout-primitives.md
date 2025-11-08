# Layout Primitives API Reference

Complete API reference for Cascade's layout primitive components. These components provide common layout patterns using CSS Grid, Flexbox, and modern CSS features.

---

## Overview

Layout primitives are React components that encapsulate common layout patterns. They use CSS custom properties (variables) for dynamic styling and support responsive design through data attributes.

**Key Features:**
- Token-based spacing system
- Responsive design support
- Polymorphic `as` prop for semantic HTML
- Optional layout transition animations
- TypeScript support

---

## Components

### Box

Basic container primitive for padding, margin, background, and border styling.

**Props:**

```typescript
interface BoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
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
  
  // Animation
  animate?: boolean | LayoutTransitionConfig;
  
  // Responsive
  responsive?: Record<string, Partial<Omit<BoxProps, 'responsive' | 'animate'>>>;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}
```

**Example:**

```tsx
<Box padding="md" background="#fff" borderRadius="md">
  Content
</Box>
```

---

### Stack

Vertical flex container with consistent spacing between children.

**Props:**

```typescript
interface StackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  spacing?: SpaceToken;
  align?: 'start' | 'center' | 'end' | 'stretch';
  animate?: boolean | LayoutTransitionConfig;
  responsive?: Record<string, Partial<Omit<StackProps, 'responsive' | 'animate'>>>;
  as?: keyof JSX.IntrinsicElements;
}
```

**Example:**

```tsx
<Stack spacing="md" align="center">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>
```

---

### Cluster

Horizontal flex container with wrapping and gap-based spacing.

**Props:**

```typescript
interface ClusterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  spacing?: SpaceToken;
  justify?: 'start' | 'center' | 'end' | 'between';
  detectWrapping?: boolean;
  animate?: boolean | LayoutTransitionConfig;
  as?: keyof JSX.IntrinsicElements;
}
```

**Example:**

```tsx
<Cluster spacing="md" justify="between">
  <button>Action 1</button>
  <button>Action 2</button>
  <button>Action 3</button>
</Cluster>
```

---

### Flex

General-purpose flexbox container with full control over direction, alignment, and wrapping.

**Props:**

```typescript
interface FlexProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  wrap?: boolean | 'wrap' | 'nowrap' | 'wrap-reverse';
  gap?: SpaceToken | SpaceToken[]; // Single or [row, column]
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | 'stretch';
  alignContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'stretch';
  animate?: boolean | LayoutTransitionConfig;
  responsive?: Record<string, Partial<Omit<FlexProps, 'responsive' | 'animate'>>>;
  as?: keyof JSX.IntrinsicElements;
}
```

**Example:**

```tsx
<Flex direction="row" gap="md" justify="between" wrap>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Flex>
```

---

### Grid

CSS Grid container with token-based gaps and flexible column/row configuration.

**Props:**

```typescript
interface GridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  columns?: number | string | number[]; // e.g., 3, "repeat(3, 1fr)", [1, 2, 3]
  rows?: number | string | number[];
  gap?: SpaceToken | SpaceToken[]; // Single or [row, column]
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  alignContent?: 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around';
  justifyContent?: 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around';
  autoFit?: boolean;
  minColumnWidth?: string;
  animate?: boolean | LayoutTransitionConfig;
  responsive?: Record<string, Partial<Omit<GridProps, 'responsive' | 'animate'>>>;
  as?: keyof JSX.IntrinsicElements;
}
```

**Example:**

```tsx
<Grid columns={3} gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

---

### Center

Centering container (horizontal and/or vertical) with optional max-width.

**Props:**

```typescript
interface CenterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  centerText?: boolean;
  centerChildren?: boolean;
  maxWidth?: string;
  minHeight?: string;
  padding?: SpaceToken | SpaceToken[];
  animate?: boolean | LayoutTransitionConfig;
  responsive?: Record<string, Partial<Omit<CenterProps, 'responsive' | 'animate'>>>;
  as?: keyof JSX.IntrinsicElements;
}
```

**Example:**

```tsx
<Center maxWidth="1200px" centerText>
  <h1>Centered Content</h1>
</Center>
```

---

### Sidebar

Sidebar layout pattern (main content + sidebar) with responsive stacking.

**Props:**

```typescript
interface SidebarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  side?: 'left' | 'right';
  sidebarWidth?: string; // e.g., "20rem", "300px"
  contentMin?: string;
  gap?: SpaceToken;
  noStretch?: boolean;
  sidebarFirst?: boolean;
  animate?: boolean | LayoutTransitionConfig;
  responsive?: Record<string, Partial<Omit<SidebarProps, 'responsive' | 'children' | 'animate'>>>;
  as?: keyof JSX.IntrinsicElements;
  children: [ReactNode, ReactNode]; // [sidebar, content] or [content, sidebar]
}
```

**Example:**

```tsx
<Sidebar side="left" sidebarWidth="20rem" gap="md">
  <aside>Sidebar</aside>
  <main>Content</main>
</Sidebar>
```

---

### Split

Two-column responsive layout with fraction-based sizing.

**Props:**

```typescript
interface SplitProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  fraction?: string; // e.g., '1/2', '1/3', '2/3', 'auto'
  gutter?: SpaceToken;
  switchTo?: 'stack' | 'none';
  threshold?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  animate?: boolean | LayoutTransitionConfig;
  responsive?: Record<string, Partial<Omit<SplitProps, 'responsive' | 'children' | 'animate'>>>;
  as?: keyof JSX.IntrinsicElements;
  children: [ReactNode, ReactNode];
}
```

**Example:**

```tsx
<Split fraction="1/3" gutter="md">
  <div>Left Column</div>
  <div>Right Column</div>
</Split>
```

---

### Switcher

Responsive container that switches between horizontal/vertical layouts based on threshold.

**Props:**

```typescript
interface SwitcherProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  threshold?: string; // e.g., '30rem', '768px'
  limit?: number;
  gap?: SpaceToken;
  justify?: 'start' | 'center' | 'end' | 'between';
  animate?: boolean | LayoutTransitionConfig;
  responsive?: Record<string, Partial<Omit<SwitcherProps, 'responsive' | 'animate'>>>;
  as?: keyof JSX.IntrinsicElements;
}
```

**Example:**

```tsx
<Switcher threshold="30rem" limit={3}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Switcher>
```

---

### Reel

Horizontal scrolling container with optional snap scrolling.

**Props:**

```typescript
interface ReelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  itemWidth?: string;
  gap?: SpaceToken;
  snap?: boolean;
  snapAlign?: 'start' | 'center' | 'end';
  scrollPadding?: string;
  animate?: boolean | LayoutTransitionConfig;
  responsive?: Record<string, Partial<Omit<ReelProps, 'responsive' | 'animate'>>>;
  as?: keyof JSX.IntrinsicElements;
}
```

**Example:**

```tsx
<Reel itemWidth="300px" gap="md" snap>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Reel>
```

---

### Frame

Aspect ratio container with object-fit support.

**Props:**

```typescript
interface FrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  ratio: `${number}/${number}`; // e.g., "16/9", "4/3"
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  animate?: boolean | LayoutTransitionConfig;
  as?: keyof JSX.IntrinsicElements;
}
```

**Example:**

```tsx
<Frame ratio="16/9" objectFit="cover">
  <img src="image.jpg" alt="Image" />
</Frame>
```

---

### Cover

Full-height layout with header/footer slots and centered content.

**Props:**

```typescript
interface CoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  centered?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  minHeight?: string;
  padding?: SpaceToken | SpaceToken[];
  animate?: boolean | LayoutTransitionConfig;
  responsive?: Record<string, Partial<Omit<CoverProps, 'responsive' | 'animate' | 'centered' | 'header' | 'footer' | 'children'>>>;
  as?: keyof JSX.IntrinsicElements;
}
```

**Example:**

```tsx
<Cover 
  minHeight="100vh"
  header={<header>Header</header>}
  centered={<main>Centered Content</main>}
  footer={<footer>Footer</footer>}
/>
```

---

### Imposter

Centered overlay/modal container that can break out of its container.

**Props:**

```typescript
interface ImposterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  margin?: SpaceToken;
  maxWidth?: string;
  maxHeight?: string;
  breakout?: boolean;
  animate?: boolean | LayoutTransitionConfig;
  responsive?: Record<string, Partial<Omit<ImposterProps, 'responsive' | 'animate'>>>;
  as?: keyof JSX.IntrinsicElements;
}
```

**Example:**

```tsx
<Imposter breakout margin="md" maxWidth="600px">
  <div>Modal Content</div>
</Imposter>
```

---

## Common Props

### Animation

All layout primitives support the `animate` prop for smooth layout transitions:

```typescript
animate?: boolean | LayoutTransitionConfig;

interface LayoutTransitionConfig {
  enabled?: boolean;
  duration?: number; // milliseconds
  easing?: string; // CSS easing function
}
```

**Example:**

```tsx
<Stack spacing="md" animate={{ duration: 300, easing: 'ease-in-out' }}>
  {/* Content */}
</Stack>
```

### Responsive Design

All primitives support responsive overrides via the `responsive` prop:

```typescript
responsive?: Record<string, Partial<ComponentProps>>;
```

The keys are breakpoint names (e.g., `'sm'`, `'md'`, `'lg'`), and values are partial props that override the base props at that breakpoint.

**Example:**

```tsx
<Stack 
  spacing="sm" 
  responsive={{
    md: { spacing: 'md' },
    lg: { spacing: 'lg' }
  }}
>
  {/* Content */}
</Stack>
```

Responsive overrides are applied via CSS data attributes. The component generates `data-responsive` attributes that CSS can target using attribute selectors.

### Polymorphic `as` Prop

All primitives support the `as` prop to render as different HTML elements:

```tsx
<Stack as="section" spacing="md">
  {/* Content */}
</Stack>
```

---

## Space Tokens

Layout primitives use space tokens from `@cascade/tokens`:

- `xs` - Extra small spacing
- `sm` - Small spacing
- `md` - Medium spacing (default)
- `lg` - Large spacing
- `xl` - Extra large spacing

---

## CSS Custom Properties

All layout primitives use CSS custom properties (variables) for dynamic styling. These can be overridden via CSS:

```css
.my-stack {
  --stack-gap: 2rem;
}
```

Common variable patterns:
- `--{component}-gap` - Spacing/gap value
- `--{component}-{property}` - Component-specific properties

---

## Related Documentation

- [Tutorial: Getting Started with Layout Primitives](./tutorials/layout-primitives.md)
- [How-to: Create Responsive Layouts](./how-to/create-responsive-layout.md)
- [Explanations: Layout Primitives Philosophy](./explanations/layout-primitives-philosophy.md)


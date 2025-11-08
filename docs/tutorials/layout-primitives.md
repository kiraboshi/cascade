# Layout Primitives Tutorial

Learn how to use Cascade's layout primitives to build responsive, accessible layouts. This tutorial will guide you through the core concepts and common patterns.

---

## Prerequisites

- Basic React knowledge
- Understanding of CSS Flexbox and Grid
- Cascade project set up

---

## What Are Layout Primitives?

Layout primitives are pre-built React components that encapsulate common layout patterns. Instead of writing custom CSS for every layout, you can use these components to quickly build consistent, responsive layouts.

**Benefits:**
- Consistent spacing and alignment
- Built-in responsive behavior
- Less custom CSS to maintain
- Type-safe props

---

## Step 1: Basic Stack Layout

Let's start with the simplest primitive: `Stack`. It arranges children vertically with consistent spacing.

```tsx
import { Stack } from '@cascade/react';

function MyComponent() {
  return (
    <Stack spacing="md">
      <h1>Title</h1>
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
    </Stack>
  );
}
```

**What's happening:**
- Children are stacked vertically
- `spacing="md"` adds medium spacing between items
- The component handles all the flexbox CSS

---

## Step 2: Horizontal Layouts with Cluster

`Cluster` arranges items horizontally with wrapping:

```tsx
import { Cluster } from '@cascade/react';

function Navigation() {
  return (
    <Cluster spacing="md" justify="between">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </Cluster>
  );
}
```

**Key differences from Stack:**
- Items flow horizontally
- `justify="between"` spreads items across the width
- Items wrap to new lines if needed

---

## Step 3: Grid Layouts

`Grid` provides powerful CSS Grid capabilities:

```tsx
import { Grid } from '@cascade/react';

function ProductGrid() {
  return (
    <Grid columns={3} gap="md">
      <ProductCard />
      <ProductCard />
      <ProductCard />
      <ProductCard />
      <ProductCard />
      <ProductCard />
    </Grid>
  );
}
```

**Features:**
- `columns={3}` creates a 3-column grid
- `gap="md"` adds spacing between grid items
- Items automatically flow into the grid

---

## Step 4: Responsive Design

All primitives support responsive behavior:

```tsx
import { Grid } from '@cascade/react';

function ResponsiveGrid() {
  return (
    <Grid 
      columns={1}
      gap="sm"
      responsive={{
        md: { columns: 2, gap: 'md' },
        lg: { columns: 3, gap: 'lg' }
      }}
    >
      {/* Items */}
    </Grid>
  );
}
```

**How it works:**
- Base props apply on mobile
- `responsive` object overrides props at breakpoints
- CSS data attributes enable breakpoint-specific styling

---

## Step 5: Complex Layouts

Combine primitives for complex layouts:

```tsx
import { Stack, Sidebar, Grid } from '@cascade/react';

function Dashboard() {
  return (
    <Stack spacing="lg">
      <header>Header</header>
      
      <Sidebar side="left" sidebarWidth="20rem" gap="lg">
        <nav>Navigation</nav>
        <main>
          <Grid columns={2} gap="md">
            <Card />
            <Card />
            <Card />
            <Card />
          </Grid>
        </main>
      </Sidebar>
      
      <footer>Footer</footer>
    </Stack>
  );
}
```

**Pattern:**
- `Stack` for vertical page structure
- `Sidebar` for main content area with sidebar
- `Grid` for card layouts

---

## Step 6: Centering Content

Use `Center` to center content horizontally:

```tsx
import { Center } from '@cascade/react';

function Hero() {
  return (
    <Center maxWidth="1200px" centerText>
      <h1>Welcome</h1>
      <p>Centered content with max width</p>
    </Center>
  );
}
```

---

## Step 7: Responsive Switcher

`Switcher` changes layout direction based on container width:

```tsx
import { Switcher } from '@cascade/react';

function ResponsiveCard() {
  return (
    <Switcher threshold="30rem" gap="md">
      <img src="image.jpg" alt="Card image" />
      <div>
        <h2>Card Title</h2>
        <p>Card description</p>
      </div>
    </Switcher>
  );
}
```

**Behavior:**
- Horizontal layout when container > 30rem
- Vertical layout when container ≤ 30rem
- Smooth transitions between states

---

## Step 8: Adding Animations

Enable smooth layout transitions:

```tsx
import { Stack } from '@cascade/react';

function AnimatedList() {
  const [items, setItems] = useState([1, 2, 3]);
  
  return (
    <Stack spacing="md" animate={{ duration: 300 }}>
      {items.map(item => (
        <div key={item}>Item {item}</div>
      ))}
    </Stack>
  );
}
```

**Animation features:**
- Smooth transitions when items are added/removed
- FLIP animation technique for optimal performance
- Configurable duration and easing

---

## Common Patterns

### Card Layout

```tsx
<Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="md">
  {cards.map(card => (
    <Box padding="md" borderRadius="md" key={card.id}>
      {card.content}
    </Box>
  ))}
</Grid>
```

### Navigation Bar

```tsx
<Cluster spacing="lg" justify="between" as="nav">
  <Logo />
  <Cluster spacing="md">
    <NavLink href="/">Home</NavLink>
    <NavLink href="/about">About</NavLink>
  </Cluster>
</Cluster>
```

### Modal/Dialog

```tsx
<Imposter breakout margin="md" maxWidth="600px">
  <Box padding="lg">
    <h2>Modal Title</h2>
    <p>Modal content</p>
  </Box>
</Imposter>
```

---

## Next Steps

- Explore the [API Reference](./reference/layout-primitives.md) for all available props
- Check out [How-to Guides](./how-to/) for specific use cases
- Read [Explanations](./explanations/) to understand the design philosophy

---

## Summary

You've learned:
- ✅ How to use Stack, Cluster, and Grid
- ✅ How to create responsive layouts
- ✅ How to combine primitives for complex layouts
- ✅ How to add animations
- ✅ Common layout patterns

Layout primitives make it easy to build consistent, responsive layouts without writing custom CSS for every component.


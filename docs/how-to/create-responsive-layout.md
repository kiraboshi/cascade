# How to Create Responsive Layouts

Learn how to use layout primitives to build layouts that adapt to different screen sizes.

---

## Problem

You need a layout that works on mobile, tablet, and desktop screens. Writing custom CSS media queries for every layout is time-consuming and error-prone.

---

## Solution

Use layout primitives with the `responsive` prop to create breakpoint-specific layouts.

---

## Basic Responsive Pattern

All layout primitives support responsive overrides:

```tsx
import { Grid } from '@cascade/react';

function ResponsiveGrid() {
  return (
    <Grid 
      columns={1}  // Mobile: 1 column
      gap="sm"
      responsive={{
        md: { columns: 2, gap: 'md' },  // Tablet: 2 columns
        lg: { columns: 3, gap: 'lg' }   // Desktop: 3 columns
      }}
    >
      {/* Items */}
    </Grid>
  );
}
```

**How it works:**
1. Base props (`columns={1}`, `gap="sm"`) apply on mobile
2. `responsive.md` overrides apply at medium breakpoint
3. `responsive.lg` overrides apply at large breakpoint

---

## Responsive Stack

Change spacing and alignment at different breakpoints:

```tsx
import { Stack } from '@cascade/react';

function ResponsiveStack() {
  return (
    <Stack 
      spacing="sm"
      align="start"
      responsive={{
        md: { spacing: 'md', align: 'center' },
        lg: { spacing: 'lg' }
      }}
    >
      {/* Items */}
    </Stack>
  );
}
```

---

## Responsive Sidebar

Sidebar layouts that stack on mobile:

```tsx
import { Sidebar } from '@cascade/react';

function ResponsiveSidebar() {
  return (
    <Sidebar 
      side="left"
      sidebarWidth="20rem"
      gap="md"
      responsive={{
        sm: { 
          sidebarWidth: '0',  // Stack on mobile
          side: undefined
        }
      }}
    >
      <aside>Sidebar</aside>
      <main>Content</main>
    </Sidebar>
  );
}
```

**Behavior:**
- Desktop: Sidebar on left, content on right
- Mobile: Sidebar and content stack vertically

---

## Responsive Switcher

Use Switcher for layouts that change direction:

```tsx
import { Switcher } from '@cascade/react';

function ResponsiveCard() {
  return (
    <Switcher 
      threshold="30rem"  // Switch at 30rem
      gap="md"
      responsive={{
        lg: { threshold: '40rem' }  // Different threshold on large screens
      }}
    >
      <img src="image.jpg" alt="Card" />
      <div>
        <h2>Title</h2>
        <p>Description</p>
      </div>
    </Switcher>
  );
}
```

---

## Responsive Grid with Auto-fit

Use `autoFit` for flexible column counts:

```tsx
import { Grid } from '@cascade/react';

function FlexibleGrid() {
  return (
    <Grid 
      columns={1}
      autoFit={false}
      responsive={{
        md: { 
          autoFit: true,
          minColumnWidth: '250px'
        }
      }}
    >
      {/* Items automatically fit based on available space */}
    </Grid>
  );
}
```

**Behavior:**
- Mobile: Single column
- Tablet+: Auto-fit columns with minimum 250px width

---

## Combining Responsive Primitives

Create complex responsive layouts:

```tsx
import { Stack, Grid, Sidebar } from '@cascade/react';

function ResponsiveDashboard() {
  return (
    <Stack spacing="lg">
      <header>Header</header>
      
      <Sidebar 
        side="left"
        sidebarWidth="20rem"
        responsive={{
          md: { sidebarWidth: '0' }
        }}
      >
        <nav>Navigation</nav>
        <main>
          <Grid 
            columns={1}
            gap="sm"
            responsive={{
              md: { columns: 2, gap: 'md' },
              lg: { columns: 3, gap: 'lg' }
            }}
          >
            {/* Cards */}
          </Grid>
        </main>
      </Sidebar>
      
      <footer>Footer</footer>
    </Stack>
  );
}
```

---

## Breakpoint Naming

Use semantic breakpoint names that match your design system:

```tsx
responsive={{
  sm: { /* Small devices */ },
  md: { /* Medium devices */ },
  lg: { /* Large devices */ },
  xl: { /* Extra large devices */ }
}}
```

**Note:** Breakpoint names are arbitrary strings. Define them in your CSS to match your design system's breakpoints.

---

## CSS Breakpoint Definitions

Define breakpoints in your CSS:

```css
/* Mobile first approach */
@media (min-width: 768px) {
  [data-responsive*="md:"] {
    /* Medium breakpoint styles */
  }
}

@media (min-width: 1024px) {
  [data-responsive*="lg:"] {
    /* Large breakpoint styles */
  }
}
```

---

## Tips

1. **Mobile First:** Always define base props for mobile, then override for larger screens
2. **Consistent Breakpoints:** Use the same breakpoint names across your app
3. **Test Thoroughly:** Test layouts at actual device sizes, not just browser resize
4. **Progressive Enhancement:** Ensure layouts work without JavaScript

---

## Related

- [Layout Primitives Reference](./reference/layout-primitives.md)
- [Layout Primitives Tutorial](./tutorials/layout-primitives.md)


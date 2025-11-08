# How to Create Accessible Layouts

Learn how to use Cascade's accessibility features to build layouts that meet WCAG 2.1 AA standards and provide excellent experiences for all users.

---

## Overview

Cascade's layout primitives include comprehensive accessibility features:

- **ARIA attributes** - Screen reader support
- **Keyboard navigation** - Full keyboard accessibility
- **Focus management** - Proper focus handling for modals and dynamic content
- **Screen reader announcements** - Live regions for dynamic updates
- **Visual accessibility** - Focus indicators and high contrast support

---

## ARIA Attributes

All layout primitives support ARIA attributes for screen reader accessibility.

### Basic ARIA Labels

Provide accessible names for screen readers:

```tsx
import { Grid } from '@cascade/react';

function ProductGrid() {
  return (
    <Grid ariaLabel="Product catalog with 12 items">
      {/* Products */}
    </Grid>
  );
}
```

### ARIA Labelled By

Reference an existing element that labels the layout:

```tsx
function ProductSection() {
  return (
    <>
      <h2 id="products-title">Featured Products</h2>
      <Grid ariaLabelledBy="products-title">
        {/* Products */}
      </Grid>
    </>
  );
}
```

### ARIA Described By

Provide additional context:

```tsx
function ProductSection() {
  return (
    <>
      <p id="products-desc">Browse our selection of featured products</p>
      <Grid 
        ariaLabel="Product catalog"
        ariaDescribedBy="products-desc"
      >
        {/* Products */}
      </Grid>
    </>
  );
}
```

### Component-Specific ARIA

Some components have specialized ARIA support:

**Grid (for data grids):**
```tsx
<Grid 
  role="grid"
  ariaRowCount={10}
  ariaColCount={5}
  ariaLabel="Data table"
>
  {/* Grid cells */}
</Grid>
```

**Sidebar (defaults to complementary role):**
```tsx
<Sidebar ariaLabel="Main navigation">
  <nav>Navigation</nav>
  <main>Content</main>
</Sidebar>
```

**Imposter (for modals):**
```tsx
<Imposter 
  breakout
  ariaLabelledBy="modal-title"
  ariaDescribedBy="modal-desc"
>
  <h2 id="modal-title">Confirm Action</h2>
  <p id="modal-desc">This action cannot be undone.</p>
  {/* Modal content */}
</Imposter>
```

**Reel (scrollable region):**
```tsx
<Reel 
  ariaLabel="Image gallery"
  ariaOrientation="horizontal"
>
  {/* Images */}
</Reel>
```

---

## Keyboard Navigation

### Switcher Navigation

Enable arrow key navigation for switcher items:

```tsx
import { Switcher } from '@cascade/react';

function NavigationSwitcher() {
  return (
    <Switcher keyboardNavigation={true}>
      <button>Home</button>
      <button>About</button>
      <button>Contact</button>
    </Switcher>
  );
}
```

**Keyboard shortcuts:**
- **Arrow keys** - Navigate items (horizontal/vertical based on layout)
- **Home** - Jump to first item
- **End** - Jump to last item
- **Enter/Space** - Activate item

### Reel Scrolling

Enable keyboard scrolling for reel components:

```tsx
import { Reel } from '@cascade/react';

function ImageGallery() {
  return (
    <Reel 
      keyboardNavigation={true}
      keyboardScrollAmount={200}
      keyboardPageScrollAmount={800}
    >
      {/* Images */}
    </Reel>
  );
}
```

**Keyboard shortcuts:**
- **Arrow keys** - Scroll incrementally
- **Page Up/Down** - Scroll larger amounts
- **Home** - Scroll to start
- **End** - Scroll to end

### Grid Navigation

Enable keyboard navigation for interactive grids:

```tsx
import { Grid } from '@cascade/react';

function DataGrid() {
  return (
    <Grid 
      columns={3}
      keyboardNavigation={true}
      role="grid"
    >
      {/* Grid cells with interactive content */}
    </Grid>
  );
}
```

**Keyboard shortcuts:**
- **Arrow keys** - Navigate cells (up/down/left/right)
- **Ctrl+Home** - Jump to first cell
- **Ctrl+End** - Jump to last cell
- **Enter/Space** - Activate cell

---

## Focus Management

### Focus Trap for Modals

Imposter automatically traps focus when used as a modal:

```tsx
import { Imposter } from '@cascade/react';
import { useState } from 'react';

function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      {isOpen && (
        <Imposter 
          breakout
          ariaLabelledBy="modal-title"
          ariaModal={true}
        >
          <h2 id="modal-title">Modal Title</h2>
          <button onClick={() => setIsOpen(false)}>Close</button>
        </Imposter>
      )}
    </>
  );
}
```

**Features:**
- Focus automatically moves to first focusable element
- Tab cycles within modal only
- Escape key restores focus to trigger element
- Focus returns to trigger when modal closes

### Custom Initial Focus

Specify which element should receive initial focus:

```tsx
import { Imposter } from '@cascade/react';
import { useRef } from 'react';

function CustomFocusModal() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  return (
    <Imposter 
      breakout
      initialFocus={inputRef}
    >
      <h2>Enter Name</h2>
      <input ref={inputRef} type="text" />
      <button>Submit</button>
    </Imposter>
  );
}
```

### Focus Restoration Utilities

Use focus restoration hooks for custom scenarios:

```tsx
import { useFocusRestore } from '@cascade/react';

function CustomComponent() {
  const { saveFocus, restoreFocus } = useFocusRestore();
  
  const handleOpen = () => {
    saveFocus(); // Save current focus
    // Open something
  };
  
  const handleClose = () => {
    restoreFocus(); // Restore saved focus
    // Close something
  };
  
  return (
    // Component JSX
  );
}
```

---

## Screen Reader Announcements

### Live Regions

Announce dynamic content changes to screen readers:

```tsx
import { useLiveRegion } from '@cascade/react';

function DynamicContent() {
  const { announce, LiveRegion } = useLiveRegion('polite');
  
  const handleUpdate = () => {
    // Update content
    announce('Content updated successfully');
  };
  
  return (
    <>
      <LiveRegion />
      <button onClick={handleUpdate}>Update</button>
    </>
  );
}
```

**Politeness levels:**
- `'polite'` - Wait for current announcement to finish (default)
- `'assertive'` - Interrupt current announcement

### Layout Change Announcements

Announce when layouts change:

```tsx
import { Switcher } from '@cascade/react';
import { useLiveRegion } from '@cascade/react';
import { useEffect } from 'react';

function ResponsiveSwitcher() {
  const { announce, LiveRegion } = useLiveRegion('polite');
  const [isVertical, setIsVertical] = useState(false);
  
  useEffect(() => {
    announce(
      isVertical 
        ? 'Layout changed to vertical' 
        : 'Layout changed to horizontal'
    );
  }, [isVertical, announce]);
  
  return (
    <>
      <LiveRegion />
      <Switcher threshold="30rem">
        {/* Items */}
      </Switcher>
    </>
  );
}
```

---

## Visual Accessibility

### Focus Indicators

All primitives include visible focus indicators by default. Focus indicators:
- Use `:focus-visible` (only show for keyboard navigation)
- Have 2px outline with offset
- Support high contrast mode (3px outline)

### High Contrast Mode

Layouts automatically adapt to high contrast mode:

```tsx
// No additional code needed - handled automatically
<Grid>
  {/* Content */}
</Grid>
```

In high contrast mode:
- Focus indicators are thicker (3px)
- Borders are added to layout primitives
- Colors use system defaults

### Skip Links

Add skip links for keyboard navigation:

```tsx
function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <nav>Navigation</nav>
      <main id="main-content">
        {/* Main content */}
      </main>
    </>
  );
}
```

---

## Complete Example

Here's a complete accessible layout example:

```tsx
import { Grid, Sidebar, Imposter, useLiveRegion } from '@cascade/react';
import { useState, useRef } from 'react';

function AccessibleApp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalTitleRef = useRef<HTMLHeadingElement>(null);
  const { announce, LiveRegion } = useLiveRegion('polite');
  
  const handleProductAdded = () => {
    announce('Product added to cart');
  };
  
  return (
    <>
      <LiveRegion />
      
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Sidebar layout */}
      <Sidebar 
        ariaLabel="Main layout"
        responsive={{
          sm: { sidebarWidth: '0' }
        }}
      >
        <nav aria-label="Main navigation">
          <button onClick={() => setIsModalOpen(true)}>
            Open Cart
          </button>
        </nav>
        
        <main id="main-content">
          {/* Product grid */}
          <Grid 
            columns={3}
            ariaLabel="Product catalog"
            keyboardNavigation={true}
            responsive={{
              md: { columns: 2 },
              lg: { columns: 3 }
            }}
          >
            {products.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAdd={handleProductAdded}
              />
            ))}
          </Grid>
        </main>
      </Sidebar>
      
      {/* Modal */}
      {isModalOpen && (
        <Imposter 
          breakout
          ariaLabelledBy="cart-title"
          ariaModal={true}
        >
          <h2 id="cart-title" ref={modalTitleRef}>Shopping Cart</h2>
          <button onClick={() => setIsModalOpen(false)}>Close</button>
        </Imposter>
      )}
    </>
  );
}
```

---

## WCAG 2.1 AA Compliance Checklist

### Perceivable
- ✅ **1.3.1 Info and Relationships** - Semantic HTML, ARIA labels
- ✅ **1.4.3 Contrast** - Color contrast compliance
- ✅ **1.4.11 Non-text Contrast** - Focus indicators, borders
- ✅ **1.4.13 Content on Hover or Focus** - Tooltips, focus states

### Operable
- ✅ **2.1.1 Keyboard** - All functionality keyboard accessible
- ✅ **2.1.2 No Keyboard Trap** - Focus trap with escape
- ✅ **2.4.3 Focus Order** - Logical tab order
- ✅ **2.4.7 Focus Visible** - Visible focus indicators
- ✅ **2.5.3 Label in Name** - Accessible names match visible labels

### Understandable
- ✅ **3.2.4 Consistent Identification** - Consistent ARIA patterns
- ✅ **3.3.2 Labels or Instructions** - ARIA labels and descriptions

### Robust
- ✅ **4.1.2 Name, Role, Value** - Proper ARIA attributes
- ✅ **4.1.3 Status Messages** - Live regions for announcements

---

## Best Practices

1. **Always provide ARIA labels** for layout containers that have semantic meaning
2. **Use semantic HTML** when possible (e.g., `<nav>`, `<main>`, `<aside>`)
3. **Enable keyboard navigation** for interactive layouts
4. **Test with screen readers** (NVDA, JAWS, VoiceOver, TalkBack)
5. **Test keyboard-only navigation** (no mouse)
6. **Announce dynamic changes** using live regions
7. **Ensure focus indicators are visible** (they are by default)
8. **Use skip links** for complex layouts

---

## Testing

### Automated Testing

Use testing utilities to verify accessibility:

```tsx
import { render } from '@testing-library/react';
import { Grid } from '@cascade/react';

test('Grid has aria-label', () => {
  const { container } = render(
    <Grid ariaLabel="Test grid">Content</Grid>
  );
  
  const grid = container.querySelector('.grid');
  expect(grid).toHaveAttribute('aria-label', 'Test grid');
});
```

### Manual Testing

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Verify focus indicators are visible
   - Test arrow key navigation where enabled

2. **Screen Reader Testing**
   - Test with NVDA (Windows) or VoiceOver (macOS)
   - Verify elements are announced correctly
   - Check that dynamic changes are announced

3. **Focus Management**
   - Open modals and verify focus trap
   - Close modals and verify focus restoration
   - Test Escape key handling

---

## Related Documentation

- [Layout Primitives Reference](./reference/layout-primitives.md)
- [Accessibility Explanation](../explanations/accessibility.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

---

## Summary

Cascade's accessibility features make it easy to build accessible layouts:

- ✅ **ARIA attributes** - Screen reader support
- ✅ **Keyboard navigation** - Full keyboard accessibility  
- ✅ **Focus management** - Proper focus handling
- ✅ **Screen reader announcements** - Live regions
- ✅ **Visual accessibility** - Focus indicators and high contrast

All features are opt-in and backward compatible, so you can add accessibility incrementally to your layouts.


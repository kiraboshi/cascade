---
title: Accessibility Uplift
type: plan
status: pending
created_at: 2025-01-13
scope: react
priority: high
eval_reference: evals/react/universal-layout-framework-capability-evaluation.md
rationale_reference: docs/explanations/accessibility.md
---

# Accessibility Uplift

## Overview

Enhance layout primitives with comprehensive accessibility features, including ARIA attribute support, keyboard navigation, focus management, and screen reader considerations. This ensures Cascade's layout primitives meet WCAG 2.1 AA standards and provide excellent accessibility out of the box.

**Current State**: Basic accessibility (semantic HTML via `as` prop, no explicit ARIA support)
**Target State**: Comprehensive accessibility features across all primitives
**Coverage Goal**: WCAG 2.1 AA compliance

---

## Evaluation Summary

**Key Findings**:
- Current accessibility: **Basic** - relies on semantic HTML only
- **No explicit ARIA support** in layout primitives
- **No keyboard navigation** considerations
- **No screen reader** optimizations
- Motion runtime has some accessibility features (prefers-reduced-motion)

**Priority Areas**:
1. **ARIA attributes** - Support for common ARIA patterns
2. **Keyboard navigation** - Focus management and keyboard shortcuts
3. **Screen reader** - Semantic structure and announcements
4. **Focus indicators** - Visible focus states

---

## Goals

### Primary Goals

1. **Add ARIA attribute support** to all layout primitives
2. **Implement keyboard navigation** for interactive layouts
3. **Enhance screen reader** support with proper semantics
4. **Provide focus management** utilities
5. **Ensure WCAG 2.1 AA compliance**

### Success Criteria

- ✅ All primitives support common ARIA attributes
- ✅ Keyboard navigation works correctly
- ✅ Screen readers announce layout changes appropriately
- ✅ Focus indicators are visible
- ✅ WCAG 2.1 AA compliance verified
- ✅ Documentation includes accessibility guidance

---

## Phase 1: ARIA Attribute Support

**Status**: ⏳ **PENDING**

### 1.1 Add ARIA Props to All Primitives

**Files**: All primitive components in `packages/react/src/`

**Props Interface Pattern**:
```typescript
export interface GridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Existing props...
  
  // New: ARIA support
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  role?: string;
  ariaLive?: 'off' | 'polite' | 'assertive';
  ariaAtomic?: boolean;
  ariaBusy?: boolean;
  
  // ... rest of props
}
```

### 1.2 Apply ARIA Attributes

**Implementation Pattern**:
```typescript
<Component
  aria-label={ariaLabel}
  aria-labelledby={ariaLabelledBy}
  aria-describedby={ariaDescribedBy}
  role={role}
  aria-live={ariaLive}
  aria-atomic={ariaAtomic}
  aria-busy={ariaBusy}
  // ... other props
/>
```

### 1.3 Component-Specific ARIA

**Grid**:
- `role="grid"` when appropriate
- `aria-label` for grid description
- `aria-rowcount`, `aria-colcount` for grid dimensions

**Sidebar**:
- `role="complementary"` for sidebar
- `aria-label` for sidebar description

**Imposter**:
- `role="dialog"` for modals
- `aria-modal="true"`
- `aria-labelledby` for dialog title
- Focus trap support

**Reel**:
- `role="region"`
- `aria-label` for scrollable region
- `aria-orientation="horizontal"`

**Deliverables**:
- ✅ All primitives support ARIA props
- ✅ Component-specific ARIA patterns implemented
- ✅ ARIA attributes properly applied to elements

---

## Phase 2: Keyboard Navigation

**Status**: ⏳ **PENDING**

### 2.1 Focus Management Utilities

**File**: `packages/react/src/accessibility/focus-management.ts` (new)

**Utilities**:
```typescript
// Focus trap for modals
export function useFocusTrap(ref: RefObject<HTMLElement>, enabled: boolean): void;

// Focus restoration
export function useFocusRestore(restoreOnUnmount?: boolean): void;

// Focus within container
export function useFocusWithin(ref: RefObject<HTMLElement>): boolean;
```

### 2.2 Keyboard Navigation for Interactive Layouts

**Switcher**:
- Arrow keys to navigate items
- Enter/Space to activate items
- Home/End to jump to first/last

**Reel**:
- Arrow keys to scroll
- Page Up/Down for larger scroll
- Home/End to scroll to start/end

**Grid** (when interactive):
- Arrow keys to navigate cells
- Enter/Space to activate
- Tab to move between interactive items

### 2.3 Focus Indicators

**File**: `packages/core/src/foundation.ts`

**CSS**:
```css
/* Focus indicators for all primitives */
.grid:focus-visible,
.sidebar:focus-visible,
.split:focus-visible {
  outline: 2px solid var(--cascade-color-primary);
  outline-offset: 2px;
}

/* Skip link support */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--cascade-color-primary);
  color: white;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

**Deliverables**:
- ✅ Focus management utilities created
- ✅ Keyboard navigation for interactive layouts
- ✅ Focus indicators in foundation CSS
- ✅ Skip links support

---

## Phase 3: Screen Reader Enhancements

**Status**: ⏳ **PENDING**

### 3.1 Semantic Structure

**Enhancements**:
- Ensure proper heading hierarchy
- Use semantic HTML elements (`<nav>`, `<main>`, `<aside>`, `<section>`)
- Provide landmarks via `role` attributes

### 3.2 Live Regions

**File**: `packages/react/src/accessibility/live-regions.ts` (new)

**Utilities**:
```typescript
// Announce to screen readers
export function useLiveRegion(politeness?: 'polite' | 'assertive'): {
  announce: (message: string) => void;
};

// Announce layout changes
export function useLayoutAnnouncement(
  ref: RefObject<HTMLElement>,
  message: string
): void;
```

### 3.3 State Announcements

**Components announce state changes**:
- Grid: Column/row count changes
- Sidebar: Collapse/expand
- Switcher: Layout direction changes
- Reel: Scroll position

**Example**:
```typescript
function Switcher({ threshold, ...props }) {
  const [isBelowThreshold, setIsBelowThreshold] = useState(false);
  const { announce } = useLiveRegion('polite');
  
  useEffect(() => {
    announce(
      isBelowThreshold 
        ? 'Layout changed to vertical' 
        : 'Layout changed to horizontal'
    );
  }, [isBelowThreshold, announce]);
  
  // ... rest of component
}
```

**Deliverables**:
- ✅ Live region utilities created
- ✅ State announcements for layout changes
- ✅ Semantic structure improvements
- ✅ Screen reader optimizations

---

## Phase 4: Focus Management

**Status**: ⏳ **PENDING**

### 4.1 Focus Trap for Modals

**File**: `packages/react/src/Imposter.tsx`

**Enhancement**:
```typescript
export interface ImposterProps {
  // Existing props...
  
  // New: Focus management
  trapFocus?: boolean; // Default: true for modals
  initialFocus?: RefObject<HTMLElement>;
  returnFocusOnClose?: boolean;
}
```

**Implementation**:
- Trap focus within modal when open
- Return focus to trigger element when closed
- Handle Escape key to close

### 4.2 Focus Restoration

**Utility**: `useFocusRestore`

**Use Cases**:
- Restore focus after layout changes
- Restore focus after animations
- Restore focus after route changes

### 4.3 Focus Within Detection

**Utility**: `useFocusWithin`

**Use Cases**:
- Detect when focus is within a container
- Style focused containers
- Manage focus states

**Deliverables**:
- ✅ Focus trap for Imposter (modals)
- ✅ Focus restoration utilities
- ✅ Focus within detection
- ✅ Escape key handling

---

## Phase 5: Visual Accessibility

**Status**: ⏳ **PENDING**

### 5.1 Focus Indicators

**File**: `packages/core/src/foundation.ts`

**CSS Enhancements**:
```css
/* Enhanced focus indicators */
:focus-visible {
  outline: 2px solid var(--cascade-color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :focus-visible {
    outline: 3px solid;
    outline-offset: 3px;
  }
}
```

### 5.2 Reduced Motion Support

**File**: All primitive components

**Enhancement**: Ensure animations respect `prefers-reduced-motion`:

```typescript
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

<Grid 
  animate={prefersReducedMotion ? false : { duration: 300 }}
  // ... other props
/>
```

### 5.3 Color Contrast

**File**: `packages/core/src/foundation.ts`

**CSS**:
```css
/* Ensure sufficient color contrast */
.grid,
.sidebar,
.split {
  color: var(--cascade-color-text, oklch(0.20 0 0));
  background: var(--cascade-color-background, oklch(1 0 0));
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .grid,
  .sidebar,
  .split {
    border: 2px solid currentColor;
  }
}
```

**Deliverables**:
- ✅ Enhanced focus indicators
- ✅ Reduced motion support
- ✅ Color contrast compliance
- ✅ High contrast mode support

---

## Phase 6: Testing

**Status**: ⏳ **PENDING**

### 6.1 Accessibility Testing

**Tools**:
- axe-core for automated testing
- @testing-library/jest-dom for ARIA assertions
- Manual screen reader testing

**Test Files**:
- `packages/react/src/__tests__/accessibility/`
- Individual component accessibility tests

### 6.2 Test Cases

**ARIA Tests**:
- ARIA attributes are applied correctly
- ARIA labels are associated with elements
- ARIA live regions announce changes

**Keyboard Tests**:
- Tab navigation works
- Arrow keys work (where applicable)
- Escape key works (modals)
- Focus trap works (modals)

**Screen Reader Tests**:
- Elements are announced correctly
- State changes are announced
- Navigation is logical

**Focus Tests**:
- Focus indicators are visible
- Focus restoration works
- Focus trap works

**Deliverables**:
- ✅ Automated accessibility tests
- ✅ Keyboard navigation tests
- ✅ Screen reader tests
- ✅ Focus management tests

---

## Phase 7: Documentation

**Status**: ⏳ **PENDING**

### 7.1 Accessibility Guide

**File**: `docs/how-to/create-accessible-layouts.md` (new)

**Contents**:
- ARIA attribute usage
- Keyboard navigation patterns
- Screen reader considerations
- Focus management
- WCAG compliance checklist

### 7.2 API Reference Updates

**File**: `docs/reference/layout-primitives.md`

**Updates**:
- Document ARIA props
- Document keyboard navigation
- Document accessibility features
- Provide examples

### 7.3 Examples

**File**: `apps/demo/src/pages/LayoutPrimitivesShowcase.tsx`

**Updates**:
- Add accessibility examples
- Show ARIA usage
- Demonstrate keyboard navigation
- Show focus management

**Deliverables**:
- ✅ Accessibility guide created
- ✅ API reference updated
- ✅ Examples added to showcase

---

## Implementation Details

### ARIA Props Pattern

**Standard Props** (all primitives):
```typescript
ariaLabel?: string;
ariaLabelledBy?: string;
ariaDescribedBy?: string;
role?: string;
ariaLive?: 'off' | 'polite' | 'assertive';
ariaAtomic?: boolean;
ariaBusy?: boolean;
```

**Component-Specific Props**:
```typescript
// Grid
ariaRowCount?: number;
ariaColCount?: number;

// Imposter (Modal)
ariaModal?: boolean;
ariaLabelledBy?: string; // Required for dialogs

// Reel
ariaOrientation?: 'horizontal' | 'vertical';
```

### Focus Management API

**Focus Trap**:
```typescript
function useFocusTrap(
  ref: RefObject<HTMLElement>,
  enabled: boolean
): void {
  useEffect(() => {
    if (!enabled || !ref.current) return;
    
    const element = ref.current;
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    element.addEventListener('keydown', handleTab);
    firstElement?.focus();
    
    return () => {
      element.removeEventListener('keydown', handleTab);
    };
  }, [enabled, ref]);
}
```

### Live Region API

**Live Region Hook**:
```typescript
function useLiveRegion(politeness: 'polite' | 'assertive' = 'polite') {
  const [announcement, setAnnouncement] = useState('');
  const announcementId = useId();
  
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);
  
  return {
    announce: (message: string) => setAnnouncement(message),
    liveRegionProps: {
      id: announcementId,
      role: 'status',
      'aria-live': politeness,
      'aria-atomic': true,
      className: 'sr-only',
    },
    announcement,
  };
}
```

---

## WCAG 2.1 AA Compliance Checklist

### Perceivable

- ✅ **1.3.1 Info and Relationships**: Semantic HTML, ARIA labels
- ✅ **1.4.3 Contrast**: Color contrast compliance
- ✅ **1.4.11 Non-text Contrast**: Focus indicators, borders
- ✅ **1.4.13 Content on Hover or Focus**: Tooltips, focus states

### Operable

- ✅ **2.1.1 Keyboard**: All functionality keyboard accessible
- ✅ **2.1.2 No Keyboard Trap**: Focus trap with escape
- ✅ **2.4.3 Focus Order**: Logical tab order
- ✅ **2.4.7 Focus Visible**: Visible focus indicators
- ✅ **2.5.3 Label in Name**: Accessible names match visible labels

### Understandable

- ✅ **3.2.4 Consistent Identification**: Consistent ARIA patterns
- ✅ **3.3.2 Labels or Instructions**: ARIA labels and descriptions

### Robust

- ✅ **4.1.2 Name, Role, Value**: Proper ARIA attributes
- ✅ **4.1.3 Status Messages**: Live regions for announcements

---

## Browser Support

### Accessibility Features

**ARIA**: Supported in all modern browsers
**Focus Management**: Supported in all modern browsers
**Keyboard Navigation**: Supported in all browsers
**Screen Readers**: Works with NVDA, JAWS, VoiceOver, TalkBack

**No polyfills needed** - All accessibility features use standard web APIs.

---

## Risks and Mitigations

### Risk 1: Over-Engineering

**Risk**: Adding too many ARIA attributes might be unnecessary
**Mitigation**: Follow ARIA best practices, only add what's needed
**Impact**: Low - mitigated with good practices

### Risk 2: Breaking Changes

**Risk**: Adding required props might break existing code
**Mitigation**: All ARIA props are optional
**Impact**: Low - backward compatible

### Risk 3: Performance Impact

**Risk**: Focus management might impact performance
**Mitigation**: Use efficient event listeners, cleanup properly
**Impact**: Low - minimal overhead

---

## Timeline

### Phase 1: ARIA Support (1 week)
- Add ARIA props to all primitives
- Implement component-specific ARIA
- Test ARIA attributes

### Phase 2: Keyboard Navigation (1 week)
- Create focus management utilities
- Implement keyboard navigation
- Add focus indicators

### Phase 3: Screen Reader (3-5 days)
- Create live region utilities
- Add state announcements
- Enhance semantic structure

### Phase 4: Focus Management (3-5 days)
- Implement focus trap
- Add focus restoration
- Handle Escape key

### Phase 5: Visual Accessibility (2-3 days)
- Enhance focus indicators
- Add reduced motion support
- Ensure color contrast

### Phase 6: Testing (1 week)
- Write accessibility tests
- Manual screen reader testing
- Keyboard navigation testing

### Phase 7: Documentation (3-5 days)
- Create accessibility guide
- Update API reference
- Add examples

**Total Estimated Time**: **4-5 weeks**

---

## Success Metrics

### Quantitative

- ✅ All 13 primitives support ARIA props
- ✅ WCAG 2.1 AA compliance verified
- ✅ 100% keyboard navigation coverage
- ✅ Zero accessibility violations (axe-core)

### Qualitative

- ✅ Better screen reader experience
- ✅ Improved keyboard navigation
- ✅ Clear focus indicators
- ✅ Accessible by default

---

## Dependencies

### Required

- ✅ React 18+ (for useId hook)
- ✅ Foundation CSS system
- ✅ Testing infrastructure

### Optional

- ⚠️ axe-core for automated testing
- ⚠️ @testing-library/jest-dom for ARIA assertions

---

## Related Plans

- **Container Queries Uplift** - Related but separate
- **Layout Primitives Uplift** - Foundation for accessibility

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [MDN: Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [Cascade Accessibility Documentation](../docs/explanations/accessibility.md)

---

*Plan Created: 2025-01-13*
*Status: PENDING*
*Priority: HIGH*


# Accessibility Considerations

Understanding accessibility best practices for animations in Cascade Motion.

---

## Overview

Animations can enhance user experience, but they can also create barriers for users with disabilities. Cascade Motion provides tools and guidance to create accessible animations.

---

## Respecting User Preferences

### Reduced Motion

Always respect `prefers-reduced-motion`:

```typescript
import { prefersReducedMotion } from '@cascade/motion-runtime';

if (prefersReducedMotion()) {
  // Skip animations or use instant transitions
  return <div>Content</div>;
}

// Normal animations
return <AnimatedComponent />;
```

### Automatic Respect

Many Cascade Motion hooks automatically respect reduced motion:

```typescript
// Automatically respects prefers-reduced-motion
const { start } = useMotionSequence(3, {
  respectReducedMotion: true, // Default: true
});
```

---

## Animation Guidelines

### 1. Provide Alternatives

Always provide a way to disable or skip animations:

```typescript
function AnimatedComponent({ skipAnimation }: { skipAnimation?: boolean }) {
  const opacity = useMotionValue(skipAnimation ? 1 : 0, { property: 'opacity' });
  
  useEffect(() => {
    if (!skipAnimation) {
      opacity.animateTo(1, { duration: 300 });
    }
  }, [skipAnimation, opacity]);
  
  return (
    <div style={{ opacity: `var(${opacity.cssVarName})` }}>
      Content
    </div>
  );
}
```

### 2. Keep Animations Short

Long animations can be disorienting:

```typescript
// ✅ Good: Short animation
opacity.animateTo(1, { duration: 200 });

// ⚠️ Avoid: Long animation
opacity.animateTo(1, { duration: 2000 });
```

**Guideline:** Keep animations under 500ms for most cases.

### 3. Avoid Flashing

Avoid rapid flashing animations (can trigger seizures):

```typescript
// ❌ Avoid: Rapid flashing
const opacity = useMotionValue(1);
setInterval(() => {
  opacity.animateTo(opacity.get() === 1 ? 0 : 1, { duration: 100 });
}, 200);

// ✅ Good: Smooth transitions
const opacity = useMotionValue(1);
opacity.animateTo(0, { duration: 500 });
```

---

## Focus Management

### Keyboard Navigation

Ensure animations don't interfere with keyboard navigation:

```typescript
function AnimatedButton() {
  const scale = useScale(1);
  const [isFocused, setIsFocused] = useState(false);
  
  const focusRef = useFocusAnimation(scale, {
    onFocusStart: { target: 1.1, config: { duration: 200 } },
    onFocusEnd: { target: 1, config: { duration: 200 } },
  });
  
  return (
    <button
      ref={focusRef}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        transform: `scale(var(${scale.cssVarName}))`,
        outline: isFocused ? '2px solid blue' : 'none',
      }}
    >
      Button
    </button>
  );
}
```

### Focus Indicators

Always provide visible focus indicators:

```typescript
<button
  ref={focusRef}
  style={{
    transform: `scale(var(${scale.cssVarName}))`,
    // ✅ Good: Visible focus indicator
    outline: '2px solid blue',
    outlineOffset: '2px',
  }}
>
  Button
</button>
```

---

## Screen Reader Considerations

### Announce State Changes

Use ARIA attributes to announce state changes:

```typescript
function CollapsibleSection({ isOpen }: { isOpen: boolean }) {
  const height = useMotionValue(isOpen ? 'auto' : 0, { property: 'height' });
  
  return (
    <section
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Section expanded' : 'Section collapsed'}
    >
      <div style={{ height: `var(${height.cssVarName})` }}>
        Content
      </div>
    </section>
  );
}
```

### Live Regions

Use ARIA live regions for dynamic content:

```typescript
function AnimatedNotification({ message }: { message: string }) {
  const opacity = useMotionValue(0, { property: 'opacity' });
  
  useEffect(() => {
    opacity.animateTo(1, { duration: 300 });
  }, [message, opacity]);
  
  return (
    <div
      role="alert"
      aria-live="polite"
      style={{ opacity: `var(${opacity.cssVarName})` }}
    >
      {message}
    </div>
  );
}
```

---

## Motion Sickness

### Avoid Parallax

Parallax effects can cause motion sickness:

```typescript
// ⚠️ Use with caution: Can cause motion sickness
const y = useTranslateY(0);
useScrollMotion(y, { multiplier: 0.5 });
```

**Guideline:** Provide option to disable parallax effects.

### Limit Movement

Avoid excessive movement:

```typescript
// ✅ Good: Subtle movement
const y = useTranslateY(0);
y.animateTo(10, { duration: 300 });

// ⚠️ Avoid: Excessive movement
const y = useTranslateY(0);
y.animateTo(500, { duration: 300 });
```

---

## Color and Contrast

### Maintain Contrast

Ensure animations don't reduce contrast:

```typescript
// ✅ Good: Maintains contrast
const opacity = useMotionValue(1, { property: 'opacity' });

// ⚠️ Avoid: Reduces contrast
const opacity = useMotionValue(0.3, { property: 'opacity' });
```

### Color Independence

Don't rely solely on color for information:

```typescript
// ✅ Good: Uses shape and color
<div
  style={{
    backgroundColor: isError ? 'red' : 'green',
    border: `2px solid ${isError ? 'red' : 'green'}`,
  }}
>
  {isError ? 'Error' : 'Success'}
</div>

// ⚠️ Avoid: Only color
<div style={{ backgroundColor: isError ? 'red' : 'green' }}>
  Status
</div>
```

---

## Best Practices Checklist

- [ ] Respect `prefers-reduced-motion`
- [ ] Provide way to disable animations
- [ ] Keep animations under 500ms
- [ ] Avoid rapid flashing
- [ ] Ensure keyboard navigation works
- [ ] Provide visible focus indicators
- [ ] Announce state changes with ARIA
- [ ] Use live regions for dynamic content
- [ ] Avoid excessive movement
- [ ] Maintain color contrast
- [ ] Don't rely solely on color

---

## Implementation Examples

### Accessible Modal

```typescript
function AccessibleModal({ isOpen, onClose }: ModalProps) {
  const opacity = useMotionValue(0, { property: 'opacity' });
  const scale = useScale(0.9);
  
  useEffect(() => {
    if (isOpen) {
      opacity.animateTo(1, { duration: 200 });
      scale.animateTo(1, { duration: 200 });
    } else {
      opacity.animateTo(0, { duration: 200 });
      scale.animateTo(0.9, { duration: 200 });
    }
  }, [isOpen, opacity, scale]);
  
  // Respect reduced motion
  if (prefersReducedMotion()) {
    return isOpen ? (
      <div role="dialog" aria-modal="true">
        <button onClick={onClose}>Close</button>
        Content
      </div>
    ) : null;
  }
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        opacity: `var(${opacity.cssVarName})`,
        transform: `scale(var(${scale.cssVarName}))`,
      }}
    >
      <button onClick={onClose} aria-label="Close modal">
        Close
      </button>
      <h2 id="modal-title">Modal Title</h2>
      Content
    </div>
  );
}
```

### Accessible Toggle

```typescript
function AccessibleToggle({ isOn, onToggle }: ToggleProps) {
  const x = useTranslateX(isOn ? 20 : 0);
  
  return (
    <button
      role="switch"
      aria-checked={isOn}
      onClick={onToggle}
      style={{
        transform: `translateX(var(${x.cssVarName}))`,
      }}
    >
      <span aria-hidden="true">{isOn ? 'ON' : 'OFF'}</span>
      <span className="sr-only">{isOn ? 'Enabled' : 'Disabled'}</span>
    </button>
  );
}
```

---

## Testing Accessibility

### Manual Testing

1. **Keyboard navigation** - Tab through all interactive elements
2. **Screen reader** - Test with NVDA, JAWS, or VoiceOver
3. **Reduced motion** - Enable `prefers-reduced-motion` in OS settings
4. **Focus indicators** - Ensure all focusable elements have visible focus

### Automated Testing

```typescript
// Test reduced motion
test('respects prefers-reduced-motion', () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
    })),
  });
  
  // Test that animations are skipped
});
```

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [A11y Project](https://www.a11yproject.com/)

---

## See Also

- [How to Optimize Performance](../how-to/optimize-performance.md) - Performance tips
- [Troubleshooting](../how-to/troubleshooting.md) - Common issues
- [CSS-First Philosophy](./css-first-philosophy.md) - Design principles


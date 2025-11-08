# Frequently Asked Questions

Common questions and answers about Cascade Motion.

---

## General Questions

### What is Cascade Motion?

Cascade Motion is a CSS-first animation library for React that provides smooth, performant animations using CSS custom properties and the browser's compositor thread.

### Why CSS-first?

CSS animations run on the compositor thread, providing better performance than JavaScript animations. Cascade Motion bridges JavaScript control with CSS performance.

### How does it compare to Framer Motion?

Cascade Motion is similar to Framer Motion but uses CSS-first approach for better performance. See [Comparison with Framer Motion](./comparison-framer-motion.md) for details.

### Is it production-ready?

Yes! Cascade Motion is production-ready and actively maintained.

---

## Installation and Setup

### How do I install Cascade Motion?

```bash
npm install @cascade/motion-runtime @cascade/motion-gestures
```

### Do I need to configure anything?

No configuration required! Just import and use the hooks.

### Does it work with TypeScript?

Yes! Cascade Motion is written in TypeScript and provides full type definitions.

---

## Motion Values

### What are motion values?

Motion values are reactive JavaScript values that control CSS custom properties. They bridge JavaScript state and CSS animations.

### How do motion values work?

Motion values create CSS custom properties (e.g., `--motion-value-abc123`) that are updated from JavaScript. CSS handles the visual animation.

### Can I use motion values outside React?

Yes! Use `createMotionValue` for non-React contexts:

```typescript
import { createMotionValue } from '@cascade/motion-runtime';

const opacity = createMotionValue(0, { property: 'opacity' });
```

### How do I clean up motion values?

Motion values created with hooks are automatically cleaned up. For `createMotionValue`, call `destroy()`:

```typescript
const opacity = createMotionValue(0, { property: 'opacity' });
// ... use it ...
opacity.destroy(); // Clean up
```

---

## Animations

### How do I create animations?

Use motion values with `animateTo()`:

```typescript
const opacity = useMotionValue(0, { property: 'opacity' });
opacity.animateTo(1, { duration: 300 });
```

### What's the difference between spring and keyframe animations?

- **Spring**: Physics-based, natural motion
- **Keyframe**: Time-based, precise timing

### Can I pause/resume animations?

Yes! Use `pause()` and `play()`:

```typescript
const opacity = useMotionValue(0, { property: 'opacity' });
opacity.animateTo(1, { duration: 1000 });
opacity.pause(); // Pause
opacity.play(); // Resume
```

### How do I reverse an animation?

Use `reverse()`:

```typescript
const opacity = useMotionValue(0, { property: 'opacity' });
opacity.animateTo(1, { duration: 300 });
opacity.reverse(); // Now animating back to 0
```

---

## Gestures

### How do I make an element draggable?

Use `useDrag`:

```typescript
const x = useTranslateX(0);
const y = useTranslateY(0);
const dragRef = useDrag({ x, y });
```

### Can I constrain drag movement?

Yes! Use `constraints`:

```typescript
const dragRef = useDrag({ x, y }, {
  constraints: {
    min: { x: -100, y: -100 },
    max: { x: 100, y: 100 },
  },
});
```

### How do I detect hover?

Use `useHover`:

```typescript
const [hoverRef, isHovering] = useHover();
```

### Can I combine multiple gestures?

Yes! Combine refs:

```typescript
const dragRef = useDrag({ x, y });
const hoverRef = useHoverAnimation(scale, { /* ... */ });

const combinedRef = (el: HTMLElement | null) => {
  if (dragRef.current) dragRef.current = el;
  if (hoverRef.current) hoverRef.current = el;
};
```

---

## Layout Transitions

### What are layout transitions?

Layout transitions animate changes in element position and size using the FLIP technique.

### How do I animate list reordering?

Use `useBatchLayoutTransition`:

```typescript
const refs = items.map(() => useRef<HTMLDivElement>(null));
useBatchLayoutTransition(refs, { duration: 300 });
```

### Can I animate size changes?

Yes! Layout transitions handle both position and size changes.

### How do shared element transitions work?

Use `useSharedLayoutTransition` with the same `layoutId`:

```typescript
// View 1
<SharedElement layoutId="card-1">Card</SharedElement>

// View 2
<SharedElement layoutId="card-1">Expanded Card</SharedElement>
```

---

## Performance

### How do I optimize performance?

- Use GPU-accelerated properties (`transform`, `opacity`)
- Avoid layout-triggering properties (`width`, `height`)
- Batch updates when possible
- Limit simultaneous animations

See [How to Optimize Performance](../how-to/optimize-performance.md) for details.

### Are animations GPU-accelerated?

Yes! Animations using `transform` and `opacity` are GPU-accelerated.

### How do I check if a property is GPU-accelerated?

Check `isGPUAccelerated`:

```typescript
const opacity = useMotionValue(1, { property: 'opacity' });
console.log(opacity.isGPUAccelerated); // true
```

### Does it work on mobile?

Yes! Cascade Motion works on all modern browsers including mobile.

---

## Compile-Time vs Runtime

### When should I use compile-time animations?

Use compile-time for static animations that don't change:

```typescript
const fadeIn = defineMotion({
  type: 'spring',
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});
```

### When should I use runtime animations?

Use runtime for dynamic animations that respond to state or user input:

```typescript
const opacity = useMotionValue(isVisible ? 1 : 0);
opacity.animateTo(isVisible ? 1 : 0, { duration: 300 });
```

See [Compile-Time vs Runtime](./compile-time-vs-runtime.md) for details.

---

## Troubleshooting

### Animations don't work

- Check that refs are properly attached
- Verify CSS custom properties are being used
- Check browser console for errors
- Ensure element is in DOM

### Animations are janky

- Use GPU-accelerated properties
- Check for layout-triggering properties
- Reduce animation duration
- Limit concurrent animations

### Type errors

- Ensure TypeScript is properly configured
- Check import paths
- Verify types are imported correctly

See [Troubleshooting Guide](../how-to/troubleshooting.md) for more.

---

## Browser Support

### Which browsers are supported?

- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 15+

### Does it work with SSR?

Yes! Cascade Motion works with server-side rendering. Motion values initialize on the client.

### Do I need polyfills?

No polyfills needed for modern browsers. For older browsers, consider IntersectionObserver polyfill for viewport animations.

---

## Accessibility

### Does it respect prefers-reduced-motion?

Yes! Many hooks automatically respect `prefers-reduced-motion`. Check the `respectReducedMotion` option.

### How do I make animations accessible?

- Respect `prefers-reduced-motion`
- Provide way to disable animations
- Keep animations short (< 500ms)
- Ensure keyboard navigation works

See [Accessibility Considerations](./accessibility.md) for details.

---

## Advanced Topics

### Can I create custom animations?

Yes! Use motion values with custom animation configs:

```typescript
const opacity = useMotionValue(0, { property: 'opacity' });
opacity.animateTo(1, {
  duration: 1000,
  easing: 'cubic-bezier(0.42, 0, 0.58, 1)',
});
```

### Can I use it with other animation libraries?

Yes! Cascade Motion can be used alongside other libraries. Be careful with conflicting transforms.

### How do I debug animations?

- Use browser DevTools Performance tab
- Check CSS custom properties in Elements tab
- Use `onChange` callbacks to log values
- Check `isGPUAccelerated` and `triggersLayout` properties

---

## Contributing

### How can I contribute?

Check the repository for contribution guidelines. Pull requests welcome!

### Where do I report bugs?

Open an issue on GitHub with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information

### Can I request features?

Yes! Open a feature request issue on GitHub.

---

## Resources

### Documentation

- [Getting Started Tutorial](../tutorials/getting-started.md)
- [API Reference](../reference/)
- [How-to Guides](../how-to/)

### Examples

- Check the repository examples folder
- See [How-to Guides](../how-to/) for practical examples

### Support

- GitHub Issues for bugs and features
- Documentation for questions
- Community discussions

---

## Still Have Questions?

- Check the [API Reference](../reference/) for detailed documentation
- See [Troubleshooting Guide](../how-to/troubleshooting.md) for common issues
- Review [Examples](../how-to/) for practical patterns
- Open an issue on GitHub for bugs or feature requests

---

## See Also

- [Getting Started Tutorial](../tutorials/getting-started.md) - Start here
- [Troubleshooting Guide](../how-to/troubleshooting.md) - Common issues
- [API Reference](../reference/) - Complete API docs
- [Comparison with Framer Motion](./comparison-framer-motion.md) - How it compares


# Cascade Motion Documentation

Welcome to the Cascade Motion documentation, organized using the [Diataxis framework](https://diataxis.fr/).

---

## Documentation Structure

Our documentation is organized into four distinct types, each serving a specific purpose:

### 📚 [Reference](./reference/) - Technical Documentation

Complete API reference and technical specifications. Use this when you need specific information about APIs, types, or functions.

**When to use:** You know what you're looking for and need detailed technical information.

**Contents:**
- [Motion Values API](./reference/motion-values.md)
- [Gestures API](./reference/gestures.md)
- [Layout Transitions API](./reference/layout-transitions.md)
- [Viewport Animations API](./reference/viewport-animations.md)
- [Sequences API](./reference/sequences.md)
- [AnimatePresence API](./reference/animate-presence.md)
- [Layout Primitives API](./reference/layout-primitives.md)
- [Type Definitions](./reference/types.md)

---

### 🎓 [Tutorials](./tutorials/) - Learning Paths

Step-by-step lessons that teach you how to use Cascade Motion. Follow these to learn by doing.

**When to use:** You're new to Cascade Motion or want to learn a new concept.

**Contents:**
- [Getting Started](./tutorials/getting-started.md)
- [Motion Values Tutorial](./tutorials/motion-values.md)
- [Gestures Tutorial](./tutorials/gestures.md)
- [Layout Transitions Tutorial](./tutorials/layout-transitions.md)
- [Layout Primitives Tutorial](./tutorials/layout-primitives.md)

---

### 🔧 [How-to Guides](./how-to/) - Task Instructions

Goal-oriented guides that show you how to accomplish specific tasks. Each guide solves a particular problem.

**When to use:** You know what you want to do and need step-by-step instructions.

**Contents:**
- [Create Fade Animation](./how-to/create-fade-animation.md)
- [Create Slide Animation](./how-to/create-slide-animation.md)
- [Create Scale Animation](./how-to/create-scale-animation.md)
- [Create Rotate Animation](./how-to/create-rotate-animation.md)
- [Add Drag Gesture](./how-to/add-drag-gesture.md)
- [Add Hover Effect](./how-to/add-hover-effect.md)
- [Add Tap Gesture](./how-to/add-tap-gesture.md)
- [Animate on Scroll](./how-to/animate-on-scroll.md)
- [Animate List Reorder](./how-to/animate-list-reorder.md)
- [Animate Layout Changes](./how-to/animate-layout-changes.md)
- [Create Animation Sequence](./how-to/create-animation-sequence.md)
- [Create Shared Element Transition](./how-to/create-shared-element-transition.md)
- [Migrate from Framer Motion](./how-to/migrate-from-framer-motion.md)
- [Optimize Performance](./how-to/optimize-performance.md)
- [Troubleshooting](./how-to/troubleshooting.md)
- [Prevent Animation Flash](./how-to/prevent-animation-flash.md) - Preventing visual flash/jank
- [Animation Timing Considerations](./how-to/animation-timing-considerations.md) - useLayoutEffect vs useEffect
- [Viewport Animation Patterns](./how-to/viewport-animation-patterns.md) - Best practices for scroll animations
- [Inject Animation CSS](./how-to/inject-animation-css.md) - CSS injection patterns
- [Debug Animations](./how-to/debug-animations.md) - Enable debug logging
- [Create Responsive Layout](./how-to/create-responsive-layout.md) - Build responsive layouts with primitives

---

### 💡 [Explanations](./explanations/) - Understanding Concepts

Conceptual documentation that explains the "why" and "how" behind Cascade Motion's design and architecture.

**When to use:** You want to understand concepts, design decisions, or how things work internally.

**Contents:**
- [CSS-First Philosophy](./explanations/css-first-philosophy.md)
- [Motion Values Explained](./explanations/motion-values.md)
- [Compile-time vs Runtime](./explanations/compile-time-vs-runtime.md)
- [Architecture](./explanations/architecture.md)
- [Performance Characteristics](./explanations/performance-characteristics.md)
- [Comparison with Framer Motion](./explanations/comparison-framer-motion.md)
- [Comparison with Other Libraries](./explanations/comparison-other-libraries.md)
- [Accessibility](./explanations/accessibility.md)
- [Layout Primitives Philosophy](./explanations/layout-primitives-philosophy.md)
- [FAQ](./explanations/faq.md)

---

## Quick Start

New to Cascade Motion? Start here:

1. **First time?** → [Getting Started Tutorial](./tutorials/getting-started.md)
2. **Want to create an animation?** → [How to Create Fade Animation](./how-to/create-fade-animation.md)
3. **Need API details?** → [Motion Values Reference](./reference/motion-values.md)
4. **Want to understand the design?** → [CSS-First Philosophy](./explanations/css-first-philosophy.md)

---

## Documentation Principles

Following the Diataxis framework, each document type has specific characteristics:

### Reference
- **Purpose:** Provide technical information
- **Style:** Factual, complete, accurate
- **Structure:** Organized by API/feature, searchable

### Tutorials
- **Purpose:** Help users learn by doing
- **Style:** Step-by-step, hands-on, with clear outcomes
- **Structure:** Linear progression, building skills

### How-to Guides
- **Purpose:** Help users accomplish specific tasks
- **Style:** Problem-oriented, goal-focused, practical
- **Structure:** Task-focused, may reference other docs

### Explanations
- **Purpose:** Help users understand concepts and decisions
- **Style:** Conceptual, background, context
- **Structure:** Topic-based, may reference other docs

---

## Contributing

When adding or updating documentation:

1. **Choose the right type** - Is it Reference, Tutorial, How-to, or Explanation?
2. **Follow the structure** - Each type has a specific format
3. **Cross-reference** - Link to related documents in other categories
4. **Keep it focused** - One document = one topic

---

## Additional Resources

- [Development Workflow](./DEVELOPMENT_WORKFLOW.md) - Using Cascade Motion as a git submodule
- [Integration Strategies](./INTEGRATION_STRATEGIES.md) - Integration approaches
- [Technical Documentation](./technical-documentation.md) - Low-level technical details


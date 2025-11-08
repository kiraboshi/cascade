# Reusable Animated Components

This directory contains reusable, parameterized animated components built with Cascade Motion. These components demonstrate how Cascade supports component composition and reusability alongside its integration features.

## Components

### `AnimatedCard`
A reusable card component with scroll-triggered fade and slide animations.

**Props:**
- `title` (string): Card title
- `description` (string): Card description
- `icon?` (string): Optional icon/emoji
- `delay?` (number): Animation delay in milliseconds
- `style?` (React.CSSProperties): Custom styling
- `className?` (string): Additional CSS classes
- `children?` (React.ReactNode): Children content
- `background?` (string): Background color (default: white)
- `hoverScale?` (number): Hover scale effect (default: 1.02)

**Features:**
- Scroll-triggered fade-in and slide-up animations
- Fade-out when scrolling out of view
- Hover scale effect
- Staggered animations via delay prop

**Example:**
```typescript
<AnimatedCard
  title="Feature Title"
  description="Feature description"
  icon="⚡"
  delay={100}
/>
```

### `AnimatedSection`
A reusable section component with scroll-triggered fade animations.

**Props:**
- `title` (string): Section title
- `subtitle?` (string): Section subtitle
- `background?` (string): Background color or gradient
- `children` (React.ReactNode): Section content
- `maxWidth?` (string): Maximum width of content (default: '1200px')
- `style?` (React.CSSProperties): Additional styling
- `spacing?` ('xs' | 'sm' | 'md' | 'lg' | 'xl'): Spacing between Stack items
- `align?` ('start' | 'center' | 'end' | 'stretch'): Alignment of Stack items

**Features:**
- Scroll-triggered fade-in animation
- Fade-out when scrolling out of view
- Uses Cascade's `Stack` component for layout
- Responsive typography

**Example:**
```typescript
<AnimatedSection
  title="Section Title"
  subtitle="Section subtitle"
  background="white"
>
  {/* Content */}
</AnimatedSection>
```

### `AnimatedSequenceCard`
A reusable card component that uses `MotionSequence` for compile-time animations.

**Props:**
- `animation` (MotionOutput): Animation definition from `defineMotion`
- `delay?` (number): Animation delay in milliseconds
- `title` (string): Card title
- `description` (string): Card description
- `icon` (string): Icon/emoji
- `additionalTransform?` (string): Additional transform styles (for parallax, rotation, scale)
- `background?` (string): Background color
- `autoStart?` (boolean): Whether to auto-start animation
- `style?` (React.CSSProperties): Custom styling

**Features:**
- Uses `MotionSequence` and `MotionStage` for orchestrated animations
- Supports compile-time animations from `defineMotion`
- Can be combined with runtime motion values via `additionalTransform`
- Automatic CSS injection

**Example:**
```typescript
const spinAnimation = defineMotion({
  type: 'spring',
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(720deg)' },
  duration: 2000,
});

<AnimatedSequenceCard
  animation={spinAnimation}
  title="Spinning Card"
  description="This card spins!"
  icon="🌀"
  delay={200}
  additionalTransform={`translateY(var(${parallaxY.cssVarName}))`}
/>
```

### `AnimatedTestimonial`
A reusable testimonial card component with slide-in animation.

**Props:**
- `quote` (string): Testimonial quote
- `author` (string): Author name
- `role` (string): Author role
- `background?` (string): Background gradient or color
- `style?` (React.CSSProperties): Custom styling

**Features:**
- Scroll-triggered slide-up animation
- Fade-out when scrolling out of view
- Gradient background support

**Example:**
```typescript
<AnimatedTestimonial
  quote="This is amazing!"
  author="John Doe"
  role="Developer"
/>
```

### `AnimatedHero`
A reusable hero section component with sequenced animations.

**Props:**
- `title` (string): Hero title
- `subtitle` (string): Hero subtitle
- `ctaText?` (string): CTA button text
- `onCtaClick?` (() => void): CTA button onClick handler
- `background?` (string): Background gradient
- `maxWidth?` (string): Maximum width of content

**Features:**
- Sequenced title, subtitle, and CTA animations
- Uses `MotionSequence` for orchestration
- CTA button with hover scale effect
- Automatic CSS injection via `useMotionStyles`

**Example:**
```typescript
<AnimatedHero
  title="Welcome"
  subtitle="This is a hero section"
  ctaText="Get Started"
  onCtaClick={() => console.log('Clicked')}
/>
```

## Hooks

### `useMotionStyles`
Reusable hook for injecting motion CSS styles into the document head.

**Parameters:**
- `animations` (MotionOutput[]): Array of motion outputs from `defineMotion`
- `styleId?` (string): Optional custom style ID

**Features:**
- Automatic deduplication by style ID
- Handles multiple animations in a single style element

**Example:**
```typescript
const fadeIn = defineMotion({ /* ... */ });
const slideIn = defineMotion({ /* ... */ });

useMotionStyles([fadeIn, slideIn], 'my-animations');
```

### `useMotionStyle`
Convenience wrapper around `useMotionStyles` for a single animation.

**Parameters:**
- `animation` (MotionOutput): Motion output from `defineMotion`
- `styleId?` (string): Optional custom style ID

## Design Principles

These components demonstrate:

1. **Reusability**: Components can be used across different pages and contexts
2. **Parameterization**: All aspects are configurable via props
3. **Composition**: Components can be nested and combined
4. **Integration**: Seamlessly works with Cascade's layout primitives (`Stack`, `Cluster`, `Frame`)
5. **Type Safety**: Full TypeScript support with exported prop types
6. **Performance**: Leverages Cascade's CSS-first approach for optimal performance

## Usage in Landing Page

The landing page (`apps/demo/src/pages/LandingPage.tsx`) has been refactored to use these reusable components, demonstrating:

- **Before**: Direct style manipulation with repeated code
- **After**: Clean, reusable components with parameterized props

This proves that Cascade supports component composition and reusability alongside its integration features.


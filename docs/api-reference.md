# Cascade CSS Foundation: API Reference

Complete API documentation for all packages, types, and functions.

## Table of Contents

- [@cascade/tokens](#cascade-tokens)
- [@cascade/core](#cascade-core)
- [@cascade/compiler](#cascade-compiler)
- [@cascade/motion-runtime](#cascade-motion-runtime)
- [@cascade/react](#cascade-react)

---

## @cascade/tokens

### Exports

#### `tokens`

Type: `Readonly<{ color: {...}, space: {...}, motion: {...}, typography: {...}, layout: {...} }>`

The TypeScript token definitions object. Provides type-safe access to all design tokens.

**Example:**
```typescript
import { tokens } from '@cascade/tokens';

const primaryColor = tokens.color.primary;
const spacing = tokens.space.md;
```

---

#### `dtcgTokens`

Type: `DTCGTokenTree`

The DTCG JSON format token definitions. Used for tooling interoperability.

**Example:**
```typescript
import { dtcgTokens } from '@cascade/tokens';

const token = dtcgTokens.color.primary;
// { $value: "{color.blue.500}", $type: "color" }
```

---

#### `resolveToken(category: string, key: string): string`

Resolves a token value from either DTCG JSON or TypeScript format.

**Parameters:**
- `category`: Token category (e.g., `'color'`, `'space'`)
- `key`: Token key (e.g., `'primary'`, `'md'`)

**Returns:** Resolved token value as string

**Throws:** `Error` if token not found

**Example:**
```typescript
import { resolveToken } from '@cascade/tokens';

const color = resolveToken('color', 'primary');
const spacing = resolveToken('space', 'md');
```

---

#### `getTokens<T>(category: T): typeof tokens[T]`

Gets all tokens for a specific category.

**Type Parameters:**
- `T`: Token category key

**Parameters:**
- `category`: Token category

**Returns:** All tokens in that category

**Example:**
```typescript
import { getTokens } from '@cascade/tokens';

const colors = getTokens('color');
const spaces = getTokens('space');
```

---

#### Types

```typescript
type TokenKey<T extends keyof typeof tokens> = keyof typeof tokens[T];
type ColorToken = TokenKey<'color'>;
type SpaceToken = TokenKey<'space'>;
type MotionDurationToken = TokenKey<'motion'> extends 'motion' 
  ? keyof typeof tokens.motion.duration 
  : never;
```

---

## @cascade/core

### Exports

#### `generateFoundationCSS(): string`

Generates the complete foundation CSS with all layers.

**Returns:** Complete CSS string with @layer declarations and all layer content

**Example:**
```typescript
import { generateFoundationCSS } from '@cascade/core';

const css = generateFoundationCSS();
// Output: "@layer reset, tokens, ...\n\n@layer reset { ... } ..."
```

---

#### `generateTokenCSS(options?: TokenResolverOptions): string`

Generates CSS custom properties from tokens.

**Parameters:**
- `options.prefix`: CSS custom property prefix (default: `'--cascade'`)
- `options.format`: Color format preference (not fully implemented)

**Returns:** CSS string with `:root { --cascade-*: ... }` declarations

**Example:**
```typescript
import { generateTokenCSS } from '@cascade/core';

const css = generateTokenCSS({ prefix: '--my-prefix' });
```

---

#### `resolveTokenValue(value: string | number, options?: TokenResolverOptions): string`

Resolves a token value, handling references like `{color.blue.500}`.

**Parameters:**
- `value`: Token value (may contain references)
- `options`: Resolution options

**Returns:** Resolved value as string

**Example:**
```typescript
import { resolveTokenValue } from '@cascade/core';

const resolved = resolveTokenValue('{color.blue.500}');
// Returns: "oklch(0.637 0.237 25.331)"
```

---

#### `generateLayerDeclarations(): string`

Generates CSS @layer declarations in priority order.

**Returns:** `"@layer reset, tokens, base, layouts, components, utilities, motion, overrides;"`

---

#### `wrapInLayer(layer: LayerName, content: string): string`

Wraps CSS content in a @layer block.

**Parameters:**
- `layer`: Layer name
- `content`: CSS content to wrap

**Returns:** Wrapped CSS string

**Example:**
```typescript
import { wrapInLayer } from '@cascade/core';

const css = wrapInLayer('tokens', ':root { --color: red; }');
// Output: "@layer tokens { :root { --color: red; } }"
```

---

#### `isLayoutTriggering(property: string): boolean`

Checks if a CSS property triggers layout recalculation.

**Parameters:**
- `property`: CSS property name

**Returns:** `true` if property triggers layout

**Example:**
```typescript
import { isLayoutTriggering } from '@cascade/core';

if (isLayoutTriggering('margin')) {
  console.warn('Avoid animating margin');
}
```

---

#### `isAccelerated(property: string): boolean`

Checks if a CSS property is hardware-accelerated.

**Parameters:**
- `property`: CSS property name

**Returns:** `true` if property is accelerated

---

#### Constants

```typescript
const LAYER_ORDER: readonly LayerName[];
const ACCELERATED_PROPERTIES: Set<string>;
const LAYOUT_TRIGGERING_PROPERTIES: Set<string>;
```

---

## @cascade/compiler

### Token Compilation

#### `compileTokens(): CompiledTokens`

Compiles tokens from both DTCG JSON and TypeScript formats.

**Returns:**
```typescript
{
  css: string;      // Generated CSS custom properties
  ts: string;       // Generated TypeScript type definitions
  tokens: Map<...>  // Merged token map
}
```

**Example:**
```typescript
import { compileTokens } from '@cascade/compiler';

const compiled = compileTokens();
console.log(compiled.css);  // CSS output
console.log(compiled.ts);   // TypeScript types
```

---

#### `resolveToken(keyPath: string): string | number | string[]`

Resolves a token value by dot-notation path.

**Parameters:**
- `keyPath`: Dot-notation path (e.g., `'space.md'`, `'color.primary'`)

**Returns:** Resolved token value

**Throws:** `Error` if token not found

---

#### `computeFluidValue(min: number, max: number, minViewport?: number, maxViewport?: number): string`

Computes a CSS `clamp()` value for fluid typography/spacing.

**Parameters:**
- `min`: Minimum value in pixels
- `max`: Maximum value in pixels
- `minViewport`: Minimum viewport width (default: `320`)
- `maxViewport`: Maximum viewport width (default: `1280`)

**Returns:** CSS clamp() expression string

**Example:**
```typescript
import { computeFluidValue } from '@cascade/compiler';

const fluid = computeFluidValue(16, 20);
// Returns: "clamp(1.0000rem, 0.9792rem + 0.4167vw, 1.2500rem)"
```

---

### DTCG Parsing

#### `parseDTCG(tokens: DTCGTokenTree): DTCGTokenTree`

Parses DTCG JSON token structure (currently a pass-through).

**Parameters:**
- `tokens`: DTCG token tree

**Returns:** Parsed token tree

---

#### `resolveDTCGAliases(tokens: DTCGTokenTree, visited?: Set<string>): DTCGTokenTree`

Resolves token aliases in DTCG format (e.g., `{color.blue.500}`).

**Parameters:**
- `tokens`: Token tree with aliases
- `visited`: Set of visited paths (for cycle detection)

**Returns:** Token tree with resolved aliases

**Throws:** `Error` if circular reference detected

---

#### `flattenDTCGTokens(tokens: DTCGTokenTree, prefix?: string): Map<string, DTCGToken>`

Flattens nested DTCG token tree to a flat map.

**Parameters:**
- `tokens`: Nested token tree
- `prefix`: Key prefix for nested tokens

**Returns:** Flat map of `path -> token`

---

### TypeScript Token Loading

#### `loadTSTokens(): TSTokenTree`

Loads TypeScript tokens and converts to structured format.

**Returns:** Structured token tree

---

#### `flattenTSTokens(tokenTree: TSTokenTree, prefix?: string): Map<string, TSTokenValue>`

Flattens TypeScript token tree to a flat map.

**Parameters:**
- `tokenTree`: Nested token tree
- `prefix`: Key prefix for nested tokens

**Returns:** Flat map of `path -> token value`

---

### Motion Compilation

#### `defineMotion(config: SpringMotionConfig | KeyframeConfig): MotionOutput`

Defines a motion animation (spring or keyframe).

**Parameters:**
- `config`: Spring or keyframe configuration

**Returns:**
```typescript
{
  css: string;           // Generated @keyframes CSS
  className: string;     // Generated class name
  jsConfig?: {          // Optional JS config for runtime
    type: 'css';
    className: string;
    duration: number;
  }
}
```

**Example:**
```typescript
import { defineMotion } from '@cascade/compiler';

const fadeIn = defineMotion({
  type: 'spring',
  stiffness: 300,
  damping: 20,
  from: { opacity: 0, transform: 'translateY(20px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
  duration: 300,
});

// Use: inject fadeIn.css, apply fadeIn.className
```

---

#### `defineMotionSequence(config: SequenceConfig): SequenceOutput`

Defines a motion sequence with multiple stages.

**Parameters:**
- `config.stages`: Array of animation stages
- `config.onComplete`: Optional completion signal

**Returns:**
```typescript
{
  css: string;           // Combined @keyframes CSS
  className: string;     // Sequence class name
  jsConfig: {
    type: 'sequence';
    stages: Array<{
      name: string;
      startAt: number;
      duration: number;
      className: string;
    }>;
    totalDuration: number;
  }
}
```

**Example:**
```typescript
import { defineMotionSequence } from '@cascade/compiler';

const sequence = defineMotionSequence({
  stages: [
    {
      name: 'slide',
      from: { transform: 'translateX(0)' },
      to: { transform: 'translateX(400px)' },
      duration: '800ms',
    },
    {
      name: 'fade',
      startAt: '60%',  // Starts at 60% of slide duration
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: '400ms',
    },
  ],
});
```

---

### Spring Physics

#### `solveSpring(config: SpringConfig, duration?: number, steps?: number): number[]`

Solves spring physics using RK4 method.

**Parameters:**
- `config.stiffness`: Spring stiffness
- `config.damping`: Damping coefficient
- `config.mass`: Mass (default: `1`)
- `config.from`: Starting value
- `config.to`: Target value
- `duration`: Animation duration in ms (default: `1000`)
- `steps`: Number of steps (default: `60`)

**Returns:** Array of values at each step

**Algorithm:** Runge-Kutta 4th order method

---

#### `shouldPrecompute(duration: number): boolean`

Determines if spring animation should be pre-computed.

**Parameters:**
- `duration`: Animation duration in ms

**Returns:** `true` if duration < 300ms (should pre-compute)

---

### Keyframe Generation

#### `generateKeyframes(name: string, config: KeyframeConfig): { css: string; className: string }`

Generates CSS @keyframes from keyframe config.

**Parameters:**
- `name`: Keyframe name
- `config.from`: Starting keyframe values
- `config.to`: Ending keyframe values
- `config.duration`: Animation duration (default: `'300ms'`)
- `config.easing`: Easing function (default: `'ease'`)

**Returns:** CSS string and class name

---

#### `generateSpringKeyframes(name: string, config: SpringKeyframeConfig): { css: string; className: string; jsConfig?: object }`

Generates CSS @keyframes from spring physics.

**Parameters:**
- `name`: Keyframe name
- `config.properties`: Property definitions with from/to values
- `config.stiffness`: Spring stiffness
- `config.damping`: Damping coefficient
- `config.mass`: Mass
- `config.duration`: Duration in ms (default: `300`)
- `config.easing`: Easing function (default: bounce)

**Returns:** CSS string, class name, and optional JS config

---

### Type Generation

#### `generateTypes(options?: TypeGenerationOptions): string`

Generates TypeScript type definitions.

**Parameters:**
- `options.generateTokenTypes`: Generate token types (default: `true`)
- `options.generateComponentTypes`: Generate component types (default: `true`)
- `options.generateMotionTypes`: Generate motion types (default: `true`)

**Returns:** TypeScript declaration file content

---

#### `writeTypes(outputPath: string, options?: TypeGenerationOptions): Promise<void>`

Writes type definitions to file.

**Parameters:**
- `outputPath`: File path to write
- `options`: Generation options

---

### Vite Plugin

#### `cascadeVitePlugin(options?: CascadeVitePluginOptions): Plugin`

Creates a Vite plugin for token compilation and HMR.

**Parameters:**
- `options.watchTokens`: Watch token files for changes (default: `true`)
- `options.generateFoundationCSS`: Regenerate foundation CSS (default: `true`)

**Returns:** Vite plugin instance

**Example:**
```typescript
import { cascadeVitePlugin } from '@cascade/compiler';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    cascadeVitePlugin({
      watchTokens: true,
      generateFoundationCSS: true,
    }),
  ],
});
```

---

### StyleX Integration

#### `stylex`

Re-export of `@stylexjs/stylex`. Use `stylex.create()` at module level.

**Example:**
```typescript
import { stylex } from '@cascade/compiler';

const styles = stylex.create({
  button: { backgroundColor: 'blue' },
});
```

---

#### `props`

Re-export of `stylex.props`. Combines style objects into className.

**Example:**
```typescript
import { props } from '@cascade/compiler';

const className = props(styles.base, styles.variant).className;
```

---

## @cascade/motion-runtime

### Components

#### `<MotionSequence>`

Orchestrates multiple animation stages.

**Props:**
```typescript
interface MotionSequenceProps {
  children: ReactNode;
  onComplete?: () => void;
  autoStart?: boolean;
  respectReducedMotion?: boolean;
  pauseOnHover?: boolean;
}
```

**Example:**
```typescript
<MotionSequence autoStart onComplete={() => console.log('Done!')}>
  <MotionStage animation={stage1} onComplete={(e) => e.next()} />
  <MotionStage animation={stage2} delay="until-previous-completes" />
</MotionSequence>
```

---

#### `<MotionStage>`

Individual animation stage component.

**Props:**
```typescript
interface MotionStageProps {
  animation: string | { className: string; css?: string };
  delay?: number | 'until-previous-completes';
  onComplete?: (event: { next: () => void }) => void;
  onStart?: () => void;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}
```

**Example:**
```typescript
<MotionStage
  animation={{
    className: motion.className,
    css: motion.css,
  }}
  onComplete={(e) => {
    console.log('Animation complete');
    e.next();  // Trigger next stage
  }}
>
  <div>Animated content</div>
</MotionStage>
```

---

### Hooks

#### `useMotionSequence(stageCount: number, options?: UseMotionSequenceOptions): MotionSequenceControls`

Hook for programmatic sequence control.

**Parameters:**
- `stageCount`: Number of stages
- `options.autoStart`: Start automatically (default: `false`)
- `options.respectReducedMotion`: Respect prefers-reduced-motion (default: `true`)
- `options.onComplete`: Completion callback

**Returns:**
```typescript
{
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  goToStage: (index: number) => void;
  state: SequenceState;
}
```

**Example:**
```typescript
import { useMotionSequence } from '@cascade/motion-runtime';

function MyComponent() {
  const { start, pause, state } = useMotionSequence(3, {
    autoStart: true,
    onComplete: () => console.log('Done!'),
  });
  
  return <button onClick={pause}>Pause</button>;
}
```

---

#### `<AnimatePresence>`

Component for animating mount/unmount of children with enter/exit animations.

**Props:**
```typescript
interface AnimatePresenceProps {
  children: ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
  onExitComplete?: () => void;
  exit?: {
    opacity?: number;
    transform?: string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  enter?: {
    opacity?: number;
    transform?: string;
    config?: SpringConfig | MotionValueKeyframeConfig;
  };
  layout?: boolean;
}
```

**Example:**
```typescript
import { AnimatePresence } from '@cascade/motion-runtime';

function List() {
  const [items, setItems] = useState([1, 2, 3]);
  
  return (
    <AnimatePresence
      exit={{
        opacity: 0,
        transform: 'translateX(-100px)',
        config: { duration: 300, easing: 'ease-out' },
      }}
      enter={{
        opacity: 0,
        config: { duration: 300, easing: 'ease-in' },
      }}
    >
      {items.map(item => (
        <div key={item}>Item {item}</div>
      ))}
    </AnimatePresence>
  );
}
```

**Modes:**
- `sync` (default): Animate all children simultaneously
- `wait`: Wait for exit animation before entering next
- `popLayout`: Remove element from layout immediately, then animate

**With Layout Transitions:**
```typescript
<AnimatePresence
  layout
  exit={{ opacity: 0, config: { duration: 300 } }}
>
  {items.map(item => (
    <div key={item}>Item {item}</div>
  ))}
</AnimatePresence>
```

---

#### `useAnimatePresence(isPresent: boolean, config?: UseAnimatePresenceConfig): UseAnimatePresenceReturn`

Hook version of AnimatePresence for programmatic control of single elements.

**Parameters:**
- `isPresent`: Boolean indicating if element should be present
- `config`: Optional configuration (same as AnimatePresence props)

**Returns:**
```typescript
{
  ref: (el: HTMLElement | null) => void;
  isExiting: boolean;
  isEntering: boolean;
  shouldRender: boolean;
}
```

**Example:**
```typescript
import { useAnimatePresence } from '@cascade/motion-runtime';

function Modal({ isOpen }: { isOpen: boolean }) {
  const { ref, isExiting, shouldRender } = useAnimatePresence(isOpen, {
    exit: { opacity: 0, config: { duration: 200 } },
    enter: { opacity: 0, config: { duration: 200 } },
  });
  
  if (!shouldRender) return null;
  
  return (
    <div
      ref={ref}
      style={{ opacity: isExiting ? 0 : 1 }}
    >
      Modal content
    </div>
  );
}
```

---

### Utilities

#### `prefersReducedMotion(): boolean`

Checks if user prefers reduced motion.

**Returns:** `true` if `(prefers-reduced-motion: reduce)` matches

---

## @cascade/react

### Components

#### `<Stack>`

Vertical flex container with configurable spacing.

**Props:**
```typescript
interface StackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  spacing: SpaceToken;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  responsive?: Record<string, Partial<Omit<StackProps, 'responsive'>>>;
  as?: keyof JSX.IntrinsicElements;
}
```

**Example:**
```typescript
import { Stack } from '@cascade/react';

<Stack 
  spacing="md" 
  align="center"
  responsive={{
    sm: { spacing: 'lg', align: 'start' },
    lg: { spacing: 'xl' },
  }}
>
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
```

**CSS Output:**
- Base: `display: flex; flex-direction: column; gap: var(--stack-gap)`
- Responsive: Media queries apply based on `data-responsive` attribute

---

#### `<Cluster>`

Horizontal flex container with wrapping.

**Props:**
```typescript
interface ClusterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  spacing?: SpaceToken;
  justify?: 'start' | 'center' | 'end' | 'between';
  detectWrapping?: boolean;
  as?: keyof JSX.IntrinsicElements;
}
```

**Example:**
```typescript
import { Cluster } from '@cascade/react';

<Cluster spacing="sm" detectWrapping>
  <div>Tag 1</div>
  <div>Tag 2</div>
  <div>Tag 3</div>
</Cluster>
```

**Features:**
- Automatic wrapping detection (optional)
- `data-wrapping` attribute for CSS styling
- Gap-based spacing using tokens

---

#### `<Frame>`

Aspect ratio container.

**Props:**
```typescript
interface FrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  ratio: `${number}/${number}`;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  as?: keyof JSX.IntrinsicElements;
}
```

**Example:**
```typescript
import { Frame } from '@cascade/react';

<Frame ratio="16/9" objectFit="cover">
  <img src="..." />
</Frame>
```

**CSS Output:**
- Container: `aspect-ratio: var(--frame-ratio)`
- Content: `position: absolute; inset: 0; object-fit: var(--frame-object-fit)`

---

## Type Definitions

### Token Types

```typescript
// Token key types
type TokenKey<T extends keyof typeof tokens> = keyof typeof tokens[T];
type ColorToken = TokenKey<'color'>;
type SpaceToken = TokenKey<'space'>;

// DTCG types
interface DTCGToken {
  $value: string | number | string[];
  $type?: string;
  $description?: string;
}

interface DTCGTokenTree {
  [key: string]: DTCGToken | DTCGTokenTree;
}

// TypeScript token types
interface TSTokenValue {
  value: string | number | string[];
  type?: string;
}

interface TSTokenTree {
  [key: string]: TSTokenValue | TSTokenTree;
}
```

### Motion Types

```typescript
interface SpringMotionConfig {
  type: 'spring';
  stiffness: number;
  damping: number;
  mass?: number;
  from: Record<string, string | number>;
  to: Record<string, string | number>;
  duration?: number;
}

interface SequenceStage {
  name: string;
  from: Record<string, string | number>;
  to: Record<string, string | number>;
  duration: string | number;
  easing?: string;
  startAt?: string | number;
}

interface SequenceConfig {
  stages: SequenceStage[];
  onComplete?: string;
}

interface MotionOutput {
  css: string;
  className: string;
  jsConfig?: {
    type: 'css';
    className: string;
    duration: number;
  };
}

interface SequenceOutput {
  css: string;
  className: string;
  jsConfig: {
    type: 'sequence';
    stages: Array<{
      name: string;
      startAt: number;
      duration: number;
      className: string;
    }>;
    totalDuration: number;
  };
}
```

### Component Types

```typescript
interface StackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  spacing: SpaceToken;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  responsive?: Record<string, Partial<Omit<StackProps, 'responsive'>>>;
  as?: keyof JSX.IntrinsicElements;
}

interface ClusterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  spacing?: SpaceToken;
  justify?: 'start' | 'center' | 'end' | 'between';
  detectWrapping?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

interface FrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  ratio: `${number}/${number}`;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  as?: keyof JSX.IntrinsicElements;
}
```

---

## Error Handling

### Common Errors

#### Token Not Found

```typescript
try {
  resolveToken('invalid', 'key');
} catch (error) {
  // Error: Token not found: invalid.key
}
```

#### Circular Reference

```typescript
try {
  resolveDTCGAliases({
    a: { $value: '{b}' },
    b: { $value: '{a}' },
  });
} catch (error) {
  // Error: Circular reference detected in token: a
}
```

#### Invalid Motion Config

```typescript
// Negative stiffness may produce invalid keyframes
defineMotion({
  type: 'spring',
  stiffness: -100,  // Invalid
  ...
});
```

---

## Best Practices

### Token Usage

1. **Use TypeScript tokens in code:**
   ```typescript
   const spacing = tokens.space.md;  // ✅ Type-safe
   ```

2. **Use DTCG JSON for tooling:**
   ```json
   { "color": { "primary": { "$value": "{color.blue.500}" } } }
   ```

3. **Resolve aliases at build-time:**
   ```typescript
   const compiled = compileTokens();  // Aliases resolved
   ```

### Motion Usage

1. **Pre-compute short animations:**
   ```typescript
   // Duration < 300ms: pre-computed keyframes
   const quick = defineMotion({ duration: 200, ... });
   ```

2. **Use sequences for complex animations:**
   ```typescript
   // Overlapping stages: combined keyframe
   const sequence = defineMotionSequence({
     stages: [
       { startAt: '0%', ... },
       { startAt: '60%', ... },  // Overlaps
     ],
   });
   ```

3. **Inject CSS before using:**
   ```typescript
   useEffect(() => {
     const style = document.createElement('style');
     style.textContent = motion.css;
     document.head.appendChild(style);
   }, [motion]);
   ```

### Component Usage

1. **Use tokens for spacing:**
   ```typescript
   <Stack spacing="md" />  // ✅ Uses token
   <Stack spacing="20px" />  // ❌ Not type-safe
   ```

2. **Leverage responsive props:**
   ```typescript
   <Stack 
     spacing="sm"
     responsive={{
       sm: { spacing: 'md' },
       lg: { spacing: 'lg', align: 'center' },
     }}
   />
   ```

3. **Use polymorphic `as` prop:**
   ```typescript
   <Stack as="section" spacing="md" />  // Renders <section>
   ```

---

This API reference provides complete documentation for all public interfaces, types, and functions in the Cascade CSS Foundation system.



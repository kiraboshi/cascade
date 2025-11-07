# Cascade CSS Foundation: Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Type System](#type-system)
3. [Package APIs](#package-apis)
4. [Data Flow](#data-flow)
5. [Key Algorithms](#key-algorithms)
6. [Integration Points](#integration-points)

---

## Architecture Overview

### Package Structure

```
cascade/
├── packages/
│   ├── tokens/          # Token definitions (DTCG JSON + TypeScript)
│   ├── core/            # Foundation CSS generator
│   ├── compiler/        # Token compiler, StyleX integration, motion compiler
│   ├── motion-runtime/  # Runtime orchestrator for sequences
│   └── react/           # Layout primitives
└── apps/
    └── demo/            # Demo application
```

### Dependency Graph

```
@cascade/react → @cascade/motion-runtime → @cascade/compiler → @cascade/core → @cascade/tokens
apps/demo → @cascade/react + @cascade/core + @cascade/motion-runtime
```

---

## Type System

### Token Types

#### `@cascade/tokens`

```typescript
// DTCG Token Structure
interface DTCGToken {
  $value: string | number | string[];
  $type?: string;
  $description?: string;
}

interface DTCGTokenTree {
  [key: string]: DTCGToken | DTCGTokenTree;
}

// TypeScript Token Structure
interface TSTokenValue {
  value: string | number | string[];
  type?: string;
}

interface TSTokenTree {
  [key: string]: TSTokenValue | TSTokenTree;
}

// Token Key Types
type TokenKey<T extends keyof typeof tokens> = keyof typeof tokens[T];
type ColorToken = TokenKey<'color'>;
type SpaceToken = TokenKey<'space'>;
```

**Purpose:** Provides dual-format token definitions with type safety. DTCG format enables tooling interoperability, TypeScript format provides compile-time type checking.

**Key Functions:**
- `resolveToken(category: string, key: string): string` - Resolves token value from either format
- `getTokens<T>(category: T): typeof tokens[T]` - Gets all tokens for a category

---

### Core Types

#### `@cascade/core`

```typescript
// Layer Management
type LayerName = 'reset' | 'tokens' | 'base' | 'layouts' | 'components' | 'utilities' | 'motion' | 'overrides';

const LAYER_ORDER: readonly LayerName[] = [
  'reset', 'tokens', 'base', 'layouts', 'components', 'utilities', 'motion', 'overrides'
];

// Token Resolution Options
interface TokenResolverOptions {
  prefix?: string;
  format?: 'oklch' | 'hex' | 'rgb';
}

// Hardware Acceleration Classification
const ACCELERATED_PROPERTIES: Set<string>;
const LAYOUT_TRIGGERING_PROPERTIES: Set<string>;
```

**Key Functions:**

```typescript
// Layer Management
function generateLayerDeclarations(): string
function wrapInLayer(layer: LayerName, content: string): string

// Token Resolution
function resolveTokenValue(
  value: string | number,
  options?: TokenResolverOptions
): string

function generateTokenCSS(options?: TokenResolverOptions): string

// Hardware Acceleration Checks
function isLayoutTriggering(property: string): boolean
function isAccelerated(property: string): boolean

// Foundation CSS Generation
function generateFoundationCSS(): string
```

**Implementation Details:**

- **Layer System:** Uses CSS `@layer` to manage cascade priority. Layers are applied in strict order (reset → overrides).
- **Token Resolution:** Handles token references like `{color.blue.500}` by traversing the token tree.
- **CSS Generation:** Generates CSS custom properties with `--cascade-` prefix. Supports oklch colors and calc() expressions.
t
---

### Compiler Types

#### `@cascade/compiler`

```typescript
// Compiled Token Output
interface CompiledTokens {
  css: string;           // Generated CSS custom properties
  ts: string;            // Generated TypeScript type definitions
  tokens: Map<string, { value: string | number | string[]; source: 'dtcg' | 'ts' }>;
}

// Motion Configuration
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
  startAt?: string | number;  // Percentage or absolute time
}

interface SequenceConfig {
  stages: SequenceStage[];
  onComplete?: string;
}

// Motion Output
interface MotionOutput {
  css: string;           // Generated @keyframes CSS
  className: string;     // Generated class name
  jsConfig?: {
    type: 'css';
    className: string;
    duration: number;
  };
}

interface SequenceOutput {
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
  };
}

// Keyframe Configuration
interface KeyframeConfig {
  from: KeyframeValue;
  to: KeyframeValue;
  duration?: number;
  easing?: string;
}

interface SpringKeyframeConfig extends SpringConfig {
  properties: Record<string, { from: number; to: number }>;
  duration?: number;
  easing?: string;
}

interface SpringConfig {
  stiffness: number;
  damping: number;
  mass?: number;
  from: number;
  to: number;
}
```

**Key Functions:**

```typescript
// Token Compilation
function compileTokens(): CompiledTokens
function resolveToken(keyPath: string): string | number | string[]
function computeFluidValue(
  min: number,
  max: number,
  minViewport?: number,
  maxViewport?: number
): string

// DTCG Parsing
function parseDTCG(tokens: DTCGTokenTree): DTCGTokenTree
function resolveDTCGAliases(
  tokens: DTCGTokenTree,
  visited?: Set<string>
): DTCGTokenTree
function flattenDTCGTokens(
  tokens: DTCGTokenTree,
  prefix?: string
): Map<string, DTCGToken>

// TypeScript Token Loading
function loadTSTokens(): TSTokenTree
function flattenTSTokens(
  tokenTree: TSTokenTree,
  prefix?: string
): Map<string, TSTokenValue>

// Motion Compilation
function defineMotion(config: SpringMotionConfig | KeyframeConfig): MotionOutput
function defineMotionSequence(config: SequenceConfig): SequenceOutput

// Spring Physics
function solveSpring(
  config: SpringConfig,
  duration?: number,
  steps?: number
): number[]
function shouldPrecompute(duration: number): boolean

// Keyframe Generation
function generateKeyframes(
  name: string,
  config: KeyframeConfig
): { css: string; className: string }

function generateSpringKeyframes(
  name: string,
  config: SpringKeyframeConfig
): { css: string; className: string; jsConfig?: object }

// Type Generation
function generateTypes(options?: TypeGenerationOptions): string
function writeTypes(outputPath: string, options?: TypeGenerationOptions): Promise<void>

// Vite Plugin
function cascadeVitePlugin(options?: CascadeVitePluginOptions): Plugin
```

**Implementation Details:**

- **Token Compilation:** Merges DTCG JSON and TypeScript tokens, with TypeScript taking precedence. Resolves aliases recursively, detecting circular references.
- **Spring Solver:** Uses RK4 (Runge-Kutta 4th order) method to solve spring differential equations. Generates keyframe values at build-time for durations < 300ms.
- **Sequence Compilation:** Detects overlapping stages and generates combined keyframes. Supports percentage-based (`startAt: '60%'`) and absolute timing.

---

### React Component Types

#### `@cascade/react`

```typescript
// Stack Component
interface StackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  spacing: SpaceToken;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  responsive?: Record<string, Partial<Omit<StackProps, 'responsive'>>>;
  as?: keyof JSX.IntrinsicElements;
}

// Cluster Component
interface ClusterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  spacing?: SpaceToken;
  justify?: 'start' | 'center' | 'end' | 'between';
  detectWrapping?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

// Frame Component
interface FrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  ratio: `${number}/${number}`;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  as?: keyof JSX.IntrinsicElements;
}
```

**Implementation Pattern:**

All components follow this pattern:
1. Use `stylex.create()` at module level (required by Babel plugin)
2. Resolve tokens to CSS custom properties
3. Generate responsive data-attributes (if applicable)
4. Compose className using `stylex.props()`
5. Apply CSS custom properties via inline styles
6. Support polymorphic `as` prop

---

### Motion Runtime Types

#### `@cascade/motion-runtime`

```typescript
// Animation State
type AnimationState = 'idle' | 'running' | 'paused' | 'completed';

interface MotionStageState {
  name: string;
  state: AnimationState;
  startTime: number | null;
  progress: number;  // 0-1
}

interface SequenceState {
  stages: MotionStageState[];
  currentStageIndex: number;
  state: AnimationState;
  respectReducedMotion: boolean;
}

// Component Props
interface MotionSequenceProps {
  children: ReactNode;
  onComplete?: () => void;
  autoStart?: boolean;
  respectReducedMotion?: boolean;
  pauseOnHover?: boolean;
}

interface MotionStageProps {
  animation: string | { className: string; css?: string };
  delay?: number | 'until-previous-completes';
  onComplete?: (event: { next: () => void }) => void;
  onStart?: () => void;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}

// Hook Options
interface UseMotionSequenceOptions {
  autoStart?: boolean;
  respectReducedMotion?: boolean;
  onComplete?: () => void;
}

interface MotionSequenceControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  goToStage: (index: number) => void;
  state: SequenceState;
}
```

**Key Functions:**

```typescript
// Components
function MotionSequence(props: MotionSequenceProps): JSX.Element
function MotionStage(props: MotionStageProps): JSX.Element

// Hook
function useMotionSequence(
  stageCount: number,
  options?: UseMotionSequenceOptions
): MotionSequenceControls

// Utilities
function prefersReducedMotion(): boolean
```

**Implementation Details:**

- **MotionSequence:** Orchestrates multiple MotionStage components. Clones children to inject completion handlers. Manages stage progression via `animationend` events.
- **MotionStage:** Wraps content and applies animation className. Injects CSS if provided. Handles delay and completion callbacks.
- **State Management:** Tracks animation state per stage. Supports pause/resume/reset operations. Respects `prefers-reduced-motion` media query.

---

## Package APIs

### `@cascade/tokens`

**Exports:**

```typescript
// Token Objects
export const tokens: {
  color: { ... };
  space: { ... };
  motion: { ... };
  typography: { ... };
  layout: { ... };
}

export const dtcgTokens: DTCGTokenTree;

// Types
export type TokenKey<T extends keyof typeof tokens>;
export type ColorToken;
export type SpaceToken;
export type MotionDurationToken;

// Functions
export function resolveToken(category: string, key: string): string
export function getTokens<T extends keyof typeof tokens>(category: T): typeof tokens[T]
```

**Usage:**

```typescript
import { tokens, resolveToken, type SpaceToken } from '@cascade/tokens';

// Direct access
const primaryColor = tokens.color.primary;
const spacing = tokens.space.md;

// Resolve function
const color = resolveToken('color', 'primary');

// Type-safe token keys
const spacingKey: SpaceToken = 'md';
```

---

### `@cascade/core`

**Exports:**

```typescript
// Foundation CSS
export function generateFoundationCSS(): string

// Token Resolution
export function generateTokenCSS(options?: TokenResolverOptions): string
export function resolveTokenValue(
  value: string | number,
  options?: TokenResolverOptions
): string

// Layer Management
export const LAYER_ORDER: readonly LayerName[];
export type LayerName;
export function generateLayerDeclarations(): string
export function wrapInLayer(layer: LayerName, content: string): string

// Hardware Acceleration
export const ACCELERATED_PROPERTIES: Set<string>;
export const LAYOUT_TRIGGERING_PROPERTIES: Set<string>;
export function isLayoutTriggering(property: string): boolean
export function isAccelerated(property: string): boolean
```

**Usage:**

```typescript
import { generateFoundationCSS, isLayoutTriggering } from '@cascade/core';

// Generate foundation CSS
const css = generateFoundationCSS();

// Check property classification
if (isLayoutTriggering('margin')) {
  console.warn('Avoid animating margin');
}
```

---

### `@cascade/compiler`

**Exports:**

```typescript
// Token Compilation
export function compileTokens(): CompiledTokens
export function resolveToken(keyPath: string): string | number | string[]
export function computeFluidValue(
  min: number,
  max: number,
  minViewport?: number,
  maxViewport?: number
): string

// DTCG Parsing
export function parseDTCG(tokens: DTCGTokenTree): DTCGTokenTree
export function resolveDTCGAliases(
  tokens: DTCGTokenTree,
  visited?: Set<string>
): DTCGTokenTree
export function flattenDTCGTokens(
  tokens: DTCGTokenTree,
  prefix?: string
): Map<string, DTCGToken>

// TypeScript Token Loading
export function loadTSTokens(): TSTokenTree
export function flattenTSTokens(
  tokenTree: TSTokenTree,
  prefix?: string
): Map<string, TSTokenValue>

// Motion Compilation
export function defineMotion(
  config: SpringMotionConfig | KeyframeConfig
): MotionOutput

export function defineMotionSequence(
  config: SequenceConfig
): SequenceOutput

// Spring Physics
export function solveSpring(
  config: SpringConfig,
  duration?: number,
  steps?: number
): number[]
export function shouldPrecompute(duration: number): boolean

// Keyframe Generation
export function generateKeyframes(
  name: string,
  config: KeyframeConfig
): { css: string; className: string }

export function generateSpringKeyframes(
  name: string,
  config: SpringKeyframeConfig
): { css: string; className: string; jsConfig?: object }

// StyleX Integration
export const stylex: typeof import('@stylexjs/stylex');
export const props: typeof stylex.props;
export type StyleXStyles = stylex.StyleXStyles;
export function checkLayoutTriggering(property: string): boolean

// Type Generation
export function generateTypes(options?: TypeGenerationOptions): string
export function writeTypes(
  outputPath: string,
  options?: TypeGenerationOptions
): Promise<void>

// Vite Plugin
export function cascadeVitePlugin(
  options?: CascadeVitePluginOptions
): Plugin
```

**Usage:**

```typescript
import { 
  compileTokens, 
  defineMotion, 
  defineMotionSequence,
  stylex 
} from '@cascade/compiler';

// Compile tokens
const compiled = compileTokens();
console.log(compiled.css);  // Generated CSS
console.log(compiled.ts);   // Generated types

// Define motion
const fadeIn = defineMotion({
  type: 'spring',
  stiffness: 300,
  damping: 20,
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
});

// Define sequence
const sequence = defineMotionSequence({
  stages: [
    { name: 'slide', from: {...}, to: {...}, duration: '800ms' },
    { name: 'fade', startAt: '60%', from: {...}, to: {...}, duration: '400ms' },
  ],
});

// Use StyleX
const styles = stylex.create({
  button: { backgroundColor: 'blue' },
});
```

---

### `@cascade/motion-runtime`

**Exports:**

```typescript
// Components
export function MotionSequence(props: MotionSequenceProps): JSX.Element
export function MotionStage(props: MotionStageProps): JSX.Element

// Hook
export function useMotionSequence(
  stageCount: number,
  options?: UseMotionSequenceOptions
): MotionSequenceControls

// Utilities
export function prefersReducedMotion(): boolean

// Types
export type AnimationState;
export type MotionStageState;
export type SequenceState;
```

**Usage:**

```typescript
import { MotionSequence, MotionStage } from '@cascade/motion-runtime';
import { slideAndFade, nextAnimation } from './animations';

function AnimatedComponent() {
  return (
    <MotionSequence autoStart onComplete={() => console.log('Done!')}>
      <MotionStage
        animation={{ className: slideAndFade.className, css: slideAndFade.css }}
        onComplete={(e) => e.next()}
      >
        <div>Slides and fades</div>
      </MotionStage>
      <MotionStage
        animation={{ className: nextAnimation.className, css: nextAnimation.css }}
        delay="until-previous-completes"
      >
        <div>Next animation</div>
      </MotionStage>
    </MotionSequence>
  );
}
```

---

### `@cascade/react`

**Exports:**

```typescript
// Components
export function Stack(props: StackProps): JSX.Element
export function Cluster(props: ClusterProps): JSX.Element
export function Frame(props: FrameProps): JSX.Element

// Types
export type StackProps;
export type ClusterProps;
export type FrameProps;
```

**Usage:**

```typescript
import { Stack, Cluster, Frame } from '@cascade/react';

function Layout() {
  return (
    <Stack spacing="md" align="center" responsive={{ sm: { spacing: 'lg' } }}>
      <Cluster spacing="sm">
        <div>Tag 1</div>
        <div>Tag 2</div>
      </Cluster>
      <Frame ratio="16/9">
        <img src="..." />
      </Frame>
    </Stack>
  );
}
```

---

## Data Flow

### Token Compilation Flow

```
tokens.json (DTCG) ──┐
                     ├─→ resolveDTCGAliases() ─→ flattenDTCGTokens() ─┐
tokens.ts (TS) ──────┘                                                  │
                                                                        ├─→ compileTokens()
loadTSTokens() ─→ flattenTSTokens() ───────────────────────────────────┘
                                                                        │
                                                                        ├─→ CSS Output
                                                                        └─→ TypeScript Types
```

**Step-by-Step:**

1. **DTCG Parsing:** `parseDTCG()` loads JSON, `resolveDTCGAliases()` resolves references like `{color.blue.500}`, `flattenDTCGTokens()` creates flat map.
2. **TS Loading:** `loadTSTokens()` converts TypeScript tokens to structured format, `flattenTSTokens()` creates flat map.
3. **Merging:** `compileTokens()` merges both maps (TS takes precedence), generates CSS via `generateTokenCSS()`, generates TypeScript types.

---

### Motion Compilation Flow

```
defineMotion(config) ──┐
                       ├─→ Check type: 'spring' or keyframe
defineMotionSequence() ─┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
   Spring Config              Keyframe Config
        │                             │
        ├─→ solveSpring()             ├─→ generateKeyframes()
        │   (RK4 solver)               │   (Simple from/to)
        │                             │
        └─→ generateSpringKeyframes() └─→ CSS Output
            (60-step keyframes)
                    │
                    └─→ CSS Output + JS Config
```

**Spring Solver Algorithm:**

```typescript
function solveSpring(config, duration, steps) {
  // RK4 method for: y'' = (-k(y - target) - c*y') / m
  // Where: k = stiffness, c = damping, m = mass
  
  for each step:
    k1v = (-k*(y - target) - c*v) / m
    k1y = v
    
    k2v = (-k*(y + k1y*dt/2 - target) - c*(v + k1v*dt/2)) / m
    k2y = v + k1v*dt/2
    
    k3v = (-k*(y + k2y*dt/2 - target) - c*(v + k2v*dt/2)) / m
    k3y = v + k2v*dt/2
    
    k4v = (-k*(y + k3y*dt - target) - c*(v + k3v*dt)) / m
    k4y = v + k3v*dt
    
    y = y + (k1y + 2*k2y + 2*k3y + k4y) * dt / 6
    v = v + (k1v + 2*k2v + 2*k3v + k4v) * dt / 6
    
    values.push(y)
  
  return values
}
```

**Sequence Compilation Algorithm:**

```typescript
function defineMotionSequence(config) {
  // 1. Calculate stage timings
  for each stage:
    duration = parseTiming(stage.duration)
    startAt = parseTiming(stage.startAt) || currentTime
    
  // 2. Check for overlaps
  if (any stage.startAt < previous stage.end):
    // Generate combined keyframe
    keyPoints = [0, 100, ...all stage start/end percentages]
    
    for each keyPoint:
      time = (percentage / 100) * totalDuration
      combinedValues = {}
      
      for each active stage at this time:
        progress = (time - stage.startAt) / stage.duration
        interpolate stage values by progress
        merge into combinedValues
      
      keyframes.push({ percentage, values: combinedValues })
    
    return combined keyframe CSS
  else:
    // Generate separate keyframes
    for each stage:
      generateKeyframes(stage)
    
    return combined CSS + JS config
}
```

---

### Component Rendering Flow

```
Stack Component
    │
    ├─→ Resolve spacing token ──→ tokens.space[spacing]
    │
    ├─→ Generate responsive attrs ──→ "sm:spacing-lg md:align-center"
    │
    ├─→ Build className ──→ stylex.props(base, alignClass, justifyClass)
    │
    └─→ Render ──→ <div 
                      className={combinedClassName}
                      style={{ '--stack-gap': gap }}
                      data-responsive={responsiveAttrs}
                    />
```

**StyleX Transformation:**

```
Component Source:
  const styles = stylex.create({ base: { display: 'flex' } });
  <div {...stylex.props(styles.base)} />

Babel Plugin Transforms To:
  const styles = { base: { className: 'x1a2b3c4' } };
  <div className="x1a2b3c4" />

CSS Output:
  .x1a2b3c4 { display: flex; }
```

---

## Key Algorithms

### Token Alias Resolution

**Algorithm:** Recursive tree traversal with cycle detection

```typescript
function resolveDTCGAliases(tokens, visited = new Set()) {
  for each token:
    if token.$value is reference "{path.to.token}":
      if path in visited:
        throw CircularReferenceError
      
      visited.add(path)
      resolved = resolveTokenReference(tokens, path.split('.'), visited)
      visited.delete(path)
      
      token.$value = resolved
    else:
      token.$value = token.$value  // Keep as-is
  
  return tokens
}
```

**Time Complexity:** O(n * d) where n = number of tokens, d = max depth
**Space Complexity:** O(n) for visited set

---

### Spring Physics Solver

**Algorithm:** Runge-Kutta 4th Order (RK4)

**Differential Equation:**
```
y'' = (-k(y - target) - c*y') / m
```

Where:
- `k` = stiffness
- `c` = damping  
- `m` = mass
- `y` = position
- `y'` = velocity
- `target` = target position

**RK4 Implementation:**

```typescript
function rk4(y, v, k, c, m, target, dt) {
  // k1: slope at current point
  k1v = (-k*(y - target) - c*v) / m
  k1y = v
  
  // k2: slope at midpoint using k1
  k2v = (-k*(y + k1y*dt/2 - target) - c*(v + k1v*dt/2)) / m
  k2y = v + k1v*dt/2
  
  // k3: slope at midpoint using k2
  k3v = (-k*(y + k2y*dt/2 - target) - c*(v + k2v*dt/2)) / m
  k3y = v + k2v*dt/2
  
  // k4: slope at endpoint using k3
  k4v = (-k*(y + k3y*dt - target) - c*(v + k3v*dt)) / m
  k4y = v + k3v*dt
  
  // Weighted average
  newY = y + (k1y + 2*k2y + 2*k3y + k4y) * dt / 6
  newV = v + (k1v + 2*k2v + 2*k3v + k4v) * dt / 6
  
  return [newY, newV]
}
```

**Accuracy:** 4th order method provides O(dt⁴) accuracy per step.

---

### Sequence Keyframe Merging

**Algorithm:** Multi-stage interpolation with overlap detection

```typescript
function mergeSequenceKeyframes(stages) {
  // 1. Calculate timing for all stages
  timings = []
  for each stage:
    startAt = parseTiming(stage.startAt)
    duration = parseTiming(stage.duration)
    end = startAt + duration
    timings.push({ stage, startAt, duration, end })
  
  // 2. Find keyframe points (all stage start/end times)
  keyPoints = new Set([0, 100])
  for each timing:
    keyPoints.add((startAt / totalDuration) * 100)
    keyPoints.add((end / totalDuration) * 100)
  
  sortedPoints = Array.from(keyPoints).sort()
  
  // 3. Generate keyframes
  for each percentage in sortedPoints:
    time = (percentage / 100) * totalDuration
    combinedValues = {}
    
    // Start with first stage's initial values
    Object.assign(combinedValues, timings[0].stage.from)
    
    // Merge active stages
    for each timing:
      if time >= startAt && time <= end:
        // Stage is active - interpolate
        progress = (time - startAt) / duration
        
        for each property in stage:
          fromValue = stage.from[property]
          toValue = stage.to[property]
          
          if numeric:
            combinedValues[property] = fromValue + (toValue - fromValue) * progress
          else:
            combinedValues[property] = progress >= 1 ? toValue : fromValue
      
      else if time > end:
        // Stage completed - use final values
        Object.assign(combinedValues, stage.to)
    
    keyframes.push({ percentage, values: combinedValues })
  
  return generateCSS(keyframes)
}
```

**Example:** Slide (0-800ms) + Fade (60% = 480ms-880ms)

```
Keyframe Points: [0%, 60%, 100%]

0%:   transform: translateX(0), opacity: 1
60%:  transform: translateX(400px), opacity: 1  (fade hasn't started)
100%: transform: translateX(400px), opacity: 0  (both complete)
```

---

### Responsive Data Attribute Generation

**Algorithm:** Breakpoint-aware attribute string generation

```typescript
function generateResponsiveAttrs(responsive) {
  attrs = []
  
  for each [breakpoint, overrides] in responsive:
    if overrides.spacing:
      attrs.push(`${breakpoint}:spacing-${overrides.spacing}`)
    if overrides.align:
      attrs.push(`${breakpoint}:align-${overrides.align}`)
    if overrides.justify:
      attrs.push(`${breakpoint}:justify-${overrides.justify}`)
  
  return attrs.join(' ')
}
```

**CSS Matching:**

```css
/* CSS uses attribute substring matching */
[data-responsive*="sm:spacing-lg"] { --stack-gap: var(--cascade-space-lg); }
```

The `*=` operator matches if the attribute contains the substring, allowing multiple breakpoint overrides in a single attribute.

---

## Integration Points

### StyleX Integration

**Build-Time Transformation:**

```
Source Code:
  const styles = stylex.create({ button: { color: 'red' } });

Babel Plugin Transforms:
  const styles = { button: { className: 'x1a2b3c4' } };
  
  // Injects CSS:
  .x1a2b3c4 { color: red; }
```

**Runtime Usage:**

```typescript
// Components use stylex.props() to combine classes
const className = stylex.props(
  styles.base,
  styles.variant,
  conditionalStyle
).className;
```

**Key Constraint:** `stylex.create()` must be called at module top-level, not inside functions. This allows the Babel plugin to statically analyze and transform the code.

---

### Motion Runtime Integration

**CSS Keyframe Injection:**

```typescript
// Motion compiler generates CSS
const motion = defineMotion({ ... });
// Output: { css: '@keyframes ...', className: 'motion-abc123' }

// Runtime injects CSS
useEffect(() => {
  const style = document.createElement('style');
  style.textContent = motion.css;
  document.head.appendChild(style);
}, [motion]);
```

**Animation Coordination:**

```typescript
// MotionSequence manages stage progression
<MotionSequence>
  <MotionStage
    animation={stage1}
    onComplete={(e) => e.next()}  // Triggers next stage
  />
  <MotionStage
    animation={stage2}
    delay="until-previous-completes"  // Waits for previous
  />
</MotionSequence>
```

**Event Flow:**

```
Stage 1 starts → animationstart event
  ↓
Stage 1 animates
  ↓
Stage 1 ends → animationend event
  ↓
onComplete callback → e.next()
  ↓
Stage 2 starts → animationstart event
  ↓
...
```

---

### Token System Integration

**Dual Format Support:**

```typescript
// DTCG JSON (for tooling)
{
  "color": {
    "primary": {
      "$value": "{color.blue.500}",
      "$type": "color"
    }
  }
}

// TypeScript (for code)
export const tokens = {
  color: {
    primary: 'oklch(0.637 0.237 25.331)',
  }
}

// Unified access
resolveToken('color', 'primary')  // Works with both formats
```

**Token Resolution Chain:**

```
User Code: tokens.space.md
    ↓
TypeScript tokens: 'calc(1rem * 1.5)'
    ↓
CSS Custom Property: --cascade-space-md: calc(1rem * 1.5)
    ↓
Component: style={{ '--stack-gap': 'var(--cascade-space-md)' }}
    ↓
Browser: Computed value
```

---

### Vite Plugin Integration

**Plugin Hooks:**

```typescript
cascadeVitePlugin({
  watchTokens: true,        // Watch token files
  generateFoundationCSS: true  // Regenerate CSS on changes
})
```

**HMR Flow:**

```
Token file changes (tokens.json or tokens.ts)
    ↓
Vite watcher detects change
    ↓
Plugin invalidates modules
    ↓
Foundation CSS regenerated
    ↓
Browser HMR updates styles
```

**Module Invalidation:**

```typescript
// Plugin invalidates:
1. Foundation CSS module
2. All modules importing @cascade/tokens
3. All modules importing @cascade/core
```

---

## Type Safety Architecture

### Token Type Safety

```typescript
// Token keys are type-safe
type SpaceToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

function Stack({ spacing }: { spacing: SpaceToken }) {
  // TypeScript ensures only valid tokens
  const gap = tokens.space[spacing];  // ✅ Type-safe
}
```

**Generated Types:**

```typescript
// Generated by type-generator.ts
export interface CascadeTokens {
  color: {
    blue: { 50: "oklch(...)", 100: "oklch(...)", ... };
    primary: "oklch(...)";
  };
  space: {
    xs: "0.25rem";
    sm: "0.5rem";
    md: "calc(1rem * 1.5)";
    ...
  };
  ...
}

export type TokenKey<T extends TokenCategory> = keyof CascadeTokens[T];
```

---

### Component Prop Types

**Polymorphic Types:**

```typescript
interface StackProps {
  as?: keyof JSX.IntrinsicElements;  // Allows any HTML element
  ...
}

// Usage:
<Stack as="section" spacing="md">  // ✅ Renders <section>
<Stack as="article" spacing="md">  // ✅ Renders <article>
```

**Responsive Type Safety:**

```typescript
interface StackProps {
  responsive?: Record<
    string,  // Breakpoint name
    Partial<Omit<StackProps, 'responsive'>>  // Valid props only
  >;
}

// TypeScript ensures only valid props in responsive overrides
<Stack 
  responsive={{
    sm: { spacing: 'lg' },      // ✅ Valid
    md: { invalid: 'value' }    // ❌ Type error
  }}
/>
```

---

## Performance Considerations

### Build-Time Optimizations

1. **Token Resolution:** All token aliases resolved at build-time, zero runtime cost
2. **CSS Generation:** Foundation CSS generated once, cached in file
3. **Keyframe Pre-computation:** Spring animations < 300ms pre-computed, longer ones use JS solver
4. **StyleX Compilation:** All styles compiled to atomic CSS classes at build-time

### Runtime Optimizations

1. **CSS Custom Properties:** Token values use CSS variables, enabling runtime theme switching
2. **Hardware Acceleration:** Layout-triggering properties detected, warnings issued
3. **Tree-shaking:** Motion runtime only imported when sequences are used
4. **Event Cleanup:** MotionSequence properly cleans up event listeners on unmount

### Bundle Size

- **Core packages:** < 50KB total (compiler + runtime)
- **Motion runtime:** < 5KB gzipped (tree-shakeable)
- **Foundation CSS:** < 15KB gzipped (base primitives + tokens)

---

## Error Handling

### Token Resolution Errors

```typescript
// Circular reference detection
try {
  resolveDTCGAliases(tokens);
} catch (error) {
  if (error.message.includes('Circular reference')) {
    // Handle circular token reference
  }
}

// Missing token
try {
  resolveToken('invalid.category', 'key');
} catch (error) {
  // Token not found
}
```

### Motion Compilation Errors

```typescript
// Invalid spring config
defineMotion({
  type: 'spring',
  stiffness: -100,  // Invalid: negative stiffness
  ...
});  // May produce invalid keyframes

// Invalid sequence timing
defineMotionSequence({
  stages: [
    { startAt: '150%' },  // Invalid: > 100%
  ]
});  // May cause timing issues
```

---

## Extension Points

### Adding New Token Categories

1. Add to `tokens.json` (DTCG format)
2. Add to `tokens.ts` (TypeScript format)
3. Update `TokenKey` type union
4. Regenerate types: `pnpm --filter @cascade/compiler generate-types`

### Adding New Layout Primitives

1. Create component in `packages/react/src/`
2. Use `stylex.create()` at module level
3. Resolve tokens via `tokens` object
4. Export from `packages/react/src/index.ts`
5. Add CSS to `packages/core/src/foundation.ts`

### Adding New Motion Types

1. Extend `MotionConfig` union type
2. Add compiler logic in `motion-compiler.ts`
3. Update keyframe generator if needed
4. Add tests in `__tests__/motion-compiler.test.ts`

---

This documentation provides a complete reference for understanding and extending the Cascade CSS Foundation system at the type and function level.



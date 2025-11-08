---
title: Motion Runtime as Drop-In Motion Engine for Styled-Components Apps
type: evaluation
status: draft
created_at: 2025-01-12
scope: motion-runtime
evaluator: ai-agent
subject: Viability of motion-runtime as drop-in motion engine for existing styled-components applications
---

# Motion Runtime as Drop-In Motion Engine for Styled-Components Apps

## Executive Summary

**Overall Viability: ⚠️ MODERATE-HIGH (70/100)**

Motion-runtime is **technically compatible** with styled-components and can work as a motion engine, but it is **not a true "drop-in" replacement** for libraries like Framer Motion. The framework requires **moderate integration effort** and **architectural understanding** to use effectively. It offers **excellent performance characteristics** and **CSS-first architecture** that aligns well with styled-components, but lacks **declarative component APIs** that would make it truly drop-in.

**Key Findings:**
- ✅ **Compatible**: Works with styled-components via CSS custom properties
- ⚠️ **Integration Effort**: Requires understanding of hooks-based API and CSS custom properties
- ✅ **Performance**: Excellent CSS-first approach with minimal bundle overhead
- ❌ **Not Drop-In**: Lacks declarative component API (`<motion.div>` style)
- ⚠️ **Documentation Gap**: No styled-components-specific examples or migration guides

**Recommendation**: **Viable for teams willing to invest in learning the API**, but requires **moderate refactoring** from traditional motion libraries. Best suited for **performance-conscious applications** where CSS-first architecture is valued.

---

## 1. Technical Compatibility Assessment

### 1.1 CSS Custom Properties Integration

**Status**: ✅ **FULLY COMPATIBLE**

Motion-runtime uses CSS custom properties (`--motion-value-{id}`) as its core mechanism, which works seamlessly with styled-components:

```typescript
// Motion value creates CSS custom property
const opacity = useMotionValue(0, { property: 'opacity' });
// Creates: --motion-value-abc123: 0

// Can be used in styled-components
const StyledDiv = styled.div`
  opacity: var(--motion-value-abc123);
  transition: opacity 0.3s ease;
`;
```

**Compatibility Score**: 10/10

**Evidence**:
- Motion values write to CSS custom properties (see `packages/motion-runtime/src/motion-value.ts:231-251`)
- CSS custom properties are standard CSS and work in any CSS-in-JS solution
- No dependency conflicts (motion-runtime has no styled-components dependency)
- Element-scoped CSS variables supported (can scope to specific elements)

**Limitations**:
- Requires manual CSS variable reference in styled-components templates
- No TypeScript autocomplete for CSS variable names
- CSS variable names are generated at runtime (not compile-time)

---

### 1.2 React Integration

**Status**: ✅ **FULLY COMPATIBLE**

Motion-runtime uses standard React hooks (`useMotionValue`, `useEffect`, `useRef`) that work with any React setup:

```typescript
import { useMotionValue } from '@cascade/motion-runtime';
import styled from 'styled-components';

function AnimatedComponent() {
  const opacity = useMotionValue(0, { property: 'opacity' });
  
  useEffect(() => {
    opacity.animateTo(1, { duration: 300 });
  }, [opacity]);
  
  return (
    <StyledDiv style={{ opacity: `var(${opacity.cssVarName})` }}>
      Content
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  /* Additional styles */
`;
```

**Compatibility Score**: 10/10

**Evidence**:
- Uses standard React hooks (see `packages/motion-runtime/src/useMotionValue.ts`)
- No React version conflicts (peer dependency: `react ^18.0.0`)
- Works with functional components
- Proper cleanup on unmount

---

### 1.3 Bundle Size & Dependencies

**Status**: ✅ **EXCELLENT**

Motion-runtime has minimal dependencies and small bundle size:

**Dependencies**:
- `@cascade/compiler` (workspace dependency, compile-time only)
- `react ^18.0.0` (peer dependency)

**Bundle Size** (estimated):
- Core motion values: ~5-10KB (gzipped)
- Full runtime: ~15-20KB (gzipped)
- Compare to Framer Motion: ~45KB+ (gzipped)

**Compatibility Score**: 10/10

**Evidence**:
- No runtime dependencies beyond React
- Tree-shakeable exports
- CSS-first approach reduces JavaScript overhead
- No conflicts with styled-components dependencies

---

## 2. API Design & Developer Experience

### 2.1 API Philosophy

**Status**: ⚠️ **DIFFERENT FROM TRADITIONAL MOTION LIBRARIES**

Motion-runtime uses an **imperative, hooks-based API** rather than declarative component props:

**Traditional (Framer Motion)**:
```typescript
<motion.div
  animate={{ opacity: 1 }}
  initial={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

**Motion-Runtime**:
```typescript
function Component() {
  const opacity = useMotionValue(0, { property: 'opacity' });
  
  useEffect(() => {
    opacity.animateTo(1, { duration: 300 });
  }, [opacity]);
  
  return (
    <div style={{ opacity: `var(${opacity.cssVarName})` }}>
      Content
    </div>
  );
}
```

**Developer Experience Score**: 6/10

**Strengths**:
- ✅ More flexible for complex animations
- ✅ Better performance (CSS-first)
- ✅ Full programmatic control
- ✅ Composable with other hooks

**Weaknesses**:
- ❌ More verbose for simple animations
- ❌ Requires understanding of CSS custom properties
- ❌ No declarative component API
- ❌ Steeper learning curve

---

### 2.2 Styled-Components Integration Pattern

**Status**: ⚠️ **REQUIRES MANUAL INTEGRATION**

Integration with styled-components requires manual CSS variable references:

**Pattern 1: Inline Styles (Current Demo Pattern)**
```typescript
const opacity = useMotionValue(0, { property: 'opacity' });

<StyledDiv style={{ opacity: `var(${opacity.cssVarName})` }}>
  Content
</StyledDiv>
```

**Pattern 2: CSS Custom Properties in Styled-Components**
```typescript
const opacity = useMotionValue(0, { property: 'opacity' });

const StyledDiv = styled.div<{ $opacityVar: string }>`
  opacity: var(${props => props.$opacityVar});
`;

<StyledDiv $opacityVar={opacity.cssVarName}>
  Content
</StyledDiv>
```

**Pattern 3: Element-Scoped Variables**
```typescript
const ref = useRef<HTMLDivElement>(null);
const opacity = useMotionValue(0, { 
  property: 'opacity',
  element: ref.current || undefined 
});

const StyledDiv = styled.div`
  opacity: var(--motion-value-${/* element ID */});
`;
```

**Integration Effort Score**: 7/10

**Issues**:
- ⚠️ No helper utilities for styled-components integration
- ⚠️ CSS variable names are runtime-generated (not type-safe)
- ⚠️ Requires manual prop passing or inline styles
- ⚠️ No styled-components-specific examples in documentation

**Opportunities**:
- ✅ Could create wrapper hooks for styled-components
- ✅ Could provide TypeScript helpers for CSS variable types
- ✅ Could create styled-components-specific utilities

---

## 3. Feature Completeness

### 3.1 Core Animation Features

**Status**: ✅ **GOOD COVERAGE**

| Feature | Available | Notes |
|---------|-----------|-------|
| Motion Values | ✅ | `useMotionValue`, `createMotionValue` |
| Spring Animations | ✅ | Via `animateTo` with spring config |
| Keyframe Animations | ✅ | Via `animateTo` with duration/easing |
| Transform Helpers | ✅ | `useTranslateX`, `useRotate`, `useScale` |
| Opacity Animations | ✅ | Via motion values |
| Layout Transitions | ✅ | `useLayoutTransition` |
| Viewport Animations | ✅ | `useViewportAnimation`, `useInView` |
| Sequence Animations | ✅ | `MotionSequence`, `MotionStage` |
| Gesture Support | ⚠️ | Limited (drag, pan, wheel) |
| Declarative API | ❌ | No `<motion.div>` equivalent |

**Feature Completeness Score**: 7/10

**Gaps for Styled-Components Apps**:
- ❌ No declarative component API (would need wrapper components)
- ❌ No variants system (like Framer Motion)
- ⚠️ Limited gesture support (hover, tap, focus missing)
- ⚠️ No `AnimatePresence` equivalent (mount/unmount animations)

---

### 3.2 Styled-Components Specific Needs

**Status**: ⚠️ **PARTIAL SUPPORT**

**Common Styled-Components Animation Patterns**:

1. **Hover Animations**: ⚠️ **MANUAL IMPLEMENTATION REQUIRED**
   ```typescript
   // Would need manual event handlers
   const scale = useScale(1);
   const handleMouseEnter = () => scale.animateTo(1.1);
   const handleMouseLeave = () => scale.animateTo(1);
   ```

2. **Conditional Animations**: ✅ **SUPPORTED**
   ```typescript
   const opacity = useMotionValue(isVisible ? 1 : 0);
   useEffect(() => {
     opacity.animateTo(isVisible ? 1 : 0);
   }, [isVisible]);
   ```

3. **Theme-Based Animations**: ⚠️ **MANUAL INTEGRATION**
   ```typescript
   // Would need to extract theme values and pass to motion values
   const duration = useTheme().motion.duration;
   opacity.animateTo(1, { duration });
   ```

4. **Responsive Animations**: ⚠️ **MANUAL IMPLEMENTATION**
   ```typescript
   // Would need media query hooks + motion values
   const isMobile = useMediaQuery('(max-width: 768px)');
   const x = useTranslateX(isMobile ? 0 : 100);
   ```

**Styled-Components Integration Score**: 6/10

---

## 4. Migration Effort Assessment

### 4.1 From No Motion Engine

**Effort**: ⚠️ **MODERATE** (3-5 days for small app, 1-2 weeks for large app)

**Steps Required**:
1. Install `@cascade/motion-runtime`
2. Learn hooks-based API
3. Replace CSS transitions with motion values
4. Integrate CSS custom properties with styled-components
5. Update component patterns

**Challenges**:
- Learning curve for CSS custom properties
- Understanding when to use compile-time vs runtime animations
- Integrating with existing styled-components patterns
- No migration guide for styled-components

**Effort Score**: 7/10 (moderate effort, but manageable)

---

### 4.2 From Framer Motion

**Effort**: ⚠️ **HIGH** (1-2 weeks for small app, 1-2 months for large app)

**Major Changes Required**:
1. Replace `<motion.div>` with hooks + styled-components
2. Convert variants to motion values + state management
3. Replace declarative props with imperative hooks
4. Rewrite gesture handlers
5. Update animation orchestration

**Example Migration**:

**Before (Framer Motion)**:
```typescript
const StyledMotionDiv = styled(motion.div)`
  background: blue;
`;

<StyledMotionDiv
  animate={{ opacity: 1, y: 0 }}
  initial={{ opacity: 0, y: 20 }}
  transition={{ duration: 0.3 }}
>
  Content
</StyledMotionDiv>
```

**After (Motion-Runtime)**:
```typescript
const StyledDiv = styled.div<{ $opacity: string; $y: string }>`
  background: blue;
  opacity: var(${props => props.$opacity});
  transform: translateY(var(${props => props.$y}));
`;

function Component() {
  const opacity = useMotionValue(0, { property: 'opacity' });
  const y = useTranslateY(20);
  
  useEffect(() => {
    opacity.animateTo(1, { duration: 300 });
    y.animateTo(0, { duration: 300 });
  }, [opacity, y]);
  
  return (
    <StyledDiv $opacity={opacity.cssVarName} $y={y.cssVarName}>
      Content
    </StyledDiv>
  );
}
```

**Effort Score**: 4/10 (high effort, significant refactoring)

---

### 4.3 From CSS Transitions Only

**Effort**: ✅ **LOW-MODERATE** (1-3 days for small app, 1 week for large app)

**Changes Required**:
1. Replace CSS `transition` with motion values
2. Add hooks for animation control
3. Integrate CSS custom properties

**Example Migration**:

**Before (CSS Only)**:
```typescript
const StyledDiv = styled.div`
  opacity: 0;
  transition: opacity 0.3s ease;
  
  &.visible {
    opacity: 1;
  }
`;
```

**After (Motion-Runtime)**:
```typescript
const StyledDiv = styled.div<{ $opacity: string }>`
  opacity: var(${props => props.$opacity});
`;

function Component({ isVisible }: { isVisible: boolean }) {
  const opacity = useMotionValue(0, { property: 'opacity' });
  
  useEffect(() => {
    opacity.animateTo(isVisible ? 1 : 0, { duration: 300 });
  }, [isVisible, opacity]);
  
  return <StyledDiv $opacity={opacity.cssVarName}>Content</StyledDiv>;
}
```

**Effort Score**: 8/10 (low-moderate effort, straightforward)

---

## 5. Performance Characteristics

### 5.1 Runtime Performance

**Status**: ✅ **EXCELLENT**

**Performance Characteristics**:
- ✅ CSS-first animations (compositor thread)
- ✅ GPU-accelerated by default
- ✅ Batched updates via `requestAnimationFrame`
- ✅ Transform registry optimization (combines multiple transforms)
- ✅ Minimal JavaScript overhead

**Performance Score**: 10/10

**Evidence**:
- Uses CSS custom properties (see `packages/motion-runtime/src/motion-value.ts:231-251`)
- Batched updates (see `packages/motion-runtime/src/motion-value.ts:104-118`)
- Transform registry for optimization (see `packages/motion-runtime/src/motion-value.ts:128-177`)
- GPU acceleration detection (see `packages/motion-runtime/src/motion-value.ts:199-208`)

---

### 5.2 Bundle Size Impact

**Status**: ✅ **EXCELLENT**

**Bundle Size**:
- Core motion values: ~5-10KB (gzipped)
- Full runtime: ~15-20KB (gzipped)
- Compare to Framer Motion: ~45KB+ (gzipped)

**Tree-Shaking**:
- ✅ Named exports
- ✅ Modular architecture
- ✅ Only import what you use

**Bundle Size Score**: 10/10

---

### 5.3 Styled-Components Performance Impact

**Status**: ✅ **NO NEGATIVE IMPACT**

Motion-runtime's CSS custom properties work efficiently with styled-components:
- CSS custom properties are standard CSS (no runtime overhead)
- Styled-components handles CSS variable references efficiently
- No additional re-renders from motion-runtime
- CSS custom properties are optimized by browsers

**Performance Score**: 10/10

---

## 6. Documentation & Examples

### 6.1 Current Documentation

**Status**: ⚠️ **PARTIAL**

**Available Documentation**:
- ✅ Motion values API reference
- ✅ Motion values tutorial
- ✅ Architecture explanations
- ✅ CSS-first philosophy guide
- ✅ Framer Motion comparison

**Missing Documentation**:
- ❌ Styled-components integration guide
- ❌ Styled-components examples
- ❌ Migration guide from other motion libraries to styled-components
- ❌ Best practices for styled-components + motion-runtime

**Documentation Score**: 5/10

---

### 6.2 Code Examples

**Status**: ⚠️ **LIMITED**

**Current Examples**:
- ✅ Basic motion value usage (inline styles)
- ✅ React component examples
- ✅ Demo app with various patterns

**Missing Examples**:
- ❌ Styled-components integration examples
- ❌ Styled-components + motion values patterns
- ❌ Theme integration examples
- ❌ Responsive animation examples with styled-components

**Examples Score**: 4/10

---

## 7. Production Readiness

### 7.1 Stability & Maturity

**Status**: ⚠️ **EARLY STAGE**

**Indicators**:
- Version: `0.1.0` (early stage)
- No major production usage documented
- Active development (recent commits)
- Comprehensive feature set but new

**Stability Score**: 6/10

---

### 7.2 TypeScript Support

**Status**: ✅ **EXCELLENT**

**TypeScript Features**:
- ✅ Full TypeScript definitions
- ✅ Type-safe motion value APIs
- ✅ Generic types for motion values
- ✅ Type inference for helpers

**TypeScript Score**: 10/10

---

### 7.3 Testing & Quality

**Status**: ⚠️ **UNKNOWN**

**Testing**:
- ⚠️ Test setup exists (`vitest.config.ts`)
- ⚠️ No visible test coverage metrics
- ⚠️ No test examples in evaluation

**Quality Score**: 5/10 (unknown, needs investigation)

---

## 8. Integration Patterns for Styled-Components

### 8.1 Recommended Integration Pattern

**Pattern: CSS Custom Properties with Props**

```typescript
import { useMotionValue, useTranslateY } from '@cascade/motion-runtime';
import styled from 'styled-components';
import { useEffect } from 'react';

// Styled component accepts CSS variable names as props
const AnimatedCard = styled.div<{ 
  $opacity: string;
  $y: string;
}>`
  opacity: var(${props => props.$opacity});
  transform: translateY(var(${props => props.$y}));
  transition: transform 0.2s ease; /* For hover effects */
`;

function Card({ isVisible }: { isVisible: boolean }) {
  const opacity = useMotionValue(0, { property: 'opacity' });
  const y = useTranslateY(20);
  
  useEffect(() => {
    if (isVisible) {
      opacity.animateTo(1, { duration: 300 });
      y.animateTo(0, { duration: 300 });
    } else {
      opacity.animateTo(0, { duration: 200 });
      y.animateTo(20, { duration: 200 });
    }
  }, [isVisible, opacity, y]);
  
  return (
    <AnimatedCard 
      $opacity={opacity.cssVarName}
      $y={y.cssVarName}
    >
      Content
    </AnimatedCard>
  );
}
```

**Pros**:
- ✅ Type-safe props
- ✅ Works with styled-components
- ✅ Clear separation of concerns

**Cons**:
- ⚠️ Requires prop passing
- ⚠️ More verbose than declarative API

---

### 8.2 Alternative: Inline Styles Pattern

```typescript
const StyledCard = styled.div`
  /* Static styles */
  background: blue;
  padding: 1rem;
`;

function Card() {
  const opacity = useMotionValue(0, { property: 'opacity' });
  
  useEffect(() => {
    opacity.animateTo(1, { duration: 300 });
  }, [opacity]);
  
  return (
    <StyledCard style={{ opacity: `var(${opacity.cssVarName})` }}>
      Content
    </StyledCard>
  );
}
```

**Pros**:
- ✅ Simpler for basic cases
- ✅ No prop passing needed

**Cons**:
- ⚠️ Mixes styled-components and inline styles
- ⚠️ Less type-safe

---

## 9. Critical Gaps & Limitations

### 9.1 Missing Features for Drop-In Replacement

1. **Declarative Component API** ❌
   - No `<motion.div>` equivalent
   - Requires hooks + manual integration
   - **Impact**: High - This is what makes libraries "drop-in"

2. **Variants System** ❌
   - No state-based animation variants
   - **Impact**: Medium - Common pattern in motion libraries

3. **AnimatePresence** ⚠️
   - Partially implemented (see `evals/motion-runtime/animate-presence-implementation-evaluation.md`)
   - **Impact**: Medium - Essential for route transitions

4. **Gesture Handlers** ⚠️
   - Limited gesture support (drag, pan, wheel)
   - Missing hover, tap, focus handlers
   - **Impact**: Medium - Common interaction patterns

5. **Styled-Components Integration Utilities** ❌
   - No helper hooks or utilities
   - No TypeScript helpers for CSS variables
   - **Impact**: Low-Medium - Would improve DX

---

### 9.2 Architectural Considerations

1. **CSS-First Philosophy**
   - Requires understanding of CSS custom properties
   - May conflict with teams preferring JavaScript-only solutions
   - **Impact**: Low - Actually a strength, but requires learning

2. **Compile-Time vs Runtime**
   - Two animation systems (compile-time `defineMotion` + runtime motion values)
   - May be confusing for new users
   - **Impact**: Low-Medium - Documentation could clarify

3. **No Theming Integration**
   - No built-in styled-components theme integration
   - Requires manual theme value extraction
   - **Impact**: Low - Can be worked around

---

## 10. Recommendations

### 10.1 For Teams Considering Adoption

**✅ Good Fit If**:
- Performance is a priority (CSS-first approach)
- Willing to invest in learning hooks-based API
- Need fine-grained control over animations
- Bundle size matters
- Already using CSS custom properties

**❌ Not Good Fit If**:
- Need drop-in replacement for Framer Motion
- Prefer declarative component APIs
- Team is not comfortable with CSS custom properties
- Need extensive gesture support immediately
- Want zero learning curve

---

### 10.2 For Framework Maintainers

**High Priority Improvements**:

1. **Styled-Components Integration Guide** (1-2 days)
   - Add documentation page
   - Provide code examples
   - Best practices guide

2. **Helper Utilities** (2-3 days)
   - Create `useStyledMotionValue` hook
   - TypeScript helpers for CSS variable types
   - Wrapper utilities for common patterns

3. **Examples** (1-2 days)
   - Add styled-components examples to demo app
   - Create migration examples
   - Show theme integration patterns

**Medium Priority Improvements**:

4. **Declarative API Wrapper** (1-2 weeks)
   - Create `<MotionDiv>` component wrapper
   - Support styled-components via `as` prop
   - Would make it more "drop-in"

5. **Gesture Enhancements** (1-2 weeks)
   - Add hover, tap, focus handlers
   - Improve gesture API

---

## 11. Final Verdict

### Overall Viability Score: 70/100

**Breakdown**:
- Technical Compatibility: 10/10 ✅
- API Design: 6/10 ⚠️
- Feature Completeness: 7/10 ⚠️
- Migration Effort: 6/10 ⚠️
- Performance: 10/10 ✅
- Documentation: 5/10 ⚠️
- Production Readiness: 6/10 ⚠️

### Is It a Drop-In Replacement?

**Answer: ❌ NO**

Motion-runtime is **not a true drop-in replacement** for motion libraries like Framer Motion. It requires:
- Understanding of hooks-based API
- Integration with CSS custom properties
- Manual styled-components integration
- Moderate refactoring effort

### Is It Viable?

**Answer: ✅ YES (with caveats)**

Motion-runtime is **viable** for styled-components apps if:
- Team is willing to learn the API
- Performance is prioritized
- Fine-grained control is needed
- Moderate integration effort is acceptable

### Recommendation

**For New Projects**: ✅ **RECOMMENDED**
- Clean slate allows for proper integration
- Can design components with motion-runtime in mind
- Performance benefits are significant

**For Existing Projects**: ⚠️ **CONDITIONAL**
- **From CSS-only**: ✅ **RECOMMENDED** (low effort, high value)
- **From Framer Motion**: ⚠️ **CONSIDER CAREFULLY** (high effort, evaluate ROI)
- **From no motion engine**: ✅ **RECOMMENDED** (moderate effort, good value)

---

## 12. Conclusion

Motion-runtime offers **excellent technical compatibility** with styled-components and **superior performance characteristics**, but falls short of being a true "drop-in" replacement due to its **imperative, hooks-based API** and **lack of declarative component APIs**.

The framework is **viable** for teams willing to invest in learning the API and integrating CSS custom properties with styled-components. The **performance benefits** and **CSS-first architecture** make it an attractive choice for performance-conscious applications.

**Key Takeaway**: Motion-runtime is a **powerful motion engine** that works well with styled-components, but requires **moderate integration effort** and **architectural understanding**. It's best suited for teams that value **performance** and **fine-grained control** over **developer convenience**.

---

## 13. Cascade Component System Integration

### 13.1 Overview

The Cascade component system (`@cascade/react`) provides layout primitives (`Stack`, `Cluster`, `Frame`) that can work alongside styled-components. However, they **do not eliminate** the need for styled-components integration work.

### 13.2 Component System Architecture

**Cascade Components**:
- Use **StyleX** internally (not styled-components)
- Accept standard React props (`style`, `className`, etc.)
- Support polymorphic `as` prop
- Use CSS custom properties for internal styling
- Can accept motion-runtime CSS variables via `style` prop

**Key Finding**: Cascade components are **compatible** with motion-runtime but **require StyleX as a dependency**, meaning you'd need both StyleX and styled-components in your project.

### 13.3 Integration Ease Assessment

**Status**: ⚠️ **MODERATE** - Does not significantly simplify integration

**How Cascade Components Help**:
- ✅ **Pre-built layout primitives** - Less code to write
- ✅ **Motion-runtime compatible** - Can accept CSS custom properties via `style` prop
- ✅ **Token integration** - Uses design tokens that work with motion-runtime
- ✅ **Examples exist** - See `apps/demo/src/pages/LayoutAnimationsDemo.tsx`

**How Cascade Components Don't Help**:
- ❌ **Still requires StyleX** - Adds another CSS-in-JS dependency
- ❌ **Not styled-components** - Doesn't integrate with styled-components ecosystem
- ❌ **Same motion-runtime integration pattern** - Still need to pass CSS variables via `style` prop
- ❌ **No styled-components wrapper** - Can't use styled-components to style Cascade components

### 13.4 Integration Pattern with Cascade Components

**Pattern: Using Cascade Components with Motion-Runtime**

```typescript
import { Stack } from '@cascade/react';
import { useMotionValue, useTranslateY } from '@cascade/motion-runtime';
import styled from 'styled-components';

// Cascade component with motion-runtime
function AnimatedStack() {
  const opacity = useMotionValue(0, { property: 'opacity' });
  const y = useTranslateY(30);
  
  useEffect(() => {
    opacity.animateTo(1, { duration: 300 });
    y.animateTo(0, { duration: 300 });
  }, [opacity, y]);
  
  return (
    <Stack
      spacing="lg"
      align="center"
      style={{
        opacity: `var(${opacity.cssVarName})`,
        transform: `translateY(var(${y.cssVarName}))`,
      }}
    >
      <StyledContent>Content</StyledContent>
    </Stack>
  );
}

// Still need styled-components for custom styling
const StyledContent = styled.div`
  background: blue;
  padding: 1rem;
`;
```

**Integration Effort**: Same as without Cascade components - still need to:
1. Create motion values
2. Pass CSS variables via `style` prop
3. Use styled-components for custom styling

### 13.5 Can You Use Cascade Components Instead of Styled-Components?

**Answer**: ⚠️ **PARTIALLY** - But requires architectural changes

**If You Replace Styled-Components with Cascade Components**:
- ✅ **Simpler integration** - Cascade components designed for motion-runtime
- ✅ **Better token integration** - Uses same token system
- ✅ **Less integration work** - Components accept motion values directly
- ❌ **Requires migration** - Need to replace styled-components usage
- ❌ **Less flexible** - Only 3 layout primitives (Stack, Cluster, Frame)
- ❌ **Still need StyleX** - Cascade components require StyleX

**If You Keep Styled-Components**:
- ✅ **Keep existing components** - No migration needed
- ✅ **More flexibility** - Full styled-components ecosystem
- ⚠️ **Same integration effort** - Still need to integrate motion-runtime manually
- ⚠️ **Two CSS-in-JS systems** - StyleX (for Cascade) + styled-components

### 13.6 Recommendation

**For Existing Styled-Components Apps**:
- ⚠️ **Cascade components don't significantly simplify integration**
- ✅ **Can use alongside** styled-components for layout primitives
- ⚠️ **Adds StyleX dependency** - May not be worth it unless you want the layout primitives
- ✅ **If adopting Cascade components**, integration becomes easier (but requires architectural changes)

**For New Apps**:
- ✅ **Consider Cascade components** if you want layout primitives + motion-runtime
- ✅ **Simpler integration** when using Cascade's full stack
- ⚠️ **Still need to decide** between StyleX and styled-components for custom components

**Bottom Line**: Cascade components are **nice-to-have** but **not essential** for motion-runtime integration with styled-components. They help if you want layout primitives, but don't eliminate the core integration work.

---

*Evaluation Date: 2025-01-12*
*Framework Version: 0.1.0*
*Evaluated Against: styled-components integration requirements*


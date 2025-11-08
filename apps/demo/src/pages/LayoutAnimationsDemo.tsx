/**
 * Demo: Animations Applied Directly to Layout Components
 * Shows how to animate Stack, Cluster, and Frame components directly
 */

import { useEffect, useRef } from 'react';
import { Stack, Cluster, Frame } from '@cascade/react';
import {
  useMotionValue,
  useScale,
  useTranslateY,
  useFadeInOnScroll,
  useSlideInOnScroll,
  MotionSequence,
  MotionStage,
} from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';
import { tokens } from '@cascade/tokens';

// Example 1: Animated Stack with motion values
function AnimatedStackExample() {
  const opacity = useMotionValue(0, { property: 'opacity' });
  const y = useTranslateY(30);

  useEffect(() => {
    opacity.animateTo(1, { duration: 500, easing: 'ease-out' });
    y.animateTo(0, { duration: 500, easing: 'ease-out' });
  }, [opacity, y]);

  return (
    <Stack
      spacing="lg"
      align="center"
      style={{
        opacity: `var(${opacity.cssVarName})`,
        transform: `translateY(var(${y.cssVarName}))`,
        padding: 'var(--cascade-space-xl)',
        background: tokens.color.blue[50],
        borderRadius: '12px',
      }}
    >
      <h3>Animated Stack</h3>
      <p>This Stack fades in and slides up on mount</p>
      <p>Motion values are applied directly via the style prop</p>
    </Stack>
  );
}

// Example 2: Scroll-triggered Cluster
function ScrollTriggeredCluster() {
  const ref = useRef<HTMLElement>(null);
  
  // useFadeInOnScroll automatically applies opacity to the ref element
  useFadeInOnScroll(ref, {
    threshold: 0.2,
    duration: 600,
    once: true,
  });

  return (
    <Cluster
      ref={ref}
      spacing="md"
      justify="center"
      style={{
        padding: 'var(--cascade-space-lg)',
        background: tokens.color.blue[100],
        borderRadius: '12px',
      }}
    >
      <div style={{ padding: 'var(--cascade-space-sm)', background: 'white', borderRadius: '4px' }}>
        Tag 1
      </div>
      <div style={{ padding: 'var(--cascade-space-sm)', background: 'white', borderRadius: '4px' }}>
        Tag 2
      </div>
      <div style={{ padding: 'var(--cascade-space-sm)', background: 'white', borderRadius: '4px' }}>
        Tag 3
      </div>
      <div style={{ padding: 'var(--cascade-space-sm)', background: 'white', borderRadius: '4px' }}>
        Tag 4
      </div>
    </Cluster>
  );
}

// Example 3: Slide-in Stack with useSlideInOnScroll
function SlideInStack() {
  const ref = useRef<HTMLElement>(null);
  
  // useSlideInOnScroll automatically applies transform to the ref element
  useSlideInOnScroll(ref, {
    direction: 'left',
    distance: 50,
    duration: 600,
    threshold: 0.2,
    once: true,
  });

  return (
    <Stack
      ref={ref}
      spacing="md"
      style={{
        padding: 'var(--cascade-space-lg)',
        background: `linear-gradient(135deg, ${tokens.color.blue[50]} 0%, ${tokens.color.blue[100]} 100%)`,
        borderRadius: '12px',
        maxWidth: '500px',
      }}
    >
      <h3>Slide-In Stack</h3>
      <p>This Stack slides in from the left when scrolled into view</p>
      <p>The animation is applied directly to the Stack component</p>
    </Stack>
  );
}

// Example 4: Scale animation on Frame
function ScaledFrame() {
  const scale = useScale(0.8);
  const opacity = useMotionValue(0, { property: 'opacity' });

  useEffect(() => {
    scale.animateTo(1, { duration: 500, easing: 'ease-out' });
    opacity.animateTo(1, { duration: 500, easing: 'ease-out' });
  }, [scale, opacity]);

  return (
    <Frame
      ratio="16/9"
      style={{
        transform: `scale(var(${scale.cssVarName}))`,
        opacity: `var(${opacity.cssVarName})`,
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, ${tokens.color.primary} 0%, ${tokens.color.blue[900]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2rem',
          borderRadius: '8px',
        }}
      >
        16:9 Frame
      </div>
    </Frame>
  );
}

// Example 5: MotionSequence with Stack
const stackSequenceAnimation = defineMotion({
  type: 'spring',
  from: { opacity: 0, transform: 'translateY(20px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
  duration: 500,
});

function SequencedStack() {
  useEffect(() => {
    const styleId = 'sequenced-stack-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = stackSequenceAnimation.css;
      document.head.appendChild(styleElement);
    }
  }, []);

  return (
    <MotionSequence autoStart>
      <MotionStage animation={stackSequenceAnimation.className}>
        <Stack
          spacing="md"
          align="center"
          style={{
            padding: 'var(--cascade-space-xl)',
            background: tokens.color.blue[50],
            borderRadius: '12px',
          }}
        >
          <h3>Sequenced Stack</h3>
          <p>This Stack animates using MotionSequence</p>
          <p>The animation class is applied to the Stack directly</p>
        </Stack>
      </MotionStage>
    </MotionSequence>
  );
}

// Example 6: Combined layout props + animations
function CombinedLayoutAnimation() {
  const ref = useRef<HTMLElement>(null);
  const scale = useScale(0.95);
  
  useFadeInOnScroll(ref, {
    threshold: 0.2,
    duration: 500,
    once: true,
  });

  useEffect(() => {
    scale.animateTo(1, { duration: 400, easing: 'ease-out' });
  }, [scale]);

  return (
    <Stack
      ref={ref}
      spacing="lg"
      align="center"
      justify="center"
      responsive={{
        'md': { spacing: 'xl', align: 'start' },
      }}
      style={{
        transform: `scale(var(${scale.cssVarName}))`,
        padding: 'var(--cascade-space-xl)',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        minHeight: '200px',
      }}
    >
      <h3>Combined Layout + Animation</h3>
      <p>This Stack uses:</p>
      <Cluster spacing="sm" justify="center">
        <span>• Layout props (spacing, align, justify)</span>
        <span>• Responsive behavior</span>
        <span>• Scroll-triggered fade</span>
        <span>• Scale animation</span>
      </Cluster>
    </Stack>
  );
}

// Example 7: Hover animation on Cluster
function HoverAnimatedCluster() {
  const scale = useScale(1);

  return (
    <Cluster
      spacing="md"
      justify="center"
      style={{
        transform: `scale(var(${scale.cssVarName}))`,
        padding: 'var(--cascade-space-lg)',
        background: tokens.color.blue[100],
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
      }}
      onMouseEnter={() => {
        scale.animateTo(1.05, { duration: 200, easing: 'ease-out' });
      }}
      onMouseLeave={() => {
        scale.animateTo(1, { duration: 200, easing: 'ease-out' });
      }}
    >
      <div style={{ padding: 'var(--cascade-space-sm)', background: 'white', borderRadius: '4px' }}>
        Hover me
      </div>
      <div style={{ padding: 'var(--cascade-space-sm)', background: 'white', borderRadius: '4px' }}>
        to scale
      </div>
    </Cluster>
  );
}

// Main Demo Component
export function LayoutAnimationsDemo() {
  return (
    <Stack spacing="xl" style={{ padding: 'var(--cascade-space-xl)' }}>
      <div>
        <h2>Animations on Layout Components</h2>
        <p>
          Examples showing how to apply animations directly to Stack, Cluster, and Frame components
          using motion values, scroll hooks, and MotionSequence.
        </p>
      </div>

      <section>
        <h3>1. Motion Values via Style Prop</h3>
        <p>Apply motion values directly to layout components using CSS custom properties</p>
        <AnimatedStackExample />
      </section>

      <section>
        <h3>2. Scroll-Triggered Cluster</h3>
        <p>Use useFadeInOnScroll hook with Cluster ref</p>
        <div style={{ height: '100vh' }} /> {/* Spacer for scroll demo */}
        <ScrollTriggeredCluster />
      </section>

      <section>
        <h3>3. Slide-In Stack</h3>
        <p>Use useSlideInOnScroll hook with Stack ref</p>
        <div style={{ height: '100vh' }} /> {/* Spacer for scroll demo */}
        <SlideInStack />
      </section>

      <section>
        <h3>4. Scaled Frame</h3>
        <p>Apply scale and opacity animations to Frame component</p>
        <ScaledFrame />
      </section>

      <section>
        <h3>5. MotionSequence with Stack</h3>
        <p>Use MotionSequence/MotionStage to animate Stack</p>
        <SequencedStack />
      </section>

      <section>
        <h3>6. Combined Layout Props + Animations</h3>
        <p>Combine layout props (spacing, align, responsive) with animations</p>
        <div style={{ height: '100vh' }} /> {/* Spacer for scroll demo */}
        <CombinedLayoutAnimation />
      </section>

      <section>
        <h3>7. Hover Animation on Cluster</h3>
        <p>Interactive hover effects using motion values</p>
        <HoverAnimatedCluster />
      </section>
    </Stack>
  );
}


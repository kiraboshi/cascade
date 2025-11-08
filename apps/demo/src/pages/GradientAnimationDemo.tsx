/**
 * Gradient Animation Demo
 * Demonstrates Cascade's support for animating background gradients
 */

import { Stack } from '@cascade/react';
import { AnimatedGradient, AnimatedGradientCSS } from '../components/AnimatedGradient';
import { tokens } from '@cascade/tokens';

export function GradientAnimationDemo() {
  return (
    <Stack spacing="xl" style={{ padding: 'var(--cascade-space-xl)', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: tokens.color.blue[900] }}>
        Gradient Animation Demo
      </h1>
      
      <p style={{ fontSize: tokens.typography.fontSize.base, color: tokens.color.blue[900] }}>
        Cascade supports animating background gradients using motion values. Here are different approaches:
      </p>

      {/* Approach 1: Runtime animation with motion values */}
      <section>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: 'var(--cascade-space-md)' }}>
          Runtime Gradient Animation (Motion Values)
        </h2>
        <AnimatedGradient
          fromColor={tokens.color.blue[500]}
          toColor={tokens.color.primary}
          duration={2000}
          loop={true}
          style={{
            padding: 'var(--cascade-space-xl)',
            borderRadius: '12px',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Animated Gradient Background
          </div>
        </AnimatedGradient>
      </section>

      {/* Approach 2: Multiple animated gradients */}
      <section>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: 'var(--cascade-space-md)' }}>
          Multiple Color Transitions
        </h2>
        <AnimatedGradient
          fromColor="#ff6b6b"
          toColor="#4ecdc4"
          duration={3000}
          loop={true}
          style={{
            padding: 'var(--cascade-space-xl)',
            borderRadius: '12px',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Red to Cyan Gradient
          </div>
        </AnimatedGradient>
      </section>

      {/* Approach 3: CSS-based gradient animation */}
      <section>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: 'var(--cascade-space-md)' }}>
          CSS Keyframe Gradient Animation
        </h2>
        <AnimatedGradientCSS
          fromColor={tokens.color.blue[400]}
          toColor={tokens.color.purple[500]}
          duration={2000}
          style={{
            padding: 'var(--cascade-space-xl)',
            borderRadius: '12px',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            CSS-Based Gradient Animation
          </div>
        </AnimatedGradientCSS>
      </section>

      {/* Code example */}
      <section>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: 'var(--cascade-space-md)' }}>
          How It Works
        </h2>
        <div style={{ 
          background: tokens.color.blue[50], 
          padding: 'var(--cascade-space-lg)', 
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: tokens.typography.fontSize.sm,
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`// Cascade supports gradient animation via motion values:

const progress = useMotionValue(0, { property: 'background' });

// Interpolate colors based on progress
const gradient = \`linear-gradient(
  \${angle}deg, 
  \${color1} 0%, 
  \${color2} 100%
)\`;

// Animate the progress value
progress.animateTo(1, { duration: 2000 });

// Update background on change
progress.onChange(() => {
  element.style.background = createGradient(progress.get());
});`}
          </pre>
        </div>
      </section>
    </Stack>
  );
}


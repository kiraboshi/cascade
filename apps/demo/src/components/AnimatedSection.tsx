/**
 * Reusable Animated Section Component
 * Parameterized section with scroll-triggered fade animations
 */

import { useRef, useEffect } from 'react';
import { Stack } from '@cascade/react';
import { useMotionValue, useViewportAnimationWithRef } from '@cascade/motion-runtime';
import { tokens } from '@cascade/tokens';

export interface AnimatedSectionProps {
  /** Section title */
  title: string;
  /** Section subtitle */
  subtitle?: string;
  /** Background color or gradient */
  background?: string;
  /** Section content */
  children: React.ReactNode;
  /** Maximum width of content */
  maxWidth?: string;
  /** Additional styling */
  style?: React.CSSProperties;
  /** Spacing between Stack items */
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Alignment of Stack items */
  align?: 'start' | 'center' | 'end' | 'stretch';
}

/**
 * Reusable animated section component with scroll-triggered fade
 * Supports fade out when scrolling out of view
 */
export function AnimatedSection({
  title,
  subtitle,
  background = 'white',
  children,
  maxWidth = '1200px',
  style,
  spacing = 'xl',
  align = 'center',
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(0, { property: 'opacity' });

  // Hooks must be called at top level
  useViewportAnimationWithRef(ref, opacity, {
    initial: 0,
    threshold: 0.1,
    onEnter: {
      target: 1,
      config: { duration: 600, easing: 'ease-out' },
    },
    onExit: {
      target: 0,
      config: { duration: 400, easing: 'ease-in' },
    },
    once: false,
  });

  useEffect(() => {
    if (ref.current) {
      ref.current.style.opacity = `var(${opacity.cssVarName})`;
      const unsubscribe = opacity.onChange((value) => {
        if (ref.current) {
          ref.current.style.opacity = String(value);
        }
      });
      return unsubscribe;
    }
  }, [opacity]);

  return (
    <section
      ref={ref}
      style={{
        padding: 'var(--cascade-space-xl)',
        background,
        opacity: `var(${opacity.cssVarName})`,
        ...style,
      }}
    >
      <Stack spacing={spacing} align={align} style={{ maxWidth, margin: '0 auto' }}>
        <Stack spacing="md" align={align}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 'bold',
              color: tokens.color.blue[900],
              textAlign: 'center',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                fontSize: tokens.typography.fontSize.lg,
                color: tokens.color.blue[900],
                opacity: 0.7,
                textAlign: 'center',
                maxWidth: '600px',
              }}
            >
              {subtitle}
            </p>
          )}
        </Stack>
        {children}
      </Stack>
    </section>
  );
}


/**
 * Reusable Animated Testimonial Component
 * Parameterized testimonial card with slide-in animation
 */

import { useRef, useEffect } from 'react';
import { useMotionValue, useTranslateY, useViewportAnimationWithRef } from '@cascade/motion-runtime';
import { tokens } from '@cascade/tokens';

export interface AnimatedTestimonialProps {
  /** Testimonial quote */
  quote: string;
  /** Author name */
  author: string;
  /** Author role */
  role: string;
  /** Background gradient or color */
  background?: string;
  /** Custom styling */
  style?: React.CSSProperties;
}

/**
 * Reusable testimonial component with scroll-triggered slide-up animation
 * Supports fade out when scrolling out of view
 */
export function AnimatedTestimonial({
  quote,
  author,
  role,
  background = `linear-gradient(135deg, ${tokens.color.blue[50]} 0%, white 100%)`,
  style,
}: AnimatedTestimonialProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(0, { property: 'opacity' });
  const y = useTranslateY(40);

  // Hooks must be called at top level
  useViewportAnimationWithRef(ref, opacity, {
    initial: 0,
    threshold: 0.2,
    onEnter: {
      target: 1,
      config: { duration: 500, easing: 'ease-out' },
    },
    onExit: {
      target: 0,
      config: { duration: 300, easing: 'ease-in' },
    },
    once: false,
  });

  useViewportAnimationWithRef(ref, y, {
    initial: 40,
    threshold: 0.2,
    onEnter: {
      target: 0,
      config: { duration: 500, easing: 'ease-out' },
    },
    onExit: {
      target: 40,
      config: { duration: 300, easing: 'ease-in' },
    },
    once: false,
  });

  useEffect(() => {
    if (ref.current) {
      const element = ref.current;
      const updateTransform = () => {
        const yValue = y.get();
        element.style.transform = `translateY(${yValue}px)`;
      };
      element.style.opacity = `var(${opacity.cssVarName})`;
      const unsubscribeY = y.onChange(() => updateTransform());
      const unsubscribeOpacity = opacity.onChange((value) => {
        element.style.opacity = String(value);
      });
      updateTransform();
      return () => {
        unsubscribeY();
        unsubscribeOpacity();
      };
    }
  }, [opacity, y]);

  return (
    <div
      ref={ref}
      style={{
        padding: 'var(--cascade-space-xl)',
        background,
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        ...style,
      }}
    >
      <p
        style={{
          fontSize: tokens.typography.fontSize.base,
          color: tokens.color.blue[900],
          lineHeight: 1.8,
          marginBottom: 'var(--cascade-space-md)',
          fontStyle: 'italic',
        }}
      >
        "{quote}"
      </p>
      <div>
        <p
          style={{
            fontSize: tokens.typography.fontSize.base,
            fontWeight: '600',
            color: tokens.color.blue[900],
            margin: 0,
          }}
        >
          {author}
        </p>
        <p
          style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.color.blue[900],
            opacity: 0.6,
            margin: 0,
          }}
        >
          {role}
        </p>
      </div>
    </div>
  );
}


/**
 * Reusable Animated Card Component
 * Parameterized component for scroll-triggered animated cards
 */

import { useRef, useEffect } from 'react';
import { useMotionValue, useTranslateY, useViewportAnimationWithRef } from '@cascade/motion-runtime';
import { tokens } from '@cascade/tokens';

export interface AnimatedCardProps {
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Optional icon/emoji */
  icon?: string;
  /** Animation delay in milliseconds */
  delay?: number;
  /** Custom styling */
  style?: React.CSSProperties;
  /** Additional CSS classes */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
  /** Background color (default: white) */
  background?: string;
  /** Hover scale effect (default: 1.02) */
  hoverScale?: number;
}

/**
 * Reusable animated card component with scroll-triggered fade and slide animations
 * Supports fade out when scrolling out of view
 */
export function AnimatedCard({
  title,
  description,
  icon,
  delay = 0,
  style,
  className,
  children,
  background = 'white',
  hoverScale = 1.02,
}: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(0, { property: 'opacity' });
  const y = useTranslateY(30);

  // Staggered threshold based on delay for sequential animations
  const threshold = 0.2 + (delay / 1000);

  // Hooks must be called at top level
  useViewportAnimationWithRef(ref, opacity, {
    initial: 0,
    threshold,
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
    initial: 30,
    threshold,
    onEnter: {
      target: 0,
      config: { duration: 500, easing: 'ease-out' },
    },
    onExit: {
      target: 30,
      config: { duration: 300, easing: 'ease-in' },
    },
    once: false,
  });

  // Apply styles and handle hover
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

      const handleMouseEnter = () => {
        const yValue = y.get();
        element.style.transform = `translateY(${yValue}px) scale(${hoverScale})`;
      };

      const handleMouseLeave = () => {
        const yValue = y.get();
        element.style.transform = `translateY(${yValue}px) scale(1)`;
      };

      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        unsubscribeY();
        unsubscribeOpacity();
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [opacity, y, hoverScale]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        padding: 'var(--cascade-space-lg)',
        background,
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s ease',
        ...style,
      }}
    >
      {icon && (
        <div style={{ fontSize: '3rem', marginBottom: 'var(--cascade-space-md)', textAlign: 'center' }}>
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: '600',
          color: tokens.color.blue[900],
          marginBottom: 'var(--cascade-space-sm)',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: tokens.typography.fontSize.base,
          color: tokens.color.blue[900],
          opacity: 0.7,
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      {children}
    </div>
  );
}


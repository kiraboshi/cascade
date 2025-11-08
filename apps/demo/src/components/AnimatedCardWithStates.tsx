/**
 * Animated Card Component using Animation States
 * Demonstrates the new animation states hook
 */

import React, { useRef } from 'react';
import { defineAnimationStates } from '@cascade/compiler';
import { useAnimationStatesWithGestures } from '@cascade/motion-runtime';
import { tokens } from '@cascade/tokens';

export interface AnimatedCardWithStatesProps {
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
}

// Define animation states once at module level
const cardStates = defineAnimationStates({
  initial: {
    opacity: 0,
    transform: 'translateY(30px) scale(0.95)',
  },
  animate: {
    opacity: 1,
    transform: 'translateY(0) scale(1)',
    transition: {
      duration: 500,
      easing: 'ease-out',
    },
  },
  hover: {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: 200,
      easing: 'ease-out',
    },
  },
  tap: {
    transform: 'translateY(-2px) scale(0.98)',
    transition: {
      duration: 100,
    },
  },
});

/**
 * Animated card component using animation states hook
 * Automatically handles hover and tap states
 */
export function AnimatedCardWithStates({
  title,
  description,
  icon,
  delay = 0,
  style,
  className,
  children,
  background = 'white',
}: AnimatedCardWithStatesProps) {
  // Use animation states with gesture integration
  const animation = useAnimationStatesWithGestures(cardStates, {
    initial: 'initial',
    animate: 'animate',
    hover: true,
    tap: true,
  });

  // Apply delay by delaying the animate transition
  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        animation.animateTo('animate');
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay, animation]);

  // Combine refs: animation.ref for gestures, and our own ref if needed
  const combinedRef = React.useCallback((el: HTMLDivElement | null) => {
    // Attach gesture refs via callback
    if (el && (animation.ref as any).callback) {
      (animation.ref as any).callback(el);
    } else if (el && animation.ref) {
      (animation.ref as any).current = el;
    }
  }, [animation.ref]);

  return (
    <div
      ref={combinedRef}
      className={`${animation.className} ${className || ''}`}
      style={{
        padding: 'var(--cascade-space-lg)',
        background,
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.2s ease',
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


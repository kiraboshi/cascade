/**
 * Example component demonstrating token-based animation states
 */

import React from 'react';
import { defineAnimationStates } from '@cascade/compiler';
import { useAnimationStatesWithGestures } from '@cascade/motion-runtime';
import { tokens } from '@cascade/tokens';

// Animation states using design tokens
const tokenBasedStates = defineAnimationStates({
  initial: {
    opacity: 0,
    transform: `translateY(${tokens.space.lg})`,
  },
  animate: {
    opacity: 1,
    transform: 'translateY(0)',
    transition: {
      duration: tokens.motion.duration.normal,
      easing: tokens.motion.easing.easeOut,
    },
  },
  hover: {
    transform: `translateY(-${tokens.space.sm})`,
    transition: {
      duration: tokens.motion.duration.fast,
      easing: tokens.motion.easing.easeOut,
    },
  },
});

export interface TokenBasedAnimationProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * Component demonstrating token-based animations
 */
export function TokenBasedAnimation({ children, title = 'Token-Based Animation' }: TokenBasedAnimationProps) {
  const animation = useAnimationStatesWithGestures(tokenBasedStates, {
    initial: 'initial',
    animate: 'animate',
    hover: true,
  });
  
  return (
    <div
      ref={(el) => {
        if (el && (animation.ref as any).callback) {
          (animation.ref as any).callback(el);
        }
      }}
      className={animation.className}
      style={{
        padding: tokens.space.lg,
        background: tokens.color.blue[50],
        borderRadius: '12px',
        boxShadow: `0 4px 6px ${tokens.color.blue[900]}20`,
      }}
    >
      <h3
        style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: '600',
          color: tokens.color.blue[900],
          marginBottom: tokens.space.md,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: tokens.typography.fontSize.base,
          color: tokens.color.blue[700],
          lineHeight: 1.6,
        }}
      >
        {children}
      </p>
    </div>
  );
}


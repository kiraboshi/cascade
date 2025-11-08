/**
 * Reusable Animated Sequence Card Component
 * Parameterized component for cards with MotionSequence animations
 * 
 * NOW USES MotionSequence properly - no workarounds needed!
 */

import { MotionSequence, MotionStage } from '@cascade/motion-runtime';
import type { MotionOutput } from '@cascade/compiler';

export interface AnimatedSequenceCardProps {
  /** Animation definition from defineMotion */
  animation: MotionOutput;
  /** Animation delay in milliseconds */
  delay?: number;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Icon/emoji */
  icon: string;
  /** Additional transform styles (for parallax, rotation, scale) */
  additionalTransform?: string;
  /** Background color */
  background?: string;
  /** Whether to auto-start animation */
  autoStart?: boolean;
  /** Custom styling */
  style?: React.CSSProperties;
}

/**
 * Reusable card component that uses MotionSequence for compile-time animations
 * Can be combined with runtime motion values for complex effects
 * 
 * Now properly uses MotionSequence with reactive autoStart prop
 */
export function AnimatedSequenceCard({
  animation,
  delay = 0,
  title,
  description,
  icon,
  additionalTransform,
  background = 'rgba(255, 255, 255, 0.95)',
  autoStart = true,
  style,
}: AnimatedSequenceCardProps) {
  const cardContent = (
    <div
      style={{
        padding: 'var(--cascade-space-xl)',
        background,
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: 'var(--cascade-space-md)' }}>
        {icon}
      </div>
      <h3
        style={{
          fontSize: 'var(--cascade-typography-font-size-lg)',
          fontWeight: 'bold',
          color: 'var(--cascade-color-blue-900)',
          textAlign: 'center',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 'var(--cascade-typography-font-size-base)',
          color: 'var(--cascade-color-blue-900)',
          opacity: 0.7,
          textAlign: 'center',
        }}
      >
        {description}
      </p>
    </div>
  );

  // Use MotionSequence with MotionStage for proper animation handling
  const animatedContent = (
    <MotionSequence autoStart={autoStart}>
      <MotionStage
        animation={{
          className: animation.className,
          css: animation.css,
        }}
        delay={delay}
      >
        {cardContent}
      </MotionStage>
    </MotionSequence>
  );

  // Wrap in transform container only if additionalTransform is provided
  if (additionalTransform) {
    return (
      <div
        style={{
          transform: additionalTransform,
          transformStyle: 'preserve-3d',
        }}
      >
        {animatedContent}
      </div>
    );
  }

  return animatedContent;
}


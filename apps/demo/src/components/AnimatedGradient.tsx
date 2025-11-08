/**
 * Animated Gradient Component
 * Demonstrates gradient animation with Cascade Motion
 */

import { useEffect, useRef } from 'react';
import { useMotionValue } from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';
import { useMotionStyles } from './useMotionStyles';
import { tokens } from '@cascade/tokens';

export interface AnimatedGradientProps {
  /** Starting color */
  fromColor?: string;
  /** Ending color */
  toColor?: string;
  /** Gradient angle in degrees */
  angle?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Whether to loop the animation */
  loop?: boolean;
  /** Custom styling */
  style?: React.CSSProperties;
  /** Children content */
  children?: React.ReactNode;
}

/**
 * Component that animates a background gradient using motion values
 * Demonstrates Cascade's support for animating CSS gradient strings
 */
export function AnimatedGradient({
  fromColor = tokens.color.blue[500],
  toColor = tokens.color.primary,
  angle = 135,
  duration = 3000,
  loop = true,
  style,
  children,
}: AnimatedGradientProps) {
  const progress = useMotionValue(0, { property: 'background' });
  const elementRef = useRef<HTMLDivElement>(null);

  // Create gradient string from progress value
  useEffect(() => {
    if (!elementRef.current) return;

    const updateGradient = () => {
      const p = progress.get();
      
      // Interpolate colors based on progress
      // This creates a smooth color transition
      const currentAngle = angle + (p * 360); // Rotate gradient
      
      // Create gradient with animated color stops
      const color1 = interpolateColor(fromColor, toColor, p);
      const color2 = interpolateColor(toColor, fromColor, p);
      
      const gradient = `linear-gradient(${currentAngle}deg, ${color1} 0%, ${color2} 50%, ${color1} 100%)`;
      
      if (elementRef.current) {
        elementRef.current.style.background = gradient;
      }
    };

    const unsubscribe = progress.onChange(() => updateGradient());
    updateGradient();

    return unsubscribe;
  }, [progress, fromColor, toColor, angle]);

  // Animate the progress value
  useEffect(() => {
    const animate = async () => {
      while (loop) {
        await progress.animateTo(1, {
          duration,
          easing: 'ease-in-out',
        });
        await progress.animateTo(0, {
          duration,
          easing: 'ease-in-out',
        });
      }
    };
    
    if (loop) {
      animate();
    } else {
      progress.animateTo(1, { duration, easing: 'ease-in-out' });
    }
  }, [progress, duration, loop]);

  return (
    <div
      ref={elementRef}
      style={{
        background: `linear-gradient(${angle}deg, ${fromColor} 0%, ${toColor} 100%)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Helper function to interpolate between two hex colors
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  // Handle hex colors
  if (color1.startsWith('#') && color2.startsWith('#')) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (rgb1 && rgb2) {
      const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
      const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
      const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  
  // Fallback: simple interpolation
  return factor < 0.5 ? color1 : color2;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Component using defineMotion for compile-time gradient animation
 * This approach uses CSS keyframes for better performance
 */
export function AnimatedGradientCSS({
  fromColor = tokens.color.blue[500],
  toColor = tokens.color.primary,
  angle = 135,
  duration = 3000,
  style,
  children,
}: Omit<AnimatedGradientProps, 'loop'>) {
  // Define gradient animation using keyframes
  // Note: CSS can't directly animate gradients, so we animate opacity of overlays
  // or use multiple gradients with opacity animation
  const gradientAnimation = defineMotion({
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: `${duration}ms`,
    easing: 'ease-in-out',
  });

  useMotionStyles([gradientAnimation], 'gradient-animation');

  return (
    <div
      style={{
        position: 'relative',
        background: `linear-gradient(${angle}deg, ${fromColor} 0%, ${toColor} 100%)`,
        ...style,
      }}
    >
      {/* Animated overlay gradient */}
      <div
        className={gradientAnimation.className}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(${angle + 180}deg, ${toColor} 0%, ${fromColor} 100%)`,
          opacity: 0,
          mixBlendMode: 'multiply',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}


/**
 * Reusable Hook for Injecting Motion CSS Styles
 * Centralized CSS injection with deduplication
 */

import { useEffect } from 'react';
import type { MotionOutput } from '@cascade/compiler';

/**
 * Hook to inject motion CSS styles into the document head
 * Automatically deduplicates styles by className
 * 
 * @param animations - Array of motion outputs from defineMotion
 * @param styleId - Optional custom style ID (defaults to first animation className)
 */
export function useMotionStyles(
  animations: MotionOutput[],
  styleId?: string
): void {
  // Inject CSS synchronously during render to prevent flash
  // This ensures CSS is available before the element renders
  if (typeof document !== 'undefined') {
    const id = styleId || `motion-styles-${animations[0]?.className || 'default'}`;
    
    if (!document.getElementById(id)) {
      const styleElement = document.createElement('style');
      styleElement.id = id;
      styleElement.textContent = animations
        .map(anim => anim.css)
        .join('\n\n');
      document.head.appendChild(styleElement);
    }
  }
  
  // Also inject in useEffect as fallback for SSR/hydration
  useEffect(() => {
    const id = styleId || `motion-styles-${animations[0]?.className || 'default'}`;
    
    if (!document.getElementById(id)) {
      const styleElement = document.createElement('style');
      styleElement.id = id;
      styleElement.textContent = animations
        .map(anim => anim.css)
        .join('\n\n');
      document.head.appendChild(styleElement);
    }
  }, [animations, styleId]);
}

/**
 * Hook to inject a single motion CSS style
 * Convenience wrapper around useMotionStyles
 */
export function useMotionStyle(animation: MotionOutput, styleId?: string): void {
  useMotionStyles([animation], styleId);
}


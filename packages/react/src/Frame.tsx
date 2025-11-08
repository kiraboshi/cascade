/**
 * Frame layout primitive
 * Aspect ratio container with object-fit support
 */

import { forwardRef, useRef, type HTMLAttributes } from 'react';
import * as stylex from '@stylexjs/stylex';
import { useLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';

const frameStyles = stylex.create({
  base: {
    position: 'relative',
    aspectRatio: 'var(--frame-ratio)',
  },
  content: {
    position: 'absolute',
    inset: 0,
    objectFit: 'var(--frame-object-fit, cover)',
  },
});

export interface FrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  ratio: `${number}/${number}`;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  
  // Animation
  /**
   * Enable layout transition animation for property changes.
   * When enabled, changes to aspect ratio will be smoothly animated.
   */
  animate?: boolean | LayoutTransitionConfig;
  
  as?: keyof JSX.IntrinsicElements;
}

export const Frame = forwardRef<HTMLElement, FrameProps>(
  ({ ratio, objectFit = 'cover', animate, as: Component = 'div', style, className, children, ...props }, ref) => {
    // Internal ref for layout transitions
    const internalRef = useRef<HTMLElement>(null);
    
    // Apply layout transition if animation is enabled
    const layoutTransitionConfig: LayoutTransitionConfig | undefined = animate
      ? typeof animate === 'boolean'
        ? { enabled: animate }
        : { enabled: animate.enabled !== false, ...animate }
      : undefined;
    
    useLayoutTransition(internalRef, layoutTransitionConfig);
    
    // Parse ratio (e.g., "16/9" -> 16/9)
    const [width, height] = ratio.split('/').map(Number);
    const aspectRatio = width / height;
    
    const combinedClassName = stylex.props(frameStyles.base).className + (className ? ` ${className}` : '');
    
    // Merge refs
    const mergedRef = (element: HTMLElement | null) => {
      internalRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as any).current = element;
      }
    };
    
    return (
      <Component
        ref={mergedRef as any}
        className={combinedClassName}
        style={{
          '--frame-ratio': aspectRatio,
          '--frame-object-fit': objectFit,
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        <div {...stylex.props(frameStyles.content)}>
          {children}
        </div>
      </Component>
    );
  }
);

Frame.displayName = 'Frame';


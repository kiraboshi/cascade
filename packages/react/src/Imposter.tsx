/**
 * Imposter layout primitive
 * Centered overlay/modal container that can break out of its container
 */

import { forwardRef, useRef, type HTMLAttributes } from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens, type SpaceToken } from '@cascade/tokens';
import { useLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';

const impostorStyles = stylex.create({
  base: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    margin: 'var(--imposter-margin, 0)',
    maxWidth: 'var(--imposter-max-width, 100%)',
    maxHeight: 'var(--imposter-max-height, 100%)',
    overflow: 'auto',
  },
  breakout: {
    position: 'fixed',
  },
});

export interface ImposterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Configuration
  /**
   * Margin around the impostor using space tokens.
   * Provides spacing from viewport edges when breakout is enabled.
   */
  margin?: SpaceToken;
  
  /**
   * Maximum width of the impostor.
   * Defaults to '100%' of container.
   */
  maxWidth?: string;
  
  /**
   * Maximum height of the impostor.
   * Defaults to '100%' of container.
   */
  maxHeight?: string;
  
  /**
   * Break out of container and position relative to viewport.
   * When true, uses `position: fixed` instead of `position: absolute`.
   */
  breakout?: boolean;
  
  // Animation
  /**
   * Enable layout transition animation for property changes.
   * When enabled, changes to position, size will be smoothly animated.
   */
  animate?: boolean | LayoutTransitionConfig;
  
  // Responsive
  responsive?: Record<string, Partial<Omit<ImposterProps, 'responsive' | 'animate'>>>;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Resolve spacing token to CSS value
 */
function resolveSpacing(spacing: SpaceToken | undefined): string {
  if (!spacing) return '0';
  return tokens.space[spacing];
}

export const Imposter = forwardRef<HTMLElement, ImposterProps>(
  ({ 
    margin,
    maxWidth = '100%',
    maxHeight = '100%',
    breakout = false,
    animate,
    responsive,
    as: Component = 'div', 
    style, 
    className,
    children,
    ...props 
  }, ref) => {
    // Internal ref for layout transitions
    const internalRef = useRef<HTMLElement>(null);
    
    // Apply layout transition if animation is enabled
    const layoutTransitionConfig: LayoutTransitionConfig | undefined = animate
      ? typeof animate === 'boolean'
        ? { enabled: animate }
        : { enabled: animate.enabled !== false, ...animate }
      : undefined;
    
    useLayoutTransition(internalRef, layoutTransitionConfig);
    
    // Resolve margin token
    const marginValue = resolveSpacing(margin);
    
    // Generate responsive data-attributes for CSS selectors
    const responsiveAttrs: string[] = [];
    if (responsive) {
      for (const [breakpoint, overrides] of Object.entries(responsive)) {
        if (overrides.margin) {
          responsiveAttrs.push(`${breakpoint}:margin-${overrides.margin}`);
        }
        if (overrides.maxWidth) {
          responsiveAttrs.push(`${breakpoint}:max-width-${overrides.maxWidth.replace(/\s+/g, '-')}`);
        }
        if (overrides.maxHeight) {
          responsiveAttrs.push(`${breakpoint}:max-height-${overrides.maxHeight.replace(/\s+/g, '-')}`);
        }
        if (overrides.breakout !== undefined) {
          responsiveAttrs.push(`${breakpoint}:breakout-${overrides.breakout}`);
        }
      }
    }
    const dataResponsive = responsiveAttrs.length > 0 ? responsiveAttrs.join(' ') : undefined;
    
    const combinedClassName = stylex.props(
      impostorStyles.base,
      breakout && impostorStyles.breakout
    ).className + (className ? ` ${className}` : '');
    
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
          '--imposter-margin': marginValue,
          '--imposter-max-width': maxWidth,
          '--imposter-max-height': maxHeight,
          ...style,
        } as React.CSSProperties}
        data-responsive={dataResponsive}
        data-breakout={breakout}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Imposter.displayName = 'Imposter';


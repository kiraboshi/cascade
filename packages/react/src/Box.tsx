/**
 * Box layout primitive
 * Basic container primitive for padding, margin, background, border
 */

import { forwardRef, useRef, type HTMLAttributes } from 'react';
import * as stylex from '@stylexjs/stylex';
import { type SpaceToken } from '@cascade/tokens';
import { useLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';
import { resolveSpacing, resolveBorderRadius } from './utils/token-resolvers';

const boxStyles = stylex.create({
  base: {
    padding: 'var(--box-padding, 0)',
    margin: 'var(--box-margin, 0)',
    background: 'var(--box-background, transparent)',
    border: 'var(--box-border, none)',
    borderRadius: 'var(--box-border-radius, 0)',
    width: 'var(--box-width, auto)',
    height: 'var(--box-height, auto)',
    maxWidth: 'var(--box-max-width, none)',
    maxHeight: 'var(--box-max-height, none)',
    minWidth: 'var(--box-min-width, 0)',
    minHeight: 'var(--box-min-height, 0)',
  },
});

export interface BoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Spacing (token-based)
  padding?: SpaceToken | SpaceToken[]; // Single value or [top/bottom, left/right]
  margin?: SpaceToken | SpaceToken[]; // Single value or [top/bottom, left/right]
  
  // Visual properties
  background?: string;
  border?: string;
  borderRadius?: SpaceToken | string;
  
  // Layout
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  
  // Animation
  /**
   * Enable layout transition animation for property changes.
   * When enabled, changes to padding, margin, width, height, and other size properties will be smoothly animated.
   */
  animate?: boolean | LayoutTransitionConfig;
  
  // Responsive
  responsive?: Record<string, Partial<Omit<BoxProps, 'responsive' | 'animate'>>>;
  
  // Accessibility (ARIA)
  /**
   * ARIA label for the box.
   * Provides an accessible name for screen readers.
   */
  ariaLabel?: string;
  /**
   * ID of element that labels this box.
   */
  ariaLabelledBy?: string;
  /**
   * ID of element that describes this box.
   */
  ariaDescribedBy?: string;
  /**
   * ARIA role for the box.
   */
  role?: string;
  /**
   * ARIA live region politeness level.
   * Use "polite" or "assertive" to announce box changes to screen readers.
   */
  ariaLive?: 'off' | 'polite' | 'assertive';
  /**
   * Whether the entire box should be announced when it changes.
   */
  ariaAtomic?: boolean;
  /**
   * Whether the box is currently busy/loading.
   */
  ariaBusy?: boolean;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}


export const Box = forwardRef<HTMLElement, BoxProps>(
  ({ 
    padding, 
    margin, 
    background, 
    border, 
    borderRadius,
    width,
    height,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    animate,
    responsive,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    role,
    ariaLive,
    ariaAtomic,
    ariaBusy,
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
    
    // Resolve spacing tokens
    const paddingValue = resolveSpacing(padding);
    const marginValue = resolveSpacing(margin);
    const borderRadiusValue = resolveBorderRadius(borderRadius);
    
    // Generate responsive data-attributes for CSS selectors
    const responsiveAttrs: string[] = [];
    if (responsive) {
      for (const [breakpoint, overrides] of Object.entries(responsive)) {
        if (overrides.padding) {
          const paddingOverride = Array.isArray(overrides.padding) 
            ? overrides.padding.join('-')
            : overrides.padding;
          responsiveAttrs.push(`${breakpoint}:padding-${paddingOverride}`);
        }
        if (overrides.margin) {
          const marginOverride = Array.isArray(overrides.margin) 
            ? overrides.margin.join('-')
            : overrides.margin;
          responsiveAttrs.push(`${breakpoint}:margin-${marginOverride}`);
        }
        if (overrides.background) {
          responsiveAttrs.push(`${breakpoint}:background-${overrides.background.replace(/\s+/g, '-')}`);
        }
        if (overrides.borderRadius) {
          const borderRadiusOverride = typeof overrides.borderRadius === 'string' && overrides.borderRadius in tokens.space
            ? overrides.borderRadius
            : 'custom';
          responsiveAttrs.push(`${breakpoint}:border-radius-${borderRadiusOverride}`);
        }
        if (overrides.width) {
          responsiveAttrs.push(`${breakpoint}:width-${overrides.width.replace(/\s+/g, '-')}`);
        }
        if (overrides.maxWidth) {
          responsiveAttrs.push(`${breakpoint}:max-width-${overrides.maxWidth.replace(/\s+/g, '-')}`);
        }
      }
    }
    const dataResponsive = responsiveAttrs.length > 0 ? responsiveAttrs.join(' ') : undefined;
    
    const combinedClassName = stylex.props(boxStyles.base).className + (className ? ` ${className}` : '');
    
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
          '--box-padding': paddingValue,
          '--box-margin': marginValue,
          '--box-background': background,
          '--box-border': border,
          '--box-border-radius': borderRadiusValue,
          '--box-width': width,
          '--box-height': height,
          '--box-max-width': maxWidth,
          '--box-max-height': maxHeight,
          '--box-min-width': minWidth,
          '--box-min-height': minHeight,
          ...style,
        } as React.CSSProperties}
        data-responsive={dataResponsive}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        role={role}
        aria-live={ariaLive}
        aria-atomic={ariaAtomic}
        aria-busy={ariaBusy}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Box.displayName = 'Box';


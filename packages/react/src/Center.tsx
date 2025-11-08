/**
 * Center layout primitive
 * Centering container (horizontal and/or vertical) with optional max-width
 */

import { forwardRef, useRef, type HTMLAttributes } from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens, type SpaceToken } from '@cascade/tokens';
import { useLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';

const centerStyles = stylex.create({
  base: {
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 'var(--center-max-width, 100%)',
    minHeight: 'var(--center-min-height, auto)',
    padding: 'var(--center-padding, 0)',
    textAlign: 'var(--center-text-align, inherit)',
    display: 'var(--center-display, block)',
    alignItems: 'var(--center-align-items, center)',
    justifyContent: 'var(--center-justify-content, center)',
  },
  flexCenter: {
    display: 'flex',
    flexDirection: 'column',
  },
});

export interface CenterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Centering behavior
  centerText?: boolean; // Also center text-align
  centerChildren?: boolean; // Center child elements (default: true)
  
  // Sizing
  maxWidth?: string;
  minHeight?: string;
  
  // Padding
  padding?: SpaceToken | SpaceToken[];
  
  // Animation
  /**
   * Enable layout transition animation for property changes.
   * When enabled, changes to maxWidth, padding, minHeight will be smoothly animated.
   */
  animate?: boolean | LayoutTransitionConfig;
  
  // Responsive
  responsive?: Record<string, Partial<Omit<CenterProps, 'responsive' | 'animate'>>>;
  
  // Accessibility (ARIA)
  /**
   * ARIA label for the center container.
   * Provides an accessible name for screen readers.
   */
  ariaLabel?: string;
  /**
   * ID of element that labels this center container.
   */
  ariaLabelledBy?: string;
  /**
   * ID of element that describes this center container.
   */
  ariaDescribedBy?: string;
  /**
   * ARIA role for the center container.
   */
  role?: string;
  /**
   * ARIA live region politeness level.
   * Use "polite" or "assertive" to announce center changes to screen readers.
   */
  ariaLive?: 'off' | 'polite' | 'assertive';
  /**
   * Whether the entire center container should be announced when it changes.
   */
  ariaAtomic?: boolean;
  /**
   * Whether the center container is currently busy/loading.
   */
  ariaBusy?: boolean;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Resolve spacing token or array to CSS value
 */
function resolveSpacing(spacing: SpaceToken | SpaceToken[] | undefined): string {
  if (!spacing) return '0';
  
  if (Array.isArray(spacing)) {
    const [vertical, horizontal] = spacing;
    const verticalValue = tokens.space[vertical];
    const horizontalValue = tokens.space[horizontal];
    return `${verticalValue} ${horizontalValue}`;
  }
  
  return tokens.space[spacing];
}

export const Center = forwardRef<HTMLElement, CenterProps>(
  ({ 
    centerText = false,
    centerChildren = true,
    maxWidth,
    minHeight,
    padding,
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
    // Resolve padding token
    const paddingValue = resolveSpacing(padding);
    
    // Generate responsive data-attributes for CSS selectors
    const responsiveAttrs: string[] = [];
    if (responsive) {
      for (const [breakpoint, overrides] of Object.entries(responsive)) {
        if (overrides.maxWidth) {
          responsiveAttrs.push(`${breakpoint}:max-width-${overrides.maxWidth.replace(/\s+/g, '-')}`);
        }
        if (overrides.padding) {
          const paddingOverride = Array.isArray(overrides.padding) 
            ? overrides.padding.join('-')
            : overrides.padding;
          responsiveAttrs.push(`${breakpoint}:padding-${paddingOverride}`);
        }
        if (overrides.centerText !== undefined) {
          responsiveAttrs.push(`${breakpoint}:center-text-${overrides.centerText}`);
        }
      }
    }
    const dataResponsive = responsiveAttrs.length > 0 ? responsiveAttrs.join(' ') : undefined;
    
    // Determine if we need flex centering for children
    const needsFlexCenter = centerChildren;
    const combinedClassName = stylex.props(
      centerStyles.base,
      needsFlexCenter && centerStyles.flexCenter
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
          '--center-max-width': maxWidth,
          '--center-min-height': minHeight,
          '--center-padding': paddingValue,
          '--center-text-align': centerText ? 'center' : 'inherit',
          '--center-display': needsFlexCenter ? 'flex' : 'block',
          '--center-align-items': needsFlexCenter ? 'center' : 'normal',
          '--center-justify-content': needsFlexCenter ? 'center' : 'normal',
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
      />
    );
  }
);

Center.displayName = 'Center';


/**
 * Cover layout primitive
 * Full-height layout with header/footer slots and centered content
 */

import { forwardRef, useRef, type HTMLAttributes, type ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import { type SpaceToken } from '@cascade/tokens';
import { useLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';
import { resolveSpacing } from './utils/token-resolvers';

const coverStyles = stylex.create({
  base: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'var(--cover-min-height, 100vh)',
    padding: 'var(--cover-padding, 0)',
  },
  header: {
    flexShrink: 0,
  },
  centered: {
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexShrink: 0,
  },
});

export interface CoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  // Content slots
  /**
   * Centered content that fills the available space.
   */
  centered?: ReactNode;
  
  /**
   * Header content at the top.
   */
  header?: ReactNode;
  
  /**
   * Footer content at the bottom.
   */
  footer?: ReactNode;
  
  /**
   * Regular children (rendered after centered content if both are provided).
   */
  children?: ReactNode;
  
  // Sizing
  /**
   * Minimum height of the cover container.
   * Defaults to '100vh' for full viewport height.
   */
  minHeight?: string;
  
  // Spacing
  /**
   * Padding using space tokens.
   */
  padding?: SpaceToken | SpaceToken[];
  
  // Animation
  /**
   * Enable layout transition animation for property changes.
   * When enabled, changes to minHeight, padding will be smoothly animated.
   */
  animate?: boolean | LayoutTransitionConfig;
  
  // Responsive
  responsive?: Record<string, Partial<Omit<CoverProps, 'responsive' | 'animate' | 'centered' | 'header' | 'footer' | 'children'>>>;
  
  // Accessibility (ARIA)
  /**
   * ARIA label for the cover layout.
   * Provides an accessible name for screen readers.
   */
  ariaLabel?: string;
  /**
   * ID of element that labels this cover layout.
   */
  ariaLabelledBy?: string;
  /**
   * ID of element that describes this cover layout.
   */
  ariaDescribedBy?: string;
  /**
   * ARIA role for the cover layout.
   */
  role?: string;
  /**
   * ARIA live region politeness level.
   * Use "polite" or "assertive" to announce cover changes to screen readers.
   */
  ariaLive?: 'off' | 'polite' | 'assertive';
  /**
   * Whether the entire cover layout should be announced when it changes.
   */
  ariaAtomic?: boolean;
  /**
   * Whether the cover layout is currently busy/loading.
   */
  ariaBusy?: boolean;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}

export const Cover = forwardRef<HTMLElement, CoverProps>(
  ({ 
    centered,
    header,
    footer,
    children,
    minHeight = '100vh',
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
        if (overrides.minHeight) {
          responsiveAttrs.push(`${breakpoint}:min-height-${overrides.minHeight.replace(/\s+/g, '-')}`);
        }
        if (overrides.padding) {
          const paddingOverride = Array.isArray(overrides.padding) 
            ? overrides.padding.join('-')
            : overrides.padding;
          responsiveAttrs.push(`${breakpoint}:padding-${paddingOverride}`);
        }
      }
    }
    const dataResponsive = responsiveAttrs.length > 0 ? responsiveAttrs.join(' ') : undefined;
    
    const combinedClassName = stylex.props(coverStyles.base).className + (className ? ` ${className}` : '');
    
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
          '--cover-min-height': minHeight,
          '--cover-padding': paddingValue,
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
        {header && (
          <div {...stylex.props(coverStyles.header)} data-cover-header>
            {header}
          </div>
        )}
        
        {centered ? (
          <div {...stylex.props(coverStyles.centered)} data-cover-centered>
            {centered}
          </div>
        ) : children ? (
          <div {...stylex.props(coverStyles.centered)} data-cover-centered>
            {children}
          </div>
        ) : null}
        
        {footer && (
          <div {...stylex.props(coverStyles.footer)} data-cover-footer>
            {footer}
          </div>
        )}
      </Component>
    );
  }
);

Cover.displayName = 'Cover';


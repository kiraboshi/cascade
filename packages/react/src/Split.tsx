/**
 * Split layout primitive
 * Two-column responsive layout with fraction-based sizing
 */

import { forwardRef, useRef, useMemo, Children, cloneElement, isValidElement, type HTMLAttributes, type ReactNode, type ReactElement } from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens, type SpaceToken } from '@cascade/tokens';
import { useLayoutTransition, useBatchLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';

const splitStyles = stylex.create({
  base: {
    display: 'grid',
    gridTemplateColumns: 'var(--split-template-columns)',
    gap: 'var(--split-gap, 0)',
    alignItems: 'var(--split-align, stretch)',
  },
  stack: {
    gridTemplateColumns: '1fr',
  },
});

export interface SplitProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  // Split configuration
  fraction?: string; // e.g., '1/2', '1/3', '2/3', 'auto'
  gutter?: SpaceToken;
  
  // Responsive behavior
  switchTo?: 'stack' | 'none'; // Stack on mobile
  threshold?: string; // Breakpoint to switch (e.g., '768px') - viewport-based
  
  // Alignment
  align?: 'start' | 'center' | 'end' | 'stretch';
  
  // Animation
  /**
   * Enable layout transition animation for property changes.
   * When enabled, changes to fraction, gutter, align will be smoothly animated.
   */
  animate?: boolean | LayoutTransitionConfig;
  
  // Responsive (viewport-based)
  responsive?: Record<string, Partial<Omit<SplitProps, 'responsive' | 'children' | 'animate' | 'containerQueries'>>>;
  
  // Container queries (container-based)
  /**
   * Container query support for responsive behavior based on container size.
   * Use this instead of `responsive` when the component is nested in containers
   * to ensure correct behavior. For stacking behavior, use `maxWidth` with `switchTo: 'stack'`.
   */
  containerQueries?: {
    minWidth?: Record<string, Partial<Omit<SplitProps, 'containerQueries' | 'responsive' | 'children' | 'animate'>>>;
    maxWidth?: Record<string, Partial<Omit<SplitProps, 'containerQueries' | 'responsive' | 'children' | 'animate'>>>;
  };
  
  // Accessibility (ARIA)
  /**
   * ARIA label for the split layout.
   * Provides an accessible name for screen readers.
   */
  ariaLabel?: string;
  /**
   * ID of element that labels this split layout.
   */
  ariaLabelledBy?: string;
  /**
   * ID of element that describes this split layout.
   */
  ariaDescribedBy?: string;
  /**
   * ARIA role for the split layout.
   */
  role?: string;
  /**
   * ARIA live region politeness level.
   * Use "polite" or "assertive" to announce split changes to screen readers.
   */
  ariaLive?: 'off' | 'polite' | 'assertive';
  /**
   * Whether the entire split layout should be announced when it changes.
   */
  ariaAtomic?: boolean;
  /**
   * Whether the split layout is currently busy/loading.
   */
  ariaBusy?: boolean;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
  
  // Children (should be exactly 2)
  children: [ReactNode, ReactNode];
}

/**
 * Parse fraction string and generate grid template columns
 */
function parseFraction(fraction: string = '1/2'): string {
  if (fraction === 'auto') {
    return 'auto 1fr'; // First column auto, second takes remaining
  }
  
  // Parse fraction like '1/2', '1/3', '2/3'
  const parts = fraction.split('/');
  if (parts.length === 2) {
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    
    if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
      const ratio = numerator / denominator;
      // Return two columns: first gets the fraction, second gets the remainder
      return `${ratio}fr ${1 - ratio}fr`;
    }
  }
  
  // Default to 1/2 if parsing fails
  return '1fr 1fr';
}

export const Split = forwardRef<HTMLElement, SplitProps>(
  ({ 
    fraction = '1/2',
    gutter,
    switchTo = 'stack',
    threshold,
    align = 'stretch',
    animate,
    responsive,
    containerQueries,
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
    const childRefsRef = useRef<React.RefObject<HTMLElement>[]>([]);
    
    // Apply layout transition if animation is enabled
    const layoutTransitionConfig: LayoutTransitionConfig | undefined = animate
      ? typeof animate === 'boolean'
        ? { enabled: animate }
        : { enabled: animate.enabled !== false, ...animate }
      : undefined;
    
    useLayoutTransition(internalRef, layoutTransitionConfig);
    
    // Prepare refs for the 2 children
    const childRefs = useMemo(() => {
      const refs: React.RefObject<HTMLElement>[] = [];
      for (let i = 0; i < 2; i++) {
        if (!childRefsRef.current[i]) {
          childRefsRef.current[i] = { current: null };
        }
        refs.push(childRefsRef.current[i]);
      }
      return refs;
    }, []);
    
    useBatchLayoutTransition(childRefs, layoutTransitionConfig);
    // Validate children
    if (!Array.isArray(children) || children.length !== 2) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Split component expects exactly 2 children');
      }
    }
    
    // Resolve gutter token
    const gutterValue = gutter ? tokens.space[gutter] : '0';
    
    // Parse fraction to grid template
    const gridTemplate = parseFraction(fraction);
    
    // Generate responsive data-attributes for CSS selectors (viewport-based)
    const responsiveAttrs: string[] = [];
    let shouldStack = switchTo === 'stack';
    
    if (responsive) {
      for (const [breakpoint, overrides] of Object.entries(responsive)) {
        if (overrides.fraction) {
          responsiveAttrs.push(`${breakpoint}:fraction-${overrides.fraction.replace(/\//g, '-')}`);
        }
        if (overrides.gutter) {
          responsiveAttrs.push(`${breakpoint}:gutter-${overrides.gutter}`);
        }
        if (overrides.switchTo) {
          responsiveAttrs.push(`${breakpoint}:switch-to-${overrides.switchTo}`);
          if (overrides.switchTo === 'stack') {
            shouldStack = true;
          }
        }
        if (overrides.align) {
          responsiveAttrs.push(`${breakpoint}:align-${overrides.align}`);
        }
      }
    }
    const dataResponsive = responsiveAttrs.length > 0 ? responsiveAttrs.join(' ') : undefined;
    
    // Generate CSS variables for container queries
    // Container queries check container size directly - no data attributes needed
    const containerQueryStyles: Record<string, string> = {};
    
    if (containerQueries?.minWidth) {
      for (const [width, overrides] of Object.entries(containerQueries.minWidth)) {
        const normalizedWidth = width.replace(/\s+/g, '-');
        
        // Set CSS variables that container queries will use
        if (overrides.fraction !== undefined) {
          const overrideTemplate = parseFraction(overrides.fraction);
          containerQueryStyles[`--split-template-columns-${normalizedWidth}`] = overrideTemplate;
        }
        if (overrides.gutter) {
          const gutterValue = tokens.space[overrides.gutter];
          containerQueryStyles[`--split-gap-${normalizedWidth}`] = gutterValue;
        }
      }
    }
    if (containerQueries?.maxWidth) {
      for (const [width, overrides] of Object.entries(containerQueries.maxWidth)) {
        const normalizedWidth = width.replace(/\s+/g, '-');
        
        // Set CSS variables for max-width container queries
        if (overrides.fraction !== undefined) {
          const overrideTemplate = parseFraction(overrides.fraction);
          containerQueryStyles[`--split-template-columns-max-${normalizedWidth}`] = overrideTemplate;
        }
        if (overrides.gutter) {
          const gutterValue = tokens.space[overrides.gutter];
          containerQueryStyles[`--split-gap-max-${normalizedWidth}`] = gutterValue;
        }
        // Check if stacking should occur
        if (overrides.switchTo === 'stack') {
          shouldStack = true;
        }
      }
    }
    
    const stylexClassName = stylex.props(
      splitStyles.base,
      shouldStack && splitStyles.stack
    ).className;
    const classNames = ['split', stylexClassName];
    if (className) {
      classNames.push(className);
    }
    const combinedClassName = classNames.join(' ');
    
    // Resolve align value
    const alignValue = align === 'start' ? 'start' :
                       align === 'end' ? 'end' :
                       align === 'center' ? 'center' :
                       'stretch';
    
    // Clone children to add refs for layout transitions
    const childrenWithRefs = useMemo(() => {
      if (!animate || !Array.isArray(children)) return children;
      
      return children.map((child, index) => {
        if (!isValidElement(child)) return child;
        const childRef = childRefs[index];
        if (!childRef) return child;
        
        return cloneElement(child as ReactElement<any>, {
          ref: (element: HTMLElement | null) => {
            childRef.current = element;
            const originalRef = (child as any).ref;
            if (typeof originalRef === 'function') {
              originalRef(element);
            } else if (originalRef && typeof originalRef === 'object' && 'current' in originalRef) {
              (originalRef as any).current = element;
            }
          },
        });
      });
    }, [children, animate, childRefs]);
    
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
          '--split-template-columns': shouldStack ? '1fr' : gridTemplate,
          '--split-gap': gutterValue,
          '--split-align': alignValue,
          ...(threshold && { '--split-threshold': threshold }),
          ...containerQueryStyles,
          ...style,
        } as React.CSSProperties}
        data-responsive={dataResponsive}
        data-fraction={fraction}
        data-switch-to={switchTo}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        role={role}
        aria-live={ariaLive}
        aria-atomic={ariaAtomic}
        aria-busy={ariaBusy}
        {...props}
      >
        {childrenWithRefs}
      </Component>
    );
  }
);

Split.displayName = 'Split';


/**
 * Stack layout primitive
 * Vertical flex container with configurable spacing and alignment
 */

import { forwardRef, useRef, useMemo, Children, cloneElement, isValidElement, type HTMLAttributes, type ReactElement } from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens, type SpaceToken } from '@cascade/tokens';
import { useLayoutTransition, useBatchLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';

const stackStyles = stylex.create({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--stack-gap, 0)',
    alignItems: 'var(--stack-align, stretch)',
    justifyContent: 'var(--stack-justify, flex-start)',
  },
});

export interface StackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  spacing: SpaceToken;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  /**
   * Enable layout transition animation for property changes.
   * When enabled, changes to spacing, align, justify will be smoothly animated.
   */
  animate?: boolean | LayoutTransitionConfig;
  responsive?: Record<string, Partial<Omit<StackProps, 'responsive' | 'animate'>>>;
  
  // Accessibility (ARIA)
  /**
   * ARIA label for the stack.
   * Provides an accessible name for screen readers.
   */
  ariaLabel?: string;
  /**
   * ID of element that labels this stack.
   */
  ariaLabelledBy?: string;
  /**
   * ID of element that describes this stack.
   */
  ariaDescribedBy?: string;
  /**
   * ARIA role for the stack.
   */
  role?: string;
  /**
   * ARIA live region politeness level.
   * Use "polite" or "assertive" to announce stack changes to screen readers.
   */
  ariaLive?: 'off' | 'polite' | 'assertive';
  /**
   * Whether the entire stack should be announced when it changes.
   */
  ariaAtomic?: boolean;
  /**
   * Whether the stack is currently busy/loading.
   */
  ariaBusy?: boolean;
  
  as?: keyof JSX.IntrinsicElements;
}

export const Stack = forwardRef<HTMLElement, StackProps>(
  ({ 
    spacing, 
    align = 'stretch', 
    justify = 'start', 
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
    const childRefsRef = useRef<React.RefObject<HTMLElement>[]>([]);
    
    // Apply layout transition if animation is enabled
    const layoutTransitionConfig: LayoutTransitionConfig | undefined = animate
      ? typeof animate === 'boolean'
        ? { enabled: animate }
        : { enabled: animate.enabled !== false, ...animate }
      : undefined;
    
    useLayoutTransition(internalRef, layoutTransitionConfig);
    
    // Prepare child refs for batch layout transition
    const childCount = Children.count(children);
    const childRefs = useMemo(() => {
      const refs: React.RefObject<HTMLElement>[] = [];
      for (let i = 0; i < childCount; i++) {
        if (!childRefsRef.current[i]) {
          childRefsRef.current[i] = { current: null };
        }
        refs.push(childRefsRef.current[i]);
      }
      if (childRefsRef.current.length > childCount) {
        childRefsRef.current = childRefsRef.current.slice(0, childCount);
      }
      return refs;
    }, [childCount]);
    
    useBatchLayoutTransition(childRefs, layoutTransitionConfig);
    
    // Resolve spacing token
    const gap = tokens.space[spacing];
    
    // Resolve alignment values to CSS values
    const alignValue = align === 'start' ? 'flex-start' :
                       align === 'end' ? 'flex-end' :
                       align || 'stretch';
    
    const justifyValue = justify === 'start' ? 'flex-start' :
                         justify === 'end' ? 'flex-end' :
                         justify === 'between' ? 'space-between' :
                         justify === 'center' ? 'center' :
                         'flex-start';
    
    // Generate responsive data-attributes for CSS selectors
    const responsiveAttrs: string[] = [];
    if (responsive) {
      for (const [breakpoint, overrides] of Object.entries(responsive)) {
        if (overrides.spacing) {
          responsiveAttrs.push(`${breakpoint}:spacing-${overrides.spacing}`);
        }
        if (overrides.align) {
          responsiveAttrs.push(`${breakpoint}:align-${overrides.align}`);
        }
        if (overrides.justify) {
          responsiveAttrs.push(`${breakpoint}:justify-${overrides.justify}`);
        }
      }
    }
    const dataResponsive = responsiveAttrs.length > 0 ? responsiveAttrs.join(' ') : undefined;
    
    const stylexClassName = stylex.props(stackStyles.base).className;
    const classNames = ['stack', stylexClassName];
    if (className) {
      classNames.push(className);
    }
    const combinedClassName = classNames.join(' ');
    
    // Clone children to add refs for layout transitions
    const childrenWithRefs = useMemo(() => {
      if (!animate) return children;
      
      return Children.map(children, (child, index) => {
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
          '--stack-gap': gap,
          '--stack-align': alignValue,
          '--stack-justify': justifyValue,
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
        {childrenWithRefs}
      </Component>
    );
  }
);

Stack.displayName = 'Stack';


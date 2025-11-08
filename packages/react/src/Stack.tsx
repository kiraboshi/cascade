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
  alignStart: {
    alignItems: 'flex-start',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  alignStretch: {
    alignItems: 'stretch',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  justifyBetween: {
    justifyContent: 'space-between',
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
  as?: keyof JSX.IntrinsicElements;
}

export const Stack = forwardRef<HTMLElement, StackProps>(
  ({ spacing, align = 'stretch', justify = 'start', animate, responsive, as: Component = 'div', style, className, children, ...props }, ref) => {
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
    
    // Build className with alignment utilities
    const alignClass = align === 'start' ? stackStyles.alignStart :
                       align === 'center' ? stackStyles.alignCenter :
                       align === 'end' ? stackStyles.alignEnd :
                       stackStyles.alignStretch;
    
    const justifyClass = justify === 'start' ? stackStyles.justifyStart :
                         justify === 'center' ? stackStyles.justifyCenter :
                         justify === 'end' ? stackStyles.justifyEnd :
                         stackStyles.justifyBetween;
    
    const combinedClassName = stylex.props(
      stackStyles.base,
      alignClass,
      justifyClass
    ).className + (className ? ` ${className}` : '');
    
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
          ...style,
        } as React.CSSProperties}
        data-responsive={dataResponsive}
        {...props}
      >
        {childrenWithRefs}
      </Component>
    );
  }
);

Stack.displayName = 'Stack';


/**
 * Cluster layout primitive
 * Horizontal flex container with wrapping and gap-based spacing
 */

import { forwardRef, useEffect, useRef, useMemo, Children, cloneElement, isValidElement, type HTMLAttributes, type ReactElement } from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens, type SpaceToken } from '@cascade/tokens';
import { useLayoutTransition, useBatchLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';

const clusterStyles = stylex.create({
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--cluster-gap, var(--cascade-space-md))',
    justifyContent: 'var(--cluster-justify, flex-start)',
  },
  wrapping: {
    justifyContent: 'space-between',
  },
});

export interface ClusterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  spacing?: SpaceToken;
  justify?: 'start' | 'center' | 'end' | 'between';
  detectWrapping?: boolean;
  /**
   * Enable layout transition animation for property changes.
   * When enabled, changes to spacing, justify will be smoothly animated.
   */
  animate?: boolean | LayoutTransitionConfig;
  as?: keyof JSX.IntrinsicElements;
}

export const Cluster = forwardRef<HTMLElement, ClusterProps>(
  ({ spacing, justify = 'start', detectWrapping = false, animate, as: Component = 'div', style, className, children, ...props }, ref) => {
    const internalRef = useRef<HTMLElement>(null);
    const childRefsRef = useRef<React.RefObject<HTMLElement>[]>([]);
    const combinedRef = (ref || internalRef) as React.RefObject<HTMLElement>;
    
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
    const gap = spacing ? tokens.space[spacing] : tokens.space.md;
    
    // Detect wrapping if enabled
    useEffect(() => {
      if (!detectWrapping || !combinedRef.current) {
        return;
      }
      
      const element = combinedRef.current;
      const checkWrapping = () => {
        const isWrapping = element.scrollHeight > element.clientHeight;
        element.setAttribute('data-wrapping', String(isWrapping));
      };
      
      checkWrapping();
      
      const resizeObserver = new ResizeObserver(checkWrapping);
      resizeObserver.observe(element);
      
      return () => {
        resizeObserver.disconnect();
      };
    }, [detectWrapping]);
    
    const combinedClassName = stylex.props(clusterStyles.base).className + (className ? ` ${className}` : '');
    
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
    
    return (
      <Component
        ref={combinedRef as any}
        className={combinedClassName}
        style={{
          '--cluster-gap': gap,
          '--cluster-justify': justify === 'start' ? 'flex-start' :
                               justify === 'center' ? 'center' :
                               justify === 'end' ? 'flex-end' :
                               'space-between',
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        {childrenWithRefs}
      </Component>
    );
  }
);

Cluster.displayName = 'Cluster';


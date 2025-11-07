/**
 * Cluster layout primitive
 * Horizontal flex container with wrapping and gap-based spacing
 */

import { forwardRef, useEffect, useRef, type HTMLAttributes } from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens, type SpaceToken } from '@cascade/tokens';

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
  as?: keyof JSX.IntrinsicElements;
}

export const Cluster = forwardRef<HTMLElement, ClusterProps>(
  ({ spacing, justify = 'start', detectWrapping = false, as: Component = 'div', style, className, ...props }, ref) => {
    const internalRef = useRef<HTMLElement>(null);
    const combinedRef = (ref || internalRef) as React.RefObject<HTMLElement>;
    
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
      />
    );
  }
);

Cluster.displayName = 'Cluster';


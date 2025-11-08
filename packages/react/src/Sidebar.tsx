/**
 * Sidebar layout primitive
 * Sidebar layout pattern (main content + sidebar) with responsive stacking
 */

import { forwardRef, useRef, useMemo, Children, cloneElement, isValidElement, type HTMLAttributes, type ReactNode, type ReactElement } from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens, type SpaceToken } from '@cascade/tokens';
import { useLayoutTransition, useBatchLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';

const sidebarStyles = stylex.create({
  base: {
    display: 'grid',
    gridTemplateColumns: 'var(--sidebar-template-columns)',
    gap: 'var(--sidebar-gap, 0)',
    alignItems: 'var(--sidebar-align-items, stretch)',
  },
  stack: {
    gridTemplateColumns: '1fr',
  },
});

export interface SidebarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  // Sidebar configuration
  side?: 'left' | 'right';
  sidebarWidth?: string; // e.g., "20rem", "300px"
  contentMin?: string; // Minimum content width
  
  // Spacing
  gap?: SpaceToken;
  
  // Behavior
  noStretch?: boolean; // Don't stretch sidebar to fill space
  sidebarFirst?: boolean; // Sidebar appears first in DOM (for mobile)
  
  // Animation
  /**
   * Enable layout transition animation for property changes.
   * When enabled, changes to side, sidebarWidth, gap will be smoothly animated.
   */
  animate?: boolean | LayoutTransitionConfig;
  
  // Responsive
  responsive?: Record<string, Partial<Omit<SidebarProps, 'responsive' | 'children' | 'animate'>>>;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
  
  // Children (should be exactly 2)
  children: [ReactNode, ReactNode]; // [sidebar, content] or [content, sidebar]
}

/**
 * Generate grid template columns based on side and widths
 */
function generateGridTemplate(
  side: 'left' | 'right' = 'left',
  sidebarWidth: string = '20rem',
  contentMin: string = '50%',
  noStretch: boolean = false
): string {
  const sidebarCol = noStretch ? sidebarWidth : `minmax(0, ${sidebarWidth})`;
  const contentCol = `minmax(${contentMin}, 1fr)`;
  
  if (side === 'left') {
    return `${sidebarCol} ${contentCol}`;
  } else {
    return `${contentCol} ${sidebarCol}`;
  }
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ 
    side = 'left',
    sidebarWidth = '20rem',
    contentMin = '50%',
    gap,
    noStretch = false,
    sidebarFirst = false,
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
        console.warn('Sidebar component expects exactly 2 children: [sidebar, content] or [content, sidebar]');
      }
    }
    
    // Resolve gap token
    const gapValue = gap ? tokens.space[gap] : '0';
    
    // Generate grid template
    const gridTemplate = generateGridTemplate(side, sidebarWidth, contentMin, noStretch);
    
    // Generate responsive data-attributes for CSS selectors
    const responsiveAttrs: string[] = [];
    let shouldStack = false;
    
    if (responsive) {
      for (const [breakpoint, overrides] of Object.entries(responsive)) {
        if (overrides.sidebarWidth === '0' || overrides.side === undefined) {
          // Implicit stacking when sidebarWidth is 0
          shouldStack = true;
        }
        if (overrides.gap) {
          responsiveAttrs.push(`${breakpoint}:gap-${overrides.gap}`);
        }
        if (overrides.side) {
          responsiveAttrs.push(`${breakpoint}:side-${overrides.side}`);
        }
      }
    }
    const dataResponsive = responsiveAttrs.length > 0 ? responsiveAttrs.join(' ') : undefined;
    
    // Determine children order
    // Assume children[0] is sidebar, children[1] is content
    const [sidebarChild, contentChild] = Array.isArray(children) && children.length === 2 
      ? children 
      : [null, null];
    
    // Order children in DOM based on side prop
    // For left: [sidebar, content], for right: [content, sidebar]
    const orderedChildren: ReactNode[] = side === 'left' 
      ? [sidebarChild, contentChild]
      : [contentChild, sidebarChild];
    
    // Clone children to add refs for layout transitions
    const childrenWithRefs = useMemo(() => {
      if (!animate) return orderedChildren;
      
      return orderedChildren.map((child, index) => {
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
    }, [orderedChildren, animate, childRefs]);
    
    const combinedClassName = stylex.props(
      sidebarStyles.base,
      shouldStack && sidebarStyles.stack
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
          '--sidebar-template-columns': gridTemplate,
          '--sidebar-gap': gapValue,
          '--sidebar-align-items': 'stretch',
          ...style,
        } as React.CSSProperties}
        data-responsive={dataResponsive}
        data-side={side}
        {...props}
      >
        {childrenWithRefs}
      </Component>
    );
  }
);

Sidebar.displayName = 'Sidebar';


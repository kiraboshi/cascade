/**
 * Grid layout primitive
 * CSS Grid container with token-based gaps and flexible column/row configuration
 */

import { forwardRef, useRef, useMemo, Children, cloneElement, isValidElement, type HTMLAttributes, type ReactElement } from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens, type SpaceToken } from '@cascade/tokens';
import { useLayoutTransition, useBatchLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';

const gridStyles = stylex.create({
  base: {
    display: 'grid',
    gap: 'var(--grid-gap, 0)',
    gridTemplateColumns: 'var(--grid-columns, repeat(3, 1fr))',
    gridTemplateRows: 'var(--grid-rows, none)',
    alignItems: 'var(--grid-align-items, stretch)',
    justifyItems: 'var(--grid-justify-items, stretch)',
    alignContent: 'var(--grid-align-content, start)',
    justifyContent: 'var(--grid-justify-content, start)',
  },
});

export interface GridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Grid configuration
  columns?: number | string | number[]; // e.g., 3, "repeat(3, 1fr)", [1, 2, 3]
  rows?: number | string | number[];
  
  // Spacing
  gap?: SpaceToken | SpaceToken[]; // Single or [row, column]
  
  // Alignment
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  alignContent?: 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around';
  justifyContent?: 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around';
  
  // Auto-fit/auto-fill
  autoFit?: boolean; // Use auto-fit instead of fixed columns
  minColumnWidth?: string; // Min width for auto-fit
  
  // Animation
  /**
   * Enable layout transition animation for property changes.
   * When enabled, changes to columns, rows, gap, alignment will be smoothly animated.
   */
  animate?: boolean | LayoutTransitionConfig;
  
  // Responsive
  responsive?: Record<string, Partial<Omit<GridProps, 'responsive' | 'animate'>>>;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Resolve gap token or array to CSS value
 */
function resolveGap(gap: SpaceToken | SpaceToken[] | undefined): string {
  if (!gap) return '0';
  
  if (Array.isArray(gap)) {
    const [row, column] = gap;
    const rowValue = tokens.space[row];
    const columnValue = tokens.space[column];
    return `${rowValue} ${columnValue}`;
  }
  
  return tokens.space[gap];
}

/**
 * Resolve columns to CSS grid-template-columns value
 */
function resolveColumns(
  columns: number | string | number[] | undefined,
  autoFit: boolean | undefined,
  minColumnWidth: string | undefined
): string {
  if (!columns) {
    if (autoFit && minColumnWidth) {
      return `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`;
    }
    return 'repeat(3, 1fr)'; // Default
  }
  
  if (autoFit && minColumnWidth) {
    return `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`;
  }
  
  if (typeof columns === 'number') {
    return `repeat(${columns}, 1fr)`;
  }
  
  if (typeof columns === 'string') {
    return columns; // Use as-is (e.g., "repeat(3, 1fr)", "1fr 2fr 1fr")
  }
  
  if (Array.isArray(columns)) {
    return columns.map(col => `${col}fr`).join(' ');
  }
  
  return 'repeat(3, 1fr)';
}

/**
 * Resolve rows to CSS grid-template-rows value
 */
function resolveRows(rows: number | string | number[] | undefined): string {
  if (!rows) return 'none';
  
  if (typeof rows === 'number') {
    return `repeat(${rows}, 1fr)`;
  }
  
  if (typeof rows === 'string') {
    return rows; // Use as-is
  }
  
  if (Array.isArray(rows)) {
    return rows.map(row => `${row}fr`).join(' ');
  }
  
  return 'none';
}

/**
 * Convert alignment prop to CSS value
 */
function resolveAlignItems(align: 'start' | 'center' | 'end' | 'stretch' | undefined): string {
  if (!align) return 'stretch';
  return align === 'start' ? 'start' :
         align === 'end' ? 'end' :
         align;
}

function resolveJustifyItems(justify: 'start' | 'center' | 'end' | 'stretch' | undefined): string {
  if (!justify) return 'stretch';
  return justify === 'start' ? 'start' :
         justify === 'end' ? 'end' :
         justify;
}

function resolveAlignContent(align: 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around' | undefined): string {
  if (!align) return 'start';
  return align === 'between' ? 'space-between' :
         align === 'around' ? 'space-around' :
         align === 'start' ? 'start' :
         align === 'end' ? 'end' :
         align;
}

function resolveJustifyContent(justify: 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around' | undefined): string {
  if (!justify) return 'start';
  return justify === 'between' ? 'space-between' :
         justify === 'around' ? 'space-around' :
         justify === 'start' ? 'start' :
         justify === 'end' ? 'end' :
         justify;
}

export const Grid = forwardRef<HTMLElement, GridProps>(
  ({ 
    columns,
    rows,
    gap,
    alignItems = 'stretch',
    justifyItems = 'stretch',
    alignContent = 'start',
    justifyContent = 'start',
    autoFit,
    minColumnWidth,
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
    // Resolve values
    const gapValue = resolveGap(gap);
    const columnsValue = resolveColumns(columns, autoFit, minColumnWidth);
    const rowsValue = resolveRows(rows);
    
    // Generate responsive data-attributes for CSS selectors
    const responsiveAttrs: string[] = [];
    if (responsive) {
      for (const [breakpoint, overrides] of Object.entries(responsive)) {
        if (overrides.columns !== undefined) {
          const columnsOverride = typeof overrides.columns === 'number'
            ? overrides.columns.toString()
            : Array.isArray(overrides.columns)
            ? overrides.columns.join('-')
            : 'custom';
          responsiveAttrs.push(`${breakpoint}:columns-${columnsOverride}`);
        }
        if (overrides.gap) {
          const gapOverride = Array.isArray(overrides.gap) 
            ? overrides.gap.join('-')
            : overrides.gap;
          responsiveAttrs.push(`${breakpoint}:gap-${gapOverride}`);
        }
        if (overrides.alignItems) {
          responsiveAttrs.push(`${breakpoint}:align-items-${overrides.alignItems}`);
        }
        if (overrides.autoFit !== undefined) {
          responsiveAttrs.push(`${breakpoint}:auto-fit-${overrides.autoFit}`);
        }
      }
    }
    const dataResponsive = responsiveAttrs.length > 0 ? responsiveAttrs.join(' ') : undefined;
    
    const combinedClassName = stylex.props(gridStyles.base).className + (className ? ` ${className}` : '');
    
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
          '--grid-gap': gapValue,
          '--grid-columns': columnsValue,
          '--grid-rows': rowsValue,
          '--grid-align-items': resolveAlignItems(alignItems),
          '--grid-justify-items': resolveJustifyItems(justifyItems),
          '--grid-align-content': resolveAlignContent(alignContent),
          '--grid-justify-content': resolveJustifyContent(justifyContent),
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

Grid.displayName = 'Grid';


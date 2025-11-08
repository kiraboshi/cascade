/**
 * Grid layout primitive
 * CSS Grid container with token-based gaps and flexible column/row configuration
 */

import { forwardRef, useRef, useMemo, Children, cloneElement, isValidElement, type HTMLAttributes, type ReactElement } from 'react';
import * as stylex from '@stylexjs/stylex';
import { type SpaceToken } from '@cascade/tokens';
import { useLayoutTransition, useBatchLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';
import { useGridKeyboardNavigation } from './accessibility';
import { resolveGap } from './utils/token-resolvers';

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
  
  // Responsive (viewport-based)
  responsive?: Record<string, Partial<Omit<GridProps, 'responsive' | 'animate' | 'containerQueries'>>>;
  
  // Container queries (container-based)
  /**
   * Container query support for responsive behavior based on container size.
   * Use this instead of `responsive` when the component is nested in containers
   * (e.g., inside Sidebar, Modal, Split) to ensure correct behavior.
   */
  containerQueries?: {
    minWidth?: Record<string, Partial<Omit<GridProps, 'containerQueries' | 'responsive' | 'animate'>>>;
    maxWidth?: Record<string, Partial<Omit<GridProps, 'containerQueries' | 'responsive' | 'animate'>>>;
  };
  
  // Accessibility (ARIA)
  /**
   * ARIA label for the grid.
   * Provides an accessible name for screen readers.
   */
  ariaLabel?: string;
  /**
   * ID of element that labels this grid.
   */
  ariaLabelledBy?: string;
  /**
   * ID of element that describes this grid.
   */
  ariaDescribedBy?: string;
  /**
   * ARIA role for the grid.
   * Use "grid" for interactive data grids, or leave undefined for layout grids.
   */
  role?: string;
  /**
   * ARIA live region politeness level.
   * Use "polite" or "assertive" to announce grid changes to screen readers.
   */
  ariaLive?: 'off' | 'polite' | 'assertive';
  /**
   * Whether the entire grid should be announced when it changes.
   */
  ariaAtomic?: boolean;
  /**
   * Whether the grid is currently busy/loading.
   */
  ariaBusy?: boolean;
  /**
   * Number of rows in the grid (for data grids).
   */
  ariaRowCount?: number;
  /**
   * Number of columns in the grid (for data grids).
   */
  ariaColCount?: number;
  
  // Keyboard navigation
  /**
   * Enable keyboard navigation for grid cells.
   * When enabled, arrow keys navigate cells, Enter/Space activate, Ctrl+Home/End jump to first/last.
   * Requires `columns` prop to be set for proper navigation.
   */
  keyboardNavigation?: boolean;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
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
    containerQueries,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    role,
    ariaLive,
    ariaAtomic,
    ariaBusy,
    ariaRowCount,
    ariaColCount,
    keyboardNavigation = false,
    as: Component = 'div', 
    style, 
    className,
    children,
    ...props 
  }, ref) => {
    // Internal ref for layout transitions
    const internalRef = useRef<HTMLElement>(null);
    const childRefsRef = useRef<React.RefObject<HTMLElement>[]>([]);
    
    // Determine column count for keyboard navigation
    const columnCount = useMemo(() => {
      if (typeof columns === 'number') {
        return columns;
      }
      // For auto-fit or string-based columns, try to infer from ariaColCount
      if (ariaColCount) {
        return ariaColCount;
      }
      // Default fallback
      return 3;
    }, [columns, ariaColCount]);
    
    // Keyboard navigation for grid cells
    useGridKeyboardNavigation(internalRef, keyboardNavigation && columnCount > 0, {
      columns: columnCount,
    });
    
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
    
    // Generate responsive data-attributes for CSS selectors (viewport-based)
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
    
    // Generate CSS variables for container queries
    // Container queries check container size directly - no data attributes needed
    const containerQueryStyles: Record<string, string> = {};
    
    // When using container queries, we still set the base value for fallback
    // but container queries will override it when container size matches
    const hasContainerQueries = !!(containerQueries?.minWidth || containerQueries?.maxWidth);
    
    if (containerQueries?.minWidth) {
      for (const [width, overrides] of Object.entries(containerQueries.minWidth)) {
        const normalizedWidth = width.replace(/\s+/g, '-');
        
        // Set CSS variables that container queries will use
        if (overrides.columns !== undefined) {
          const columnsValue = resolveColumns(overrides.columns, overrides.autoFit, overrides.minColumnWidth);
          containerQueryStyles[`--grid-columns-${normalizedWidth}`] = columnsValue;
        }
        if (overrides.gap) {
          const gapValue = resolveGap(overrides.gap);
          containerQueryStyles[`--grid-gap-${normalizedWidth}`] = gapValue;
        }
      }
    }
    if (containerQueries?.maxWidth) {
      for (const [width, overrides] of Object.entries(containerQueries.maxWidth)) {
        const normalizedWidth = width.replace(/\s+/g, '-');
        
        // Set CSS variables for max-width container queries
        if (overrides.columns !== undefined) {
          const columnsValue = resolveColumns(overrides.columns, overrides.autoFit, overrides.minColumnWidth);
          containerQueryStyles[`--grid-columns-max-${normalizedWidth}`] = columnsValue;
        }
        if (overrides.gap) {
          const gapValue = resolveGap(overrides.gap);
          containerQueryStyles[`--grid-gap-max-${normalizedWidth}`] = gapValue;
        }
      }
    }
    
    const stylexClassName = stylex.props(gridStyles.base).className;
    const classNames = ['grid', stylexClassName];
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
    
    const baseStyles: Record<string, string> = {
      '--grid-gap': gapValue,
      '--grid-rows': rowsValue,
      '--grid-align-items': resolveAlignItems(alignItems),
      '--grid-justify-items': resolveJustifyItems(justifyItems),
      '--grid-align-content': resolveAlignContent(alignContent),
      '--grid-justify-content': resolveJustifyContent(justifyContent),
    };
    
    // Set base --grid-columns value
    // IMPORTANT: When container queries are used, we MUST NOT set --grid-columns inline,
    // because inline styles have higher specificity than container query CSS rules and will
    // prevent container queries from overriding it. Instead, we set --grid-columns-base
    // and update the CSS fallback chain to use it.
    if (!hasContainerQueries) {
      // No container queries: set --grid-columns directly
      baseStyles['--grid-columns'] = columnsValue;
    } else {
      // Container queries active: set base value as --grid-columns-base
      // The container query CSS fallback chain will use this via --grid-columns-base
      baseStyles['--grid-columns-base'] = columnsValue;
    }
    
    // When container queries are used, wrap the Grid in a container div
    // Container queries check the nearest ancestor container, so we need a parent with container-type
    // The wrapper div will expand to fill its parent, so container queries check the parent's size
    const gridElement = (
      <Component
        ref={mergedRef as any}
        className={combinedClassName}
        style={{
          ...baseStyles,
          ...containerQueryStyles,
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
        aria-rowcount={ariaRowCount}
        aria-colcount={ariaColCount}
        {...props}
      >
        {childrenWithRefs}
      </Component>
    );
    
    // If container queries are used, wrap in a container div
    // The wrapper expands to fill its parent, so container queries check the parent's size
    // Use box-sizing: border-box to ensure width calculation accounts for padding/borders
    if (hasContainerQueries) {
      return (
        <div style={{ 
          containerType: 'inline-size', 
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {gridElement}
        </div>
      );
    }
    
    return gridElement;
  }
);

Grid.displayName = 'Grid';


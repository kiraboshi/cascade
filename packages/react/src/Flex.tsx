/**
 * Flex layout primitive
 * General-purpose flexbox container with full control over direction, alignment, and wrapping
 */

import { forwardRef, useRef, useMemo, Children, cloneElement, isValidElement, type HTMLAttributes, type ReactElement } from 'react';
import { type SpaceToken } from '@cascade/tokens';
import { useLayoutTransition, useBatchLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';
import { resolveGap } from './utils/token-resolvers';

export interface FlexProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Direction
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  
  // Wrapping
  wrap?: boolean | 'wrap' | 'nowrap' | 'wrap-reverse';
  
  // Spacing
  gap?: SpaceToken | SpaceToken[]; // Single or [row, column] for 2D gap
  
  // Alignment (cross-axis)
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  
  // Justification (main-axis)
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | 'stretch';
  
  // Content alignment (for wrapped content)
  alignContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'stretch';
  
  // Animation
  /**
   * Enable layout transition animation for flex property changes.
   * When enabled, changes to direction, wrap, align, justify, etc. will be smoothly animated.
   * Can be a boolean to enable with defaults, or a config object for customization.
   * 
   * @example
   * ```tsx
   * <Flex direction="row" animate={{ duration: 300 }}>...</Flex>
   * <Flex direction="column" animate={true}>...</Flex>
   * ```
   */
  animate?: boolean | LayoutTransitionConfig;
  
  // Responsive
  responsive?: Record<string, Partial<Omit<FlexProps, 'responsive' | 'animate'>>>;
  
  // Accessibility (ARIA)
  /**
   * ARIA label for the flex container.
   * Provides an accessible name for screen readers.
   */
  ariaLabel?: string;
  /**
   * ID of element that labels this flex container.
   */
  ariaLabelledBy?: string;
  /**
   * ID of element that describes this flex container.
   */
  ariaDescribedBy?: string;
  /**
   * ARIA role for the flex container.
   */
  role?: string;
  /**
   * ARIA live region politeness level.
   * Use "polite" or "assertive" to announce flex changes to screen readers.
   */
  ariaLive?: 'off' | 'polite' | 'assertive';
  /**
   * Whether the entire flex container should be announced when it changes.
   */
  ariaAtomic?: boolean;
  /**
   * Whether the flex container is currently busy/loading.
   */
  ariaBusy?: boolean;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}


/**
 * Resolve flex direction to CSS value
 */
function resolveDirection(direction: 'row' | 'column' | 'row-reverse' | 'column-reverse' | undefined): string {
  if (!direction) return 'row';
  return direction;
}

/**
 * Resolve flex wrap to CSS value
 */
function resolveWrap(wrap: boolean | 'wrap' | 'nowrap' | 'wrap-reverse' | undefined): string {
  if (wrap === undefined) return 'nowrap';
  if (typeof wrap === 'boolean') return wrap ? 'wrap' : 'nowrap';
  return wrap;
}

/**
 * Resolve align-items to CSS value
 */
function resolveAlignItems(align: 'start' | 'center' | 'end' | 'stretch' | 'baseline' | undefined): string {
  if (!align) return 'stretch';
  return align === 'start' ? 'flex-start' :
         align === 'end' ? 'flex-end' :
         align;
}

/**
 * Resolve justify-content to CSS value
 */
function resolveJustifyContent(justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | 'stretch' | undefined): string {
  if (!justify) return 'flex-start';
  return justify === 'start' ? 'flex-start' :
         justify === 'end' ? 'flex-end' :
         justify === 'between' ? 'space-between' :
         justify === 'around' ? 'space-around' :
         justify === 'evenly' ? 'space-evenly' :
         justify;
}

/**
 * Resolve align-content to CSS value
 */
function resolveAlignContent(alignContent: 'start' | 'center' | 'end' | 'between' | 'around' | 'stretch' | undefined): string {
  if (!alignContent) return 'stretch';
  return alignContent === 'start' ? 'flex-start' :
         alignContent === 'end' ? 'flex-end' :
         alignContent === 'between' ? 'space-between' :
         alignContent === 'around' ? 'space-around' :
         alignContent;
}

export const Flex = forwardRef<HTMLElement, FlexProps>(
  ({ 
    direction = 'row',
    wrap = false,
    gap,
    align,
    justify,
    alignContent,
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
    // Internal ref for layout transitions (merged with forwarded ref)
    const internalRef = useRef<HTMLElement>(null);
    
    // Create refs for children to enable batch layout transitions
    const childRefsRef = useRef<React.RefObject<HTMLElement>[]>([]);
    
    // Apply layout transition if animation is enabled
    const layoutTransitionConfig: LayoutTransitionConfig | undefined = animate
      ? typeof animate === 'boolean'
        ? { enabled: animate }
        : { enabled: animate.enabled !== false, ...animate }
      : undefined;
    
    // Apply layout transition to container
    useLayoutTransition(internalRef, layoutTransitionConfig);
    
    // Prepare child refs for batch layout transition
    const childCount = Children.count(children);
    const childRefs = useMemo(() => {
      // Ensure we have enough refs for all children
      const refs: React.RefObject<HTMLElement>[] = [];
      for (let i = 0; i < childCount; i++) {
        if (!childRefsRef.current[i]) {
          childRefsRef.current[i] = { current: null };
        }
        refs.push(childRefsRef.current[i]);
      }
      // Trim excess refs
      if (childRefsRef.current.length > childCount) {
        childRefsRef.current = childRefsRef.current.slice(0, childCount);
      }
      return refs;
    }, [childCount]);
    
    // Apply batch layout transition to children when animation is enabled
    useBatchLayoutTransition(
      childRefs,
      layoutTransitionConfig
    );
    // Resolve values
    const gapValue = resolveGap(gap);
    const directionValue = resolveDirection(direction);
    const wrapValue = resolveWrap(wrap);
    const alignItemsValue = resolveAlignItems(align);
    const justifyContentValue = resolveJustifyContent(justify);
    const alignContentValue = resolveAlignContent(alignContent);
    
    // Generate responsive data-attributes for CSS selectors
    const responsiveAttrs: string[] = [];
    if (responsive) {
      for (const [breakpoint, overrides] of Object.entries(responsive)) {
        if (overrides.direction) {
          responsiveAttrs.push(`${breakpoint}:direction-${overrides.direction}`);
        }
        if (overrides.wrap !== undefined) {
          const wrapOverride = typeof overrides.wrap === 'boolean' 
            ? (overrides.wrap ? 'wrap' : 'nowrap')
            : overrides.wrap;
          responsiveAttrs.push(`${breakpoint}:wrap-${wrapOverride}`);
        }
        if (overrides.gap) {
          const gapOverride = Array.isArray(overrides.gap) 
            ? overrides.gap.join('-')
            : overrides.gap;
          responsiveAttrs.push(`${breakpoint}:gap-${gapOverride}`);
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
    
    // Merge refs: internal ref for layout transitions + forwarded ref
    const mergedRef = (element: HTMLElement | null) => {
      internalRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as any).current = element;
      }
    };
    
    // Clone children to add refs for layout transitions
    const childrenWithRefs = useMemo(() => {
      if (!animate) return children;
      
      return Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        
        // Get ref for this child (should already exist from useMemo above)
        const childRef = childRefs[index];
        if (!childRef) return child;
        
        // Clone element and merge refs
        return cloneElement(child as ReactElement<any>, {
          ref: (element: HTMLElement | null) => {
            childRef.current = element;
            // Also call original ref if it exists
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
    
    const classNames = ['flex'];
    if (className) {
      classNames.push(className);
    }
    const combinedClassName = classNames.join(' ');
    
    return (
      <Component
        ref={mergedRef as any}
        className={combinedClassName}
        style={{
          '--flex-gap': gapValue,
          '--flex-direction': directionValue,
          '--flex-wrap': wrapValue,
          '--flex-align-items': alignItemsValue,
          '--flex-justify-content': justifyContentValue,
          '--flex-align-content': alignContentValue,
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

Flex.displayName = 'Flex';

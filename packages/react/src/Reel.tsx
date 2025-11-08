/**
 * Reel layout primitive
 * Horizontal scrolling container with optional snap scrolling
 */

import { forwardRef, useRef, useMemo, Children, cloneElement, isValidElement, type HTMLAttributes, type ReactElement } from 'react';
import { tokens, type SpaceToken } from '@cascade/tokens';
import { useLayoutTransition, useBatchLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';
import { useKeyboardScrolling } from './accessibility';

export interface ReelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Configuration
  /**
   * Fixed width for items.
   * When set, all items will have this width.
   * If not set, items use their natural width.
   */
  itemWidth?: string;
  
  /**
   * Gap between items using space tokens.
   */
  gap?: SpaceToken;
  
  // Scrolling behavior
  /**
   * Enable snap scrolling.
   * When enabled, scrolling will snap to items.
   */
  snap?: boolean;
  
  /**
   * Snap alignment for items.
   * Only applies when snap is enabled.
   */
  snapAlign?: 'start' | 'center' | 'end';
  
  /**
   * Scroll padding to offset snap points.
   * Useful for adding padding at the edges.
   */
  scrollPadding?: string;
  
  // Animation
  /**
   * Enable layout transition animation for property changes.
   * When enabled, changes to gap, itemWidth, and item reordering will be smoothly animated.
   */
  animate?: boolean | LayoutTransitionConfig;
  
  // Responsive
  responsive?: Record<string, Partial<Omit<ReelProps, 'responsive' | 'animate'>>>;
  
  // Accessibility (ARIA)
  /**
   * ARIA label for the reel (scrollable region).
   * Provides an accessible name for screen readers.
   */
  ariaLabel?: string;
  /**
   * ID of element that labels this reel.
   */
  ariaLabelledBy?: string;
  /**
   * ID of element that describes this reel.
   */
  ariaDescribedBy?: string;
  /**
   * ARIA role for the reel.
   * Defaults to "region" for scrollable regions.
   */
  role?: string;
  /**
   * Orientation of the reel.
   * Defaults to "horizontal" for horizontal scrolling.
   */
  ariaOrientation?: 'horizontal' | 'vertical';
  /**
   * ARIA live region politeness level.
   * Use "polite" or "assertive" to announce reel changes to screen readers.
   */
  ariaLive?: 'off' | 'polite' | 'assertive';
  /**
   * Whether the entire reel should be announced when it changes.
   */
  ariaAtomic?: boolean;
  /**
   * Whether the reel is currently busy/loading.
   */
  ariaBusy?: boolean;
  
  // Keyboard navigation
  /**
   * Enable keyboard scrolling for the reel.
   * When enabled, arrow keys scroll, Page Up/Down scroll larger amounts, Home/End scroll to start/end.
   */
  keyboardNavigation?: boolean;
  /**
   * Amount in pixels to scroll with arrow keys (default: 100).
   */
  keyboardScrollAmount?: number;
  /**
   * Amount in pixels to scroll with Page Up/Down (default: 400).
   */
  keyboardPageScrollAmount?: number;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Resolve snap type value
 */
function resolveSnapType(snap: boolean | undefined): string {
  return snap ? 'x mandatory' : 'none';
}

/**
 * Resolve snap align value
 */
function resolveSnapAlign(snapAlign: 'start' | 'center' | 'end' | undefined): string {
  return snapAlign || 'start';
}

export const Reel = forwardRef<HTMLElement, ReelProps>(
  ({ 
    itemWidth,
    gap,
    snap = false,
    snapAlign = 'start',
    scrollPadding,
    animate,
    responsive,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    role = 'region',
    ariaOrientation = 'horizontal',
    ariaLive,
    ariaAtomic,
    ariaBusy,
    keyboardNavigation = false,
    keyboardScrollAmount = 100,
    keyboardPageScrollAmount = 400,
    as: Component = 'div', 
    style, 
    className,
    children,
    ...props 
  }, ref) => {
    // Internal ref for layout transitions
    const internalRef = useRef<HTMLElement>(null);
    const childRefsRef = useRef<React.RefObject<HTMLElement>[]>([]);
    
    // Keyboard scrolling navigation
    useKeyboardScrolling(internalRef, keyboardNavigation, {
      orientation: ariaOrientation,
      scrollAmount: keyboardScrollAmount,
      pageScrollAmount: keyboardPageScrollAmount,
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
    
    // Resolve gap token
    const gapValue = gap ? tokens.space[gap] : tokens.space.md;
    const snapTypeValue = resolveSnapType(snap);
    const snapAlignValue = resolveSnapAlign(snapAlign);
    
    // Generate responsive data-attributes for CSS selectors
    const responsiveAttrs: string[] = [];
    if (responsive) {
      for (const [breakpoint, overrides] of Object.entries(responsive)) {
        if (overrides.itemWidth) {
          responsiveAttrs.push(`${breakpoint}:item-width-${overrides.itemWidth.replace(/\s+/g, '-')}`);
        }
        if (overrides.gap) {
          responsiveAttrs.push(`${breakpoint}:gap-${overrides.gap}`);
        }
        if (overrides.snap !== undefined) {
          responsiveAttrs.push(`${breakpoint}:snap-${overrides.snap}`);
        }
        if (overrides.snapAlign) {
          responsiveAttrs.push(`${breakpoint}:snap-align-${overrides.snapAlign}`);
        }
      }
    }
    const dataResponsive = responsiveAttrs.length > 0 ? responsiveAttrs.join(' ') : undefined;
    
    // Merge refs
    const mergedRef = (element: HTMLElement | null) => {
      internalRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as any).current = element;
      }
    };
    
    // Clone children to add refs and item styles for layout transitions
    const childrenWithRefs = useMemo(() => {
      return Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        
        // Get ref for this child (should already exist from useMemo above)
        const childRef = childRefs[index];
        
        // Build item styles
        // Items MUST have flexShrink: 0 to prevent shrinking and enable scrolling
        const itemStyles: React.CSSProperties = {
          flexShrink: 0, // Always prevent shrinking - critical for scrolling
          flexGrow: 0,   // Never grow
          // Apply snap alignment directly when snap is enabled
          ...(snap ? { 
            scrollSnapAlign: snapAlignValue,
          } : {}),
          ...(itemWidth ? { 
            width: itemWidth,
            flexBasis: itemWidth,
            minWidth: itemWidth, // Ensure minimum width
            maxWidth: itemWidth, // Ensure maximum width
          } : {}),
        };
        
        // Clone element and merge refs and styles
        // IMPORTANT: flexShrink: 0 MUST come last to ensure items don't shrink
        const childStyle = child.props.style || {};
        return cloneElement(child as ReactElement<any>, {
          ref: childRef ? (element: HTMLElement | null) => {
            childRef.current = element;
            // Also call original ref if it exists
            const originalRef = (child as any).ref;
            if (typeof originalRef === 'function') {
              originalRef(element);
            } else if (originalRef && typeof originalRef === 'object' && 'current' in originalRef) {
              (originalRef as any).current = element;
            }
          } : undefined,
          style: {
            ...childStyle,
            ...itemStyles,
            // Ensure flexShrink: 0 is always applied (critical for scrolling)
            flexShrink: 0,
            flexGrow: 0,
            // Ensure snap align is applied last so it can't be overridden
            ...(snap ? { 
              scrollSnapAlign: snapAlignValue,
            } : {}),
          },
        });
      });
    }, [children, animate, childRefs, itemWidth, snap, snapAlign, snapAlignValue, gapValue]);
    
    return (
      <Component
        ref={mergedRef as any}
        className={className}
        style={{
          // CRITICAL: All flex properties must be inline to ensure they're applied
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          overflowY: 'hidden',
          gap: gapValue,
          scrollSnapType: snap ? 'x mandatory' : 'none',
          scrollPadding: scrollPadding || '0',
          WebkitOverflowScrolling: 'touch',
          '--reel-gap': gapValue,
          '--reel-snap-type': snapTypeValue,
          '--reel-snap-align': snapAlignValue,
          '--reel-scroll-padding': scrollPadding || '0',
          // Merge user-provided styles, but re-apply critical properties after to ensure they override
          ...style,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          overflowY: 'hidden',
          // Re-apply snap properties after user styles to ensure they're not overridden
          scrollSnapType: snap ? 'x mandatory' : 'none',
          scrollPadding: scrollPadding || '0',
        } as React.CSSProperties}
        data-responsive={dataResponsive}
        data-snap={snap}
        data-snap-align={snapAlign}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        role={role}
        aria-orientation={ariaOrientation}
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

Reel.displayName = 'Reel';


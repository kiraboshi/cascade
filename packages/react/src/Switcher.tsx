/**
 * Switcher layout primitive
 * Responsive container that switches between horizontal/vertical based on threshold
 */

import { forwardRef, useRef, useMemo, useEffect, useState, Children, cloneElement, isValidElement, type HTMLAttributes, type ReactElement } from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens, type SpaceToken } from '@cascade/tokens';
import { useLayoutTransition, useBatchLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';
import { useArrowKeyNavigation } from './accessibility';

const switcherStyles = stylex.create({
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--switcher-gap, var(--cascade-space-md))',
    justifyContent: 'var(--switcher-justify, flex-start)',
    // flexDirection is controlled dynamically via inline styles
  },
});

export interface SwitcherProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Configuration
  /**
   * Breakpoint threshold to switch from horizontal to vertical.
   * Can be a CSS length (e.g., '768px') or a container query value.
   * Defaults to '30rem' (480px).
   */
  threshold?: string;
  
  /**
   * Maximum number of items before wrapping.
   * When set, items will wrap after this count.
   * If not set, wrapping is based on threshold only.
   */
  limit?: number;
  
  // Spacing
  /**
   * Gap between items using space tokens.
   */
  gap?: SpaceToken;
  
  // Alignment
  /**
   * Justify content alignment along the main axis.
   */
  justify?: 'start' | 'center' | 'end' | 'between';
  
  // Animation
  /**
   * Enable layout transition animation for property changes.
   * When enabled, changes to gap, justify, and layout switching will be smoothly animated.
   */
  animate?: boolean | LayoutTransitionConfig;
  
  // Responsive
  responsive?: Record<string, Partial<Omit<SwitcherProps, 'responsive' | 'animate'>>>;
  
  // Accessibility (ARIA)
  /**
   * ARIA label for the switcher.
   * Provides an accessible name for screen readers.
   */
  ariaLabel?: string;
  /**
   * ID of element that labels this switcher.
   */
  ariaLabelledBy?: string;
  /**
   * ID of element that describes this switcher.
   */
  ariaDescribedBy?: string;
  /**
   * ARIA role for the switcher.
   */
  role?: string;
  /**
   * ARIA live region politeness level.
   * Use "polite" or "assertive" to announce layout changes to screen readers.
   */
  ariaLive?: 'off' | 'polite' | 'assertive';
  /**
   * Whether the entire switcher should be announced when it changes.
   */
  ariaAtomic?: boolean;
  /**
   * Whether the switcher is currently busy/loading.
   */
  ariaBusy?: boolean;
  
  // Keyboard navigation
  /**
   * Enable keyboard navigation for switcher items.
   * When enabled, arrow keys navigate items, Enter/Space activate, Home/End jump to first/last.
   */
  keyboardNavigation?: boolean;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Resolve justify content value
 */
function resolveJustifyContent(justify: 'start' | 'center' | 'end' | 'between' | undefined): string {
  switch (justify) {
    case 'start':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    case 'between':
      return 'space-between';
    default:
      return 'flex-start';
  }
}

/**
 * Parse a CSS length value (e.g., '30rem', '480px') to pixels
 */
function parseLengthToPixels(value: string, element: HTMLElement): number {
  // Handle rem values
  if (value.endsWith('rem')) {
    const remValue = parseFloat(value);
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return remValue * rootFontSize;
  }
  // Handle px values
  if (value.endsWith('px')) {
    return parseFloat(value);
  }
  // Handle em values
  if (value.endsWith('em')) {
    const emValue = parseFloat(value);
    const fontSize = parseFloat(getComputedStyle(element).fontSize);
    return emValue * fontSize;
  }
  // Default: assume pixels
  return parseFloat(value) || 480;
}

export const Switcher = forwardRef<HTMLElement, SwitcherProps>(
  ({ 
    threshold = '30rem',
    limit,
    gap,
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
    const [isBelowThreshold, setIsBelowThreshold] = useState(false);
    
    // Keyboard navigation - orientation changes based on threshold
    useArrowKeyNavigation(internalRef, keyboardNavigation, {
      orientation: isBelowThreshold ? 'vertical' : 'horizontal',
      wrap: false,
    });
    
    // Apply layout transition if animation is enabled
    const layoutTransitionConfig: LayoutTransitionConfig | undefined = animate
      ? typeof animate === 'boolean'
        ? { enabled: animate }
        : { enabled: animate.enabled !== false, ...animate }
      : undefined;
    
    useLayoutTransition(internalRef, layoutTransitionConfig);
    
    // Watch container size and toggle data attribute based on threshold
    useEffect(() => {
      const element = internalRef.current;
      if (!element) return;
      
      // Parse threshold to pixels for comparison
      const thresholdPx = parseLengthToPixels(threshold, element);
      
      // Function to check and update threshold state
      const checkThreshold = (width: number) => {
        const belowThreshold = width < thresholdPx;
        setIsBelowThreshold(belowThreshold);
      };
      
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Use contentRect.width consistently (content box, excludes padding/border)
          // This matches what we care about for flex container layout
          const width = entry.contentRect.width;
          // Only update if we have a valid width
          if (width > 0) {
            checkThreshold(width);
          }
        }
      });
      
      // Helper to get content width consistently
      const getContentWidth = (el: HTMLElement): number => {
        const rect = el.getBoundingClientRect();
        const computedStyle = getComputedStyle(el);
        const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
        const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
        const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
        const borderRight = parseFloat(computedStyle.borderRightWidth) || 0;
        return rect.width - paddingLeft - paddingRight - borderLeft - borderRight;
      };
      
      // Start observing - ResizeObserver fires immediately when observing
      resizeObserver.observe(element);
      
      // Also listen to window resize as a fallback (in case ResizeObserver has issues)
      const handleWindowResize = () => {
        const width = getContentWidth(element);
        if (width > 0) {
          checkThreshold(width);
        }
      };
      window.addEventListener('resize', handleWindowResize);
      
      // Do an explicit check after layout to ensure we have the right initial state
      const timeoutId = setTimeout(() => {
        const width = getContentWidth(element);
        if (width > 0) {
          checkThreshold(width);
        }
      }, 0);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', handleWindowResize);
        resizeObserver.disconnect();
      };
    }, [threshold]);
    
    // Prepare transition config values early so they can be used in useMemo
    const transitionDuration = layoutTransitionConfig?.duration ?? 300;
    const transitionEasing = layoutTransitionConfig?.easing ?? 'cubic-bezier(0.4, 0, 0.2, 1)';
    const transitionEnabled = layoutTransitionConfig?.enabled !== false;
    
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
    const justifyContentValue = resolveJustifyContent(justify);
    
    // Generate responsive data-attributes for CSS selectors
    const responsiveAttrs: string[] = [];
    if (responsive) {
      for (const [breakpoint, overrides] of Object.entries(responsive)) {
        if (overrides.threshold) {
          responsiveAttrs.push(`${breakpoint}:threshold-${overrides.threshold.replace(/\s+/g, '-')}`);
        }
        if (overrides.limit !== undefined) {
          responsiveAttrs.push(`${breakpoint}:limit-${overrides.limit}`);
        }
        if (overrides.gap) {
          responsiveAttrs.push(`${breakpoint}:gap-${overrides.gap}`);
        }
        if (overrides.justify) {
          responsiveAttrs.push(`${breakpoint}:justify-${overrides.justify}`);
        }
      }
    }
    const dataResponsive = responsiveAttrs.length > 0 ? responsiveAttrs.join(' ') : undefined;
    
    const combinedClassName = stylex.props(switcherStyles.base).className + (className ? ` ${className}` : '');
    
    // Merge refs
    const mergedRef = (element: HTMLElement | null) => {
      internalRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as any).current = element;
      }
    };
    
    // Calculate flex-basis based on limit
    // If limit is set, each item should be (100% / limit) minus gap
    const itemStyle: React.CSSProperties = limit
      ? {
          flexBasis: `calc((100% - (var(--switcher-gap) * ${limit - 1})) / ${limit})`,
          minWidth: 0, // Allow items to shrink below flex-basis
        }
      : {};
    
    // Clone children to add refs for layout transitions and item styles
    const childrenWithRefs = useMemo(() => {
      return Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        
        // Get ref for this child (should already exist from useMemo above)
        const childRef = childRefs[index];
        
        // Build merged styles with transition support for smooth child animations
        const mergedStyles: React.CSSProperties = {
          ...(limit ? itemStyle : {}),
          // Add transition for child elements to smoothly animate position/size changes
          // This works with FLIP animation for smooth layout transitions
          ...(transitionEnabled ? {
            transition: `transform ${transitionDuration}ms ${transitionEasing}, opacity ${transitionDuration}ms ${transitionEasing}`,
          } : {}),
          ...(child.props.style || {}),
          // Re-apply transition after user styles to ensure it's not overridden
          ...(transitionEnabled ? {
            transition: `transform ${transitionDuration}ms ${transitionEasing}, opacity ${transitionDuration}ms ${transitionEasing}`,
          } : {}),
        };
        
        // Clone element and merge refs and styles
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
          style: mergedStyles,
        });
      });
    }, [children, animate, childRefs, limit, itemStyle, transitionEnabled, transitionDuration, transitionEasing]);
    
    // Build inline styles - flexDirection must be inline to ensure dynamic updates work
    // Apply user styles first, then re-apply critical properties to ensure they override
    const flexDirectionValue = isBelowThreshold ? 'column' : 'row';
    
    // Build transition string for smooth animations
    // Note: flexDirection itself can't be CSS-transitioned, but FLIP handles layout changes
    // We'll add CSS transitions for properties that can be smoothly animated
    // gap and justify-content can be smoothly transitioned
    const transitionValue = transitionEnabled
      ? `gap ${transitionDuration}ms ${transitionEasing}, justify-content ${transitionDuration}ms ${transitionEasing}`
      : undefined;
    
    const inlineStyles: React.CSSProperties = {
      // CRITICAL: Apply display: flex inline to ensure it's always applied
      // StyleX classes may not be applying display: flex correctly
      display: 'flex',
      flexWrap: 'wrap',
      '--switcher-gap': gapValue,
      '--switcher-justify': justifyContentValue,
      '--switcher-threshold': threshold,
      '--switcher-limit': limit?.toString() || 'none',
      // Add smooth transitions for animatable properties
      ...(transitionValue ? { transition: transitionValue } : {}),
      // Merge user-provided styles first
      ...style,
      // Re-apply critical flex properties after user styles to ensure they always override
      display: 'flex',
      flexWrap: 'wrap',
      flexDirection: flexDirectionValue,
      // Re-apply transition after user styles to ensure it's not overridden
      ...(transitionValue ? { transition: transitionValue } : {}),
    };
    
    return (
      <Component
        ref={mergedRef as any}
        className={combinedClassName}
        style={inlineStyles}
        data-responsive={dataResponsive}
        data-threshold={threshold}
        data-limit={limit}
        data-below-threshold={isBelowThreshold ? 'true' : undefined}
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

Switcher.displayName = 'Switcher';


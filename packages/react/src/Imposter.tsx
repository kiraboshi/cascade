/**
 * Imposter layout primitive
 * Centered overlay/modal container that can break out of its container
 */

import { forwardRef, useRef, useEffect, type HTMLAttributes, type RefObject } from 'react';
import * as stylex from '@stylexjs/stylex';
import { type SpaceToken } from '@cascade/tokens';
import { useLayoutTransition, type LayoutTransitionConfig } from '@cascade/motion-runtime';
import { useFocusTrap, useFocusRestore } from './accessibility';
import { resolveSpacing } from './utils/token-resolvers';

const impostorStyles = stylex.create({
  base: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    margin: 'var(--imposter-margin, 0)',
    maxWidth: 'var(--imposter-max-width, 100%)',
    maxHeight: 'var(--imposter-max-height, 100%)',
    overflow: 'auto',
  },
  breakout: {
    position: 'fixed',
  },
});

export interface ImposterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  // Configuration
  /**
   * Margin around the impostor using space tokens.
   * Provides spacing from viewport edges when breakout is enabled.
   */
  margin?: SpaceToken;
  
  /**
   * Maximum width of the impostor.
   * Defaults to '100%' of container.
   */
  maxWidth?: string;
  
  /**
   * Maximum height of the impostor.
   * Defaults to '100%' of container.
   */
  maxHeight?: string;
  
  /**
   * Break out of container and position relative to viewport.
   * When true, uses `position: fixed` instead of `position: absolute`.
   */
  breakout?: boolean;
  
  // Animation
  /**
   * Enable layout transition animation for property changes.
   * When enabled, changes to position, size will be smoothly animated.
   */
  animate?: boolean | LayoutTransitionConfig;
  
  // Responsive
  responsive?: Record<string, Partial<Omit<ImposterProps, 'responsive' | 'animate'>>>;
  
  // Accessibility (ARIA)
  /**
   * ARIA label for the impostor (modal/overlay).
   * Provides an accessible name for screen readers.
   */
  ariaLabel?: string;
  /**
   * ID of element that labels this impostor (typically the modal title).
   * Required for dialogs.
   */
  ariaLabelledBy?: string;
  /**
   * ID of element that describes this impostor.
   */
  ariaDescribedBy?: string;
  /**
   * ARIA role for the impostor.
   * Defaults to "dialog" when breakout is true (modal).
   */
  role?: string;
  /**
   * Whether this is a modal dialog.
   * When true, sets aria-modal="true" and role="dialog".
   */
  ariaModal?: boolean;
  /**
   * ARIA live region politeness level.
   * Use "polite" or "assertive" to announce modal changes to screen readers.
   */
  ariaLive?: 'off' | 'polite' | 'assertive';
  /**
   * Whether the entire impostor should be announced when it changes.
   */
  ariaAtomic?: boolean;
  /**
   * Whether the impostor is currently busy/loading.
   */
  ariaBusy?: boolean;
  
  // Focus management
  /**
   * Whether to trap focus within the impostor (for modals).
   * Defaults to true when breakout is true (modal behavior).
   */
  trapFocus?: boolean;
  /**
   * Ref to element that should receive initial focus when impostor opens.
   * If not provided, first focusable element will be focused.
   */
  initialFocus?: RefObject<HTMLElement>;
  /**
   * Whether to return focus to the previously focused element when impostor closes.
   * Defaults to true for modals.
   */
  returnFocusOnClose?: boolean;
  
  // Polymorphic
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Resolve spacing token to CSS value
 */

export const Imposter = forwardRef<HTMLElement, ImposterProps>(
  ({ 
    margin,
    maxWidth = '100%',
    maxHeight = '100%',
    breakout = false,
    animate,
    responsive,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    role,
    ariaModal,
    ariaLive,
    ariaAtomic,
    ariaBusy,
    trapFocus,
    initialFocus,
    returnFocusOnClose,
    as: Component = 'div', 
    style, 
    className,
    children,
    ...props 
  }, ref) => {
    // Internal ref for layout transitions
    const internalRef = useRef<HTMLElement>(null);
    
    // Determine if focus trapping should be enabled
    // Default to true for modals (when breakout is true)
    const shouldTrapFocus = trapFocus ?? (breakout ? true : false);
    const shouldReturnFocus = returnFocusOnClose ?? (breakout ? true : false);
    
    // Focus management
    useFocusTrap(internalRef, shouldTrapFocus);
    const { saveFocus, restoreFocus } = useFocusRestore(shouldReturnFocus);
    
    // Save focus when impostor opens (if breakout/modal)
    useEffect(() => {
      if (breakout && shouldReturnFocus) {
        saveFocus();
      }
    }, [breakout, shouldReturnFocus, saveFocus]);
    
    // Focus initial element or first focusable element when trap is enabled
    useEffect(() => {
      if (!shouldTrapFocus || !internalRef.current) return;
      
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else {
        // Focus first focusable element
        const focusableElements = internalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    }, [shouldTrapFocus, initialFocus]);
    
    // Handle Escape key to close modal
    useEffect(() => {
      if (!breakout || !shouldTrapFocus) return;
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && internalRef.current) {
          // Call onClose if provided via props, otherwise restore focus
          if (shouldReturnFocus) {
            restoreFocus();
          }
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }, [breakout, shouldTrapFocus, shouldReturnFocus, restoreFocus]);
    
    // Apply layout transition if animation is enabled
    const layoutTransitionConfig: LayoutTransitionConfig | undefined = animate
      ? typeof animate === 'boolean'
        ? { enabled: animate }
        : { enabled: animate.enabled !== false, ...animate }
      : undefined;
    
    useLayoutTransition(internalRef, layoutTransitionConfig);
    
    // Resolve margin token
    const marginValue = resolveSpacing(margin);
    
    // Generate responsive data-attributes for CSS selectors
    const responsiveAttrs: string[] = [];
    if (responsive) {
      for (const [breakpoint, overrides] of Object.entries(responsive)) {
        if (overrides.margin) {
          responsiveAttrs.push(`${breakpoint}:margin-${overrides.margin}`);
        }
        if (overrides.maxWidth) {
          responsiveAttrs.push(`${breakpoint}:max-width-${overrides.maxWidth.replace(/\s+/g, '-')}`);
        }
        if (overrides.maxHeight) {
          responsiveAttrs.push(`${breakpoint}:max-height-${overrides.maxHeight.replace(/\s+/g, '-')}`);
        }
        if (overrides.breakout !== undefined) {
          responsiveAttrs.push(`${breakpoint}:breakout-${overrides.breakout}`);
        }
      }
    }
    const dataResponsive = responsiveAttrs.length > 0 ? responsiveAttrs.join(' ') : undefined;
    
    const combinedClassName = stylex.props(
      impostorStyles.base,
      breakout && impostorStyles.breakout
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
    
    // Determine role and aria-modal based on breakout and ariaModal props
    const finalRole = role ?? (breakout ? 'dialog' : undefined);
    const finalAriaModal = ariaModal ?? (breakout ? true : undefined);
    
    return (
      <Component
        ref={mergedRef as any}
        className={combinedClassName}
        style={{
          '--imposter-margin': marginValue,
          '--imposter-max-width': maxWidth,
          '--imposter-max-height': maxHeight,
          ...style,
        } as React.CSSProperties}
        data-responsive={dataResponsive}
        data-breakout={breakout}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        role={finalRole}
        aria-modal={finalAriaModal}
        aria-live={ariaLive}
        aria-atomic={ariaAtomic}
        aria-busy={ariaBusy}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Imposter.displayName = 'Imposter';


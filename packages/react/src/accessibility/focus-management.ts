/**
 * Focus management utilities for accessibility
 * Provides hooks and utilities for focus trapping, restoration, and detection
 */

import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');
  
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

/**
 * Hook to trap focus within a container (e.g., modal dialogs)
 * 
 * @param ref - Ref to the container element
 * @param enabled - Whether focus trapping is enabled
 * 
 * @example
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(modalRef, isOpen);
 * ```
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement>,
  enabled: boolean
): void {
  useEffect(() => {
    if (!enabled || !ref.current) return;
    
    const element = ref.current;
    const focusableElements = getFocusableElements(element);
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Focus the first element when trap is enabled
    firstElement.focus();
    
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // Shift+Tab: if focus is on first element, move to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if focus is on last element, move to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    element.addEventListener('keydown', handleTab);
    
    return () => {
      element.removeEventListener('keydown', handleTab);
    };
  }, [enabled, ref]);
}

/**
 * Hook to restore focus to a previously focused element
 * Useful for modals, dropdowns, and other temporary UI elements
 * 
 * @param restoreOnUnmount - Whether to restore focus when component unmounts (default: true)
 * 
 * @example
 * ```tsx
 * const { restoreFocus } = useFocusRestore();
 * 
 * // When closing modal:
 * restoreFocus();
 * ```
 */
export function useFocusRestore(restoreOnUnmount: boolean = true): {
  saveFocus: () => void;
  restoreFocus: () => void;
} {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  const saveFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  };
  
  const restoreFocus = () => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  };
  
  useEffect(() => {
    if (restoreOnUnmount) {
      saveFocus();
      return () => {
        restoreFocus();
      };
    }
  }, [restoreOnUnmount]);
  
  return { saveFocus, restoreFocus };
}

/**
 * Hook to detect if focus is within a container
 * Useful for styling focused containers or managing focus states
 * 
 * @param ref - Ref to the container element
 * @returns Whether focus is currently within the container
 * 
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const isFocused = useFocusWithin(containerRef);
 * 
 * return (
 *   <div ref={containerRef} className={isFocused ? 'focused' : ''}>
 *     ...
 *   </div>
 * );
 * ```
 */
export function useFocusWithin(ref: RefObject<HTMLElement>): boolean {
  const [isFocused, setIsFocused] = useState(false);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const element = ref.current;
    
    const handleFocusIn = (e: FocusEvent) => {
      if (element.contains(e.target as Node)) {
        setIsFocused(true);
      }
    };
    
    const handleFocusOut = (e: FocusEvent) => {
      if (!element.contains(e.relatedTarget as Node)) {
        setIsFocused(false);
      }
    };
    
    element.addEventListener('focusin', handleFocusIn);
    element.addEventListener('focusout', handleFocusOut);
    
    // Check initial state
    if (element.contains(document.activeElement)) {
      setIsFocused(true);
    }
    
    return () => {
      element.removeEventListener('focusin', handleFocusIn);
      element.removeEventListener('focusout', handleFocusOut);
    };
  }, [ref]);
  
  return isFocused;
}


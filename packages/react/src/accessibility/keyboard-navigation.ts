/**
 * Keyboard navigation utilities for interactive layouts
 * Provides hooks for arrow key navigation, activation, and scrolling
 */

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Hook for arrow key navigation in a list/container
 * Supports horizontal and vertical navigation with wrapping
 * 
 * @param ref - Ref to the container element
 * @param enabled - Whether keyboard navigation is enabled
 * @param options - Navigation options
 * 
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * useArrowKeyNavigation(containerRef, true, {
 *   orientation: 'horizontal',
 *   wrap: true,
 *   onNavigate: (index) => console.log('Navigated to', index)
 * });
 * ```
 */
export function useArrowKeyNavigation(
  ref: RefObject<HTMLElement>,
  enabled: boolean,
  options: {
    orientation?: 'horizontal' | 'vertical';
    wrap?: boolean;
    onNavigate?: (index: number) => void;
    onActivate?: (index: number) => void;
  } = {}
): void {
  const {
    orientation = 'horizontal',
    wrap = false,
    onNavigate,
    onActivate,
  } = options;

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const container = ref.current;
    
    // Get all focusable/interactive children
    const getFocusableChildren = (): HTMLElement[] => {
      return Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, [role="button"], a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
    };

    const getCurrentIndex = (): number => {
      const children = getFocusableChildren();
      const activeElement = document.activeElement as HTMLElement;
      return children.indexOf(activeElement);
    };

    const navigate = (direction: 'next' | 'prev' | 'first' | 'last') => {
      const children = getFocusableChildren();
      if (children.length === 0) return;

      let newIndex: number;
      const currentIndex = getCurrentIndex();

      switch (direction) {
        case 'next':
          newIndex = currentIndex < children.length - 1 ? currentIndex + 1 : wrap ? 0 : currentIndex;
          break;
        case 'prev':
          newIndex = currentIndex > 0 ? currentIndex - 1 : wrap ? children.length - 1 : currentIndex;
          break;
        case 'first':
          newIndex = 0;
          break;
        case 'last':
          newIndex = children.length - 1;
          break;
        default:
          return;
      }

      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < children.length) {
        children[newIndex].focus();
        onNavigate?.(newIndex);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if focus is within the container
      if (!container.contains(document.activeElement)) return;

      const isHorizontal = orientation === 'horizontal';
      const isVertical = orientation === 'vertical';

      // Arrow keys
      if (
        (isHorizontal && e.key === 'ArrowRight') ||
        (isVertical && e.key === 'ArrowDown')
      ) {
        e.preventDefault();
        navigate('next');
      } else if (
        (isHorizontal && e.key === 'ArrowLeft') ||
        (isVertical && e.key === 'ArrowUp')
      ) {
        e.preventDefault();
        navigate('prev');
      } else if (e.key === 'Home') {
        e.preventDefault();
        navigate('first');
      } else if (e.key === 'End') {
        e.preventDefault();
        navigate('last');
      } else if (e.key === 'Enter' || e.key === ' ') {
        // Activate current item
        const currentIndex = getCurrentIndex();
        if (currentIndex >= 0) {
          const children = getFocusableChildren();
          const currentElement = children[currentIndex];
          
          // If it's a button or link, let the default behavior handle it
          // Otherwise, trigger activation callback
          if (currentElement.tagName !== 'BUTTON' && currentElement.tagName !== 'A') {
            e.preventDefault();
            onActivate?.(currentIndex);
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, ref, orientation, wrap, onNavigate, onActivate]);
}

/**
 * Hook for keyboard scrolling in a scrollable container
 * Supports arrow keys, Page Up/Down, and Home/End
 * 
 * @param ref - Ref to the scrollable container element
 * @param enabled - Whether keyboard scrolling is enabled
 * @param options - Scrolling options
 * 
 * @example
 * ```tsx
 * const reelRef = useRef<HTMLDivElement>(null);
 * useKeyboardScrolling(reelRef, true, {
 *   orientation: 'horizontal',
 *   scrollAmount: 200
 * });
 * ```
 */
export function useKeyboardScrolling(
  ref: RefObject<HTMLElement>,
  enabled: boolean,
  options: {
    orientation?: 'horizontal' | 'vertical';
    scrollAmount?: number; // Pixels to scroll for arrow keys
    pageScrollAmount?: number; // Pixels to scroll for Page Up/Down
  } = {}
): void {
  const {
    orientation = 'horizontal',
    scrollAmount = 100,
    pageScrollAmount = 400,
  } = options;

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const container = ref.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if focus is within the container
      if (!container.contains(document.activeElement)) return;

      const isHorizontal = orientation === 'horizontal';
      const isVertical = orientation === 'vertical';

      let scrollDelta = 0;
      let shouldPreventDefault = false;

      if (
        (isHorizontal && e.key === 'ArrowRight') ||
        (isVertical && e.key === 'ArrowDown')
      ) {
        scrollDelta = scrollAmount;
        shouldPreventDefault = true;
      } else if (
        (isHorizontal && e.key === 'ArrowLeft') ||
        (isVertical && e.key === 'ArrowUp')
      ) {
        scrollDelta = -scrollAmount;
        shouldPreventDefault = true;
      } else if (
        (isHorizontal && e.key === 'PageDown') ||
        (isVertical && e.key === 'PageDown')
      ) {
        scrollDelta = pageScrollAmount;
        shouldPreventDefault = true;
      } else if (
        (isHorizontal && e.key === 'PageUp') ||
        (isVertical && e.key === 'PageUp')
      ) {
        scrollDelta = -pageScrollAmount;
        shouldPreventDefault = true;
      } else if (e.key === 'Home') {
        if (isHorizontal) {
          container.scrollLeft = 0;
        } else {
          container.scrollTop = 0;
        }
        shouldPreventDefault = true;
      } else if (e.key === 'End') {
        if (isHorizontal) {
          container.scrollLeft = container.scrollWidth;
        } else {
          container.scrollTop = container.scrollHeight;
        }
        shouldPreventDefault = true;
      }

      if (shouldPreventDefault) {
        e.preventDefault();
        
        if (scrollDelta !== 0) {
          if (isHorizontal) {
            container.scrollBy({ left: scrollDelta, behavior: 'smooth' });
          } else {
            container.scrollBy({ top: scrollDelta, behavior: 'smooth' });
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, ref, orientation, scrollAmount, pageScrollAmount]);
}

/**
 * Hook for grid keyboard navigation
 * Supports arrow keys to navigate cells in a grid layout
 * 
 * @param ref - Ref to the grid container element
 * @param enabled - Whether grid keyboard navigation is enabled
 * @param options - Grid navigation options
 * 
 * @example
 * ```tsx
 * const gridRef = useRef<HTMLDivElement>(null);
 * useGridKeyboardNavigation(gridRef, true, {
 *   columns: 3,
 *   onNavigate: (row, col) => console.log('Navigated to', row, col)
 * });
 * ```
 */
export function useGridKeyboardNavigation(
  ref: RefObject<HTMLElement>,
  enabled: boolean,
  options: {
    columns?: number; // Number of columns in the grid
    onNavigate?: (row: number, col: number) => void;
    onActivate?: (row: number, col: number) => void;
  } = {}
): void {
  const { columns = 3, onNavigate, onActivate } = options;

  useEffect(() => {
    if (!enabled || !ref.current || columns <= 0) return;

    const container = ref.current;

    // Get all focusable/interactive children
    const getFocusableChildren = (): HTMLElement[] => {
      return Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, [role="button"], a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
    };

    const getCurrentIndex = (): number => {
      const children = getFocusableChildren();
      const activeElement = document.activeElement as HTMLElement;
      return children.indexOf(activeElement);
    };

    const navigate = (direction: 'up' | 'down' | 'left' | 'right' | 'home' | 'end') => {
      const children = getFocusableChildren();
      if (children.length === 0) return;

      const currentIndex = getCurrentIndex();
      if (currentIndex < 0) return;

      const currentRow = Math.floor(currentIndex / columns);
      const currentCol = currentIndex % columns;
      const totalRows = Math.ceil(children.length / columns);

      let newRow = currentRow;
      let newCol = currentCol;

      switch (direction) {
        case 'up':
          newRow = Math.max(0, currentRow - 1);
          break;
        case 'down':
          newRow = Math.min(totalRows - 1, currentRow + 1);
          break;
        case 'left':
          newCol = Math.max(0, currentCol - 1);
          break;
        case 'right':
          newCol = Math.min(columns - 1, currentCol + 1);
          break;
        case 'home':
          newRow = 0;
          newCol = 0;
          break;
        case 'end':
          const lastIndex = children.length - 1;
          newRow = Math.floor(lastIndex / columns);
          newCol = lastIndex % columns;
          break;
      }

      const newIndex = newRow * columns + newCol;
      if (newIndex >= 0 && newIndex < children.length && newIndex !== currentIndex) {
        children[newIndex].focus();
        onNavigate?.(newRow, newCol);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if focus is within the container
      if (!container.contains(document.activeElement)) return;

      let shouldPreventDefault = false;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigate('up');
          shouldPreventDefault = true;
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigate('down');
          shouldPreventDefault = true;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigate('left');
          shouldPreventDefault = true;
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigate('right');
          shouldPreventDefault = true;
          break;
        case 'Home':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            navigate('home');
            shouldPreventDefault = true;
          }
          break;
        case 'End':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            navigate('end');
            shouldPreventDefault = true;
          }
          break;
        case 'Enter':
        case ' ':
          // Activate current cell
          const currentIndex = getCurrentIndex();
          if (currentIndex >= 0) {
            const currentRow = Math.floor(currentIndex / columns);
            const currentCol = currentIndex % columns;
            const children = getFocusableChildren();
            const currentElement = children[currentIndex];
            
            // If it's a button or link, let the default behavior handle it
            // Otherwise, trigger activation callback
            if (currentElement.tagName !== 'BUTTON' && currentElement.tagName !== 'A') {
              e.preventDefault();
              onActivate?.(currentRow, currentCol);
            }
          }
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, ref, columns, onNavigate, onActivate]);
}


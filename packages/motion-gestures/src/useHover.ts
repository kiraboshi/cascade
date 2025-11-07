/**
 * Hover Gesture Hooks
 * Detect hover state on elements
 */

import { useEffect, useRef, useState, type RefObject } from 'react';

export interface HoverConfig {
  /**
   * Callback when hover starts
   */
  onHoverStart?: (event: MouseEvent) => void;
  
  /**
   * Callback when hover ends
   */
  onHoverEnd?: (event: MouseEvent) => void;
  
  /**
   * Callback when hover state changes
   */
  onHoverChange?: (isHovering: boolean) => void;
  
  /**
   * Disable hover detection
   */
  disabled?: boolean;
}

export interface HoverState {
  isHovering: boolean;
}

/**
 * Hook to detect hover state on an element
 * Returns a ref and boolean indicating hover state
 */
export function useHover(
  config: HoverConfig = {}
): [RefObject<HTMLElement>, boolean] {
  const elementRef = useRef<HTMLElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const configRef = useRef(config);
  
  configRef.current = config;
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || config.disabled) return;
    
    const handleMouseEnter = (event: MouseEvent) => {
      setIsHovering(true);
      configRef.current.onHoverStart?.(event);
      configRef.current.onHoverChange?.(true);
    };
    
    const handleMouseLeave = (event: MouseEvent) => {
      setIsHovering(false);
      configRef.current.onHoverEnd?.(event);
      configRef.current.onHoverChange?.(false);
    };
    
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [config.disabled]);
  
  return [elementRef, isHovering];
}

/**
 * Hook that returns detailed hover state
 * Useful when you need access to the state object
 */
export function useHoverState(
  config: HoverConfig = {}
): [RefObject<HTMLElement>, HoverState] {
  const elementRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<HoverState>({
    isHovering: false,
  });
  const configRef = useRef(config);
  
  configRef.current = config;
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || config.disabled) return;
    
    const handleMouseEnter = (event: MouseEvent) => {
      setState({ isHovering: true });
      configRef.current.onHoverStart?.(event);
      configRef.current.onHoverChange?.(true);
    };
    
    const handleMouseLeave = (event: MouseEvent) => {
      setState({ isHovering: false });
      configRef.current.onHoverEnd?.(event);
      configRef.current.onHoverChange?.(false);
    };
    
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [config.disabled]);
  
  return [elementRef, state];
}


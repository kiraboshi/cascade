/**
 * Focus Gesture Hooks
 * Detect focus state on elements
 */

import { useEffect, useRef, useState, type RefObject } from 'react';

export interface FocusConfig {
  /**
   * Callback when focus starts
   */
  onFocusStart?: (event: FocusEvent) => void;
  
  /**
   * Callback when focus ends
   */
  onFocusEnd?: (event: FocusEvent) => void;
  
  /**
   * Callback when focus state changes
   */
  onFocusChange?: (isFocused: boolean) => void;
  
  /**
   * Disable focus detection
   */
  disabled?: boolean;
}

export interface FocusState {
  isFocused: boolean;
}

/**
 * Hook to detect focus state on an element
 * Returns a ref and boolean indicating focus state
 */
export function useFocus(
  config: FocusConfig = {}
): [RefObject<HTMLElement>, boolean] {
  const elementRef = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const configRef = useRef(config);
  
  configRef.current = config;
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || config.disabled) return;
    
    const handleFocus = (event: FocusEvent) => {
      setIsFocused(true);
      configRef.current.onFocusStart?.(event);
      configRef.current.onFocusChange?.(true);
    };
    
    const handleBlur = (event: FocusEvent) => {
      setIsFocused(false);
      configRef.current.onFocusEnd?.(event);
      configRef.current.onFocusChange?.(false);
    };
    
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);
    
    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [config.disabled]);
  
  return [elementRef, isFocused];
}

/**
 * Hook that returns detailed focus state
 * Useful when you need access to the state object
 */
export function useFocusState(
  config: FocusConfig = {}
): [RefObject<HTMLElement>, FocusState] {
  const elementRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<FocusState>({
    isFocused: false,
  });
  const configRef = useRef(config);
  
  configRef.current = config;
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || config.disabled) return;
    
    const handleFocus = (event: FocusEvent) => {
      setState({ isFocused: true });
      configRef.current.onFocusStart?.(event);
      configRef.current.onFocusChange?.(true);
    };
    
    const handleBlur = (event: FocusEvent) => {
      setState({ isFocused: false });
      configRef.current.onFocusEnd?.(event);
      configRef.current.onFocusChange?.(false);
    };
    
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);
    
    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [config.disabled]);
  
  return [elementRef, state];
}


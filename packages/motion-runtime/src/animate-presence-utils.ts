/**
 * Animation utilities for AnimatePresence
 * Handles enter and exit animations for mounting/unmounting elements
 */

import type { SpringConfig } from '@cascade/compiler';
import { createMotionValue, type MotionValue, type MotionValueKeyframeConfig } from './motion-value';

export interface ExitAnimationConfig {
  opacity?: number;
  transform?: string;
  config?: SpringConfig | MotionValueKeyframeConfig;
}

export interface EnterAnimationConfig {
  opacity?: number;
  transform?: string;
  config?: SpringConfig | MotionValueKeyframeConfig;
}

/**
 * Parse transform string (e.g., "translateX(100px)") and extract values
 */
function parseTransform(transform: string): { type: string; value: number; unit: string } | null {
  const match = transform.match(/(\w+)\(([-\d.]+)(\w+)?\)/);
  if (!match) return null;
  
  return {
    type: match[1],
    value: parseFloat(match[2]),
    unit: match[3] || 'px',
  };
}

/**
 * Apply exit animation to element
 */
export function applyExitAnimation(
  element: HTMLElement,
  config: ExitAnimationConfig,
  onComplete: () => void
): () => void {
  const cleanupFunctions: (() => void)[] = [];
  const animationPromises: Promise<void>[] = [];
  
  // Create motion values for exit animation
  let opacityValue: MotionValue<number> | null = null;
  let transformValues: Map<string, MotionValue<number | string>> = new Map();
  
  // Get element ID for transform CSS variable
  const getElementId = (el: HTMLElement): string => {
    if (!el.dataset.motionElementId) {
      el.dataset.motionElementId = `el-${Math.random().toString(36).substr(2, 9)}`;
    }
    return el.dataset.motionElementId;
  };
  
  // Handle opacity animation
  if (config.opacity !== undefined) {
    const currentOpacity = parseFloat(window.getComputedStyle(element).opacity) || 1;
    
    opacityValue = createMotionValue({
      initialValue: currentOpacity,
      property: 'opacity',
      element,
    });
    
    // Subscribe to changes - this will be called during animation
    const unsubscribeOpacity = opacityValue.onChange((value) => {
      element.style.opacity = String(value);
    });
    
    cleanupFunctions.push(() => {
      unsubscribeOpacity();
      opacityValue?.destroy();
    });
    
    // Animate to target opacity
    const opacityPromise = opacityValue.animateTo(config.opacity, config.config).then(() => {
      // Ensure element reaches target opacity when animation completes
      element.style.opacity = String(config.opacity);
    }).catch(() => {
      // If animation fails, ensure element reaches target opacity
      element.style.opacity = String(config.opacity);
    });
    animationPromises.push(opacityPromise);
  }
  
  // Handle transform animation
  if (config.transform) {
    const parsed = parseTransform(config.transform);
    if (parsed) {
      const { type, value: targetValue, unit } = parsed;
      
      // Map transform types to motion value properties
      const propertyMap: Record<string, string> = {
        translateX: 'x',
        translateY: 'y',
        translateZ: 'z',
        rotate: 'rotate',
        rotateX: 'rotateX',
        rotateY: 'rotateY',
        rotateZ: 'rotateZ',
        scale: 'scale',
        scaleX: 'scaleX',
        scaleY: 'scaleY',
      };
      
      const property = propertyMap[type];
      if (property) {
        // Get current transform value (simplified - assumes 0 for now)
        const currentValue = 0;
        const transformValue = createMotionValue({
          initialValue: currentValue,
          property,
          unit,
          element,
        });
        
        transformValues.set(property, transformValue);
        
        // Apply transform CSS variable to element
        const elementId = getElementId(element);
        const transformVarName = `--motion-transform-${elementId}`;
        element.style.transform = `var(${transformVarName})`;
        
        const unsubscribeTransform = transformValue.onChange(() => {
          // Transform is applied via CSS custom properties automatically
        });
        
        cleanupFunctions.push(() => {
          unsubscribeTransform();
          transformValue.destroy();
          // Clean up transform style
          element.style.transform = '';
        });
        
        // Animate to target value
        const transformPromise = transformValue.animateTo(targetValue, config.config);
        animationPromises.push(transformPromise);
      }
    }
  }
  
  // Wait for all animations to complete
  Promise.all(animationPromises).then(() => {
    onComplete();
  }).catch(() => {
    // If animation fails, still call onComplete
    onComplete();
  });
  
  // Return cleanup function
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
    opacityValue?.stop();
    transformValues.forEach(value => value.stop());
  };
}

/**
 * Apply enter animation to element
 */
export function applyEnterAnimation(
  element: HTMLElement,
  config: EnterAnimationConfig
): () => void {
  console.log('[AnimatePresence] applyEnterAnimation called', {
    element: element.textContent?.substring(0, 20) || 'unknown',
    config,
    currentOpacity: window.getComputedStyle(element).opacity,
  });
  
  const cleanupFunctions: (() => void)[] = [];
  
  // Create motion values for enter animation
  let opacityValue: MotionValue<number> | null = null;
  let transformValues: Map<string, MotionValue<number | string>> = new Map();
  
  // Get element ID for transform CSS variable
  const getElementId = (el: HTMLElement): string => {
    if (!el.dataset.motionElementId) {
      el.dataset.motionElementId = `el-${Math.random().toString(36).substr(2, 9)}`;
    }
    return el.dataset.motionElementId;
  };
  
  // Handle opacity animation
  if (config.opacity !== undefined) {
    // Enter animation: animate FROM config.opacity TO 1 (normal state)
    const startOpacity = config.opacity;
    const targetOpacity = 1;
    
    console.log('[AnimatePresence] Setting up enter opacity animation', {
      startOpacity,
      targetOpacity,
      config: config.config,
    });
    
    // Set initial opacity immediately - critical for visibility
    // This ensures element starts invisible before animation begins
    element.style.opacity = String(startOpacity);
    console.log('[AnimatePresence] Set initial opacity', {
      opacity: element.style.opacity,
      computedOpacity: window.getComputedStyle(element).opacity,
    });
    
    opacityValue = createMotionValue({
      initialValue: startOpacity,
      property: 'opacity',
      element,
    });
    
    console.log('[AnimatePresence] Created motion value', {
      initialValue: opacityValue.get(),
      id: opacityValue.id,
    });
    
    // Subscribe to changes - this will be called during animation
    // This is the primary way opacity gets updated during animation
    let onChangeCallCount = 0;
    const unsubscribeOpacity = opacityValue.onChange((value) => {
      onChangeCallCount++;
      console.log('[AnimatePresence] onChange callback fired', {
        value,
        callCount: onChangeCallCount,
        elementOpacity: element.style.opacity,
      });
      // Always update opacity - this is called during animation
      element.style.opacity = String(value);
      console.log('[AnimatePresence] Updated element.style.opacity', {
        newOpacity: element.style.opacity,
        computedOpacity: window.getComputedStyle(element).opacity,
      });
    });
    
    cleanupFunctions.push(() => {
      console.log('[AnimatePresence] Cleaning up enter animation', {
        onChangeCallCount,
      });
      unsubscribeOpacity();
      opacityValue?.destroy();
    });
    
    // Start animation immediately - the motion value is ready
    // Use a small delay to ensure DOM is ready, but start animation right away
    setTimeout(() => {
      if (opacityValue) {
        console.log('[AnimatePresence] Starting animateTo', {
          from: opacityValue.get(),
          to: targetOpacity,
          config: config.config,
        });
        // Start the animation - onChange will be called during animation
        opacityValue.animateTo(targetOpacity, config.config)
          .then(() => {
            console.log('[AnimatePresence] Animation completed', {
              finalOpacity: element.style.opacity,
              onChangeCallCount,
            });
            // Ensure final value is set
            element.style.opacity = '1';
          })
          .catch((error) => {
            console.error('[AnimatePresence] Animation failed', error);
            // If animation fails, ensure element is visible
            element.style.opacity = '1';
          });
      } else {
        console.error('[AnimatePresence] opacityValue is null, cannot start animation');
      }
    }, 0);
  }
  
  // Handle transform animation
  if (config.transform) {
    const parsed = parseTransform(config.transform);
    if (parsed) {
      const { type, value: targetValue, unit } = parsed;
      
      const propertyMap: Record<string, string> = {
        translateX: 'x',
        translateY: 'y',
        translateZ: 'z',
        rotate: 'rotate',
        rotateX: 'rotateX',
        rotateY: 'rotateY',
        rotateZ: 'rotateZ',
        scale: 'scale',
        scaleX: 'scaleX',
        scaleY: 'scaleY',
      };
      
      const property = propertyMap[type];
      if (property) {
        // Enter animation: animate FROM config.transform value TO normal state
        // Normal state is 0 for translate/rotate, 1 for scale
        const startValue = targetValue;
        const isScale = type.startsWith('scale');
        const endValue = isScale ? 1 : 0;
        
        const transformValue = createMotionValue({
          initialValue: startValue,
          property,
          unit,
          element,
        });
        
        transformValues.set(property, transformValue);
        
        // Apply transform CSS variable to element
        const elementId = getElementId(element);
        const transformVarName = `--motion-transform-${elementId}`;
        element.style.transform = `var(${transformVarName})`;
        
        const unsubscribeTransform = transformValue.onChange(() => {
          // Transform is applied via CSS custom properties automatically
        });
        
        cleanupFunctions.push(() => {
          unsubscribeTransform();
          transformValue.destroy();
          // Clean up transform style
          element.style.transform = '';
        });
        
        // Animate from exit state to normal state (0)
        transformValue.animateTo(endValue, config.config);
      }
    }
  }
  
  // Return cleanup function
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
    opacityValue?.stop();
    transformValues.forEach(value => value.stop());
  };
}


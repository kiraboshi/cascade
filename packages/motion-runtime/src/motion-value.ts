/**
 * Reactive Motion Value API
 * Enables runtime control of animations via CSS custom properties
 */

import type { SpringConfig } from '@cascade/compiler';
import { isAccelerated, isLayoutTriggering } from '@cascade/core';
import { animateSpringRuntime } from './spring-animator';
import { AnimationTimelineImpl, SpringAnimationTimeline, type AnimationTimeline, type TimelineState } from './animation-timeline';
import { warnPerformanceIssue, warnConflictingTransform } from './dev-warnings';
import { createInvalidMotionValueError, createMissingPropertyError } from './error-messages';
import { debugLog, debugError } from './debug';

export interface MotionValueConfig {
  initialValue: number | string;
  property?: string; // CSS property name (e.g., 'transform', 'opacity')
  unit?: string;    // Unit suffix (e.g., 'px', 'deg', '%')
  element?: HTMLElement; // Optional: scope CSS var to element
  // Performance hints
  warnOnLayoutTrigger?: boolean; // Default: true in dev mode
  transformMode?: 'auto' | 'transform' | 'position'; // Default: 'auto'
}

export interface MotionValueKeyframeConfig {
  duration?: number | string;
  easing?: string;
}

export interface MotionValue<T = number | string> {
  get(): T;
  set(value: T): void;
  onChange(callback: (value: T) => void): () => void;
  animateTo(
    target: T,
    config?: SpringConfig | MotionValueKeyframeConfig
  ): Promise<void>;
  stop(): void;
  destroy(): void; // Clean up registries
  getTransformValue(): string; // Returns formatted transform string if applicable
  
  /**
   * Reverse animation direction
   */
  reverse(): void;
  
  /**
   * Seek to specific progress (0-1) or time (ms)
   */
  seek(progress: number | { time: number } | { progress: number }): void;
  
  /**
   * Play animation
   */
  play(): void;
  
  /**
   * Pause animation
   */
  pause(): void;
  
  /**
   * Get animation timeline (if animation is active)
   */
  getTimeline(): AnimationTimeline | null;
  
  /**
   * Subscribe to animation state changes
   */
  onAnimationStateChange(callback: (state: TimelineState) => void): () => void;
  
  readonly id: string;
  readonly cssVarName: string;
  readonly isGPUAccelerated: boolean;
  readonly triggersLayout: boolean;
}

// Property mapping for position properties
const POSITION_TO_TRANSFORM: Record<string, { transform: string; defaultUnit: string }> = {
  'x': { transform: 'translateX', defaultUnit: 'px' },
  'y': { transform: 'translateY', defaultUnit: 'px' },
  'z': { transform: 'translateZ', defaultUnit: 'px' },
  'rotate': { transform: 'rotate', defaultUnit: 'deg' },
  'rotateX': { transform: 'rotateX', defaultUnit: 'deg' },
  'rotateY': { transform: 'rotateY', defaultUnit: 'deg' },
  'rotateZ': { transform: 'rotateZ', defaultUnit: 'deg' },
  'scale': { transform: 'scale', defaultUnit: '' },
  'scaleX': { transform: 'scaleX', defaultUnit: '' },
  'scaleY': { transform: 'scaleY', defaultUnit: '' },
};

// Transform value registry system
const transformRegistries = new WeakMap<HTMLElement, Map<string, MotionValue<number>>>();
const globalTransformRegistry = new Map<string, MotionValue<number>>();

// Helper to get element ID for CSS variable naming
function getElementId(element: HTMLElement): string {
  if (!element.dataset.motionElementId) {
    element.dataset.motionElementId = `el-${Math.random().toString(36).substr(2, 9)}`;
  }
  return element.dataset.motionElementId;
}

// Global batching queue for CSS variable updates
const updateQueue = new Set<MotionValue<any>>();
let rafScheduled = false;

// Separate batching queue for transform updates
const transformUpdateQueue = new Set<HTMLElement | null>();
let transformRafScheduled = false;

function flushUpdates(): void {
  updateQueue.forEach(mv => {
    // Access internal flushCSSUpdate method
    (mv as any).flushCSSUpdate();
  });
  updateQueue.clear();
  rafScheduled = false;
}

function flushTransformUpdates(): void {
  transformUpdateQueue.forEach(element => {
    updateCombinedTransform(element);
  });
  transformUpdateQueue.clear();
  transformRafScheduled = false;
}

function updateCombinedTransform(element: HTMLElement | null): void {
  const registry = element 
    ? transformRegistries.get(element) || new Map()
    : globalTransformRegistry;
  
  if (!registry || registry.size === 0) return;
  
  const transforms: string[] = [];
  
  // Order: translate, rotate, scale (CSS transform order matters)
  const x = registry.get('x');
  const y = registry.get('y');
  const z = registry.get('z');
  if (x || y || z) {
    const tx = x?.get() || 0;
    const ty = y?.get() || 0;
    const tz = z?.get() || 0;
    transforms.push(`translate3d(${tx}px, ${ty}px, ${tz}px)`);
  }
  
  const rotate = registry.get('rotate');
  const rotateX = registry.get('rotateX');
  const rotateY = registry.get('rotateY');
  const rotateZ = registry.get('rotateZ');
  if (rotate) transforms.push(`rotate(${rotate.get()}deg)`);
  if (rotateX) transforms.push(`rotateX(${rotateX.get()}deg)`);
  if (rotateY) transforms.push(`rotateY(${rotateY.get()}deg)`);
  if (rotateZ) transforms.push(`rotateZ(${rotateZ.get()}deg)`);
  
  const scale = registry.get('scale');
  const scaleX = registry.get('scaleX');
  const scaleY = registry.get('scaleY');
  if (scale) {
    transforms.push(`scale(${scale.get()})`);
  } else {
    if (scaleX) transforms.push(`scaleX(${scaleX.get()})`);
    if (scaleY) transforms.push(`scaleY(${scaleY.get()})`);
  }
  
  const combinedTransform = transforms.join(' ') || 'none';
  const cssVarName = element 
    ? `--motion-transform-${getElementId(element)}`
    : '--motion-transform-global';
  
  if (element) {
    element.style.setProperty(cssVarName, combinedTransform);
  } else {
    document.documentElement.style.setProperty(cssVarName, combinedTransform);
  }
}

/**
 * Create a reactive motion value that writes to CSS custom properties
 */
export function createMotionValue<T extends number | string>(
  config: MotionValueConfig
): MotionValue<T> {
  // Validate config
  if (!config) {
    throw createMissingPropertyError('config', 'createMotionValue');
  }
  
  if (config.initialValue === undefined || config.initialValue === null) {
    throw createInvalidMotionValueError(config.initialValue, 'number | string');
  }
  
  const id = `mv-${Math.random().toString(36).substr(2, 9)}`;
  const cssVarName = `--motion-value-${id}`;
  
  // Detect property characteristics
  const propertyName = config.property || '';
  const isGPUAccelerated = propertyName ? isAccelerated(propertyName) : false;
  const triggersLayout = propertyName ? isLayoutTriggering(propertyName) : false;
  
  // Development warning for layout-triggering properties
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' && triggersLayout && config.warnOnLayoutTrigger !== false) {
    warnPerformanceIssue(
      `Property "${propertyName}" triggers layout recalculation`,
      `Consider using transform or opacity properties instead for GPU-accelerated animations. These properties run on the compositor thread and provide better performance.`
    );
  }
  
  // Detect transform properties and mode
  const transformConfig = config.property && POSITION_TO_TRANSFORM[config.property];
  const transformMode = config.transformMode || 'auto';
  const useTransform = transformConfig && (
    transformMode === 'auto' || 
    transformMode === 'transform'
  );
  
  let currentValue: T = config.initialValue as T;
  const onChangeCallbacks = new Set<(value: T) => void>();
  let cancelAnimation: (() => void) | null = null;
  let currentTimeline: AnimationTimelineImpl | null = null;
  let lastUpdateTime = 0;
  const DEBOUNCE_THRESHOLD = 16; // ~60fps
  let willChangeSet = false;
  
  // Store element reference that can be updated dynamically
  // This allows motion values to be re-registered when element becomes available
  let elementRef: HTMLElement | null = config.element || null;
  
  // Update CSS variable
  const updateCSSVar = (value: T): void => {
    let formattedValue: string;
    
    if (useTransform && typeof value === 'number') {
      // Format as transform function: translateX(100px)
      const unit = config.unit || transformConfig!.defaultUnit;
      formattedValue = `${transformConfig!.transform}(${value}${unit})`;
    } else if (typeof value === 'number' && config.unit) {
      formattedValue = `${value}${config.unit}`;
    } else {
      formattedValue = String(value);
    }
    
    // Use elementRef which can be updated dynamically
    const targetElement = elementRef || config.element;
    if (targetElement) {
      targetElement.style.setProperty(cssVarName, formattedValue);
    } else {
      document.documentElement.style.setProperty(cssVarName, formattedValue);
    }
  };
  
  // Initialize CSS variable
  if (typeof window !== 'undefined') {
    updateCSSVar(currentValue);
  }
  
  // Get current value
  const get = (): T => {
    return currentValue;
  };
  
  // Set value (batched)
  // We'll create a reference that gets set later
  let motionValueInstanceRef: MotionValue<T> & { flushCSSUpdate: () => void } | null = null;
  
  const set = (value: T): void => {
    if (currentValue !== value) {
      const oldValue = currentValue;
      currentValue = value;
      
      // debugLog('MotionValue', 'motionValue', 'set() called:', {
      //   oldValue,
      //   newValue: value,
      //   valueType: typeof value,
      //   isNaN: typeof value === 'number' ? isNaN(value as number) : false,
      //   hasCancelAnimation: cancelAnimation !== null,
      //   hasCurrentTimeline: currentTimeline !== null
      // });
      
      // If animating, always trigger onChange immediately for smooth animation
      // Otherwise, batch updates for performance
      if (cancelAnimation) {
        // During animation, call onChange callbacks immediately for responsive updates
        if (motionValueInstanceRef) {
          // Still queue for CSS var update, but trigger onChange immediately
          updateQueue.add(motionValueInstanceRef);
          
          // Call onChange callbacks immediately during animation
          onChangeCallbacks.forEach(cb => {
            try {
              cb(currentValue);
            } catch (error) {
              debugError('MotionValue', 'Error in onChange callback:', error);
            }
          });
          
          // Schedule CSS var update
          if (!rafScheduled && typeof window !== 'undefined') {
            rafScheduled = true;
            requestAnimationFrame(flushUpdates);
          }
        }
      } else {
        // If not animating and updates are too frequent, throttle
        if (typeof window !== 'undefined') {
          const now = performance.now();
          if (now - lastUpdateTime < DEBOUNCE_THRESHOLD) {
            // Update already scheduled, skip duplicate
            if (motionValueInstanceRef) {
              updateQueue.add(motionValueInstanceRef);
            }
            return;
          }
          lastUpdateTime = now;
        }
        
        if (motionValueInstanceRef) {
          updateQueue.add(motionValueInstanceRef);
          
          if (!rafScheduled && typeof window !== 'undefined') {
            rafScheduled = true;
            requestAnimationFrame(flushUpdates);
          }
        } else {
          // If instance not ready yet, update directly (for initial value)
          updateCSSVar(value);
        }
      }
    }
  };
  
  // Subscribe to changes
  const onChange = (callback: (value: T) => void): (() => void) => {
    onChangeCallbacks.add(callback);
    return () => {
      onChangeCallbacks.delete(callback);
    };
  };
  
  // Animate to target value
  const animateTo = async (
    target: T,
    animationConfig?: SpringConfig | MotionValueKeyframeConfig
  ): Promise<void> => {
    debugLog('MotionValue', 'motionValue', 'animateTo called:', {
      target,
      animationConfig,
      currentValue,
      currentValueType: typeof currentValue,
      targetType: typeof target,
      isNumeric: typeof currentValue === 'number' && typeof target === 'number'
    });
    
    return new Promise((resolve, reject) => {
      // Stop any existing animation
      stop();
      
      // Set will-change hint for GPU-accelerated properties
      if (config.element && isGPUAccelerated && !willChangeSet) {
        config.element.style.willChange = 'transform, opacity';
        willChangeSet = true;
      }
      
      debugLog('MotionValue', 'motionValue', 'animateTo inside Promise:', {
        currentValue,
        target,
        currentValueType: typeof currentValue,
        targetType: typeof target,
        willEnterNumericBranch: typeof currentValue === 'number' && typeof target === 'number'
      });
      
      if (typeof currentValue === 'number' && typeof target === 'number') {
        // If from and to are the same, resolve immediately
        if (currentValue === target) {
          debugLog('MotionValue', 'motionValue', 'animateTo: from === to, resolving immediately', {
            currentValue,
            target
          });
          resolve();
          return;
        }
        
        // Check if this is a keyframe config (has duration/easing but not stiffness/damping)
        const keyframeConfig = animationConfig as MotionValueKeyframeConfig;
        const springConfig = animationConfig as SpringConfig;
        const hasKeyframeProps = keyframeConfig && 
          (keyframeConfig.duration !== undefined || keyframeConfig.easing !== undefined);
        const hasSpringProps = springConfig && 
          (springConfig.stiffness !== undefined || springConfig.damping !== undefined);
        const isKeyframeConfig = hasKeyframeProps && !hasSpringProps;
        
        debugLog('MotionValue', 'motionValue', 'animateTo detection:', {
          animationConfig,
          hasKeyframeProps,
          hasSpringProps,
          isKeyframeConfig,
          currentValue,
          target,
          keyframeConfigDuration: keyframeConfig?.duration,
          keyframeConfigEasing: keyframeConfig?.easing,
          springConfigStiffness: springConfig?.stiffness,
          springConfigDamping: springConfig?.damping
        });
        
        if (isKeyframeConfig) {
          // Use keyframe animation (duration/easing) with timeline
          const duration = typeof keyframeConfig.duration === 'number'
            ? keyframeConfig.duration
            : typeof keyframeConfig.duration === 'string'
            ? parseFloat(keyframeConfig.duration)
            : 300;
          
          const easing = keyframeConfig.easing || 'linear';
          
          // Clean up will-change after animation completes
          const cleanupWillChange = () => {
            if (config.element && willChangeSet && !currentTimeline) {
              setTimeout(() => {
                if (config.element && !currentTimeline) {
                  config.element.style.willChange = '';
                  willChangeSet = false;
                }
              }, 1000);
            }
          };
          
          const startValue = currentValue as number;
          const endValue = target as number;
          
          // Easing function
          const ease = (t: number): number => {
            if (easing === 'linear') return t;
            if (easing === 'ease-in') return t * t;
            if (easing === 'ease-out') return t * (2 - t);
            if (easing === 'ease-in-out') return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            // Try to parse cubic-bezier
            const bezierMatch = easing.match(/cubic-bezier\(([^)]+)\)/);
            if (bezierMatch) {
              // Simplified cubic-bezier - for production, use a proper implementation
              return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            }
            return t;
          };
          
          // Create timeline with easing
          currentTimeline = new AnimationTimelineImpl(duration, (progress) => {
            const easedProgress = ease(progress);
            const value = startValue + (endValue - startValue) * easedProgress;
            set(value as T);
          });
          
          // Set cancelAnimation for compatibility with existing code
          // This ensures set() knows we're animating
          cancelAnimation = () => {
            if (currentTimeline) {
              currentTimeline.cancel();
              currentTimeline = null;
            }
            cancelAnimation = null;
            cleanupWillChange();
          };
          
          // Ensure cancelAnimation is set so set() knows we're animating
          // The timeline will handle the actual animation loop
          
          // Wait for completion
          const unsubscribe = currentTimeline.onStateChange((state) => {
            if (state.isCompleted) {
              unsubscribe();
              // Ensure final value is set exactly
              set(target);
              currentTimeline = null;
              cancelAnimation = null;
              cleanupWillChange();
              resolve();
            }
          });
          
          // Start animation
          currentTimeline.play();
        } else {
          // Use spring animation with timeline
          debugLog('MotionValue', 'motionValue', 'Using spring animation path');
          
          const springConfigFinal = springConfig || {
            stiffness: 300,
            damping: 20,
            mass: 1,
            from: currentValue as number,
            to: target as number,
          };
          
          debugLog('MotionValue', 'motionValue', 'springConfigFinal:', springConfigFinal);
          
          // Ensure from/to are set correctly
          const finalConfig: SpringConfig & { duration?: number } = {
            ...springConfigFinal,
            from: currentValue as number,
            to: target as number,
            duration: (springConfigFinal as any).duration || 2000,
          };
          
          const startValue = currentValue as number;
          const endValue = target as number;
          const estimatedDuration = finalConfig.duration || 2000;
          
          debugLog('MotionValue', 'motionValue', 'Creating SpringAnimationTimeline:', {
            finalConfig,
            startValue,
            endValue,
            estimatedDuration
          });
          
          // Clean up will-change after animation completes
          const cleanupWillChange = () => {
            if (config.element && willChangeSet && !currentTimeline) {
              setTimeout(() => {
                if (config.element && !currentTimeline) {
                  config.element.style.willChange = '';
                  willChangeSet = false;
                }
              }, 1000);
            }
          };
          
          // Create spring timeline
          try {
            currentTimeline = new SpringAnimationTimeline(
              finalConfig,
              startValue,
              endValue,
              (value) => {
                debugLog('MotionValue', 'motionValue', 'SpringAnimationTimeline updateCallback called with:', value);
                set(value as T);
              },
              estimatedDuration
            );
            debugLog('MotionValue', 'motionValue', 'SpringAnimationTimeline created successfully:', {
              timeline: currentTimeline,
              duration: currentTimeline.duration,
              progress: currentTimeline.progress
            });
          } catch (error) {
            debugError('MotionValue', 'Error creating SpringAnimationTimeline:', error);
            reject(error);
            return;
          }
          
          // Set cancelAnimation for compatibility with existing code
          // This is critical - set() needs cancelAnimation to be set to trigger onChange immediately
          cancelAnimation = () => {
            debugLog('MotionValue', 'motionValue', 'cancelAnimation called for spring timeline');
            if (currentTimeline) {
              currentTimeline.cancel();
              currentTimeline = null;
            }
            cancelAnimation = null;
            cleanupWillChange();
          };
          
          debugLog('MotionValue', 'motionValue', 'cancelAnimation set, subscribing to state changes');
          
          // Wait for completion
          const unsubscribe = currentTimeline.onStateChange((state) => {
            debugLog('MotionValue', 'motionValue', 'SpringAnimationTimeline state change:', state);
            if (state.isCompleted) {
              debugLog('MotionValue', 'motionValue', 'SpringAnimationTimeline completed');
              unsubscribe();
              // Ensure final value is set exactly
              set(endValue as T);
              currentTimeline = null;
              cancelAnimation = null;
              cleanupWillChange();
              resolve();
            }
          });
          
          debugLog('MotionValue', 'motionValue', 'Starting spring animation with play()');
          // Start animation
          currentTimeline.play();
        }
      } else {
        // Fallback to simple interpolation for non-numeric values
        const keyframeConfig = animationConfig as MotionValueKeyframeConfig || {};
        const duration = typeof keyframeConfig.duration === 'number'
          ? keyframeConfig.duration
          : typeof keyframeConfig.duration === 'string'
          ? parseFloat(keyframeConfig.duration)
          : 300;
        
        // Clean up will-change after animation completes
        const cleanupWillChange = () => {
          if (config.element && willChangeSet && !cancelAnimation) {
            setTimeout(() => {
              if (config.element && !cancelAnimation) {
                config.element.style.willChange = '';
                willChangeSet = false;
              }
            }, 1000);
          }
        };
        
        const startValue = currentValue;
        const startTime = performance.now();
        
        const animate = (timestamp: number) => {
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Simple linear interpolation
          if (typeof startValue === 'number' && typeof target === 'number') {
            const value = startValue + (target - startValue) * progress;
            set(value as T);
          } else {
            // For non-numeric, just set target at end
            if (progress >= 1) {
              set(target);
            }
          }
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            cancelAnimation = null;
            cleanupWillChange();
            resolve();
          }
        };
        
        cancelAnimation = () => {
          cancelAnimation = null;
          cleanupWillChange();
        };
        
        requestAnimationFrame(animate);
      }
    });
  };
  
  // Stop current animation
  const stop = (): void => {
    if (cancelAnimation) {
      cancelAnimation();
      cancelAnimation = null;
    }
    if (currentTimeline) {
      currentTimeline.cancel();
      currentTimeline = null;
    }
  };
  
  // Control methods
  const reverse = (): void => {
    if (currentTimeline) {
      currentTimeline.reverse();
    }
  };
  
  const seek = (target: number | { time: number } | { progress: number }): void => {
    if (currentTimeline) {
      currentTimeline.seek(target);
    }
  };
  
  const play = (): void => {
    if (currentTimeline) {
      currentTimeline.play();
    }
  };
  
  const pause = (): void => {
    if (currentTimeline) {
      currentTimeline.pause();
    }
  };
  
  const getTimeline = (): AnimationTimeline | null => {
    return currentTimeline;
  };
  
  const onAnimationStateChange = (callback: (state: TimelineState) => void): (() => void) => {
    if (!currentTimeline) {
      return () => {};
    }
    return currentTimeline.onStateChange(callback);
  };
  
  // Get transform-ready value
  const getTransformValue = (): string => {
    if (useTransform && typeof currentValue === 'number') {
      const unit = config.unit || transformConfig!.defaultUnit;
      return `${transformConfig!.transform}(${currentValue}${unit})`;
    }
    return String(currentValue);
  };
  
  // Destroy method for cleanup
  const destroy = (): void => {
    stop(); // Stop any animations
    onChangeCallbacks.clear();
    
    // Remove from registry
    if (useTransform && config.element) {
      const registry = transformRegistries.get(config.element);
      registry?.delete(config.property!);
      if (registry && registry.size === 0) {
        transformRegistries.delete(config.element);
      }
      // Update combined transform after removal
      updateCombinedTransform(config.element);
    } else if (useTransform) {
      globalTransformRegistry.delete(config.property!);
      updateCombinedTransform(null);
    }
    
    // Clean up will-change
    if (config.element && willChangeSet) {
      config.element.style.willChange = '';
      willChangeSet = false;
    }
  };
  
  // Helper to ensure motion value is registered with correct element
  const ensureRegistered = (): void => {
    if (useTransform && config.property) {
      const targetElement = elementRef || config.element;
      
      // If we have an element but are in global registry, move to element registry
      if (targetElement) {
        const elementRegistry = transformRegistries.get(targetElement);
        const inGlobalRegistry = globalTransformRegistry.has(config.property);
        const inElementRegistry = elementRegistry?.has(config.property);
        
        if (inGlobalRegistry && !inElementRegistry) {
          // Move from global to element registry
          const mv = globalTransformRegistry.get(config.property);
          if (mv) {
            globalTransformRegistry.delete(config.property);
            let registry = transformRegistries.get(targetElement);
            if (!registry) {
              registry = new Map();
              transformRegistries.set(targetElement, registry);
            }
            registry.set(config.property, mv as MotionValue<number>);
          }
        } else if (!inElementRegistry && !inGlobalRegistry) {
          // Not registered at all, register now
          let registry = transformRegistries.get(targetElement);
          if (!registry) {
            registry = new Map();
            transformRegistries.set(targetElement, registry);
          }
          registry.set(config.property, motionValueInstanceRef as MotionValue<number>);
        }
      }
    }
  };
  
  // Flush CSS update (called from batching queue)
  // This is an internal method, not part of the public API
  const flushCSSUpdate = (): void => {
    // Ensure we're registered with the correct element
    ensureRegistered();
    
    updateCSSVar(currentValue);
    
    // Schedule combined transform update if this is a transform property
    if (useTransform) {
      const targetElement = elementRef || config.element;
      transformUpdateQueue.add(targetElement || null);
      if (!transformRafScheduled && typeof window !== 'undefined') {
        transformRafScheduled = true;
        requestAnimationFrame(flushTransformUpdates);
      }
    }
    
    onChangeCallbacks.forEach(cb => {
      try {
        cb(currentValue);
      } catch (error) {
        debugError('MotionValue', 'Error in onChange callback:', error);
      }
    });
  };
  
  // Create motion value instance
  const motionValueInstance = {
    get,
    set,
    onChange,
    animateTo,
    stop,
    destroy,
    getTransformValue,
    reverse,
    seek,
    play,
    pause,
    getTimeline,
    onAnimationStateChange,
    id,
    cssVarName,
    isGPUAccelerated,
    triggersLayout,
    flushCSSUpdate, // Internal method for batching
  } as MotionValue<T> & { flushCSSUpdate: () => void };
  
  // Set the reference so set() can use it
  motionValueInstanceRef = motionValueInstance;
  
  // Register transform values when created
  if (useTransform && config.property) {
    if (config.element) {
      let registry = transformRegistries.get(config.element);
      if (!registry) {
        registry = new Map();
        transformRegistries.set(config.element, registry);
      }
      registry.set(config.property, motionValueInstance as MotionValue<number>);
    } else {
      // Register in global registry initially, will be moved to element registry if element becomes available
      globalTransformRegistry.set(config.property, motionValueInstance as MotionValue<number>);
    }
  }
  
  // Store elementRef in the instance for dynamic updates
  (motionValueInstance as any).elementRef = elementRef;
  
  return motionValueInstance;
}


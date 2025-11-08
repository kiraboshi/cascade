/**
 * Tests for animation states compiler
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { defineAnimationStates, generateStateTypes, type AnimationStateSet } from '../animation-states-compiler';

describe('defineAnimationStates', () => {
  beforeEach(() => {
    // Mock console.warn to avoid noise in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should create a state set with basic states', () => {
    const states = defineAnimationStates({
      initial: {
        opacity: 0,
        scale: 0.9,
      },
      animate: {
        opacity: 1,
        scale: 1,
      },
    });

    expect(states.id).toBeTruthy();
    expect(states.classes.initial).toBeTruthy();
    expect(states.classes.animate).toBeTruthy();
    expect(states.css).toContain(states.classes.initial);
    expect(states.css).toContain(states.classes.animate);
    expect(states.metadata.compileTime).toContain('initial');
    expect(states.metadata.compileTime).toContain('animate');
  });

  it('should generate CSS classes for compile-time states', () => {
    const states = defineAnimationStates({
      initial: {
        opacity: 0,
      },
      animate: {
        opacity: 1,
      },
    });

    expect(states.css).toContain(`.${states.classes.initial}`);
    expect(states.css).toContain(`.${states.classes.animate}`);
    expect(states.css).toContain('opacity: 0');
    expect(states.css).toContain('opacity: 1');
  });

  it('should detect runtime states with CSS variables', () => {
    const states = defineAnimationStates({
      initial: {
        opacity: 0,
      },
      dynamic: {
        x: 'var(--motion-x)',
        opacity: 'var(--dynamic-opacity)',
      },
    });

    expect(states.metadata.compileTime).toContain('initial');
    expect(states.metadata.runtime).toContain('dynamic');
    expect(states.css).toContain('--motion-x');
    expect(states.css).toContain('var(--motion-x)');
  });

  it('should detect runtime states with function values', () => {
    const states = defineAnimationStates({
      initial: {
        opacity: 0,
      },
      computed: {
        y: () => window.scrollY,
      },
    });

    expect(states.metadata.runtime).toContain('computed');
  });

  it('should handle transitions', () => {
    const states = defineAnimationStates({
      animate: {
        opacity: 1,
        transition: {
          duration: 300,
          easing: 'ease-out',
        },
      },
    });

    expect(states.css).toContain('transition:');
    expect(states.css).toContain('300ms');
    expect(states.css).toContain('ease-out');
  });

  it('should validate state definitions', () => {
    expect(() => {
      defineAnimationStates({
        invalid: 'not an object' as any,
      });
    }).toThrow(/must be an object/);
  });

  it('should validate transition config', () => {
    expect(() => {
      defineAnimationStates({
        invalid: {
          opacity: 1,
          transition: {
            duration: 'invalid' as any,
          },
        },
      });
    }).toThrow(/duration must be a number/);
  });

  it('should support explicit mode override', () => {
    const states = defineAnimationStates({
      forceRuntime: {
        opacity: 1,
        _mode: 'runtime' as const,
      },
      forceCompileTime: {
        x: 'var(--motion-x)',
        _mode: 'compile-time' as const,
      },
    });

    expect(states.metadata.runtime).toContain('forceRuntime');
    expect(states.metadata.compileTime).toContain('forceCompileTime');
  });

  it('should support semantic state names', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      hover: { scale: 1.05 },
      tap: { scale: 0.95 },
      focus: { outline: '2px solid blue' },
      exit: { opacity: 0 },
    });

    expect(states.classes.initial).toBeTruthy();
    expect(states.classes.animate).toBeTruthy();
    expect(states.classes.hover).toBeTruthy();
    expect(states.classes.tap).toBeTruthy();
    expect(states.classes.focus).toBeTruthy();
    expect(states.classes.exit).toBeTruthy();
  });

  it('should support arbitrary state names', () => {
    const states = defineAnimationStates({
      loading: { opacity: 0.5 },
      error: { opacity: 1, color: 'red' },
      success: { opacity: 1, color: 'green' },
    });

    expect(states.classes.loading).toBeTruthy();
    expect(states.classes.error).toBeTruthy();
    expect(states.classes.success).toBeTruthy();
  });

  it('should calculate performance metrics', () => {
    const states = defineAnimationStates({
      state1: { opacity: 1 },
      state2: { opacity: 0 },
      state3: { scale: 1 },
    });

    expect(states.metadata.performance.stateCount).toBe(3);
    expect(states.metadata.performance.totalProperties).toBe(3);
    expect(states.metadata.performance.cssSize).toBeGreaterThan(0);
    expect(states.metadata.performance.compileTimeStates).toBe(3);
    expect(states.metadata.performance.runtimeStates).toBe(0);
  });

  it('should handle transform properties', () => {
    const states = defineAnimationStates({
      animate: {
        transform: 'translateX(10px)',
        opacity: 1,
      },
    });

    expect(states.css).toContain('transform: translateX(10px)');
    expect(states.css).toContain('opacity: 1');
  });

  it('should handle property value objects', () => {
    const states = defineAnimationStates({
      animate: {
        opacity: {
          value: 1,
          transition: {
            duration: 200,
          },
        },
      },
    });

    expect(states.css).toContain('opacity: 1');
  });
});

describe('generateStateTypes', () => {
  it('should generate TypeScript types for state names', () => {
    const states = defineAnimationStates({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      hover: { scale: 1.05 },
    });

    const types = generateStateTypes(states);
    
    expect(types).toContain('StateName');
    expect(types).toContain("'initial'");
    expect(types).toContain("'animate'");
    expect(types).toContain("'hover'");
  });
});

describe('state validation', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should warn about too many properties (dev mode)', () => {
    const states = defineAnimationStates({
      complex: {
        prop1: 1,
        prop2: 2,
        prop3: 3,
        prop4: 4,
        prop5: 5,
        prop6: 6,
        prop7: 7,
        prop8: 8,
        prop9: 9,
        prop10: 10,
        prop11: 11, // Exceeds threshold
      },
    });

    expect(console.warn).toHaveBeenCalled();
  });

  it('should warn about layout-triggering properties (dev mode)', () => {
    const states = defineAnimationStates({
      layout: {
        width: '100px',
        height: '100px',
      },
    });

    expect(console.warn).toHaveBeenCalled();
  });
});


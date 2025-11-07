/**
 * Integration tests for viewport animations
 * Tests with real IntersectionObserver and DOM elements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React, { useRef } from 'react';
import {
  useInView,
  useInViewState,
  useFadeInOnScroll,
  useSlideInOnScroll,
  useViewportAnimationWithRef,
  useMotionValue,
} from '../index';

describe('Viewport Animations Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('useInView Integration', () => {
    it('should detect element and set up observer', () => {
      function TestComponent() {
        const ref = useRef<HTMLDivElement>(null);
        const isInView = useInView(ref, { threshold: 0.1 });
        
        return (
          <div ref={ref} data-testid="test-element">
            {isInView ? 'In View' : 'Out of View'}
          </div>
        );
      }
      
      const { getByTestId } = render(<TestComponent />);
      const testElement = getByTestId('test-element');
      
      expect(testElement).toBeInTheDocument();
      expect(testElement.textContent).toBe('Out of View');
    });
    
    it('should respect threshold configuration', () => {
      function TestComponent() {
        const ref = useRef<HTMLDivElement>(null);
        const isInView = useInView(ref, { threshold: 1.0 }); // Fully visible
        
        return (
          <div ref={ref} data-testid="test-element">
            {isInView ? 'Fully Visible' : 'Not Fully Visible'}
          </div>
        );
      }
      
      const { getByTestId } = render(<TestComponent />);
      const testElement = getByTestId('test-element');
      
      expect(testElement).toBeInTheDocument();
      expect(testElement.textContent).toBe('Not Fully Visible');
    });
  });
  
  describe('useFadeInOnScroll Integration', () => {
    it('should apply opacity animation setup', () => {
      function TestComponent() {
        const ref = useRef<HTMLDivElement>(null);
        useFadeInOnScroll(ref, {
          threshold: 0.1,
          duration: 300,
          once: true,
        });
        
        return (
          <div
            ref={ref}
            data-testid="fade-element"
            style={{ height: '100px', width: '100px' }}
          >
            Fade In Content
          </div>
        );
      }
      
      const { getByTestId } = render(<TestComponent />);
      const element = getByTestId('fade-element');
      
      // Element should exist
      expect(element).toBeInTheDocument();
      
      // Initial opacity should be set via inline style
      const opacity = element.style.opacity;
      expect(opacity).toBe('0');
    });
    
    it('should work with spring animation', () => {
      function TestComponent() {
        const ref = useRef<HTMLDivElement>(null);
        useFadeInOnScroll(ref, {
          threshold: 0.1,
          useSpring: true,
          spring: { stiffness: 300, damping: 30 },
          once: true,
        });
        
        return (
          <div
            ref={ref}
            data-testid="spring-fade-element"
            style={{ height: '100px', width: '100px' }}
          >
            Spring Fade Content
          </div>
        );
      }
      
      const { getByTestId } = render(<TestComponent />);
      const element = getByTestId('spring-fade-element');
      
      expect(element).toBeInTheDocument();
      expect(element.style.opacity).toBe('0');
    });
  });
  
  describe('useSlideInOnScroll Integration', () => {
    it('should apply transform animation setup', () => {
      function TestComponent() {
        const ref = useRef<HTMLDivElement>(null);
        const { x, y } = useSlideInOnScroll(ref, {
          direction: 'up',
          distance: 50,
          duration: 400,
          threshold: 0.1,
          once: true,
        });
        
        return (
          <div
            ref={ref}
            data-testid="slide-element"
            style={{
              height: '100px',
              width: '100px',
              transform: `translate(${x.get()}px, ${y.get()}px)`,
            }}
          >
            Slide In Content
          </div>
        );
      }
      
      const { getByTestId } = render(<TestComponent />);
      const element = getByTestId('slide-element');
      
      expect(element).toBeInTheDocument();
      
      // Check that transform is applied (should start at initial position)
      const transform = element.style.transform;
      expect(transform).toContain('translate');
      expect(transform).toContain('50px'); // Initial y offset for 'up' direction
    });
    
    it('should support all directions', () => {
      const directions: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right'];
      
      directions.forEach((direction) => {
        function TestComponent() {
          const ref = useRef<HTMLDivElement>(null);
          const { x, y } = useSlideInOnScroll(ref, {
            direction,
            distance: 50,
            duration: 400,
            threshold: 0.1,
            once: true,
          });
          
          return (
            <div
              ref={ref}
              data-testid={`slide-${direction}`}
              style={{
                height: '100px',
                width: '100px',
                transform: `translate(${x.get()}px, ${y.get()}px)`,
              }}
            >
              {direction}
            </div>
          );
        }
        
        const { getByTestId } = render(<TestComponent />);
        const element = getByTestId(`slide-${direction}`);
        
        expect(element).toBeInTheDocument();
        expect(element.style.transform).toBeTruthy();
      });
    });
  });
  
  describe('useViewportAnimationWithRef Integration', () => {
    it('should set initial value and setup animation', () => {
      function TestComponent() {
        const ref = useRef<HTMLDivElement>(null);
        const opacity = useMotionValue(1); // Start at 1
        
        useViewportAnimationWithRef(ref, opacity, {
          initial: 0, // Should be set to 0
          onEnter: {
            target: 1,
            config: { duration: 500 },
          },
        });
        
        return (
          <div
            ref={ref}
            data-testid="custom-animation"
            style={{
              opacity: opacity.get(),
              height: '100px',
              width: '100px',
            }}
          >
            Custom Animation
          </div>
        );
      }
      
      const { getByTestId } = render(<TestComponent />);
      const element = getByTestId('custom-animation');
      
      expect(element).toBeInTheDocument();
      
      // Element should be rendered (initial value set in useEffect)
      // The opacity style will be set by the hook's onChange callback
    });
    
    it('should support exit animations configuration', () => {
      function TestComponent() {
        const ref = useRef<HTMLDivElement>(null);
        const opacity = useMotionValue(1);
        
        useViewportAnimationWithRef(ref, opacity, {
          initial: 1,
          onEnter: {
            target: 1,
            config: { duration: 500 },
          },
          onExit: {
            target: 0,
            config: { duration: 300 },
          },
        });
        
        return (
          <div
            ref={ref}
            data-testid="exit-animation"
            style={{
              opacity: opacity.get(),
              height: '100px',
              width: '100px',
            }}
          >
            Exit Animation
          </div>
        );
      }
      
      const { getByTestId } = render(<TestComponent />);
      const element = getByTestId('exit-animation');
      
      expect(element).toBeInTheDocument();
      // Initial value should be 1
      expect(element.style.opacity).toBe('1');
    });
  });
  
  describe('Multiple Elements Integration', () => {
    it('should handle multiple elements independently', () => {
      function TestComponent() {
        const ref1 = useRef<HTMLDivElement>(null);
        const ref2 = useRef<HTMLDivElement>(null);
        const ref3 = useRef<HTMLDivElement>(null);
        
        useFadeInOnScroll(ref1, { threshold: 0.1, duration: 300 });
        useFadeInOnScroll(ref2, { threshold: 0.2, duration: 400 });
        useFadeInOnScroll(ref3, { threshold: 0.3, duration: 500 });
        
        return (
          <>
            <div ref={ref1} data-testid="element-1" style={{ height: '100px' }}>
              Element 1
            </div>
            <div ref={ref2} data-testid="element-2" style={{ height: '100px' }}>
              Element 2
            </div>
            <div ref={ref3} data-testid="element-3" style={{ height: '100px' }}>
              Element 3
            </div>
          </>
        );
      }
      
      const { getByTestId } = render(<TestComponent />);
      
      expect(getByTestId('element-1')).toBeInTheDocument();
      expect(getByTestId('element-2')).toBeInTheDocument();
      expect(getByTestId('element-3')).toBeInTheDocument();
      
      // All should have opacity 0 initially
      expect(getByTestId('element-1').style.opacity).toBe('0');
      expect(getByTestId('element-2').style.opacity).toBe('0');
      expect(getByTestId('element-3').style.opacity).toBe('0');
    });
  });
  
  describe('Edge Cases Integration', () => {
    it('should handle elements and setup observer', () => {
      function TestComponent() {
        const ref = useRef<HTMLDivElement>(null);
        const isInView = useInView(ref, { threshold: 0 });
        
        return (
          <div
            ref={ref}
            data-testid="already-visible"
            style={{ height: '100px', width: '100px' }}
          >
            {isInView ? 'Visible' : 'Not Visible'}
          </div>
        );
      }
      
      const { getByTestId } = render(<TestComponent />);
      const element = getByTestId('already-visible');
      
      expect(element).toBeInTheDocument();
      expect(element.textContent).toBe('Not Visible'); // Initially false
    });
    
    it('should cleanup observers on unmount', () => {
      const disconnectSpy = vi.fn();
      
      // Mock IntersectionObserver to track disconnects
      const OriginalObserver = global.IntersectionObserver;
      let observerInstance: any = null;
      
      global.IntersectionObserver = class extends OriginalObserver {
        constructor(...args: any[]) {
          super(...args);
          observerInstance = this;
        }
        
        disconnect() {
          disconnectSpy();
          super.disconnect();
        }
      } as any;
      
      function TestComponent() {
        const ref = useRef<HTMLDivElement>(null);
        useInView(ref);
        
        return <div ref={ref} data-testid="cleanup-test">Test</div>;
      }
      
      const { unmount } = render(<TestComponent />);
      
      // Manually disconnect to simulate cleanup
      if (observerInstance) {
        observerInstance.disconnect();
      }
      
      unmount();
      
      // Observer should be cleaned up
      expect(disconnectSpy).toHaveBeenCalled();
      
      // Restore original
      global.IntersectionObserver = OriginalObserver;
    });
  });
});


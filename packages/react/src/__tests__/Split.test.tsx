/**
 * Tests for Split component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Split } from '../Split';

describe('Split', () => {
  it('should render with default props', () => {
    const { container } = render(
      <Split>
        <div>Left</div>
        <div>Right</div>
      </Split>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element).toBeTruthy();
    expect(element.tagName).toBe('DIV');
  });

  it('should apply fraction', () => {
    const { container } = render(
      <Split fraction="1/3">
        <div>Left</div>
        <div>Right</div>
      </Split>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--split-template-columns')).toBeTruthy();
  });

  it('should apply gutter', () => {
    const { container } = render(
      <Split gutter="md">
        <div>Left</div>
        <div>Right</div>
      </Split>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--split-gap')).toBeTruthy();
  });

  it('should apply align', () => {
    const { container } = render(
      <Split align="center">
        <div>Left</div>
        <div>Right</div>
      </Split>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--split-align')).toBe('center');
  });

  it('should handle switchTo prop', () => {
    const { container } = render(
      <Split switchTo="stack">
        <div>Left</div>
        <div>Right</div>
      </Split>
    );
    const element = container.firstChild as HTMLElement;
    
    // switchTo="stack" adds a className that stacks columns
    expect(element.className).toContain('stack');
  });

  it('should handle responsive prop', () => {
    const { container } = render(
      <Split 
        fraction="1/2" 
        responsive={{ sm: { fraction: '1/3' } }}
      >
        <div>Left</div>
        <div>Right</div>
      </Split>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.getAttribute('data-responsive')).toBeTruthy();
  });

  it('should support polymorphic as prop', () => {
    const { container } = render(
      <Split as="section">
        <div>Left</div>
        <div>Right</div>
      </Split>
    );
    
    expect(container.querySelector('section')).toBeTruthy();
  });

  it('should render both children', () => {
    const { container } = render(
      <Split>
        <div>Left</div>
        <div>Right</div>
      </Split>
    );
    
    expect(container.textContent).toContain('Left');
    expect(container.textContent).toContain('Right');
  });

  it('should include the split class for foundation container queries', () => {
    const { container } = render(
      <Split fraction="1/2">
        <div>Left</div>
        <div>Right</div>
      </Split>
    );
    const element = container.firstChild as HTMLElement;
    expect(element.classList.contains('split')).toBe(true);
  });

  describe('containerQueries', () => {
    it('should set CSS variables for minWidth container queries', () => {
      const { container } = render(
        <Split
          fraction="1/2"
          containerQueries={{
            minWidth: {
              '40rem': { fraction: '1/3', gutter: 'lg' },
            },
          }}
        >
          <div>Left</div>
          <div>Right</div>
        </Split>
      );
      
      const element = container.firstChild as HTMLElement;
      
      // Should set CSS variables for container query breakpoints
      expect(element.style.getPropertyValue('--split-template-columns-40rem')).toBeTruthy();
      expect(element.style.getPropertyValue('--split-gap-40rem')).toBeTruthy();
    });

    it('should set CSS variables for maxWidth container queries with stack behavior', () => {
      const { container } = render(
        <Split
          fraction="1/2"
          containerQueries={{
            maxWidth: {
              '30rem': { switchTo: 'stack' },
            },
          }}
        >
          <div>Left</div>
          <div>Right</div>
        </Split>
      );
      
      const element = container.firstChild as HTMLElement;
      
      // When switchTo: 'stack' is used, it adds stack class but doesn't set template-columns variable
      // The stacking is handled via CSS class, not CSS variable
      expect(element.className).toContain('stack');
    });

    it('should maintain backward compatibility with responsive prop', () => {
      const { container } = render(
        <Split
          fraction="1/2"
          responsive={{ sm: { fraction: '1/3' } }}
          containerQueries={{
            minWidth: {
              '40rem': { fraction: '2/3' },
            },
          }}
        >
          <div>Left</div>
          <div>Right</div>
        </Split>
      );
      
      const element = container.firstChild as HTMLElement;
      
      // Should have both responsive data attribute and container query variables
      expect(element.getAttribute('data-responsive')).toBeTruthy();
      expect(element.style.getPropertyValue('--split-template-columns-40rem')).toBeTruthy();
    });

    it('should handle both minWidth and maxWidth container queries', () => {
      const { container } = render(
        <Split
          fraction="1/2"
          containerQueries={{
            minWidth: {
              '40rem': { fraction: '1/3' },
            },
            maxWidth: {
              '20rem': { fraction: '1/4' },
            },
          }}
        >
          <div>Left</div>
          <div>Right</div>
        </Split>
      );
      
      const element = container.firstChild as HTMLElement;
      
      // Should set variables for both min and max width queries
      expect(element.style.getPropertyValue('--split-template-columns-40rem')).toBeTruthy();
      expect(element.style.getPropertyValue('--split-template-columns-max-20rem')).toBeTruthy();
    });

    it('should handle stack behavior via container queries', () => {
      const { container } = render(
        <Split
          fraction="1/2"
          containerQueries={{
            maxWidth: {
              '30rem': { switchTo: 'stack' },
            },
          }}
        >
          <div>Left</div>
          <div>Right</div>
        </Split>
      );
      
      const element = container.firstChild as HTMLElement;
      
      // When switchTo: 'stack' is used, it adds stack class for CSS-based stacking
      expect(element.className).toContain('stack');
    });
  });
});


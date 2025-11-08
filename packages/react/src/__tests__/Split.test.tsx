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
});


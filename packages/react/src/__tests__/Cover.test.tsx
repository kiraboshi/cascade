/**
 * Tests for Cover component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Cover } from '../Cover';

describe('Cover', () => {
  it('should render with default props', () => {
    const { container } = render(
      <Cover>
        <div>Content</div>
      </Cover>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element).toBeTruthy();
    expect(element.tagName).toBe('DIV');
  });

  it('should apply minHeight', () => {
    const { container } = render(
      <Cover minHeight="100vh">
        <div>Content</div>
      </Cover>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--cover-min-height')).toBe('100vh');
  });

  it('should apply padding', () => {
    const { container } = render(
      <Cover padding="md">
        <div>Content</div>
      </Cover>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--cover-padding')).toBeTruthy();
  });

  it('should handle centered prop', () => {
    const { container } = render(
      <Cover centered={<div>Centered Content</div>}>
        <div>Content</div>
      </Cover>
    );
    const element = container.firstChild as HTMLElement;
    
    // centered prop wraps content in a centered div
    expect(container.textContent).toContain('Centered Content');
  });

  it('should handle responsive prop', () => {
    const { container } = render(
      <Cover 
        minHeight="100vh" 
        responsive={{ sm: { minHeight: '50vh' } }}
      >
        <div>Content</div>
      </Cover>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.getAttribute('data-responsive')).toBeTruthy();
  });

  it('should support polymorphic as prop', () => {
    const { container } = render(
      <Cover as="section">
        <div>Content</div>
      </Cover>
    );
    
    expect(container.querySelector('section')).toBeTruthy();
  });

  it('should render children', () => {
    const { container } = render(
      <Cover>
        <div>Content</div>
      </Cover>
    );
    
    expect(container.textContent).toContain('Content');
  });
});


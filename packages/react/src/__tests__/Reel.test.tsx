/**
 * Tests for Reel component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Reel } from '../Reel';

describe('Reel', () => {
  it('should render with default props', () => {
    const { container } = render(
      <Reel>
        <div>Item 1</div>
        <div>Item 2</div>
      </Reel>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element).toBeTruthy();
    expect(element.tagName).toBe('DIV');
  });

  it('should apply itemWidth', () => {
    const { container } = render(
      <Reel itemWidth="300px">
        <div>Item 1</div>
        <div>Item 2</div>
      </Reel>
    );
    const element = container.firstChild as HTMLElement;
    const firstChild = element.firstElementChild as HTMLElement;
    
    // itemWidth is applied directly to children, not as CSS variable
    expect(firstChild?.style.width).toBe('300px');
  });

  it('should apply gap', () => {
    const { container } = render(
      <Reel gap="md">
        <div>Item 1</div>
        <div>Item 2</div>
      </Reel>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--reel-gap')).toBeTruthy();
  });

  it('should handle responsive prop', () => {
    const { container } = render(
      <Reel 
        itemWidth="300px" 
        responsive={{ sm: { itemWidth: '250px' } }}
      >
        <div>Item 1</div>
        <div>Item 2</div>
      </Reel>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.getAttribute('data-responsive')).toBeTruthy();
  });

  it('should support polymorphic as prop', () => {
    const { container } = render(
      <Reel as="section">
        <div>Item 1</div>
        <div>Item 2</div>
      </Reel>
    );
    
    expect(container.querySelector('section')).toBeTruthy();
  });

  it('should render children', () => {
    const { container } = render(
      <Reel>
        <div>Item 1</div>
        <div>Item 2</div>
      </Reel>
    );
    
    expect(container.textContent).toContain('Item 1');
    expect(container.textContent).toContain('Item 2');
  });
});


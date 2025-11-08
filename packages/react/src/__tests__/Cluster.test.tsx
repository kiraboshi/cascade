/**
 * Tests for Cluster component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Cluster } from '../Cluster';

describe('Cluster', () => {
  it('should render with default props', () => {
    const { container } = render(<Cluster>Content</Cluster>);
    const element = container.firstChild as HTMLElement;
    
    expect(element).toBeTruthy();
    expect(element.tagName).toBe('DIV');
  });

  it('should apply spacing', () => {
    const { container } = render(<Cluster spacing="md">Content</Cluster>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--cluster-gap')).toBeTruthy();
  });

  it('should apply justify alignment', () => {
    const { container } = render(<Cluster justify="center">Content</Cluster>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--cluster-justify')).toBe('center');
  });

  it('should handle all justify values', () => {
    const { container: start } = render(<Cluster justify="start">Content</Cluster>);
    expect(start.firstChild).toBeTruthy();

    const { container: end } = render(<Cluster justify="end">Content</Cluster>);
    expect(end.firstChild).toBeTruthy();

    const { container: between } = render(<Cluster justify="between">Content</Cluster>);
    expect(between.firstChild).toBeTruthy();
  });

  it('should support polymorphic as prop', () => {
    const { container } = render(<Cluster as="nav">Content</Cluster>);
    
    expect(container.querySelector('nav')).toBeTruthy();
  });

  it('should render children', () => {
    const { container } = render(
      <Cluster>
        <div>Item 1</div>
        <div>Item 2</div>
      </Cluster>
    );
    
    expect(container.textContent).toContain('Item 1');
    expect(container.textContent).toContain('Item 2');
  });
});


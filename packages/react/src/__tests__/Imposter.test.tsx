/**
 * Tests for Imposter component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Imposter } from '../Imposter';

describe('Imposter', () => {
  it('should render with default props', () => {
    const { container } = render(
      <Imposter>
        <div>Content</div>
      </Imposter>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element).toBeTruthy();
    expect(element.tagName).toBe('DIV');
  });

  it('should apply margin', () => {
    const { container } = render(
      <Imposter margin="md">
        <div>Content</div>
      </Imposter>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--imposter-margin')).toBeTruthy();
  });

  it('should apply breakout prop', () => {
    const { container } = render(
      <Imposter breakout>
        <div>Content</div>
      </Imposter>
    );
    const element = container.firstChild as HTMLElement;
    
    // breakout adds a className that sets position: fixed
    expect(element.className).toContain('breakout');
  });

  it('should handle responsive prop', () => {
    const { container } = render(
      <Imposter 
        margin="md" 
        responsive={{ sm: { margin: 'lg' } }}
      >
        <div>Content</div>
      </Imposter>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.getAttribute('data-responsive')).toBeTruthy();
  });

  it('should support polymorphic as prop', () => {
    const { container } = render(
      <Imposter as="dialog">
        <div>Content</div>
      </Imposter>
    );
    
    expect(container.querySelector('dialog')).toBeTruthy();
  });

  it('should render children', () => {
    const { container } = render(
      <Imposter>
        <div>Content</div>
      </Imposter>
    );
    
    expect(container.textContent).toContain('Content');
  });
});


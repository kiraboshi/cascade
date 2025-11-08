/**
 * Tests for Frame component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Frame } from '../Frame';

describe('Frame', () => {
  it('should render with default props', () => {
    const { container } = render(<Frame ratio="16/9">Content</Frame>);
    const element = container.firstChild as HTMLElement;
    
    expect(element).toBeTruthy();
    expect(element.tagName).toBe('DIV');
  });

  it('should apply ratio', () => {
    const { container } = render(<Frame ratio="16/9">Content</Frame>);
    const element = container.firstChild as HTMLElement;
    
    // Ratio is converted to aspect ratio number and stored as CSS variable
    const ratioValue = element.style.getPropertyValue('--frame-ratio');
    expect(ratioValue).toBeTruthy();
    expect(parseFloat(ratioValue)).toBeCloseTo(16/9, 2);
  });

  it('should apply objectFit', () => {
    const { container } = render(<Frame ratio="16/9" objectFit="contain">Content</Frame>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--frame-object-fit')).toBe('contain');
  });

  it('should handle responsive prop', () => {
    const { container } = render(
      <Frame 
        ratio="16/9" 
        responsive={{ sm: { ratio: '4/3' } }}
      >
        Content
      </Frame>
    );
    
    const element = container.firstChild as HTMLElement;
    // Frame doesn't currently support responsive ratio changes via data attributes
    // This test verifies the component renders without error
    expect(element).toBeTruthy();
  });

  it('should support polymorphic as prop', () => {
    const { container } = render(<Frame ratio="16/9" as="figure">Content</Frame>);
    
    expect(container.querySelector('figure')).toBeTruthy();
  });
});


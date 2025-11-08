/**
 * Tests for Center component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Center } from '../Center';

describe('Center', () => {
  it('should render with default props', () => {
    const { container } = render(<Center>Content</Center>);
    const element = container.firstChild as HTMLElement;
    
    expect(element).toBeTruthy();
    expect(element.tagName).toBe('DIV');
  });

  it('should apply maxWidth', () => {
    const { container } = render(<Center maxWidth="1200px">Content</Center>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--center-max-width')).toBe('1200px');
  });

  it('should apply padding', () => {
    const { container } = render(<Center padding="md">Content</Center>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--center-padding')).toBeTruthy();
  });

  it('should center text when centerText is true', () => {
    const { container } = render(<Center centerText>Content</Center>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--center-text-align')).toBe('center');
  });

  it('should center children when centerChildren is true', () => {
    const { container } = render(<Center centerChildren>Content</Center>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.className).toContain('flexCenter');
  });

  it('should handle responsive prop', () => {
    const { container } = render(
      <Center 
        maxWidth="800px" 
        responsive={{ sm: { maxWidth: '1200px' } }}
      >
        Content
      </Center>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.getAttribute('data-responsive')).toBeTruthy();
  });

  it('should support polymorphic as prop', () => {
    const { container } = render(<Center as="main">Content</Center>);
    
    expect(container.querySelector('main')).toBeTruthy();
  });
});


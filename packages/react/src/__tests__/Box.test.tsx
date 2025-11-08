/**
 * Tests for Box component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Box } from '../Box';

describe('Box', () => {
  it('should render with default props', () => {
    const { container } = render(<Box>Content</Box>);
    const element = container.firstChild as HTMLElement;
    
    expect(element).toBeTruthy();
    expect(element.tagName).toBe('DIV');
  });

  it('should apply padding', () => {
    const { container } = render(<Box padding="md">Content</Box>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--box-padding')).toBeTruthy();
  });

  it('should apply margin', () => {
    const { container } = render(<Box margin="lg">Content</Box>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--box-margin')).toBeTruthy();
  });

  it('should apply background', () => {
    const { container } = render(<Box background="#fff">Content</Box>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--box-background')).toBe('#fff');
  });

  it('should apply border', () => {
    const { container } = render(<Box border="1px solid #000">Content</Box>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--box-border')).toBe('1px solid #000');
  });

  it('should apply borderRadius', () => {
    const { container } = render(<Box borderRadius="md">Content</Box>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--box-border-radius')).toBeTruthy();
  });

  it('should apply width and height', () => {
    const { container } = render(<Box width="100px" height="200px">Content</Box>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--box-width')).toBe('100px');
    expect(element.style.getPropertyValue('--box-height')).toBe('200px');
  });

  it('should handle responsive prop', () => {
    const { container } = render(
      <Box 
        padding="sm" 
        responsive={{ sm: { padding: 'lg' } }}
      >
        Content
      </Box>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.getAttribute('data-responsive')).toBeTruthy();
  });

  it('should support polymorphic as prop', () => {
    const { container } = render(<Box as="section">Content</Box>);
    
    expect(container.querySelector('section')).toBeTruthy();
  });

  it('should handle array padding', () => {
    const { container } = render(<Box padding={['md', 'lg']}>Content</Box>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--box-padding')).toBeTruthy();
  });

  it('should handle array margin', () => {
    const { container } = render(<Box margin={['sm', 'md']}>Content</Box>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--box-margin')).toBeTruthy();
  });
});


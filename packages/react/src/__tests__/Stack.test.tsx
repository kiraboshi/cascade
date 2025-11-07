/**
 * Tests for Stack component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stack } from '../Stack';

describe('Stack', () => {
  it('should render with spacing', () => {
    const { container } = render(<Stack spacing="md">Content</Stack>);
    const element = container.firstChild as HTMLElement;
    
    expect(element).toBeTruthy();
    expect(element.style.getPropertyValue('--stack-gap')).toBeTruthy();
  });
  
  it('should apply alignment classes', () => {
    const { container } = render(
      <Stack spacing="md" align="center">
        Content
      </Stack>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('align');
  });
  
  it('should handle responsive prop', () => {
    const { container } = render(
      <Stack 
        spacing="sm" 
        responsive={{ sm: { spacing: 'lg' } }}
      >
        Content
      </Stack>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.getAttribute('data-responsive')).toBeTruthy();
  });
  
  it('should support polymorphic as prop', () => {
    const { container } = render(
      <Stack spacing="md" as="section">
        Content
      </Stack>
    );
    
    expect(container.querySelector('section')).toBeTruthy();
  });
});



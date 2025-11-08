/**
 * Tests for Flex component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Flex } from '../Flex';

describe('Flex', () => {
  it('should render with default props', () => {
    const { container } = render(<Flex>Content</Flex>);
    const element = container.firstChild as HTMLElement;
    
    expect(element).toBeTruthy();
    expect(element.tagName).toBe('DIV');
  });

  it('should apply direction', () => {
    const { container } = render(<Flex direction="column">Content</Flex>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.flexDirection).toBe('column');
  });

  it('should apply wrap', () => {
    const { container } = render(<Flex wrap>Content</Flex>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.flexWrap).toBe('wrap');
  });

  it('should apply gap', () => {
    const { container } = render(<Flex gap="md">Content</Flex>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.gap).toBeTruthy();
  });

  it('should apply align', () => {
    const { container } = render(<Flex align="center">Content</Flex>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.alignItems).toBe('center');
  });

  it('should apply justify', () => {
    const { container } = render(<Flex justify="between">Content</Flex>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.justifyContent).toBe('space-between');
  });

  it('should handle array gap', () => {
    const { container } = render(<Flex gap={['md', 'lg']}>Content</Flex>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.gap).toBeTruthy();
  });

  it('should handle responsive prop', () => {
    const { container } = render(
      <Flex 
        direction="row" 
        responsive={{ sm: { direction: 'column' } }}
      >
        Content
      </Flex>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.getAttribute('data-responsive')).toBeTruthy();
  });

  it('should support polymorphic as prop', () => {
    const { container } = render(<Flex as="section">Content</Flex>);
    
    expect(container.querySelector('section')).toBeTruthy();
  });
});


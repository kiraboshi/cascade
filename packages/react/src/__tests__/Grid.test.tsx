/**
 * Tests for Grid component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Grid } from '../Grid';

describe('Grid', () => {
  it('should render with default props', () => {
    const { container } = render(<Grid>Content</Grid>);
    const element = container.firstChild as HTMLElement;
    
    expect(element).toBeTruthy();
    expect(element.tagName).toBe('DIV');
  });

  it('should apply columns', () => {
    const { container } = render(<Grid columns={3}>Content</Grid>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--grid-columns')).toBeTruthy();
  });

  it('should apply columns as string', () => {
    const { container } = render(<Grid columns="repeat(4, 1fr)">Content</Grid>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--grid-columns')).toBe('repeat(4, 1fr)');
  });

  it('should apply gap', () => {
    const { container } = render(<Grid gap="md">Content</Grid>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--grid-gap')).toBeTruthy();
  });

  it('should apply alignItems', () => {
    const { container } = render(<Grid alignItems="center">Content</Grid>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--grid-align-items')).toBe('center');
  });

  it('should apply justifyItems', () => {
    const { container } = render(<Grid justifyItems="end">Content</Grid>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--grid-justify-items')).toBe('end');
  });

  it('should handle autoFit', () => {
    const { container } = render(<Grid autoFit minColumnWidth="200px">Content</Grid>);
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--grid-columns')).toContain('auto-fit');
  });

  it('should handle responsive prop', () => {
    const { container } = render(
      <Grid 
        columns={3} 
        responsive={{ sm: { columns: 2 } }}
      >
        Content
      </Grid>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.getAttribute('data-responsive')).toBeTruthy();
  });

  it('should support polymorphic as prop', () => {
    const { container } = render(<Grid as="section">Content</Grid>);
    
    expect(container.querySelector('section')).toBeTruthy();
  });
});


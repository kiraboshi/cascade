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
  
  it('should include the foundation grid class for container queries', () => {
    const { container } = render(
      <Grid
        columns={1}
        containerQueries={{
          minWidth: {
            '30rem': { columns: 2 },
          },
        }}
      >
        Content
      </Grid>
    );
    // When containerQueries is used, Grid is wrapped in a container div
    const wrapper = container.firstChild as HTMLElement;
    const gridElement = wrapper.firstChild as HTMLElement;
    
    expect(gridElement.classList.contains('grid')).toBe(true);
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

  describe('containerQueries', () => {
    it('should wrap Grid in container div when containerQueries prop is used', () => {
      const { container } = render(
        <Grid
          columns={1}
          containerQueries={{
            minWidth: {
              '30rem': { columns: 2 },
            },
          }}
        >
          Content
        </Grid>
      );
      
      // Should have wrapper div with container-type
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.tagName).toBe('DIV');
      expect(wrapper.style.containerType).toBe('inline-size');
      expect(wrapper.style.width).toBe('100%');
      
      // Grid element should be inside wrapper
      const gridElement = wrapper.firstChild as HTMLElement;
      expect(gridElement.classList.contains('grid')).toBe(true);
    });

    it('should set CSS variables for minWidth container queries', () => {
      const { container } = render(
        <Grid
          columns={1}
          containerQueries={{
            minWidth: {
              '30rem': { columns: 2, gap: 'md' },
              '50rem': { columns: 3 },
            },
          }}
        >
          Content
        </Grid>
      );
      
      const wrapper = container.firstChild as HTMLElement;
      const gridElement = wrapper.firstChild as HTMLElement;
      
      // Should set CSS variables for container query breakpoints
      expect(gridElement.style.getPropertyValue('--grid-columns-30rem')).toBeTruthy();
      expect(gridElement.style.getPropertyValue('--grid-columns-50rem')).toBeTruthy();
      expect(gridElement.style.getPropertyValue('--grid-gap-30rem')).toBeTruthy();
    });

    it('should set CSS variables for maxWidth container queries', () => {
      const { container } = render(
        <Grid
          columns={3}
          containerQueries={{
            maxWidth: {
              '40rem': { columns: 2 },
            },
          }}
        >
          Content
        </Grid>
      );
      
      const wrapper = container.firstChild as HTMLElement;
      const gridElement = wrapper.firstChild as HTMLElement;
      
      // Should set CSS variables for max-width container queries
      expect(gridElement.style.getPropertyValue('--grid-columns-max-40rem')).toBeTruthy();
    });

    it('should set --grid-columns-base when containerQueries are used', () => {
      const { container } = render(
        <Grid
          columns={1}
          containerQueries={{
            minWidth: {
              '30rem': { columns: 2 },
            },
          }}
        >
          Content
        </Grid>
      );
      
      const wrapper = container.firstChild as HTMLElement;
      const gridElement = wrapper.firstChild as HTMLElement;
      
      // Should set base value, not direct --grid-columns
      expect(gridElement.style.getPropertyValue('--grid-columns-base')).toBeTruthy();
      expect(gridElement.style.getPropertyValue('--grid-columns')).toBe('');
    });

    it('should NOT wrap Grid when containerQueries prop is not used', () => {
      const { container } = render(<Grid columns={3}>Content</Grid>);
      
      // Should NOT have wrapper div
      const element = container.firstChild as HTMLElement;
      expect(element.classList.contains('grid')).toBe(true);
      expect(element.style.containerType).toBe('');
    });

    it('should maintain backward compatibility with responsive prop', () => {
      const { container } = render(
        <Grid
          columns={1}
          responsive={{ sm: { columns: 2 } }}
          containerQueries={{
            minWidth: {
              '30rem': { columns: 3 },
            },
          }}
        >
          Content
        </Grid>
      );
      
      const wrapper = container.firstChild as HTMLElement;
      const gridElement = wrapper.firstChild as HTMLElement;
      
      // Should have both responsive data attribute and container query variables
      expect(gridElement.getAttribute('data-responsive')).toBeTruthy();
      expect(gridElement.style.getPropertyValue('--grid-columns-30rem')).toBeTruthy();
    });

    it('should handle both minWidth and maxWidth container queries', () => {
      const { container } = render(
        <Grid
          columns={2}
          containerQueries={{
            minWidth: {
              '30rem': { columns: 3 },
            },
            maxWidth: {
              '20rem': { columns: 1 },
            },
          }}
        >
          Content
        </Grid>
      );
      
      const wrapper = container.firstChild as HTMLElement;
      const gridElement = wrapper.firstChild as HTMLElement;
      
      // Should set variables for both min and max width queries
      expect(gridElement.style.getPropertyValue('--grid-columns-30rem')).toBeTruthy();
      expect(gridElement.style.getPropertyValue('--grid-columns-max-20rem')).toBeTruthy();
    });

    it('should normalize breakpoint widths with spaces', () => {
      const { container } = render(
        <Grid
          columns={1}
          containerQueries={{
            minWidth: {
              '30 rem': { columns: 2 }, // Space in breakpoint
            },
          }}
        >
          Content
        </Grid>
      );
      
      const wrapper = container.firstChild as HTMLElement;
      const gridElement = wrapper.firstChild as HTMLElement;
      
      // Should normalize spaces to dashes in CSS variable names
      expect(gridElement.style.getPropertyValue('--grid-columns-30-rem')).toBeTruthy();
    });
  });
});


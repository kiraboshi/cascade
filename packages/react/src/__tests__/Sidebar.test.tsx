/**
 * Tests for Sidebar component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Sidebar } from '../Sidebar';

describe('Sidebar', () => {
  it('should render with default props', () => {
    const { container } = render(
      <Sidebar>
        <div>Sidebar</div>
        <div>Content</div>
      </Sidebar>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element).toBeTruthy();
    expect(element.tagName).toBe('DIV');
  });

  it('should apply sidebarWidth', () => {
    const { container } = render(
      <Sidebar sidebarWidth="20rem">
        <div>Sidebar</div>
        <div>Content</div>
      </Sidebar>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--sidebar-template-columns')).toBeTruthy();
  });

  it('should apply gap', () => {
    const { container } = render(
      <Sidebar gap="md">
        <div>Sidebar</div>
        <div>Content</div>
      </Sidebar>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--sidebar-gap')).toBeTruthy();
  });

  it('should handle side prop', () => {
    const { container: left } = render(
      <Sidebar side="left">
        <div>Sidebar</div>
        <div>Content</div>
      </Sidebar>
    );
    expect(left.firstChild).toBeTruthy();

    const { container: right } = render(
      <Sidebar side="right">
        <div>Sidebar</div>
        <div>Content</div>
      </Sidebar>
    );
    expect(right.firstChild).toBeTruthy();
  });

  it('should handle responsive prop', () => {
    const { container } = render(
      <Sidebar 
        sidebarWidth="20rem" 
        responsive={{ sm: { gap: 'lg', side: 'right' } }}
      >
        <div>Sidebar</div>
        <div>Content</div>
      </Sidebar>
    );
    
    const element = container.firstChild as HTMLElement;
    // Sidebar generates data-responsive for gap and side changes
    const dataResponsive = element.getAttribute('data-responsive');
    expect(dataResponsive).toBeTruthy();
    expect(dataResponsive).toContain('sm:gap');
    expect(dataResponsive).toContain('sm:side');
  });

  it('should support polymorphic as prop', () => {
    const { container } = render(
      <Sidebar as="aside">
        <div>Sidebar</div>
        <div>Content</div>
      </Sidebar>
    );
    
    expect(container.querySelector('aside')).toBeTruthy();
  });

  it('should render both children', () => {
    const { container } = render(
      <Sidebar>
        <div>Sidebar</div>
        <div>Content</div>
      </Sidebar>
    );
    
    expect(container.textContent).toContain('Sidebar');
    expect(container.textContent).toContain('Content');
  });

  it('should include the sidebar class for foundation styles', () => {
    const { container } = render(
      <Sidebar sidebarWidth="20rem">
        <div>Sidebar</div>
        <div>Content</div>
      </Sidebar>
    );
    const element = container.firstChild as HTMLElement;
    expect(element.classList.contains('sidebar')).toBe(true);
  });

  describe('containerQueries', () => {
    it('should set CSS variables for minWidth container queries', () => {
      const { container } = render(
        <Sidebar
          sidebarWidth="20rem"
          containerQueries={{
            minWidth: {
              '50rem': { sidebarWidth: '25rem', gap: 'lg' },
            },
          }}
        >
          <div>Sidebar</div>
          <div>Content</div>
        </Sidebar>
      );
      
      const element = container.firstChild as HTMLElement;
      
      // Should set CSS variables for container query breakpoints
      expect(element.style.getPropertyValue('--sidebar-template-columns-50rem')).toBeTruthy();
      expect(element.style.getPropertyValue('--sidebar-gap-50rem')).toBeTruthy();
    });

    it('should set CSS variables for maxWidth container queries', () => {
      const { container } = render(
        <Sidebar
          sidebarWidth="20rem"
          containerQueries={{
            maxWidth: {
              '40rem': { sidebarWidth: '0' },
            },
          }}
        >
          <div>Sidebar</div>
          <div>Content</div>
        </Sidebar>
      );
      
      const element = container.firstChild as HTMLElement;
      
      // Should set CSS variables for max-width container queries
      expect(element.style.getPropertyValue('--sidebar-template-columns-max-40rem')).toBeTruthy();
    });

    it('should maintain backward compatibility with responsive prop', () => {
      const { container } = render(
        <Sidebar
          sidebarWidth="20rem"
          responsive={{ sm: { gap: 'lg' } }}
          containerQueries={{
            minWidth: {
              '50rem': { sidebarWidth: '25rem' },
            },
          }}
        >
          <div>Sidebar</div>
          <div>Content</div>
        </Sidebar>
      );
      
      const element = container.firstChild as HTMLElement;
      
      // Should have both responsive data attribute and container query variables
      expect(element.getAttribute('data-responsive')).toBeTruthy();
      expect(element.style.getPropertyValue('--sidebar-template-columns-50rem')).toBeTruthy();
    });

    it('should handle both minWidth and maxWidth container queries', () => {
      const { container } = render(
        <Sidebar
          sidebarWidth="20rem"
          containerQueries={{
            minWidth: {
              '50rem': { sidebarWidth: '25rem' },
            },
            maxWidth: {
              '30rem': { sidebarWidth: '0' },
            },
          }}
        >
          <div>Sidebar</div>
          <div>Content</div>
        </Sidebar>
      );
      
      const element = container.firstChild as HTMLElement;
      
      // Should set variables for both min and max width queries
      expect(element.style.getPropertyValue('--sidebar-template-columns-50rem')).toBeTruthy();
      expect(element.style.getPropertyValue('--sidebar-template-columns-max-30rem')).toBeTruthy();
    });
  });
});


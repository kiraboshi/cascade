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
});


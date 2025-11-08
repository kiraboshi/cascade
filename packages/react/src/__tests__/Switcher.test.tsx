/**
 * Tests for Switcher component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Switcher } from '../Switcher';

describe('Switcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    const { container } = render(
      <Switcher>
        <div>Item 1</div>
        <div>Item 2</div>
      </Switcher>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element).toBeTruthy();
    expect(element.tagName).toBe('DIV');
  });

  it('should apply threshold', () => {
    const { container } = render(
      <Switcher threshold="30rem">
        <div>Item 1</div>
        <div>Item 2</div>
      </Switcher>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element.getAttribute('data-threshold')).toBe('30rem');
  });

  it('should apply gap', () => {
    const { container } = render(
      <Switcher gap="md">
        <div>Item 1</div>
        <div>Item 2</div>
      </Switcher>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--switcher-gap')).toBeTruthy();
  });

  it('should apply justify', () => {
    const { container } = render(
      <Switcher justify="center">
        <div>Item 1</div>
        <div>Item 2</div>
      </Switcher>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element.style.getPropertyValue('--switcher-justify')).toBe('center');
  });

  it('should apply limit', () => {
    const { container } = render(
      <Switcher limit={3}>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Switcher>
    );
    const element = container.firstChild as HTMLElement;
    
    expect(element.getAttribute('data-limit')).toBe('3');
  });

  it('should handle responsive prop', () => {
    const { container } = render(
      <Switcher 
        threshold="30rem" 
        responsive={{ sm: { threshold: '20rem' } }}
      >
        <div>Item 1</div>
        <div>Item 2</div>
      </Switcher>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.getAttribute('data-responsive')).toBeTruthy();
  });

  it('should support polymorphic as prop', () => {
    const { container } = render(
      <Switcher as="nav">
        <div>Item 1</div>
        <div>Item 2</div>
      </Switcher>
    );
    
    expect(container.querySelector('nav')).toBeTruthy();
  });

  it('should render children', () => {
    const { container } = render(
      <Switcher>
        <div>Item 1</div>
        <div>Item 2</div>
      </Switcher>
    );
    
    expect(container.textContent).toContain('Item 1');
    expect(container.textContent).toContain('Item 2');
  });

  it('should apply flexDirection based on threshold', async () => {
    const { container } = render(
      <Switcher threshold="1000px">
        <div>Item 1</div>
        <div>Item 2</div>
      </Switcher>
    );
    
    const element = container.firstChild as HTMLElement;
    
    // Wait for initial layout calculation
    await waitFor(() => {
      const flexDirection = element.style.flexDirection;
      expect(['row', 'column']).toContain(flexDirection);
    }, { timeout: 1000 });
  });
});


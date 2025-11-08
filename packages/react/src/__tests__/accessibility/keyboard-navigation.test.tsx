/**
 * Tests for keyboard navigation in interactive layouts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Grid, Switcher, Reel } from '../../index';

describe('Switcher Keyboard Navigation', () => {
  it('should navigate items with arrow keys when enabled', () => {
    const { container } = render(
      <Switcher keyboardNavigation={true}>
        <button>Item 1</button>
        <button>Item 2</button>
        <button>Item 3</button>
      </Switcher>
    );
    
    const buttons = container.querySelectorAll('button');
    const firstButton = buttons[0] as HTMLElement;
    
    // Focus first button
    firstButton.focus();
    
    // Arrow right should move to next
    fireEvent.keyDown(container.firstChild as HTMLElement, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[1]);
    
    // Arrow left should move to previous
    fireEvent.keyDown(container.firstChild as HTMLElement, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('should jump to first/last with Home/End', () => {
    const { container } = render(
      <Switcher keyboardNavigation={true}>
        <button>Item 1</button>
        <button>Item 2</button>
        <button>Item 3</button>
      </Switcher>
    );
    
    const buttons = container.querySelectorAll('button');
    const firstButton = buttons[0] as HTMLElement;
    const lastButton = buttons[2] as HTMLElement;
    
    // Focus middle button
    buttons[1].focus();
    
    // Home should jump to first
    fireEvent.keyDown(container.firstChild as HTMLElement, { key: 'Home' });
    expect(document.activeElement).toBe(firstButton);
    
    // End should jump to last
    fireEvent.keyDown(container.firstChild as HTMLElement, { key: 'End' });
    expect(document.activeElement).toBe(lastButton);
  });
});

describe('Reel Keyboard Scrolling', () => {
  it('should scroll with arrow keys when enabled', () => {
    const { container } = render(
      <Reel keyboardNavigation={true} style={{ width: '200px', overflowX: 'auto' }}>
        <div style={{ width: '100px' }}>Item 1</div>
        <div style={{ width: '100px' }}>Item 2</div>
        <div style={{ width: '100px' }}>Item 3</div>
      </Reel>
    );
    
    const reel = container.firstChild as HTMLElement;
    const initialScrollLeft = reel.scrollLeft;
    
    // Focus the reel
    reel.focus();
    
    // Arrow right should scroll
    fireEvent.keyDown(reel, { key: 'ArrowRight' });
    
    // Scroll position should have changed
    expect(reel.scrollLeft).toBeGreaterThan(initialScrollLeft);
  });

  it('should scroll to start/end with Home/End', () => {
    const { container } = render(
      <Reel keyboardNavigation={true} style={{ width: '200px', overflowX: 'auto' }}>
        <div style={{ width: '100px' }}>Item 1</div>
        <div style={{ width: '100px' }}>Item 2</div>
        <div style={{ width: '100px' }}>Item 3</div>
      </Reel>
    );
    
    const reel = container.firstChild as HTMLElement;
    
    // Scroll to middle
    reel.scrollLeft = 100;
    
    // Home should scroll to start
    reel.focus();
    fireEvent.keyDown(reel, { key: 'Home' });
    expect(reel.scrollLeft).toBe(0);
    
    // End should scroll to end
    fireEvent.keyDown(reel, { key: 'End' });
    expect(reel.scrollLeft).toBeGreaterThan(0);
  });
});

describe('Grid Keyboard Navigation', () => {
  it('should navigate cells with arrow keys when enabled', () => {
    const { container } = render(
      <Grid columns={3} keyboardNavigation={true}>
        <button>Cell 1</button>
        <button>Cell 2</button>
        <button>Cell 3</button>
        <button>Cell 4</button>
        <button>Cell 5</button>
        <button>Cell 6</button>
      </Grid>
    );
    
    const buttons = container.querySelectorAll('button');
    const firstButton = buttons[0] as HTMLElement;
    
    // Focus first button
    firstButton.focus();
    
    // Arrow right should move to next cell in row
    fireEvent.keyDown(container.firstChild as HTMLElement, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[1]);
    
    // Arrow down should move to cell below
    fireEvent.keyDown(container.firstChild as HTMLElement, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(buttons[4]); // 3 columns, so row 2 col 1
  });
});


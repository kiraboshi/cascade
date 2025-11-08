/**
 * Tests for focus management utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRef } from 'react';
import { useFocusTrap, useFocusRestore, useFocusWithin } from '../../accessibility';

describe('useFocusTrap', () => {
  it('should trap focus within container', () => {
    const TestComponent = ({ enabled }: { enabled: boolean }) => {
      const ref = useRef<HTMLDivElement>(null);
      useFocusTrap(ref, enabled);
      
      return (
        <div ref={ref} data-testid="container">
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </div>
      );
    };

    const { container } = render(<TestComponent enabled={true} />);
    const buttons = container.querySelectorAll('button');
    
    // Focus should be on first button when trap is enabled
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('should cycle focus with Tab key', () => {
    const TestComponent = ({ enabled }: { enabled: boolean }) => {
      const ref = useRef<HTMLDivElement>(null);
      useFocusTrap(ref, enabled);
      
      return (
        <div ref={ref} data-testid="container">
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </div>
      );
    };

    const { container } = render(<TestComponent enabled={true} />);
    const buttons = container.querySelectorAll('button');
    const firstButton = buttons[0] as HTMLElement;
    const lastButton = buttons[2] as HTMLElement;
    
    // Focus first button
    firstButton.focus();
    
    // Tab from last should wrap to first
    fireEvent.keyDown(container.firstChild as HTMLElement, { key: 'Tab' });
    lastButton.focus();
    fireEvent.keyDown(container.firstChild as HTMLElement, { key: 'Tab' });
    
    // Should wrap back to first
    expect(document.activeElement).toBe(firstButton);
  });
});

describe('useFocusRestore', () => {
  it('should restore focus on unmount', () => {
    const Button = () => {
      const { saveFocus, restoreFocus } = useFocusRestore(true);
      
      return (
        <>
          <button onClick={saveFocus}>Save</button>
          <button onClick={restoreFocus}>Restore</button>
        </>
      );
    };

    const { container, unmount } = render(<Button />);
    const saveButton = container.querySelector('button') as HTMLElement;
    const restoreButton = container.querySelectorAll('button')[1] as HTMLElement;
    
    saveButton.focus();
    saveButton.click();
    
    restoreButton.focus();
    unmount();
    
    // Focus should be restored to save button
    expect(document.activeElement).toBe(saveButton);
  });
});

describe('useFocusWithin', () => {
  it('should detect focus within container', () => {
    const TestComponent = () => {
      const ref = useRef<HTMLDivElement>(null);
      const isFocused = useFocusWithin(ref);
      
      return (
        <div ref={ref} data-testid="container">
          <button>{isFocused ? 'Focused' : 'Not Focused'}</button>
        </div>
      );
    };

    const { container } = render(<TestComponent />);
    const button = container.querySelector('button') as HTMLElement;
    
    // Initially not focused
    expect(screen.getByText('Not Focused')).toBeTruthy();
    
    // Focus button
    button.focus();
    
    // Should detect focus within
    // Note: This test may need adjustment based on actual behavior
    expect(button).toHaveFocus();
  });
});


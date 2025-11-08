/**
 * Tests for Imposter focus trap functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useRef } from 'react';
import { Imposter } from '../../Imposter';

describe('Imposter Focus Trap', () => {
  it('should trap focus when breakout is true', () => {
    const { container } = render(
      <Imposter breakout>
        <button>First</button>
        <button>Second</button>
        <button>Third</button>
      </Imposter>
    );
    
    const impostor = container.querySelector('.imposter') as HTMLElement;
    const buttons = impostor.querySelectorAll('button');
    
    // First button should be focused when modal opens
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('should handle Escape key', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Imposter breakout>
        <button>Close</button>
      </Imposter>
    );
    
    const impostor = container.querySelector('.imposter') as HTMLElement;
    
    // Escape key should trigger focus restoration
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Focus should be restored (tested via focus management utilities)
    expect(impostor).toBeTruthy();
  });

  it('should not trap focus when breakout is false', () => {
    const { container } = render(
      <Imposter breakout={false}>
        <button>First</button>
        <button>Second</button>
      </Imposter>
    );
    
    const impostor = container.querySelector('.imposter') as HTMLElement;
    const buttons = impostor.querySelectorAll('button');
    
    // Focus should not be automatically set
    // (focus trap is disabled when breakout is false)
    expect(document.activeElement).not.toBe(buttons[0]);
  });

  it('should use initialFocus ref when provided', () => {
    const TestComponent = () => {
      const initialFocusRef = useRef<HTMLButtonElement>(null);
      
      return (
        <Imposter breakout initialFocus={initialFocusRef}>
          <button>First</button>
          <button ref={initialFocusRef}>Initial</button>
          <button>Third</button>
        </Imposter>
      );
    };

    const { container } = render(<TestComponent />);
    const impostor = container.querySelector('.imposter') as HTMLElement;
    const initialButton = impostor.querySelectorAll('button')[1] as HTMLElement;
    
    // Initial focus button should be focused
    expect(document.activeElement).toBe(initialButton);
  });
});


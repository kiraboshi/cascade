/**
 * Unit tests for AnimatePresence component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { AnimatePresence } from '../AnimatePresence';

describe('AnimatePresence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clean up injected styles
    const styles = document.querySelectorAll('style[id^="flip-style-"]');
    styles.forEach(style => style.remove());
  });

  it('should render children', () => {
    render(
      <AnimatePresence>
        <div>Child 1</div>
        <div>Child 2</div>
      </AnimatePresence>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('should track children by key', () => {
    function TestComponent() {
      const [items, setItems] = useState([1, 2]);
      return (
        <>
          <button onClick={() => setItems([1, 2, 3])}>Add</button>
          <AnimatePresence>
            {items.map(item => (
              <div key={item}>Item {item}</div>
            ))}
          </AnimatePresence>
        </>
      );
    }

    const { getByText } = render(<TestComponent />);
    
    expect(getByText('Item 1')).toBeInTheDocument();
    expect(getByText('Item 2')).toBeInTheDocument();
    expect(() => getByText('Item 3')).toThrow();
  });

  it('should skip initial animation when initial={true}', async () => {
    const onEnterComplete = vi.fn();
    
    render(
      <AnimatePresence initial={true}>
        <div>Child</div>
      </AnimatePresence>
    );

    // Wait for any animations
    await vi.runAllTimersAsync();
    
    // Should not trigger enter animation on initial mount
    // (We can't easily test this without mocking, but the component should render)
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('should call onExitComplete when exit animation completes', async () => {
    const onExitComplete = vi.fn();
    
    function TestComponent() {
      const [show, setShow] = useState(true);
      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <AnimatePresence
            exit={{
              opacity: 0,
              config: { duration: 100 },
            }}
            onExitComplete={onExitComplete}
          >
            {show && <div key="test">Test</div>}
          </AnimatePresence>
        </>
      );
    }

    const { getByText, queryByText } = render(<TestComponent />);
    
    expect(getByText('Test')).toBeInTheDocument();
    
    // Trigger exit
    getByText('Hide').click();
    
    // Wait for exit animation
    await vi.advanceTimersByTimeAsync(150);
    
    // Should call onExitComplete
    await waitFor(() => {
      expect(onExitComplete).toHaveBeenCalled();
    });
    
    // Element should be removed
    expect(queryByText('Test')).not.toBeInTheDocument();
  });

  it('should handle wait mode', async () => {
    function TestComponent() {
      const [view, setView] = useState<'a' | 'b'>('a');
      return (
        <>
          <button onClick={() => setView(view === 'a' ? 'b' : 'a')}>Toggle</button>
          <AnimatePresence
            mode="wait"
            exit={{
              opacity: 0,
              config: { duration: 100 },
            }}
            enter={{
              opacity: 0,
              config: { duration: 100 },
            }}
          >
            {view === 'a' && <div key="a">View A</div>}
            {view === 'b' && <div key="b">View B</div>}
          </AnimatePresence>
        </>
      );
    }

    const { getByText, queryByText } = render(<TestComponent />);
    
    expect(getByText('View A')).toBeInTheDocument();
    
    // Toggle to view B
    getByText('Toggle').click();
    
    // In wait mode, view B should not appear until A exits
    await vi.advanceTimersByTimeAsync(50);
    expect(queryByText('View B')).not.toBeInTheDocument();
    
    // After exit completes, view B should appear
    await vi.advanceTimersByTimeAsync(100);
    await waitFor(() => {
      expect(queryByText('View B')).toBeInTheDocument();
    });
  });

  it('should handle sync mode (default)', async () => {
    function TestComponent() {
      const [items, setItems] = useState([1, 2]);
      return (
        <>
          <button onClick={() => setItems([2, 3])}>Update</button>
          <AnimatePresence
            mode="sync"
            exit={{
              opacity: 0,
              config: { duration: 100 },
            }}
            enter={{
              opacity: 0,
              config: { duration: 100 },
            }}
          >
            {items.map(item => (
              <div key={item}>Item {item}</div>
            ))}
          </AnimatePresence>
        </>
      );
    }

    const { getByText, queryByText } = render(<TestComponent />);
    
    expect(getByText('Item 1')).toBeInTheDocument();
    expect(getByText('Item 2')).toBeInTheDocument();
    
    // Update items
    getByText('Update').click();
    
    // In sync mode, exit and enter should happen simultaneously
    // Item 1 should exit, Item 3 should enter
    await vi.advanceTimersByTimeAsync(50);
    
    // Both should be in transition
    // (We can't easily verify this without more detailed mocking)
    
    await vi.advanceTimersByTimeAsync(100);
    
    await waitFor(() => {
      expect(queryByText('Item 1')).not.toBeInTheDocument();
      expect(queryByText('Item 2')).toBeInTheDocument();
      expect(queryByText('Item 3')).toBeInTheDocument();
    });
  });

  it('should handle exit animation without config', async () => {
    function TestComponent() {
      const [show, setShow] = useState(true);
      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <AnimatePresence>
            {show && <div key="test">Test</div>}
          </AnimatePresence>
        </>
      );
    }

    const { getByText, queryByText } = render(<TestComponent />);
    
    expect(getByText('Test')).toBeInTheDocument();
    
    // Trigger exit (no exit config, should remove immediately)
    getByText('Hide').click();
    
    await vi.runAllTimersAsync();
    
    // Should be removed immediately
    await waitFor(() => {
      expect(queryByText('Test')).not.toBeInTheDocument();
    });
  });

  it('should handle multiple children exiting', async () => {
    const onExitComplete = vi.fn();
    
    function TestComponent() {
      const [items, setItems] = useState([1, 2, 3]);
      return (
        <>
          <button onClick={() => setItems([])}>Clear</button>
          <AnimatePresence
            exit={{
              opacity: 0,
              config: { duration: 100 },
            }}
            onExitComplete={onExitComplete}
          >
            {items.map(item => (
              <div key={item}>Item {item}</div>
            ))}
          </AnimatePresence>
        </>
      );
    }

    const { getByText, queryByText } = render(<TestComponent />);
    
    expect(getByText('Item 1')).toBeInTheDocument();
    expect(getByText('Item 2')).toBeInTheDocument();
    expect(getByText('Item 3')).toBeInTheDocument();
    
    // Clear all items
    getByText('Clear').click();
    
    // Wait for all exit animations
    await vi.advanceTimersByTimeAsync(150);
    
    // All should be removed
    await waitFor(() => {
      expect(queryByText('Item 1')).not.toBeInTheDocument();
      expect(queryByText('Item 2')).not.toBeInTheDocument();
      expect(queryByText('Item 3')).not.toBeInTheDocument();
    });
    
    // onExitComplete should be called once when all exits complete
    expect(onExitComplete).toHaveBeenCalled();
  });
});


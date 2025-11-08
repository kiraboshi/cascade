/**
 * Tests for live region utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useLiveRegion } from '../../accessibility';

describe('useLiveRegion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render live region component', () => {
    const TestComponent = () => {
      const { LiveRegion } = useLiveRegion('polite');
      
      return (
        <>
          <LiveRegion />
          <div>Content</div>
        </>
      );
    };

    const { container } = render(<TestComponent />);
    const liveRegion = container.querySelector('[role="status"]');
    
    expect(liveRegion).toBeTruthy();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('should announce messages', () => {
    const TestComponent = () => {
      const { announce, LiveRegion } = useLiveRegion('polite');
      
      return (
        <>
          <LiveRegion />
          <button onClick={() => announce('Layout changed')}>Change</button>
        </>
      );
    };

    const { container } = render(<TestComponent />);
    const button = container.querySelector('button') as HTMLElement;
    const liveRegion = container.querySelector('[role="status"]') as HTMLElement;
    
    button.click();
    
    expect(liveRegion.textContent).toBe('Layout changed');
  });

  it('should clear announcement after timeout', async () => {
    const TestComponent = () => {
      const { announce, LiveRegion } = useLiveRegion('polite');
      
      return (
        <>
          <LiveRegion />
          <button onClick={() => announce('Message')}>Announce</button>
        </>
      );
    };

    const { container } = render(<TestComponent />);
    const button = container.querySelector('button') as HTMLElement;
    const liveRegion = container.querySelector('[role="status"]') as HTMLElement;
    
    button.click();
    expect(liveRegion.textContent).toBe('Message');
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(liveRegion.textContent).toBe('');
    });
  });

  it('should support assertive politeness', () => {
    const TestComponent = () => {
      const { LiveRegion } = useLiveRegion('assertive');
      
      return <LiveRegion />;
    };

    const { container } = render(<TestComponent />);
    const liveRegion = container.querySelector('[role="status"]') as HTMLElement;
    
    expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
  });
});


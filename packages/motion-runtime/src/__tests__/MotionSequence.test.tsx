/**
 * Tests for MotionSequence component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MotionSequence } from '../MotionSequence';
import { MotionStage } from '../MotionStage';

describe('MotionSequence', () => {
  beforeEach(() => {
    // Reset matchMedia mock
    vi.clearAllMocks();
  });

  it('should render children', () => {
    const { container } = render(
      <MotionSequence>
        <MotionStage animation="test-animation">
          <div>Test</div>
        </MotionStage>
      </MotionSequence>
    );
    
    expect(container.textContent).toContain('Test');
  });
  
  it('should respect prefers-reduced-motion', async () => {
    // Mock prefers-reduced-motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    const onComplete = vi.fn();
    render(
      <MotionSequence respectReducedMotion={true} onComplete={onComplete} autoStart={true}>
        <MotionStage animation="test-animation" />
      </MotionSequence>
    );
    
    // With reduced motion, onComplete should be called immediately
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    }, { timeout: 100 });
  });
});



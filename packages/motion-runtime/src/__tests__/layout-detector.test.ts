/**
 * Unit tests for layout change detection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectLayoutChanges, type LayoutChange } from '../layout-detector';
import { measureElement, type BoundingBox } from '../layout-utils';

describe('layout-detector', () => {
  let container: HTMLElement;
  let element1: HTMLElement;
  let element2: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '500px';
    container.style.height = '500px';
    document.body.appendChild(container);

    element1 = document.createElement('div');
    element1.style.position = 'absolute';
    element1.style.left = '0px';
    element1.style.top = '0px';
    element1.style.width = '100px';
    element1.style.height = '100px';
    element1.textContent = 'Element 1';
    container.appendChild(element1);

    element2 = document.createElement('div');
    element2.style.position = 'absolute';
    element2.style.left = '200px';
    element2.style.top = '200px';
    element2.style.width = '150px';
    element2.style.height = '120px';
    element2.textContent = 'Element 2';
    container.appendChild(element2);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('detectLayoutChanges', () => {
    it('should detect position changes', () => {
      // Mock initial bounds
      const initialRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => {},
      };
      vi.spyOn(element1, 'getBoundingClientRect').mockReturnValue(initialRect as DOMRect);
      
      const previousBounds = new Map<HTMLElement, BoundingBox>();
      previousBounds.set(element1, measureElement(element1));
      
      // Mock new position
      const newRect = {
        left: 100,
        top: 50,
        width: 100,
        height: 100,
        right: 200,
        bottom: 150,
        x: 100,
        y: 50,
        toJSON: () => {},
      };
      vi.spyOn(element1, 'getBoundingClientRect').mockReturnValue(newRect as DOMRect);
      
      const changes = detectLayoutChanges([element1], previousBounds);
      
      expect(changes).toHaveLength(1);
      expect(changes[0].element).toBe(element1);
      expect(changes[0].delta.x).toBe(100);
      expect(changes[0].delta.y).toBe(50);
    });

    it('should detect size changes', () => {
      // Mock initial bounds
      const initialRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => {},
      };
      vi.spyOn(element1, 'getBoundingClientRect').mockReturnValue(initialRect as DOMRect);
      
      const previousBounds = new Map<HTMLElement, BoundingBox>();
      previousBounds.set(element1, measureElement(element1));
      
      // Mock new size
      const newRect = {
        left: 0,
        top: 0,
        width: 200,
        height: 150,
        right: 200,
        bottom: 150,
        x: 0,
        y: 0,
        toJSON: () => {},
      };
      vi.spyOn(element1, 'getBoundingClientRect').mockReturnValue(newRect as DOMRect);
      
      const changes = detectLayoutChanges([element1], previousBounds);
      
      expect(changes).toHaveLength(1);
      expect(changes[0].delta.scaleX).toBe(2);
      expect(changes[0].delta.scaleY).toBe(1.5);
    });

    it('should detect combined position and size changes', () => {
      // Mock initial bounds
      const initialRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => {},
      };
      vi.spyOn(element1, 'getBoundingClientRect').mockReturnValue(initialRect as DOMRect);
      
      const previousBounds = new Map<HTMLElement, BoundingBox>();
      previousBounds.set(element1, measureElement(element1));
      
      // Mock new position and size
      const newRect = {
        left: 100,
        top: 50,
        width: 200,
        height: 150,
        right: 300,
        bottom: 200,
        x: 100,
        y: 50,
        toJSON: () => {},
      };
      vi.spyOn(element1, 'getBoundingClientRect').mockReturnValue(newRect as DOMRect);
      
      const changes = detectLayoutChanges([element1], previousBounds);
      
      expect(changes).toHaveLength(1);
      expect(changes[0].delta.x).toBe(100);
      expect(changes[0].delta.y).toBe(50);
      expect(changes[0].delta.scaleX).toBe(2);
      expect(changes[0].delta.scaleY).toBe(1.5);
    });

    it('should ignore insignificant changes (below threshold)', () => {
      const previousBounds = new Map<HTMLElement, BoundingBox>();
      const initialBounds = measureElement(element1);
      previousBounds.set(element1, initialBounds);
      
      // Tiny movement (less than 1px threshold)
      element1.style.left = '0.5px';
      element1.style.top = '0.5px';
      
      const changes = detectLayoutChanges([element1], previousBounds);
      
      expect(changes).toHaveLength(0);
    });

    it('should detect changes for multiple elements', () => {
      // Mock initial bounds
      const initialRect1 = {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => {},
      };
      const initialRect2 = {
        left: 200,
        top: 200,
        width: 150,
        height: 120,
        right: 350,
        bottom: 320,
        x: 200,
        y: 200,
        toJSON: () => {},
      };
      vi.spyOn(element1, 'getBoundingClientRect').mockReturnValue(initialRect1 as DOMRect);
      vi.spyOn(element2, 'getBoundingClientRect').mockReturnValue(initialRect2 as DOMRect);
      
      const previousBounds = new Map<HTMLElement, BoundingBox>();
      previousBounds.set(element1, measureElement(element1));
      previousBounds.set(element2, measureElement(element2));
      
      // Mock new positions
      const newRect1 = {
        left: 50,
        top: 0,
        width: 100,
        height: 100,
        right: 150,
        bottom: 100,
        x: 50,
        y: 0,
        toJSON: () => {},
      };
      const newRect2 = {
        left: 250,
        top: 200,
        width: 150,
        height: 120,
        right: 400,
        bottom: 320,
        x: 250,
        y: 200,
        toJSON: () => {},
      };
      vi.spyOn(element1, 'getBoundingClientRect').mockReturnValue(newRect1 as DOMRect);
      vi.spyOn(element2, 'getBoundingClientRect').mockReturnValue(newRect2 as DOMRect);
      
      const changes = detectLayoutChanges([element1, element2], previousBounds);
      
      expect(changes).toHaveLength(2);
    });

    it('should ignore elements without previous bounds', () => {
      const previousBounds = new Map<HTMLElement, BoundingBox>();
      // Don't add element1 to previousBounds
      
      element1.style.left = '100px';
      
      const changes = detectLayoutChanges([element1], previousBounds);
      
      expect(changes).toHaveLength(0);
    });

    it('should handle scale threshold correctly', () => {
      const previousBounds = new Map<HTMLElement, BoundingBox>();
      previousBounds.set(element1, measureElement(element1));
      
      // Very small scale change (less than 1% threshold)
      element1.style.width = '100.5px'; // 0.5% change
      
      const changes = detectLayoutChanges([element1], previousBounds);
      
      // Should be ignored due to scale threshold
      expect(changes).toHaveLength(0);
    });

    it('should include scale changes above threshold', () => {
      // Mock initial bounds
      const initialRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => {},
      };
      vi.spyOn(element1, 'getBoundingClientRect').mockReturnValue(initialRect as DOMRect);
      
      const previousBounds = new Map<HTMLElement, BoundingBox>();
      previousBounds.set(element1, measureElement(element1));
      
      // Mock scale change above 1% threshold (2% change)
      const newRect = {
        left: 0,
        top: 0,
        width: 102,
        height: 100,
        right: 102,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => {},
      };
      vi.spyOn(element1, 'getBoundingClientRect').mockReturnValue(newRect as DOMRect);
      
      const changes = detectLayoutChanges([element1], previousBounds);
      
      expect(changes).toHaveLength(1);
      expect(Math.abs(changes[0].delta.scaleX - 1)).toBeGreaterThan(0.01);
    });
  });
});


/**
 * Unit tests for layout utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { measureElement, calculateTransformDelta, measureElements, type BoundingBox, type TransformDelta } from '../layout-utils';

describe('layout-utils', () => {
  let container: HTMLElement;
  let element: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '500px';
    container.style.height = '500px';
    document.body.appendChild(container);

    element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '100px';
    element.style.top = '50px';
    element.style.width = '200px';
    element.style.height = '150px';
    container.appendChild(element);
    
    // Force layout calculation in jsdom
    void container.offsetWidth;
    void element.offsetWidth;
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('measureElement', () => {
    it('should measure element bounds correctly', () => {
      // In jsdom, getBoundingClientRect returns 0,0,0,0 unless we mock it
      // Mock getBoundingClientRect for this test
      const mockRect = {
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
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);
      
      const bounds = measureElement(element);
      
      expect(bounds.width).toBe(200);
      expect(bounds.height).toBe(150);
      expect(bounds.x).toBe(100);
      expect(bounds.y).toBe(50);
    });

    it('should account for scroll position', () => {
      window.scrollX = 50;
      window.scrollY = 25;
      
      const bounds = measureElement(element);
      const rect = element.getBoundingClientRect();
      
      expect(bounds.x).toBe(rect.left + 50);
      expect(bounds.y).toBe(rect.top + 25);
      
      // Reset
      window.scrollX = 0;
      window.scrollY = 0;
    });

    it('should handle elements with zero dimensions', () => {
      element.style.width = '0px';
      element.style.height = '0px';
      
      const bounds = measureElement(element);
      
      expect(bounds.width).toBe(0);
      expect(bounds.height).toBe(0);
    });
  });

  describe('calculateTransformDelta', () => {
    it('should calculate position delta correctly', () => {
      const from: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const to: BoundingBox = { x: 100, y: 50, width: 100, height: 100 };
      
      const delta = calculateTransformDelta(from, to);
      
      expect(delta.x).toBe(100);
      expect(delta.y).toBe(50);
      expect(delta.scaleX).toBe(1);
      expect(delta.scaleY).toBe(1);
    });

    it('should calculate scale delta correctly', () => {
      const from: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const to: BoundingBox = { x: 0, y: 0, width: 200, height: 150 };
      
      const delta = calculateTransformDelta(from, to);
      
      expect(delta.x).toBe(0);
      expect(delta.y).toBe(0);
      expect(delta.scaleX).toBe(2);
      expect(delta.scaleY).toBe(1.5);
    });

    it('should calculate combined position and scale delta', () => {
      const from: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const to: BoundingBox = { x: 50, y: 25, width: 200, height: 150 };
      
      const delta = calculateTransformDelta(from, to);
      
      expect(delta.x).toBe(50);
      expect(delta.y).toBe(25);
      expect(delta.scaleX).toBe(2);
      expect(delta.scaleY).toBe(1.5);
    });

    it('should handle zero width/height without division by zero', () => {
      const from: BoundingBox = { x: 0, y: 0, width: 0, height: 0 };
      const to: BoundingBox = { x: 100, y: 50, width: 200, height: 150 };
      
      const delta = calculateTransformDelta(from, to);
      
      expect(delta.x).toBe(100);
      expect(delta.y).toBe(50);
      expect(delta.scaleX).toBe(1); // Should default to 1 when from.width is 0
      expect(delta.scaleY).toBe(1); // Should default to 1 when from.height is 0
    });

    it('should handle negative deltas', () => {
      const from: BoundingBox = { x: 100, y: 100, width: 200, height: 200 };
      const to: BoundingBox = { x: 50, y: 25, width: 100, height: 100 };
      
      const delta = calculateTransformDelta(from, to);
      
      expect(delta.x).toBe(-50);
      expect(delta.y).toBe(-75);
      expect(delta.scaleX).toBe(0.5);
      expect(delta.scaleY).toBe(0.5);
    });
  });

  describe('measureElements', () => {
    it('should measure multiple elements', () => {
      const element2 = document.createElement('div');
      element2.style.position = 'absolute';
      element2.style.left = '300px';
      element2.style.top = '200px';
      element2.style.width = '100px';
      element2.style.height = '80px';
      container.appendChild(element2);

      // Mock getBoundingClientRect for both elements
      const mockRect1 = {
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
      const mockRect2 = {
        left: 300,
        top: 200,
        width: 100,
        height: 80,
        right: 400,
        bottom: 280,
        x: 300,
        y: 200,
        toJSON: () => {},
      };
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(mockRect1 as DOMRect);
      vi.spyOn(element2, 'getBoundingClientRect').mockReturnValue(mockRect2 as DOMRect);

      const bounds = measureElements([element, element2]);
      
      expect(bounds).toHaveLength(2);
      expect(bounds[0].width).toBe(200);
      expect(bounds[0].height).toBe(150);
      expect(bounds[1].width).toBe(100);
      expect(bounds[1].height).toBe(80);
    });

    it('should return empty array for empty input', () => {
      const bounds = measureElements([]);
      expect(bounds).toHaveLength(0);
    });
  });
});


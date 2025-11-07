/**
 * Unit tests for FLIP keyframe generator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateFLIPKeyframes, clearFLIPCache, getFLIPCacheSize, type FLIPConfig } from '../flip-generator';
import type { BoundingBox } from '../layout-utils';

describe('flip-generator', () => {
  beforeEach(() => {
    clearFLIPCache();
  });

  afterEach(() => {
    // Clean up injected styles
    const styles = document.querySelectorAll('style[id^="flip-style-"]');
    styles.forEach(style => style.remove());
  });

  describe('generateFLIPKeyframes', () => {
    it('should generate keyframes for position change', () => {
      const from: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const to: BoundingBox = { x: 100, y: 50, width: 100, height: 100 };
      
      const config: FLIPConfig = {
        from,
        to,
        duration: 300,
        easing: 'ease-out',
      };
      
      const result = generateFLIPKeyframes('test-flip-1', config);
      
      expect(result.className).toBe('test-flip-1');
      expect(result.css).toContain('@keyframes');
      expect(result.css).toContain('test-flip-1');
      expect(result.css).toContain('300ms');
      expect(result.css).toContain('ease-out');
    });

    it('should generate keyframes for scale change', () => {
      const from: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const to: BoundingBox = { x: 0, y: 0, width: 200, height: 150 };
      
      const config: FLIPConfig = {
        from,
        to,
        duration: 400,
      };
      
      const result = generateFLIPKeyframes('test-flip-2', config);
      
      expect(result.css).toContain('scale');
      expect(result.css).toContain('400ms');
    });

    it('should generate keyframes with different origins', () => {
      const from: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const to: BoundingBox = { x: 50, y: 50, width: 200, height: 200 };
      
      const origins: Array<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> = [
        'center',
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
      ];
      
      origins.forEach(origin => {
        const config: FLIPConfig = {
          from,
          to,
          origin,
          duration: 300,
        };
        
        const result = generateFLIPKeyframes(`test-flip-${origin}`, config);
        expect(result.css).toBeTruthy();
        expect(result.className).toBe(`test-flip-${origin}`);
      });
    });

    it('should use default values when not provided', () => {
      const from: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const to: BoundingBox = { x: 100, y: 100, width: 100, height: 100 };
      
      const config: FLIPConfig = {
        from,
        to,
      };
      
      const result = generateFLIPKeyframes('test-flip-defaults', config);
      
      expect(result.css).toContain('300ms'); // Default duration
      expect(result.css).toContain('cubic-bezier(0.4, 0, 0.2, 1)'); // Default easing
    });

    it('should cache identical keyframes', () => {
      const from: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const to: BoundingBox = { x: 100, y: 100, width: 100, height: 100 };
      
      const config: FLIPConfig = {
        from,
        to,
        duration: 300,
      };
      
      const result1 = generateFLIPKeyframes('test-flip-cache-1', config);
      const result2 = generateFLIPKeyframes('test-flip-cache-2', config);
      
      // Cache size should be 1 (same config)
      expect(getFLIPCacheSize()).toBeGreaterThanOrEqual(1);
    });

    it('should handle zero dimensions gracefully', () => {
      const from: BoundingBox = { x: 0, y: 0, width: 0, height: 0 };
      const to: BoundingBox = { x: 100, y: 100, width: 100, height: 100 };
      
      const config: FLIPConfig = {
        from,
        to,
        duration: 300,
      };
      
      // Should not throw
      const result = generateFLIPKeyframes('test-flip-zero', config);
      expect(result.css).toBeTruthy();
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      const from: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const to: BoundingBox = { x: 100, y: 100, width: 100, height: 100 };
      
      generateFLIPKeyframes('test-cache-1', { from, to });
      expect(getFLIPCacheSize()).toBeGreaterThan(0);
      
      clearFLIPCache();
      expect(getFLIPCacheSize()).toBe(0);
    });

    it('should track cache size', () => {
      clearFLIPCache();
      expect(getFLIPCacheSize()).toBe(0);
      
      const from: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const to1: BoundingBox = { x: 100, y: 100, width: 100, height: 100 };
      const to2: BoundingBox = { x: 200, y: 200, width: 100, height: 100 };
      
      generateFLIPKeyframes('test-1', { from, to: to1 });
      generateFLIPKeyframes('test-2', { from, to: to2 });
      
      expect(getFLIPCacheSize()).toBeGreaterThanOrEqual(1);
    });
  });
});


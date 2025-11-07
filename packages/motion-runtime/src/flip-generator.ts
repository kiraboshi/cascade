/**
 * FLIP Keyframe Generator
 * Generates CSS keyframes for FLIP (First, Last, Invert, Play) animations
 */

import { generateKeyframes, type KeyframeConfig } from '@cascade/compiler';
import { calculateTransformDelta, type BoundingBox } from './layout-utils';

export interface FLIPConfig {
  from: BoundingBox;
  to: BoundingBox;
  duration?: number;
  easing?: string;
  origin?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// Cache for generated keyframes to avoid regeneration
const keyframeCache = new Map<string, { css: string; className: string }>();

/**
 * Generate a cache key from FLIP config
 */
function getCacheKey(config: FLIPConfig): string {
  const { from, to, duration = 300, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', origin = 'center' } = config;
  return `${from.x},${from.y},${from.width},${from.height}-${to.x},${to.y},${to.width},${to.height}-${duration}-${easing}-${origin}`;
}

/**
 * Internal function to generate FLIP keyframes
 */
function generateFLIPKeyframesInternal(
  name: string,
  config: FLIPConfig
): { css: string; className: string } {
  const { from, to, duration = 300, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', origin = 'center' } = config;
  
  // Handle edge case: zero dimensions
  if (from.width === 0 || from.height === 0 || to.width === 0 || to.height === 0) {
    // Use opacity fade instead of transform
    const keyframeConfig: KeyframeConfig = {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: `${duration}ms` as any, // generateKeyframes expects string but type says number
      easing,
    };
    return generateKeyframes(name, keyframeConfig);
  }
  
  // Calculate transform delta
  const delta = calculateTransformDelta(from, to);
  
  // Calculate transform origin offset for scaling
  // Transform-origin should be relative to the FROM bounds (initial position)
  // because we want to scale from the corners/center of where the element originally was
  // However, the element is positioned at its final position (to bounds) when animation runs,
  // so we need to calculate the origin in the TO bounds coordinate space
  
  // Calculate transform-origin values
  // Use percentages for better browser compatibility in CSS
  let originXValue: string;
  let originYValue: string;
  
  // Calculate origin in FROM bounds (what we want visually)
  let fromOriginX: number;
  let fromOriginY: number;
  
  // Calculate origin in TO bounds (what we need for CSS transform-origin)
  // Since the element is at TO position, transform-origin is relative to TO size
  let originX: number;
  let originY: number;
  
  switch (origin) {
    case 'center':
      originXValue = '50%';
      originYValue = '50%';
      fromOriginX = from.width / 2;
      fromOriginY = from.height / 2;
      // Map from origin to to bounds: scale the origin point
      originX = (fromOriginX / from.width) * to.width;
      originY = (fromOriginY / from.height) * to.height;
      break;
    case 'top-left':
      originXValue = '0%';
      originYValue = '0%';
      fromOriginX = 0;
      fromOriginY = 0;
      originX = 0;
      originY = 0;
      break;
    case 'top-right':
      originXValue = '100%';
      originYValue = '0%';
      fromOriginX = from.width;
      fromOriginY = 0;
      originX = to.width;
      originY = 0;
      break;
    case 'bottom-left':
      originXValue = '0%';
      originYValue = '100%';
      fromOriginX = 0;
      fromOriginY = from.height;
      originX = 0;
      originY = to.height;
      break;
    case 'bottom-right':
      originXValue = '100%';
      originYValue = '100%';
      fromOriginX = from.width;
      fromOriginY = from.height;
      originX = to.width;
      originY = to.height;
      break;
  }
  
  // Handle edge case: division by zero in scale calculation
  const scaleX = delta.scaleX !== 0 ? 1 / delta.scaleX : 1;
  const scaleY = delta.scaleY !== 0 ? 1 / delta.scaleY : 1;
  
  // Calculate transform adjustment for transform-origin
  // We want to scale from the corners/center of the FROM bounds (original bounding box)
  // The transform-origin CSS property uses TO bounds (element's current size)
  // But for the transform calculation, we need to use the FROM bounds origin
  //
  // When you apply `translate(tx, ty) scale(sx, sy)` with transform-origin (ox, oy),
  // the browser effectively does:
  // 1. Translate by (-ox, -oy) to move origin to (0, 0)
  // 2. Scale by (sx, sy)
  // 3. Translate by (ox, oy) to move origin back
  // 4. Translate by (tx, ty)
  //
  // This results in: translate(tx - ox*(sx-1), ty - oy*(sy-1)) scale(sx, sy)
  //
  // For FLIP, we want to scale from the FROM bounds origin point.
  // The origin point in FROM bounds space needs to be mapped to TO bounds space for CSS,
  // but for the transform calculation, we use the FROM bounds origin directly.
  // However, since the element is at TO position, we need to account for the mapping.
  //
  // Actually, we should use the FROM bounds origin for the transform calculation:
  const originAdjustX = fromOriginX * (scaleX - 1);
  const originAdjustY = fromOriginY * (scaleY - 1);
  
  // Generate keyframes using FLIP technique:
  // FROM: Invert the delta (move element back to original position visually)
  // TO: Transform to identity (element is now in correct position)
  // Note: We SUBTRACT the origin adjustment because the browser adds it automatically
  // Note: generateKeyframes expects duration as string '300ms' but type says number
  const keyframeConfig: KeyframeConfig = {
    from: {
      transform: `translate(${-delta.x - originAdjustX}px, ${-delta.y - originAdjustY}px) scale(${scaleX}, ${scaleY})`,
    },
    to: {
      transform: 'translate(0, 0) scale(1, 1)',
    },
    duration: `${duration}ms` as any,
    easing,
  };
  
  const result = generateKeyframes(name, keyframeConfig);
  
  // Return the CSS as-is - we'll handle transform-origin via inline styles
  // This is more reliable than trying to inject it into CSS
  return {
    css: result.css,
    className: result.className,
  };
}

/**
 * Generate CSS keyframes for FLIP animation
 * Uses caching to avoid regenerating identical keyframes
 */
export function generateFLIPKeyframes(
  name: string,
  config: FLIPConfig
): { css: string; className: string } {
  const cacheKey = getCacheKey(config);
  
  if (keyframeCache.has(cacheKey)) {
    // Return cached version but with new name
    // IMPORTANT: We need to regenerate with the new name to ensure transform-origin is correct
    // because the cached version might have a different transform-origin if origin changed
    // So we'll just regenerate instead of using cache when name changes
    const cached = keyframeCache.get(cacheKey)!;
    
    // Only use cache if the name matches (same animation)
    if (cached.className === name) {
      return cached;
    }
    
    // Otherwise regenerate to ensure transform-origin is correct
    // (This happens when regenerate is clicked with same params but new name)
  }
  
  // Generate new keyframes
  const result = generateFLIPKeyframesInternal(name, config);
  keyframeCache.set(cacheKey, result);
  
  return result;
}

/**
 * Clear the keyframe cache (useful for testing or memory management)
 */
export function clearFLIPCache(): void {
  keyframeCache.clear();
}

/**
 * Get the current cache size (useful for debugging)
 */
export function getFLIPCacheSize(): number {
  return keyframeCache.size;
}


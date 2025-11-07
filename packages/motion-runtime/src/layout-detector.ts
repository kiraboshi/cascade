/**
 * Layout Change Detection
 * Detects when layout changes occur and calculates transform deltas
 */

import { measureElement, calculateTransformDelta, type BoundingBox, type TransformDelta } from './layout-utils';
import { debugLog } from './debug';

export interface LayoutChange {
  element: HTMLElement;
  from: BoundingBox;
  to: BoundingBox;
  delta: TransformDelta;
}

/**
 * Detect layout changes by comparing current bounds with previous bounds
 * Only returns changes that exceed the threshold to avoid jitter
 */
export function detectLayoutChanges(
  elements: HTMLElement[],
  previousBounds: Map<HTMLElement, BoundingBox>
): LayoutChange[] {
  const changes: LayoutChange[] = [];
  
  debugLog('detectLayoutChanges', 'Starting detection', {
    elementCount: elements.length,
    previousBoundsSize: previousBounds.size,
    previousBoundsKeys: Array.from(previousBounds.keys()).map(el => el.textContent?.substring(0, 20) || 'unknown'),
  });
  
  for (const element of elements) {
    const currentBounds = measureElement(element);
    const previous = previousBounds.get(element);
    
    debugLog('detectLayoutChanges', 'Checking element', {
      element: element.textContent?.substring(0, 20) || 'unknown',
      hasPrevious: !!previous,
      currentBounds,
      previousBounds: previous || null,
    });
    
    if (previous) {
      const delta = calculateTransformDelta(previous, currentBounds);
      
      debugLog('detectLayoutChanges', 'Delta calculated', {
        element: element.textContent?.substring(0, 20) || 'unknown',
        delta,
      });
      
      // Only create change if delta is significant (avoid jitter)
      const threshold = 1; // pixels
      const scaleThreshold = 0.01; // 1% scale change
      
      const isSignificant = 
        Math.abs(delta.x) > threshold ||
        Math.abs(delta.y) > threshold ||
        Math.abs(delta.scaleX - 1) > scaleThreshold ||
        Math.abs(delta.scaleY - 1) > scaleThreshold;
      
      debugLog('detectLayoutChanges', 'Significance check', {
        element: element.textContent?.substring(0, 20) || 'unknown',
        isSignificant,
        deltaX: Math.abs(delta.x),
        deltaY: Math.abs(delta.y),
        deltaScaleX: Math.abs(delta.scaleX - 1),
        deltaScaleY: Math.abs(delta.scaleY - 1),
      });
      
      if (isSignificant) {
        changes.push({
          element,
          from: previous,
          to: currentBounds,
          delta,
        });
        debugLog('detectLayoutChanges', 'Added change', {
          element: element.textContent?.substring(0, 20) || 'unknown',
          from: previous,
          to: currentBounds,
        });
      }
    } else {
      debugLog('detectLayoutChanges', 'No previous bounds found for element', {
        element: element.textContent?.substring(0, 20) || 'unknown',
      });
    }
  }
  
  debugLog('detectLayoutChanges', 'Detection complete', {
    changeCount: changes.length,
  });
  
  return changes;
}


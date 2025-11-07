/**
 * Layout Measurement Utilities
 * Functions for measuring element bounds and calculating transform deltas
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TransformDelta {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

/**
 * Measure a single element's bounding box
 * Returns position and dimensions relative to the document
 */
export function measureElement(element: HTMLElement): BoundingBox {
  const rect = element.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset || 0;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  
  return {
    x: rect.left + scrollX,
    y: rect.top + scrollY,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Calculate the transform delta between two bounding boxes
 * Returns the translation and scale needed to transform from one to the other
 */
export function calculateTransformDelta(
  from: BoundingBox,
  to: BoundingBox
): TransformDelta {
  // Calculate position delta
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  
  // Calculate scale delta
  // Avoid division by zero
  const scaleX = from.width > 0 ? to.width / from.width : 1;
  const scaleY = from.height > 0 ? to.height / from.height : 1;
  
  return {
    x: deltaX,
    y: deltaY,
    scaleX,
    scaleY,
  };
}

/**
 * Measure multiple elements' bounding boxes
 * Returns an array of bounding boxes in the same order as the input elements
 */
export function measureElements(elements: HTMLElement[]): BoundingBox[] {
  return elements.map(measureElement);
}


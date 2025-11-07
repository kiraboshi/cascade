/**
 * Velocity Tracker
 * Tracks velocity over recent points for spring physics
 */

interface Point {
  x: number;
  y: number;
  timestamp: number;
}

export class VelocityTracker {
  private points: Point[] = [];
  private readonly maxPoints = 10;
  private readonly timeWindow = 100; // ms
  
  addPoint(point: Point): void {
    this.points.push(point);
    
    // Remove old points
    const now = point.timestamp;
    this.points = this.points.filter(
      p => now - p.timestamp < this.timeWindow
    );
    
    // Limit to max points
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }
  }
  
  getVelocity(): { x: number; y: number } {
    if (this.points.length < 2) {
      return { x: 0, y: 0 };
    }
    
    const first = this.points[0];
    const last = this.points[this.points.length - 1];
    
    const dt = (last.timestamp - first.timestamp) / 1000; // Convert to seconds
    if (dt === 0) return { x: 0, y: 0 };
    
    return {
      x: (last.x - first.x) / dt,
      y: (last.y - first.y) / dt,
    };
  }
  
  reset(): void {
    this.points = [];
  }
}



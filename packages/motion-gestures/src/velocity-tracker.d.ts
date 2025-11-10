/**
 * Velocity Tracker
 * Tracks velocity over recent points for spring physics
 */
interface Point {
    x: number;
    y: number;
    timestamp: number;
}
export declare class VelocityTracker {
    private points;
    private readonly maxPoints;
    private readonly timeWindow;
    addPoint(point: Point): void;
    getVelocity(): {
        x: number;
        y: number;
    };
    reset(): void;
}
export {};
//# sourceMappingURL=velocity-tracker.d.ts.map
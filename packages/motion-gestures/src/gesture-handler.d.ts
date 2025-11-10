/**
 * Core Gesture Handler
 * Handles pointer/touch events and maps them to MotionValues
 */
import type { MotionValue } from '@cascade/motion-runtime';
import type { SpringConfig } from '@cascade/compiler';
export interface GestureState {
    isActive: boolean;
    delta: {
        x: number;
        y: number;
    };
    velocity: {
        x: number;
        y: number;
    };
    startPoint: {
        x: number;
        y: number;
    };
    currentPoint: {
        x: number;
        y: number;
    };
}
export interface GestureConfig {
    onStart?: (state: GestureState, event: PointerEvent | WheelEvent) => void;
    onMove?: (state: GestureState, event: Event) => void;
    onEnd?: (state: GestureState) => void;
    spring?: SpringConfig;
    constraints?: {
        min?: {
            x?: number;
            y?: number;
        };
        max?: {
            x?: number;
            y?: number;
        };
    };
    axis?: 'x' | 'y' | 'both';
    threshold?: number;
}
export interface GestureHandler {
    start(): void;
    stop(): void;
    isActive(): boolean;
    getState(): GestureState;
}
export declare class GestureHandlerImpl implements GestureHandler {
    private element;
    private motionValues;
    private config;
    private state;
    private velocityTracker;
    private rafId;
    private isStarted;
    private initialMotionValues;
    constructor(element: HTMLElement, motionValues: {
        x?: MotionValue<number>;
        y?: MotionValue<number>;
    }, config?: GestureConfig);
    private createInitialState;
    private handlePointerDown;
    private handlePointerMove;
    private handlePointerUp;
    private applySpringAnimation;
    private attachMoveListeners;
    private detachMoveListeners;
    start(): void;
    stop(): void;
    isActive(): boolean;
    getState(): GestureState;
}
export declare function createGestureHandler(element: HTMLElement, motionValues: {
    x?: MotionValue<number>;
    y?: MotionValue<number>;
}, config?: GestureConfig): GestureHandler;
//# sourceMappingURL=gesture-handler.d.ts.map
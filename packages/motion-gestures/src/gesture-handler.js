/**
 * Core Gesture Handler
 * Handles pointer/touch events and maps them to MotionValues
 */
import { VelocityTracker } from './velocity-tracker';
import { animateSpringWithVelocity } from './spring-bridge';
export class GestureHandlerImpl {
    element;
    motionValues;
    config;
    state;
    velocityTracker;
    rafId = null;
    isStarted = false;
    initialMotionValues = { x: 0, y: 0 };
    constructor(element, motionValues, config = {}) {
        this.element = element;
        this.motionValues = motionValues;
        this.config = config;
        this.state = this.createInitialState();
        this.velocityTracker = new VelocityTracker();
    }
    createInitialState() {
        return {
            isActive: false,
            delta: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            startPoint: { x: 0, y: 0 },
            currentPoint: { x: 0, y: 0 },
        };
    }
    handlePointerDown = (event) => {
        if (this.state.isActive)
            return;
        this.element.setPointerCapture(event.pointerId);
        this.state.isActive = true;
        this.state.startPoint = { x: event.clientX, y: event.clientY };
        this.state.currentPoint = { ...this.state.startPoint };
        this.state.delta = { x: 0, y: 0 };
        // Store initial motion values for relative calculation
        // The motion values at pointer down become the "origin" for this gesture
        this.initialMotionValues = {
            x: this.motionValues.x?.get() || 0,
            y: this.motionValues.y?.get() || 0,
        };
        this.velocityTracker.reset();
        this.velocityTracker.addPoint({
            x: event.clientX,
            y: event.clientY,
            timestamp: event.timeStamp,
        });
        this.config.onStart?.(this.state, event);
        this.attachMoveListeners();
    };
    handlePointerMove = (event) => {
        if (!this.state.isActive)
            return;
        // Only process events for the captured pointer
        // When listening on document, we need to verify this is our pointer
        if (typeof this.element.hasPointerCapture === 'function') {
            if (!this.element.hasPointerCapture(event.pointerId)) {
                return;
            }
        }
        const deltaX = event.clientX - this.state.startPoint.x;
        const deltaY = event.clientY - this.state.startPoint.y;
        // Check threshold
        if (this.config.threshold !== undefined) {
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance < this.config.threshold) {
                return;
            }
        }
        // Apply axis constraint
        const delta = {
            x: this.config.axis === 'y' ? 0 : deltaX,
            y: this.config.axis === 'x' ? 0 : deltaY,
        };
        this.state.delta = delta;
        this.state.currentPoint = { x: event.clientX, y: event.clientY };
        // Track velocity
        this.velocityTracker.addPoint({
            x: event.clientX,
            y: event.clientY,
            timestamp: event.timeStamp,
        });
        // Calculate new absolute positions relative to initial motion values
        // The delta is relative to where the pointer started
        let newX = this.initialMotionValues.x + delta.x;
        let newY = this.initialMotionValues.y + delta.y;
        // Apply constraints
        if (this.config.constraints) {
            if (this.config.constraints.min) {
                newX = Math.max(newX, this.config.constraints.min.x ?? -Infinity);
                newY = Math.max(newY, this.config.constraints.min.y ?? -Infinity);
            }
            if (this.config.constraints.max) {
                newX = Math.min(newX, this.config.constraints.max.x ?? Infinity);
                newY = Math.min(newY, this.config.constraints.max.y ?? Infinity);
            }
        }
        // Update motion values with absolute positions
        if (this.motionValues.x) {
            this.motionValues.x.set(newX);
        }
        if (this.motionValues.y) {
            this.motionValues.y.set(newY);
        }
        this.config.onMove?.(this.state, event);
    };
    handlePointerUp = (event) => {
        if (!this.state.isActive)
            return;
        // Only process events for the captured pointer
        if (typeof this.element.hasPointerCapture === 'function') {
            if (!this.element.hasPointerCapture(event.pointerId)) {
                return;
            }
            this.element.releasePointerCapture(event.pointerId);
        }
        this.state.isActive = false;
        // Get final velocity
        this.state.velocity = this.velocityTracker.getVelocity();
        this.config.onEnd?.(this.state);
        this.detachMoveListeners();
        // Apply spring animation if configured
        if (this.config.spring) {
            this.applySpringAnimation();
        }
    };
    applySpringAnimation() {
        const { spring } = this.config;
        if (!spring)
            return;
        // Return to initial position (where gesture started)
        // The initialMotionValues represent where the element was when drag started
        const targetX = this.initialMotionValues.x;
        const targetY = this.initialMotionValues.y;
        // Use velocity from gesture
        if (this.motionValues.x) {
            const currentX = this.motionValues.x.get();
            animateSpringWithVelocity(this.motionValues.x, targetX, {
                ...spring,
                from: currentX,
                to: targetX,
                initialVelocity: this.state.velocity.x,
            });
        }
        if (this.motionValues.y) {
            const currentY = this.motionValues.y.get();
            animateSpringWithVelocity(this.motionValues.y, targetY, {
                ...spring,
                from: currentY,
                to: targetY,
                initialVelocity: this.state.velocity.y,
            });
        }
    }
    attachMoveListeners() {
        // When using pointer capture, events are redirected to the capturing element
        // But we also listen on document to catch events outside the element
        document.addEventListener('pointermove', this.handlePointerMove);
        document.addEventListener('pointerup', this.handlePointerUp);
        document.addEventListener('pointercancel', this.handlePointerUp);
    }
    detachMoveListeners() {
        document.removeEventListener('pointermove', this.handlePointerMove);
        document.removeEventListener('pointerup', this.handlePointerUp);
        document.removeEventListener('pointercancel', this.handlePointerUp);
    }
    start() {
        if (this.isStarted)
            return;
        this.isStarted = true;
        this.element.addEventListener('pointerdown', this.handlePointerDown, {
            passive: false,
        });
    }
    stop() {
        if (!this.isStarted)
            return;
        this.isStarted = false;
        this.element.removeEventListener('pointerdown', this.handlePointerDown);
        this.detachMoveListeners();
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.state.isActive = false;
    }
    isActive() {
        return this.state.isActive;
    }
    getState() {
        return { ...this.state };
    }
}
export function createGestureHandler(element, motionValues, config = {}) {
    return new GestureHandlerImpl(element, motionValues, config);
}
//# sourceMappingURL=gesture-handler.js.map
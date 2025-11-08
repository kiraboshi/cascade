/**
 * Animation Timeline System
 * Provides control over animation playback (play, pause, reverse, seek)
 */

import { solveSpring, type SpringConfig } from '@cascade/compiler';
import { debugLog, debugWarn, debugError } from './debug';

export interface TimelineState {
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isReversed: boolean;
  progress: number;
  currentTime: number;
}

export interface AnimationTimeline {
  /**
   * Current progress (0-1)
   */
  readonly progress: number;
  
  /**
   * Current time (ms)
   */
  readonly currentTime: number;
  
  /**
   * Total duration (ms)
   */
  readonly duration: number;
  
  /**
   * Is animation playing
   */
  readonly isPlaying: boolean;
  
  /**
   * Is animation paused
   */
  readonly isPaused: boolean;
  
  /**
   * Is animation completed
   */
  readonly isCompleted: boolean;
  
  /**
   * Is animation reversed
   */
  readonly isReversed: boolean;
  
  /**
   * Play animation
   */
  play(): void;
  
  /**
   * Pause animation
   */
  pause(): void;
  
  /**
   * Reverse animation direction
   */
  reverse(): void;
  
  /**
   * Seek to specific progress (0-1) or time (ms)
   */
  seek(target: number | { time: number } | { progress: number }): void;
  
  /**
   * Reset animation to start
   */
  reset(): void;
  
  /**
   * Cancel animation
   */
  cancel(): void;
  
  /**
   * Subscribe to progress updates
   */
  onProgress(callback: (progress: number) => void): () => void;
  
  /**
   * Subscribe to state changes
   */
  onStateChange(callback: (state: TimelineState) => void): () => void;
}

/**
 * Implementation of AnimationTimeline for fixed-duration animations
 */
export class AnimationTimelineImpl implements AnimationTimeline {
  private _progress = 0;
  private _currentTime = 0;
  private readonly _duration: number;
  private _isPlaying = false;
  private _isPaused = false;
  private _isCompleted = false;
  private _isReversed = false;
  private _startTime: number | null = null;
  private _pausedTime: number | null = null;
  private rafId: number | null = null;
  private progressCallbacks = new Set<(progress: number) => void>();
  private stateCallbacks = new Set<(state: TimelineState) => void>();
  private readonly updateCallback: (progress: number) => void;
  
  constructor(
    duration: number,
    updateCallback: (progress: number) => void
  ) {
    if (duration <= 0) {
      throw new Error('Duration must be greater than 0');
    }
    this._duration = duration;
    this.updateCallback = updateCallback;
  }
  
  get progress(): number {
    return this._progress;
  }
  
  get currentTime(): number {
    return this._currentTime;
  }
  
  get duration(): number {
    return this._duration;
  }
  
  get isPlaying(): boolean {
    return this._isPlaying;
  }
  
  get isPaused(): boolean {
    return this._isPaused;
  }
  
  get isCompleted(): boolean {
    return this._isCompleted;
  }
  
  get isReversed(): boolean {
    return this._isReversed;
  }
  
  play(): void {
    // Reset if completed and not reversed
    if (this._isCompleted && !this._isReversed) {
      this._progress = 0;
      this._currentTime = 0;
      this._isCompleted = false;
    }
    
    if (this._isPaused) {
      // Resume from paused position
      const elapsedTime = this._pausedTime || 0;
      this._startTime = performance.now() - elapsedTime;
      this._pausedTime = null;
    } else {
      // Start from current progress
      const startProgress = this._isReversed ? 1 - this._progress : this._progress;
      // Ensure we have a valid progress value
      const validProgress = isNaN(startProgress) ? 0 : Math.max(0, Math.min(1, startProgress));
      this._startTime = performance.now() - (validProgress * this._duration);
    }
    
    this._isPlaying = true;
    this._isPaused = false;
    this._isCompleted = false;
    
    this.animate();
    this.notifyStateChange();
  }
  
  pause(): void {
    if (!this._isPlaying) return;
    
    this._isPaused = true;
    this._isPlaying = false;
    this._pausedTime = this._currentTime;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.notifyStateChange();
  }
  
  reverse(): void {
    this._isReversed = !this._isReversed;
    
    if (this._isPlaying) {
      // Reverse direction while playing
      const currentProgress = this._progress;
      const currentTime = this._currentTime;
      const remainingTime = this._isReversed
        ? currentTime
        : this._duration - currentTime;
      
      this._startTime = performance.now() - remainingTime;
    }
    
    this.notifyStateChange();
  }
  
  seek(target: number | { time: number } | { progress: number }): void {
    let progress: number;
    
    if (typeof target === 'number') {
      // Assume progress (0-1)
      progress = Math.max(0, Math.min(1, target));
    } else if ('time' in target) {
      // Time in ms
      progress = Math.max(0, Math.min(1, target.time / this._duration));
    } else {
      // Progress (0-1)
      progress = Math.max(0, Math.min(1, target.progress));
    }
    
    this._progress = progress;
    this._currentTime = progress * this._duration;
    
    // Check if this seek completes the animation
    const wasCompleted = this._isCompleted;
    if ((!this._isReversed && progress >= 1) || (this._isReversed && progress <= 0)) {
      if (!wasCompleted) {
        this._isCompleted = true;
        this._isPlaying = false;
        this._startTime = null;
        this.notifyStateChange();
      }
    } else {
      this._isCompleted = false;
    }
    
    // Update animation value
    this.updateCallback(progress);
    
    // Update start time if playing
    if (this._isPlaying && !this._isCompleted) {
      const effectiveProgress = this._isReversed ? 1 - progress : progress;
      this._startTime = performance.now() - (effectiveProgress * this._duration);
    }
    
    this.notifyProgress();
  }
  
  reset(): void {
    this._isPlaying = false;
    this._isPaused = false;
    this._progress = 0;
    this._currentTime = 0;
    this._isCompleted = false;
    this._isReversed = false;
    this._startTime = null;
    this._pausedTime = null;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.updateCallback(0);
    this.notifyProgress();
    this.notifyStateChange();
  }
  
  cancel(): void {
    this._isPlaying = false;
    this._isPaused = false;
    this._isCompleted = false;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.notifyStateChange();
  }
  
  onProgress(callback: (progress: number) => void): () => void {
    this.progressCallbacks.add(callback);
    return () => {
      this.progressCallbacks.delete(callback);
    };
  }
  
  onStateChange(callback: (state: TimelineState) => void): () => void {
    this.stateCallbacks.add(callback);
    return () => {
      this.stateCallbacks.delete(callback);
    };
  }
  
  private animate(): void {
    const animateFrame = (timestamp: number) => {
      if (!this._isPlaying || this._startTime === null) {
        return;
      }
      
      const elapsed = timestamp - this._startTime;
      const rawProgress = elapsed / this._duration;
      
      if (this._isReversed) {
        this._progress = Math.max(0, 1 - rawProgress);
        this._currentTime = Math.max(0, this._duration - elapsed);
      } else {
        this._progress = Math.min(1, rawProgress);
        this._currentTime = Math.min(this._duration, elapsed);
      }
      
      // Update animation value
      this.updateCallback(this._progress);
      this.notifyProgress();
      
      // Check if completed
      if ((this._isReversed && this._progress <= 0) || (!this._isReversed && this._progress >= 1)) {
        this._isCompleted = true;
        this._isPlaying = false;
        this._startTime = null;
        this.notifyStateChange();
        return;
      }
      
      this.rafId = requestAnimationFrame(animateFrame);
    };
    
    this.rafId = requestAnimationFrame(animateFrame);
  }
  
  private notifyProgress(): void {
    this.progressCallbacks.forEach(cb => {
      try {
        cb(this._progress);
      } catch (error) {
        debugError('AnimationTimeline', 'Error in progress callback:', error);
      }
    });
  }
  
  private notifyStateChange(): void {
    const state: TimelineState = {
      isPlaying: this._isPlaying,
      isPaused: this._isPaused,
      isCompleted: this._isCompleted,
      isReversed: this._isReversed,
      progress: this._progress,
      currentTime: this._currentTime,
    };
    
    this.stateCallbacks.forEach(cb => {
      try {
        cb(state);
      } catch (error) {
        debugError('AnimationTimeline', 'Error in state callback:', error);
      }
    });
  }
}

/**
 * Implementation of AnimationTimeline for spring physics animations
 * Pre-solves spring for seek support and handles variable duration
 */
export class SpringAnimationTimeline implements AnimationTimeline {
  private _progress = 0;
  private _currentTime = 0;
  private readonly _estimatedDuration: number;
  private _isPlaying = false;
  private _isPaused = false;
  private _isCompleted = false;
  private _isReversed = false;
  private _startTime: number | null = null;
  private _pausedTime: number | null = null;
  private rafId: number | null = null;
  private progressCallbacks = new Set<(progress: number) => void>();
  private stateCallbacks = new Set<(state: TimelineState) => void>();
  private readonly updateCallback: (value: number) => void;
  private readonly springConfig: SpringConfig;
  private readonly solvedValues: number[];
  private readonly from: number;
  private readonly to: number;
  private currentValue: number;
  private currentVelocity: number;
  private lastFrameTime: number | null = null;
  
  constructor(
    springConfig: SpringConfig,
    from: number,
    to: number,
    updateCallback: (value: number) => void,
    estimatedDuration?: number
  ) {
    this.springConfig = springConfig;
    this.from = from;
    this.to = to;
    this.updateCallback = updateCallback;
    this.currentValue = from;
    this.currentVelocity = springConfig.initialVelocity || 0;
    
    // Estimate duration if not provided (springs typically settle in 1-2 seconds)
    this._estimatedDuration = estimatedDuration || 2000;
    
    // Pre-solve spring for seek support
    // Use higher resolution for smoother seeking (120 steps for 2 seconds = 60fps)
    const steps = Math.max(60, Math.floor(this._estimatedDuration / 16.67)); // ~60fps
    
    debugLog('SpringAnimationTimeline', 'animationTimeline', 'constructor:', {
      springConfig,
      springConfigType: typeof springConfig,
      springConfigKeys: Object.keys(springConfig || {}),
      springConfigValues: springConfig ? Object.entries(springConfig).map(([k, v]) => [k, v, typeof v, isNaN(v as number) ? 'NaN' : 'valid']) : null,
      from,
      to,
      fromType: typeof from,
      toType: typeof to,
      estimatedDuration: this._estimatedDuration,
      steps
    });
    
    try {
      // Extract only the properties we need for solveSpring
      // Don't spread the config - explicitly extract each property to avoid passing invalid values
      const stiffness = (springConfig as any).stiffness;
      const damping = (springConfig as any).damping;
      const mass = (springConfig as any).mass;
      const initialVelocity = (springConfig as any).initialVelocity;
      
      // Validate required properties
      if (typeof stiffness !== 'number' || isNaN(stiffness) || stiffness <= 0) {
        throw new Error(`Invalid stiffness: ${stiffness}`);
      }
      if (typeof damping !== 'number' || isNaN(damping) || damping < 0) {
        throw new Error(`Invalid damping: ${damping}`);
      }
      if (typeof this.from !== 'number' || isNaN(this.from)) {
        throw new Error(`Invalid from: ${this.from}`);
      }
      if (typeof this.to !== 'number' || isNaN(this.to)) {
        throw new Error(`Invalid to: ${this.to}`);
      }
      
      // Ensure mass is a valid positive number
      const validMass = (typeof mass === 'number' && !isNaN(mass) && mass > 0) 
        ? mass 
        : 1;
      const validInitialVelocity = (typeof initialVelocity === 'number' && !isNaN(initialVelocity))
        ? initialVelocity
        : 0;
      
      const configWithFromTo: SpringConfig = {
        stiffness,
        damping,
        mass: validMass,
        from: this.from, // Use constructor parameter, not config
        to: this.to,     // Use constructor parameter, not config
        initialVelocity: validInitialVelocity
      };
      
      debugLog('SpringAnimationTimeline', 'animationTimeline', 'calling solveSpring with:', {
        configForSolver: configWithFromTo,
        duration: this._estimatedDuration,
        steps,
        from: this.from,
        to: this.to,
        stiffness,
        damping,
        mass: validMass,
        initialVelocity: validInitialVelocity,
        allPropsValid: Object.values(configWithFromTo).every(v => typeof v === 'number' && !isNaN(v)),
        configString: JSON.stringify(configWithFromTo)
      });
      
      this.solvedValues = solveSpring(configWithFromTo, this._estimatedDuration, steps);
      
      const firstValue = this.solvedValues[0];
      const lastValue = this.solvedValues[this.solvedValues.length - 1];
      const hasNaN = this.solvedValues.some(v => isNaN(v));
      
      debugLog('SpringAnimationTimeline', 'animationTimeline', 'solveSpring returned:', {
        solvedValuesLength: this.solvedValues.length,
        firstValue,
        lastValue,
        firstValueType: typeof firstValue,
        lastValueType: typeof lastValue,
        firstValueIsNaN: isNaN(firstValue),
        lastValueIsNaN: isNaN(lastValue),
        sampleValues: this.solvedValues.slice(0, 10),
        hasNaN,
        first10Values: this.solvedValues.slice(0, 10),
        last10Values: this.solvedValues.slice(-10),
        valuesAroundIndex63: this.solvedValues.slice(60, 70),
        allValuesSample: this.solvedValues.slice(0, 20).map((v, i) => ({ index: i, value: v, isNaN: isNaN(v) }))
      });
      
      if (hasNaN) {
        debugError('SpringAnimationTimeline', 'solveSpring returned NaN values! Falling back to linear interpolation.', {
          config: configWithFromTo,
          duration: this._estimatedDuration,
          steps,
          firstInvalidIndex: this.solvedValues.findIndex(v => isNaN(v)),
          invalidValuesCount: this.solvedValues.filter(v => isNaN(v)).length
        });
        // Fallback to linear interpolation if solveSpring produces NaN
        this.solvedValues = [];
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          this.solvedValues.push(this.from + (this.to - this.from) * t);
        }
        debugLog('SpringAnimationTimeline', 'animationTimeline', 'Using linear interpolation fallback:', {
          solvedValuesLength: this.solvedValues.length,
          firstValue: this.solvedValues[0],
          lastValue: this.solvedValues[this.solvedValues.length - 1]
        });
      }
    } catch (error) {
      // Fallback to simple interpolation if solveSpring fails
      debugWarn('SpringAnimationTimeline', 'animationTimeline', 'Spring solver failed, using linear interpolation:', error);
      this.solvedValues = [];
      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        this.solvedValues.push(from + (to - from) * progress);
      }
      debugLog('SpringAnimationTimeline', 'animationTimeline', 'Fallback linear interpolation:', {
        solvedValuesLength: this.solvedValues.length,
        firstValue: this.solvedValues[0],
        lastValue: this.solvedValues[this.solvedValues.length - 1]
      });
    }
  }
  
  get progress(): number {
    return this._progress;
  }
  
  get currentTime(): number {
    return this._currentTime;
  }
  
  get duration(): number {
    return this._estimatedDuration;
  }
  
  get isPlaying(): boolean {
    return this._isPlaying;
  }
  
  get isPaused(): boolean {
    return this._isPaused;
  }
  
  get isCompleted(): boolean {
    return this._isCompleted;
  }
  
  get isReversed(): boolean {
    return this._isReversed;
  }
  
  play(): void {
    // Don't restart if already playing (unless paused or completed)
    if (this._isPlaying && !this._isPaused && !this._isCompleted) {
      debugLog('SpringAnimationTimeline', 'animationTimeline', 'play() called but already playing, skipping');
      return;
    }
    
    // Reset if completed and not reversed
    if (this._isCompleted && !this._isReversed) {
      this._progress = 0;
      this._currentTime = 0;
      this._isCompleted = false;
      this.currentValue = this.from;
      this.currentVelocity = this.springConfig.initialVelocity || 0;
    }
    
    if (this._isPaused) {
      // Resume from paused position
      const elapsedTime = this._pausedTime || 0;
      this._startTime = performance.now() - elapsedTime;
      this._pausedTime = null;
    } else {
      // Start from current progress
      const startProgress = this._isReversed ? 1 - this._progress : this._progress;
      const validProgress = isNaN(startProgress) ? 0 : Math.max(0, Math.min(1, startProgress));
      this._startTime = performance.now() - (validProgress * this._estimatedDuration);
      
      // Update current value/velocity based on progress if starting mid-animation
      if (validProgress > 0 && this.solvedValues.length > 0) {
        const index = Math.floor(validProgress * (this.solvedValues.length - 1));
        this.currentValue = this.solvedValues[index];
        // Estimate velocity from adjacent values
        if (index < this.solvedValues.length - 1) {
          const nextValue = this.solvedValues[index + 1];
          const timeStep = this._estimatedDuration / (this.solvedValues.length - 1);
          this.currentVelocity = (nextValue - this.currentValue) / (timeStep / 1000);
        } else {
          this.currentVelocity = 0;
        }
      }
    }
    
    this._isPlaying = true;
    this._isPaused = false;
    this._isCompleted = false;
    
    // Ensure initial value is set correctly before starting animation
    debugLog('SpringAnimationTimeline', 'animationTimeline', 'play() called:', {
      progress: this._progress,
      isReversed: this._isReversed,
      solvedValuesLength: this.solvedValues.length,
      from: this.from,
      to: this.to,
      startTime: this._startTime
    });
    
    if (this.solvedValues.length > 0) {
      const startProgress = this._isReversed ? 1 - this._progress : this._progress;
      const validStartProgress = isNaN(startProgress) ? 0 : Math.max(0, Math.min(1, startProgress));
      const startIndex = Math.floor(validStartProgress * (this.solvedValues.length - 1));
      const startValue = this.solvedValues[startIndex];
      
      debugLog('SpringAnimationTimeline', 'animationTimeline', 'play() setting initial value from solved values:', {
        startProgress,
        validStartProgress,
        startIndex,
        startValue,
        valueAtIndex: this.solvedValues[startIndex]
      });
      
      if (isNaN(startValue)) {
        debugError('SpringAnimationTimeline', 'play() NaN startValue!', {
          startIndex,
          solvedValuesLength: this.solvedValues.length,
          solvedValueAtIndex: this.solvedValues[startIndex]
        });
      }
      
      this.currentValue = startValue;
      this.updateCallback(startValue);
    } else if (this._progress === 0 && !this._isReversed) {
      // Set initial value if starting from beginning
      debugLog('SpringAnimationTimeline', 'animationTimeline', 'play() setting initial value from "from":', {
        from: this.from
      });
      this.currentValue = this.from;
      this.updateCallback(this.from);
    }
    
    this.animate();
    this.notifyStateChange();
  }
  
  pause(): void {
    if (!this._isPlaying) return;
    
    this._isPaused = true;
    this._isPlaying = false;
    this._pausedTime = this._currentTime;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.notifyStateChange();
  }
  
  reverse(): void {
    this._isReversed = !this._isReversed;
    
    if (this._isPlaying) {
      // Reverse direction while playing
      const currentProgress = this._progress;
      const currentTime = this._currentTime;
      const remainingTime = this._isReversed
        ? currentTime
        : this._estimatedDuration - currentTime;
      
      this._startTime = performance.now() - remainingTime;
    }
    
    this.notifyStateChange();
  }
  
  seek(target: number | { time: number } | { progress: number }): void {
    let progress: number;
    
    if (typeof target === 'number') {
      // Assume progress (0-1)
      progress = Math.max(0, Math.min(1, target));
    } else if ('time' in target) {
      // Time in ms
      progress = Math.max(0, Math.min(1, target.time / this._estimatedDuration));
    } else {
      // Progress (0-1)
      progress = Math.max(0, Math.min(1, target.progress));
    }
    
    this._progress = progress;
    this._currentTime = progress * this._estimatedDuration;
    
    // Use pre-solved values for seek
    if (this.solvedValues.length > 0) {
      const index = Math.min(
        Math.floor(progress * (this.solvedValues.length - 1)),
        this.solvedValues.length - 1
      );
      const value = this.solvedValues[index];
      this.currentValue = value;
      
      // Estimate velocity from adjacent values
      if (index < this.solvedValues.length - 1) {
        const nextValue = this.solvedValues[index + 1];
        const timeStep = this._estimatedDuration / (this.solvedValues.length - 1);
        this.currentVelocity = (nextValue - value) / (timeStep / 1000);
      } else {
        this.currentVelocity = 0;
      }
      
      // Update animation value
      this.updateCallback(value);
    } else {
      // Fallback to linear interpolation
      const value = this.from + (this.to - this.from) * progress;
      this.currentValue = value;
      this.currentVelocity = 0;
      this.updateCallback(value);
    }
    
    // Check if this seek completes the animation
    const wasCompleted = this._isCompleted;
    if ((!this._isReversed && progress >= 1) || (this._isReversed && progress <= 0)) {
      if (!wasCompleted) {
        this._isCompleted = true;
        this._isPlaying = false;
        this._startTime = null;
        this.notifyStateChange();
      }
    } else {
      this._isCompleted = false;
    }
    
    // Update start time if playing
    if (this._isPlaying && !this._isCompleted) {
      const effectiveProgress = this._isReversed ? 1 - progress : progress;
      this._startTime = performance.now() - (effectiveProgress * this._estimatedDuration);
    }
    
    this.notifyProgress();
  }
  
  reset(): void {
    this._isPlaying = false;
    this._isPaused = false;
    this._progress = 0;
    this._currentTime = 0;
    this._isCompleted = false;
    this._isReversed = false;
    this._startTime = null;
    this._pausedTime = null;
    this.currentValue = this.from;
    this.currentVelocity = this.springConfig.initialVelocity || 0;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.updateCallback(this.from);
    this.notifyProgress();
    this.notifyStateChange();
  }
  
  cancel(): void {
    this._isPlaying = false;
    this._isPaused = false;
    this._isCompleted = false;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.notifyStateChange();
  }
  
  onProgress(callback: (progress: number) => void): () => void {
    this.progressCallbacks.add(callback);
    return () => {
      this.progressCallbacks.delete(callback);
    };
  }
  
  onStateChange(callback: (state: TimelineState) => void): () => void {
    this.stateCallbacks.add(callback);
    return () => {
      this.stateCallbacks.delete(callback);
    };
  }
  
  private animate(): void {
    const animateFrame = (timestamp: number) => {
      if (!this._isPlaying || this._startTime === null) {
        debugLog('SpringAnimationTimeline', 'animationTimeline', 'animateFrame: not playing or startTime is null', {
          isPlaying: this._isPlaying,
          startTime: this._startTime
        });
        return;
      }
      
      if (this.lastFrameTime === null) {
        this.lastFrameTime = timestamp;
        debugLog('SpringAnimationTimeline', 'animationTimeline', 'animateFrame: first frame, skipping', {
          timestamp,
          startTime: this._startTime
        });
        // Don't update on first frame, wait for next frame to get proper elapsed time
        this.rafId = requestAnimationFrame(animateFrame);
        return;
      }
      
      const elapsed = timestamp - this._startTime;
      const progress = Math.min(1, Math.max(0, elapsed / this._estimatedDuration));
      
      debugLog('SpringAnimationTimeline', 'animationTimeline', 'animateFrame:', {
        timestamp,
        startTime: this._startTime,
        elapsed,
        estimatedDuration: this._estimatedDuration,
        progress,
        solvedValuesLength: this.solvedValues.length,
        from: this.from,
        to: this.to,
        isReversed: this._isReversed
      });
      
      // Use pre-solved values for animation
      if (this.solvedValues.length > 0) {
        const effectiveProgress = this._isReversed ? 1 - progress : progress;
        const clampedProgress = Math.max(0, Math.min(1, effectiveProgress));
        const index = Math.min(
          Math.floor(clampedProgress * (this.solvedValues.length - 1)),
          this.solvedValues.length - 1
        );
        const value = this.solvedValues[index];
        
        debugLog('SpringAnimationTimeline', 'animationTimeline', 'using solved values:', {
          effectiveProgress,
          clampedProgress,
          index,
          value,
          valueAtIndex: this.solvedValues[index],
          solvedValuesSample: this.solvedValues.slice(0, 5),
          solvedValuesEnd: this.solvedValues.slice(-5),
          valuesAroundIndex: this.solvedValues.slice(Math.max(0, index - 2), Math.min(this.solvedValues.length, index + 3)),
          arrayLength: this.solvedValues.length,
          isValidIndex: index >= 0 && index < this.solvedValues.length
        });
        
        if (isNaN(value)) {
          debugError('SpringAnimationTimeline', 'NaN value detected!', {
            index,
            solvedValuesLength: this.solvedValues.length,
            clampedProgress,
            solvedValueAtIndex: this.solvedValues[index],
            allSolvedValues: this.solvedValues
          });
        }
        
        this.currentValue = value;
        
        // Update progress and time
        this._progress = clampedProgress;
        this._currentTime = clampedProgress * this._estimatedDuration;
        
        // Update animation value
        this.updateCallback(value);
        this.notifyProgress();
        
        // Check if completed
        const targetValue = this._isReversed ? this.from : this.to;
        const exceededDuration = elapsed >= this._estimatedDuration;
        
        // Only complete if we've exceeded duration or reached the end
        // Don't check for "settled" during animation as spring values are pre-solved
        if (exceededDuration || clampedProgress >= 1) {
          this._isCompleted = true;
          this._isPlaying = false;
          this._startTime = null;
          this.lastFrameTime = null;
          // Ensure final value is set exactly
          this.updateCallback(targetValue);
          this.notifyStateChange();
          return;
        }
        
        // For reversed animations, complete when reaching start
        if (this._isReversed && clampedProgress <= 0) {
          this._isCompleted = true;
          this._isPlaying = false;
          this._startTime = null;
          this.lastFrameTime = null;
          this.updateCallback(this.from);
          this.notifyStateChange();
          return;
        }
      } else {
        // Fallback to linear interpolation
        const effectiveProgress = this._isReversed ? 1 - progress : progress;
        const value = this.from + (this.to - this.from) * effectiveProgress;
        this.currentValue = value;
        this._progress = effectiveProgress;
        this._currentTime = effectiveProgress * this._estimatedDuration;
        this.updateCallback(value);
        this.notifyProgress();
        
        if (effectiveProgress >= 1 || effectiveProgress <= 0 || elapsed >= this._estimatedDuration) {
          this._isCompleted = true;
          this._isPlaying = false;
          this._startTime = null;
          this.lastFrameTime = null;
          this.updateCallback(this._isReversed ? this.from : this.to);
          this.notifyStateChange();
          return;
        }
      }
      
      this.lastFrameTime = timestamp;
      this.rafId = requestAnimationFrame(animateFrame);
    };
    
    this.rafId = requestAnimationFrame(animateFrame);
  }
  
  private isSpringSettled(
    value: number,
    velocity: number,
    target: number,
    threshold: number = 0.001
  ): boolean {
    const positionDiff = Math.abs(value - target);
    const velocityMagnitude = Math.abs(velocity);
    return positionDiff < threshold && velocityMagnitude < threshold;
  }
  
  private notifyProgress(): void {
    this.progressCallbacks.forEach(cb => {
      try {
        cb(this._progress);
      } catch (error) {
        debugError('AnimationTimeline', 'Error in progress callback:', error);
      }
    });
  }
  
  private notifyStateChange(): void {
    const state: TimelineState = {
      isPlaying: this._isPlaying,
      isPaused: this._isPaused,
      isCompleted: this._isCompleted,
      isReversed: this._isReversed,
      progress: this._progress,
      currentTime: this._currentTime,
    };
    
    this.stateCallbacks.forEach(cb => {
      try {
        cb(state);
      } catch (error) {
        debugError('AnimationTimeline', 'Error in state callback:', error);
      }
    });
  }
}


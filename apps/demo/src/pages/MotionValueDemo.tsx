/**
 * Demo page for Reactive Motion Values
 */

import { useEffect, useState, useRef } from 'react';
import { Stack } from '@cascade/react';
import { 
  useMotionValue,
  useTranslateX,
  useTranslateY,
  useRotate,
  useScale,
} from '@cascade/motion-runtime';

export function MotionValueDemo() {
  return (
    <Stack spacing="lg">
      <div>
        <h2>Reactive Motion Values</h2>
        <p>Runtime-controlled animations using CSS custom properties and spring physics</p>
      </div>
      
      <section>
        <h3>Basic Animation</h3>
        <p>Simple translateX animation with spring physics</p>
        <BasicMotionValue />
      </section>
      
      <section>
        <h3>Multiple Values</h3>
        <p>Animating multiple properties simultaneously</p>
        <MultiValueAnimation />
      </section>
      
      <section>
        <h3>Value Tracking</h3>
        <p>Subscribe to value changes in real-time</p>
        <ValueTracking />
      </section>
      
      <section>
        <h3>Animation Controls</h3>
        <p>Control animation playback with play, pause, reverse, and seek</p>
        <AnimationControlsDemo />
      </section>
      
      <section>
        <h3>Timeline Scrubbing</h3>
        <p>Interactive timeline with progress tracking</p>
        <TimelineScrubbingDemo />
      </section>
      
      <section>
        <h3>Interactive Spring Animation</h3>
        <p>Click to trigger a bounce animation</p>
        <SpringAnimation />
      </section>
      
      <section>
        <h3>Transform Helpers</h3>
        <p>Convenient helper functions for common transforms</p>
        <TransformHelpersDemo />
      </section>
      
      <section>
        <h3>Multi-Transform Support</h3>
        <p>Combine multiple transforms into a single CSS variable</p>
        <MultiTransformDemo />
      </section>
      
      <section>
        <h3>GPU Acceleration Comparison</h3>
        <p>Performance comparison between GPU-accelerated and layout properties</p>
        <GPUAccelerationDemo />
      </section>
      
      <section>
        <h3>Transform Modes</h3>
        <p>Different transform mode configurations</p>
        <TransformModeDemo />
      </section>
      
      <section>
        <h3>Performance Optimizations</h3>
        <p>Batching, debouncing, and will-change hints</p>
        <PerformanceDemo />
      </section>
      
      <section>
        <h3>Interactive 3D Card</h3>
        <p>Complex multi-transform example</p>
        <Interactive3DCard />
      </section>
      
      <section>
        <h3>Spring Physics Playground</h3>
        <p>Interactive spring configuration tester</p>
        <SpringPlayground />
      </section>
      
      <section>
        <h3>Value Inspector</h3>
        <p>Developer tool for inspecting motion values</p>
        <ValueInspectorDemo />
      </section>
    </Stack>
  );
}

function BasicMotionValue() {
  const x = useMotionValue(0, { property: 'transform', unit: 'px' });
  const [currentX, setCurrentX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    // Subscribe to value changes to trigger re-renders
    const unsubscribe = x.onChange((value: number) => {
      setCurrentX(value);
    });
    
    return unsubscribe;
  }, [x]);
  
  const handleStart = async () => {
    setIsAnimating(true);
    await x.animateTo(400, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 400 });
    setIsAnimating(false);
  };
  
  const handleReset = () => {
    x.stop();
    x.set(0);
    setCurrentX(0);
    setIsAnimating(false);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleStart} disabled={isAnimating}>
          {isAnimating ? 'Animating...' : 'Start'}
        </button>
        <button onClick={handleReset} disabled={isAnimating}>
          Reset
        </button>
      </div>
      <div
        style={{
          width: '100px',
          height: '100px',
          backgroundColor: '#3b82f6',
          borderRadius: '8px',
          transform: `translateX(${currentX}px)`,
          transition: 'background-color 0.2s',
        }}
      >
        Animated
      </div>
    </div>
  );
}

function MultiValueAnimation() {
  const x = useMotionValue(0, { unit: 'px' });
  const opacity = useMotionValue(1);
  const [currentX, setCurrentX] = useState(0);
  const [currentOpacity, setCurrentOpacity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const unsubscribeX = x.onChange((value: number) => {
      setCurrentX(value);
    });
    const unsubscribeOpacity = opacity.onChange((value: number) => {
      setCurrentOpacity(value);
    });
    
    return () => {
      unsubscribeX();
      unsubscribeOpacity();
    };
  }, [x, opacity]);
  
  const handleStart = async () => {
    setIsAnimating(true);
    await Promise.all([
      x.animateTo(400, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 400 }),
      opacity.animateTo(0.3, { stiffness: 200, damping: 25, mass: 1, from: 1, to: 0.3 }),
    ]);
    setIsAnimating(false);
  };
  
  const handleReset = () => {
    x.stop();
    opacity.stop();
    x.set(0);
    opacity.set(1);
    setCurrentX(0);
    setCurrentOpacity(1);
    setIsAnimating(false);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleStart} disabled={isAnimating}>
          {isAnimating ? 'Animating...' : 'Start'}
        </button>
        <button onClick={handleReset} disabled={isAnimating}>
          Reset
        </button>
      </div>
      <div style={{ position: 'relative', height: '120px' }}>
        {/* Background to show opacity change */}
        <div
          style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            backgroundColor: '#e5e7eb',
            borderRadius: '8px',
            border: '2px dashed #9ca3af',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            backgroundColor: '#10b981',
            borderRadius: '8px',
            transform: `translateX(${currentX}px)`,
            opacity: currentOpacity,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          Opacity: {(currentOpacity * 100).toFixed(0)}%
        </div>
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
        X: {currentX.toFixed(0)}px, Opacity: {currentOpacity.toFixed(2)}
      </div>
    </div>
  );
}

function ValueTracking() {
  const x = useMotionValue(0);
  const [log, setLog] = useState<number[]>([]);
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const unsubscribe = x.onChange((value: number) => {
      setLog(prev => [...prev.slice(-9), value]); // Keep last 10 values
      setCurrentValue(value);
    });
    
    return unsubscribe;
  }, [x]);
  
  const handleStart = async () => {
    setIsAnimating(true);
    setLog([]); // Clear log
    await x.animateTo(200, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 200 });
    setIsAnimating(false);
  };
  
  const handleReset = () => {
    x.stop();
    x.set(0);
    setCurrentValue(0);
    setLog([]);
    setIsAnimating(false);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleStart} disabled={isAnimating}>
          {isAnimating ? 'Animating...' : 'Start'}
        </button>
        <button onClick={handleReset} disabled={isAnimating}>
          Reset
        </button>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        Current Value: <strong>{currentValue.toFixed(2)}</strong>
      </div>
      <div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          Recent Values ({log.length}):
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
          {log.length > 0 ? log.map((v, i) => (
            <div key={i}>{v.toFixed(2)}</div>
          )) : 'No values yet...'}
        </div>
      </div>
    </div>
  );
}

function AnimationControlsDemo() {
  const x = useMotionValue(0, { property: 'x', unit: 'px' });
  const [currentX, setCurrentX] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const unsubscribe = x.onChange(setCurrentX);
    return unsubscribe;
  }, [x]);
  
  useEffect(() => {
    const timeline = x.getTimeline();
    if (timeline) {
      const unsubscribeState = timeline.onStateChange((state) => {
        setIsPlaying(state.isPlaying);
        setIsPaused(state.isPaused);
        setIsReversed(state.isReversed);
        setProgress(state.progress);
      });
      
      const unsubscribeProgress = timeline.onProgress(setProgress);
      
      return () => {
        unsubscribeState();
        unsubscribeProgress();
      };
    } else {
      setIsPlaying(false);
      setIsPaused(false);
      setIsReversed(false);
      setProgress(0);
    }
  }, [x]);
  
  const handleStart = () => {
    x.animateTo(400, { duration: 2000, easing: 'ease-in-out' });
  };
  
  const handlePlay = () => {
    x.play();
  };
  
  const handlePause = () => {
    x.pause();
  };
  
  const handleReverse = () => {
    x.reverse();
  };
  
  const handleSeek = (targetProgress: number) => {
    x.seek(targetProgress);
  };
  
  const handleReset = () => {
    x.stop();
    x.set(0);
    setCurrentX(0);
    setIsPlaying(false);
    setIsPaused(false);
    setIsReversed(false);
    setProgress(0);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={handleStart} disabled={isPlaying && !isPaused}>
          Start Animation
        </button>
        <button onClick={handlePlay} disabled={isPlaying || !x.getTimeline()}>
          ▶ Play
        </button>
        <button onClick={handlePause} disabled={!isPlaying || isPaused}>
          ⏸ Pause
        </button>
        <button onClick={handleReverse} disabled={!x.getTimeline()}>
          ↺ Reverse
        </button>
        <button onClick={() => handleSeek(0.25)} disabled={!x.getTimeline()}>
          Seek 25%
        </button>
        <button onClick={() => handleSeek(0.5)} disabled={!x.getTimeline()}>
          Seek 50%
        </button>
        <button onClick={() => handleSeek(0.75)} disabled={!x.getTimeline()}>
          Seek 75%
        </button>
        <button onClick={handleReset}>
          Reset
        </button>
      </div>
      
      <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          <strong>State:</strong> {isPlaying ? (isPaused ? '⏸ Paused' : '▶ Playing') : '⏹ Stopped'} 
          {isReversed && ' (Reversed)'}
        </div>
        <div style={{ fontSize: '0.875rem' }}>
          <strong>Progress:</strong> {Math.round(progress * 100)}% | 
          <strong> Position:</strong> {currentX.toFixed(0)}px
        </div>
      </div>
      
      <div
        style={{
          width: '100px',
          height: '100px',
          backgroundColor: '#3b82f6',
          borderRadius: '8px',
          transform: `translateX(${currentX}px)`,
          transition: 'background-color 0.2s',
        }}
      >
        Controlled
      </div>
    </div>
  );
}

function TimelineScrubbingDemo() {
  const x = useMotionValue(0, { property: 'x', unit: 'px' });
  const [currentX, setCurrentX] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(2000);
  
  useEffect(() => {
    const unsubscribe = x.onChange(setCurrentX);
    return unsubscribe;
  }, [x]);
  
  useEffect(() => {
    const timeline = x.getTimeline();
    if (timeline) {
      const unsubscribeProgress = timeline.onProgress(setProgress);
      const unsubscribeState = timeline.onStateChange((state) => {
        setIsPlaying(state.isPlaying);
        setProgress(state.progress);
      });
      
      return () => {
        unsubscribeProgress();
        unsubscribeState();
      };
    } else {
      setProgress(0);
      setIsPlaying(false);
    }
  }, [x]);
  
  const handleStart = () => {
    x.animateTo(400, { duration, easing: 'ease-in-out' });
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    x.seek(newProgress);
  };
  
  const handleReset = () => {
    x.stop();
    x.set(0);
    setCurrentX(0);
    setProgress(0);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Duration:
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 2000)}
            min="500"
            max="5000"
            step="100"
            style={{ width: '80px', padding: '0.25rem' }}
          />
          ms
        </label>
        <button onClick={handleStart} disabled={isPlaying}>
          Start Animation
        </button>
        <button onClick={() => x.play()} disabled={isPlaying || !x.getTimeline()}>
          ▶ Play
        </button>
        <button onClick={() => x.pause()} disabled={!isPlaying || !x.getTimeline()}>
          ⏸ Pause
        </button>
        <button onClick={handleReset}>
          Reset
        </button>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          <span>Progress: {Math.round(progress * 100)}%</span>
          <span>Position: {currentX.toFixed(0)}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={progress}
          onChange={handleSeek}
          disabled={!x.getTimeline()}
          style={{ width: '100%', cursor: x.getTimeline() ? 'pointer' : 'not-allowed' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
      
      <div
        style={{
          width: '100px',
          height: '100px',
          backgroundColor: '#10b981',
          borderRadius: '8px',
          transform: `translateX(${currentX}px)`,
          transition: 'background-color 0.2s',
        }}
      >
        Scrubbable
      </div>
    </div>
  );
}

function SpringAnimation() {
  const scale = useMotionValue(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);
  
  useEffect(() => {
    const unsubscribe = scale.onChange((value: number) => {
      setCurrentScale(value);
    });
    return unsubscribe;
  }, [scale]);
  
  const handleClick = async () => {
    setIsAnimating(true);
    try {
      const current = scale.get() as number;
      await scale.animateTo(1.5, {
        stiffness: 400,
        damping: 25,
        mass: 1,
        from: current,
        to: 1.5,
      });
      await scale.animateTo(1, {
        stiffness: 300,
        damping: 20,
        mass: 1,
        from: 1.5,
        to: 1,
      });
    } catch (error) {
      console.error('Animation error:', error);
    } finally {
      setIsAnimating(false);
    }
  };
  
  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isAnimating}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isAnimating ? 'not-allowed' : 'pointer',
          opacity: isAnimating ? 0.6 : 1,
        }}
      >
        {isAnimating ? 'Animating...' : 'Bounce Me!'}
      </button>
      <div
        style={{
          marginTop: '1rem',
          width: '100px',
          height: '100px',
          backgroundColor: '#8b5cf6',
          borderRadius: '8px',
          transform: `scale(${currentScale})`,
          transformOrigin: 'center',
        }}
      />
    </div>
  );
}

function TransformHelpersDemo() {
  const x = useTranslateX(0);
  const y = useTranslateY(0);
  const rotate = useRotate(0);
  const scale = useScale(1);
  
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [currentRotate, setCurrentRotate] = useState(0);
  const [currentScale, setCurrentScale] = useState(1);
  
  useEffect(() => {
    const unsubX = x.onChange(setCurrentX);
    const unsubY = y.onChange(setCurrentY);
    const unsubRotate = rotate.onChange(setCurrentRotate);
    const unsubScale = scale.onChange(setCurrentScale);
    
    return () => {
      unsubX();
      unsubY();
      unsubRotate();
      unsubScale();
    };
  }, [x, y, rotate, scale]);
  
  const handleAnimate = async () => {
    await Promise.all([
      x.animateTo(150, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 150 }),
      y.animateTo(50, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 50 }),
      rotate.animateTo(45, { stiffness: 200, damping: 25, mass: 1, from: 0, to: 45 }),
      scale.animateTo(1.2, { stiffness: 400, damping: 30, mass: 1, from: 1, to: 1.2 }),
    ]);
  };
  
  const handleReset = () => {
    x.set(0);
    y.set(0);
    rotate.set(0);
    scale.set(1);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleAnimate}>Animate All</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div style={{ position: 'relative', height: '200px', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#3b82f6',
            borderRadius: '8px',
            transform: `translateX(${currentX}px) translateY(${currentY}px) rotate(${currentRotate}deg) scale(${currentScale})`,
            transformOrigin: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          Card
        </div>
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
        <div>X: {currentX.toFixed(0)}px (translateX)</div>
        <div>Y: {currentY.toFixed(0)}px (translateY)</div>
        <div>Rotate: {currentRotate.toFixed(0)}deg</div>
        <div>Scale: {currentScale.toFixed(2)}</div>
        <div style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>
          CSS Var: {x.cssVarName} = {x.getTransformValue()}
        </div>
      </div>
    </div>
  );
}

function MultiTransformDemo() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [transformVarName, setTransformVarName] = useState('');
  const [combinedTransform, setCombinedTransform] = useState('');
  
  // Create motion values - element will be updated when ref is set
  const x = useTranslateX(0, { element: element || undefined });
  const y = useTranslateY(0, { element: element || undefined });
  const rotate = useRotate(0, { element: element || undefined });
  const scale = useScale(1, { element: element || undefined });
  
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [currentRotate, setCurrentRotate] = useState(0);
  const [currentScale, setCurrentScale] = useState(1);
  
  // Set element when ref is available
  useEffect(() => {
    if (cardRef.current) {
      setElement(cardRef.current);
    }
  }, []);
  
  // Wait for element ID to be assigned (happens when first motion value registers)
  useEffect(() => {
    if (!element) return;
    
    const checkId = () => {
      if (element.dataset.motionElementId) {
        const varName = `--motion-transform-${element.dataset.motionElementId}`;
        setTransformVarName(varName);
      } else {
        requestAnimationFrame(checkId);
      }
    };
    checkId();
  }, [element]);
  
  useEffect(() => {
    const unsubX = x.onChange(setCurrentX);
    const unsubY = y.onChange(setCurrentY);
    const unsubRotate = rotate.onChange(setCurrentRotate);
    const unsubScale = scale.onChange(setCurrentScale);
    
    return () => {
      unsubX();
      unsubY();
      unsubRotate();
      unsubScale();
    };
  }, [x, y, rotate, scale]);
  
  // Monitor combined transform CSS variable
  useEffect(() => {
    if (!cardRef.current || !transformVarName) return;
    
    const checkTransform = () => {
      if (cardRef.current) {
        const value = cardRef.current.style.getPropertyValue(transformVarName);
        if (value) {
          setCombinedTransform(value);
        } else {
          // Also check if it's set directly
          const computed = getComputedStyle(cardRef.current).getPropertyValue(transformVarName);
          if (computed) setCombinedTransform(computed.trim());
        }
      }
    };
    
    const interval = setInterval(checkTransform, 50);
    return () => clearInterval(interval);
  }, [transformVarName]);
  
  const handleAnimate = async () => {
    await Promise.all([
      x.animateTo(100, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 100 }),
      y.animateTo(50, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 50 }),
      rotate.animateTo(90, { stiffness: 200, damping: 25, mass: 1, from: 0, to: 90 }),
      scale.animateTo(1.5, { stiffness: 400, damping: 30, mass: 1, from: 1, to: 1.5 }),
    ]);
  };
  
  const handleReset = () => {
    x.set(0);
    y.set(0);
    rotate.set(0);
    scale.set(1);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleAnimate}>Animate</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div style={{ position: 'relative', height: '200px', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
        <div
          ref={cardRef}
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#10b981',
            borderRadius: '8px',
            transform: combinedTransform && transformVarName 
              ? `var(${transformVarName})` 
              : `translate3d(${currentX}px, ${currentY}px, 0px) rotate(${currentRotate}deg) scale(${currentScale})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          Card
        </div>
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
        <div><strong>Combined Transform CSS Variable:</strong></div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {transformVarName || '--motion-transform-...'} = {combinedTransform || 'none'}
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          Individual values: X={currentX.toFixed(0)}px, Y={currentY.toFixed(0)}px, Rotate={currentRotate.toFixed(0)}deg, Scale={currentScale.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

function GPUAccelerationDemo() {
  const gpuRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  
  const [gpuElement, setGpuElement] = useState<HTMLElement | null>(null);
  const [layoutElement, setLayoutElement] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    if (gpuRef.current) setGpuElement(gpuRef.current);
    if (layoutRef.current) setLayoutElement(layoutRef.current);
  }, []);
  
  // GPU-accelerated version (transform)
  const xGPU = useTranslateX(0, { element: gpuElement || undefined });
  
  // Layout-triggering version (left)
  const leftLayout = useMotionValue(0, { 
    property: 'left', 
    unit: 'px',
    transformMode: 'position',
    element: layoutElement || undefined,
  });
  
  const [gpuX, setGpuX] = useState(0);
  const [layoutLeft, setLayoutLeft] = useState(0);
  
  useEffect(() => {
    const unsubGPU = xGPU.onChange(setGpuX);
    const unsubLayout = leftLayout.onChange(setLayoutLeft);
    return () => {
      unsubGPU();
      unsubLayout();
    };
  }, [xGPU, leftLayout]);
  
  const handleAnimate = async () => {
    await Promise.all([
      xGPU.animateTo(300, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 300 }),
      leftLayout.animateTo(300, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 300 }),
    ]);
  };
  
  const handleReset = () => {
    xGPU.set(0);
    leftLayout.set(0);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleAnimate}>Animate Both</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>GPU-Accelerated (transform)</h4>
          <div style={{ position: 'relative', height: '150px', border: '2px dashed #10b981', borderRadius: '8px' }}>
            <div
              ref={gpuRef}
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#10b981',
                borderRadius: '8px',
                transform: `translateX(${gpuX}px)`,
              }}
            />
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
            <div>✅ isGPUAccelerated: {xGPU.isGPUAccelerated ? 'true' : 'false'}</div>
            <div>✅ triggersLayout: {xGPU.triggersLayout ? 'true' : 'false'}</div>
            <div>Property: transform (translateX)</div>
          </div>
        </div>
        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Layout-Triggering (left)</h4>
          <div style={{ position: 'relative', height: '150px', border: '2px dashed #ef4444', borderRadius: '8px' }}>
            <div
              ref={layoutRef}
              style={{
                position: 'absolute',
                width: '60px',
                height: '60px',
                backgroundColor: '#ef4444',
                borderRadius: '8px',
                left: `${layoutLeft}px`,
              }}
            />
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
            <div>❌ isGPUAccelerated: {leftLayout.isGPUAccelerated ? 'true' : 'false'}</div>
            <div>⚠️ triggersLayout: {leftLayout.triggersLayout ? 'true' : 'false'}</div>
            <div>Property: left (triggers layout recalculation)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransformModeDemo() {
  const autoRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef<HTMLDivElement>(null);
  
  // Auto mode (default) - uses transform for x/y
  const auto = useMotionValue(0, { property: 'x', unit: 'px' });
  
  // Explicit transform mode
  const transform = useMotionValue(0, { 
    property: 'x', 
    unit: 'px',
    transformMode: 'transform',
  });
  
  // Position mode (not recommended)
  const position = useMotionValue(0, { 
    property: 'left', 
    unit: 'px',
    transformMode: 'position',
  });
  
  const [autoVal, setAutoVal] = useState(0);
  const [transformVal, setTransformVal] = useState(0);
  const [positionVal, setPositionVal] = useState(0);
  
  useEffect(() => {
    const unsubAuto = auto.onChange(setAutoVal);
    const unsubTransform = transform.onChange(setTransformVal);
    const unsubPosition = position.onChange(setPositionVal);
    return () => {
      unsubAuto();
      unsubTransform();
      unsubPosition();
    };
  }, [auto, transform, position]);
  
  const handleAnimate = async () => {
    await Promise.all([
      auto.animateTo(200, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 200 }),
      transform.animateTo(200, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 200 }),
      position.animateTo(200, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 200 }),
    ]);
  };
  
  const handleReset = () => {
    auto.set(0);
    transform.set(0);
    position.set(0);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleAnimate}>Animate All</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Auto Mode</h4>
          <div style={{ position: 'relative', height: '120px', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
            <div
              ref={autoRef}
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#3b82f6',
                borderRadius: '8px',
                transform: `translateX(${autoVal}px)`,
              }}
            />
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
            <div>Mode: auto (default)</div>
            <div>CSS Var: {auto.cssVarName}</div>
            <div>Value: {auto.getTransformValue()}</div>
          </div>
        </div>
        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Transform Mode</h4>
          <div style={{ position: 'relative', height: '120px', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
            <div
              ref={transformRef}
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#10b981',
                borderRadius: '8px',
                transform: `translateX(${transformVal}px)`,
              }}
            />
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
            <div>Mode: transform</div>
            <div>CSS Var: {transform.cssVarName}</div>
            <div>Value: {transform.getTransformValue()}</div>
          </div>
        </div>
        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Position Mode</h4>
          <div style={{ position: 'relative', height: '120px', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
            <div
              ref={positionRef}
              style={{
                position: 'absolute',
                width: '60px',
                height: '60px',
                backgroundColor: '#ef4444',
                borderRadius: '8px',
                left: `${positionVal}px`,
              }}
            />
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
            <div>Mode: position</div>
            <div>CSS Var: {position.cssVarName}</div>
            <div>Value: {positionVal}px (not transform)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerformanceDemo() {
  const x = useTranslateX(0);
  const [updateCount, setUpdateCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    let count = 0;
    const unsubscribe = x.onChange(() => {
      count++;
      setUpdateCount(count);
    });
    return () => {
      unsubscribe();
    };
  }, [x]);
  
  const handleRapidUpdates = () => {
    setUpdateCount(0);
    for (let i = 0; i < 1000; i++) {
      x.set(i);
    }
  };
  
  const handleAnimate = async () => {
    setIsAnimating(true);
    await x.animateTo(400, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 400, duration: 1000 });
    setIsAnimating(false);
  };
  
  const handleReset = () => {
    x.set(0);
    setUpdateCount(0);
    setIsAnimating(false);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleRapidUpdates}>Rapid Updates (1000)</button>
        <button onClick={handleAnimate} disabled={isAnimating}>
          {isAnimating ? 'Animating...' : 'Animate with will-change'}
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div style={{ position: 'relative', height: '150px', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#8b5cf6',
            borderRadius: '8px',
            transform: `translateX(${x.get()}px)`,
          }}
        />
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
        <div>Update Count: {updateCount}</div>
        <div>Current Value: {x.get().toFixed(0)}px</div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
          <div>✅ Updates are batched via requestAnimationFrame</div>
          <div>✅ will-change hint set during animation</div>
          <div>✅ Rapid updates are debounced</div>
        </div>
      </div>
    </div>
  );
}

function Interactive3DCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [transformVarName, setTransformVarName] = useState('');
  const [combinedTransform, setCombinedTransform] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Set element when ref is available
  useEffect(() => {
    if (cardRef.current) {
      setElement(cardRef.current);
    }
  }, []);
  
  // Wait for element ID to be assigned
  useEffect(() => {
    if (!element) return;
    
    const checkId = () => {
      if (element.dataset.motionElementId) {
        const varName = `--motion-transform-${element.dataset.motionElementId}`;
        setTransformVarName(varName);
      } else {
        requestAnimationFrame(checkId);
      }
    };
    checkId();
  }, [element]);
  
  const x = useTranslateX(0, { element: element || undefined });
  const y = useTranslateY(0, { element: element || undefined });
  const rotateX = useMotionValue(0, { property: 'rotateX', unit: 'deg', element: element || undefined });
  const rotateY = useMotionValue(0, { property: 'rotateY', unit: 'deg', element: element || undefined });
  const scale = useScale(1, { element: element || undefined });
  
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [currentRotateX, setCurrentRotateX] = useState(0);
  const [currentRotateY, setCurrentRotateY] = useState(0);
  const [currentScale, setCurrentScale] = useState(1);
  
  useEffect(() => {
    const unsubX = x.onChange(setCurrentX);
    const unsubY = y.onChange(setCurrentY);
    const unsubRotateX = rotateX.onChange(setCurrentRotateX);
    const unsubRotateY = rotateY.onChange(setCurrentRotateY);
    const unsubScale = scale.onChange(setCurrentScale);
    
    return () => {
      unsubX();
      unsubY();
      unsubRotateX();
      unsubRotateY();
      unsubScale();
    };
  }, [x, y, rotateX, rotateY, scale]);
  
  // Monitor combined transform CSS variable
  useEffect(() => {
    if (!cardRef.current || !transformVarName) return;
    
    const checkTransform = () => {
      if (cardRef.current) {
        const value = cardRef.current.style.getPropertyValue(transformVarName);
        if (value) {
          setCombinedTransform(value);
        }
      }
    };
    
    const interval = setInterval(checkTransform, 50);
    return () => clearInterval(interval);
  }, [transformVarName]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const startX = e.clientX - x.get();
    const startY = e.clientY - y.get();
    
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX - startX);
      y.set(e.clientY - startY);
      rotateY.set((e.clientX - startX) * 0.1);
      rotateX.set(-(e.clientY - startY) * 0.1);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Spring back to center
      Promise.all([
        x.animateTo(0, { stiffness: 200, damping: 25, mass: 1, from: x.get(), to: 0 }),
        y.animateTo(0, { stiffness: 200, damping: 25, mass: 1, from: y.get(), to: 0 }),
        rotateX.animateTo(0, { stiffness: 150, damping: 20, mass: 1, from: rotateX.get(), to: 0 }),
        rotateY.animateTo(0, { stiffness: 150, damping: 20, mass: 1, from: rotateY.get(), to: 0 }),
      ]);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleScale = async () => {
    await scale.animateTo(1.2, { stiffness: 400, damping: 30, mass: 1, from: scale.get(), to: 1.2 });
    await scale.animateTo(1, { stiffness: 300, damping: 25, mass: 1, from: 1.2, to: 1 });
  };
  
  // Build fallback transform from individual values
  const fallbackTransform = `translate3d(${currentX}px, ${currentY}px, 0px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale(${currentScale})`;
  
  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          Drag the card to move and rotate it. Click "Pulse" to scale.
        </p>
        <button onClick={handleScale}>Pulse</button>
      </div>
      <div style={{ 
        position: 'relative', 
        height: '300px', 
        border: '2px dashed #e5e7eb', 
        borderRadius: '8px',
        perspective: '1000px',
      }}>
        <div
          ref={cardRef}
          onMouseDown={handleMouseDown}
          style={{
            width: '120px',
            height: '120px',
            backgroundColor: '#6366f1',
            borderRadius: '12px',
            transform: combinedTransform && transformVarName 
              ? `var(${transformVarName})` 
              : fallbackTransform,
            transformStyle: 'preserve-3d',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          }}
        >
          3D Card
        </div>
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
        <div>Combined transform: {transformVarName || '--motion-transform-...'} = {combinedTransform || 'none'}</div>
        <div>X: {currentX.toFixed(0)}px, Y: {currentY.toFixed(0)}px</div>
        <div>RotateX: {currentRotateX.toFixed(0)}deg, RotateY: {currentRotateY.toFixed(0)}deg</div>
        <div>Scale: {currentScale.toFixed(2)}</div>
      </div>
    </div>
  );
}

function SpringPlayground() {
  const [stiffness, setStiffness] = useState(300);
  const [damping, setDamping] = useState(20);
  const [mass, setMass] = useState(1);
  
  const x = useTranslateX(0);
  const [currentX, setCurrentX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Subscribe to value changes to trigger re-renders
  useEffect(() => {
    const unsubscribe = x.onChange((value: number) => {
      setCurrentX(value);
    });
    return unsubscribe;
  }, [x]);
  
  const handleAnimate = async () => {
    setIsAnimating(true);
    try {
      await x.animateTo(400, { 
        stiffness, 
        damping, 
        mass, 
        from: x.get(), 
        to: 400, 
        duration: 2000 
      });
    } catch (error) {
      console.error('Animation error:', error);
    } finally {
      setIsAnimating(false);
    }
  };
  
  const handleReset = () => {
    x.stop();
    x.set(0);
    setCurrentX(0);
    setIsAnimating(false);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleAnimate} disabled={isAnimating}>
          {isAnimating ? 'Animating...' : 'Animate'}
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Stiffness: {stiffness}
          <input
            type="range"
            min="100"
            max="500"
            value={stiffness}
            onChange={(e) => setStiffness(Number(e.target.value))}
            style={{ width: '100%', marginTop: '0.25rem' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Damping: {damping}
          <input
            type="range"
            min="5"
            max="50"
            value={damping}
            onChange={(e) => setDamping(Number(e.target.value))}
            style={{ width: '100%', marginTop: '0.25rem' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Mass: {mass}
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={mass}
            onChange={(e) => setMass(Number(e.target.value))}
            style={{ width: '100%', marginTop: '0.25rem' }}
          />
        </label>
      </div>
      <div style={{ position: 'relative', height: '150px', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#f59e0b',
            borderRadius: '8px',
            transform: `translateX(${currentX}px)`,
            transition: 'none', // Disable CSS transitions to allow motion value to control
          }}
        />
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
        <div>Current Value: {currentX.toFixed(0)}px</div>
        <div>Config: stiffness={stiffness}, damping={damping}, mass={mass}</div>
      </div>
    </div>
  );
}

function ValueInspectorDemo() {
  const x = useTranslateX(0);
  const y = useTranslateY(0);
  const opacity = useMotionValue(1, { property: 'opacity' });
  const width = useMotionValue(100, { property: 'width', unit: 'px' });
  
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [currentOpacity, setCurrentOpacity] = useState(1);
  const [currentWidth, setCurrentWidth] = useState(100);
  
  useEffect(() => {
    const unsubX = x.onChange(setCurrentX);
    const unsubY = y.onChange(setCurrentY);
    const unsubOpacity = opacity.onChange(setCurrentOpacity);
    const unsubWidth = width.onChange(setCurrentWidth);
    return () => {
      unsubX();
      unsubY();
      unsubOpacity();
      unsubWidth();
    };
  }, [x, y, opacity, width]);
  
  const handleAnimate = async () => {
    await Promise.all([
      x.animateTo(200, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 200 }),
      y.animateTo(50, { stiffness: 300, damping: 20, mass: 1, from: 0, to: 50 }),
      opacity.animateTo(0.5, { stiffness: 200, damping: 25, mass: 1, from: 1, to: 0.5 }),
      width.animateTo(200 as number, { stiffness: 300, damping: 20, mass: 1, from: 100, to: 200 }),
    ]);
  };
  
  const handleReset = () => {
    x.set(0);
    y.set(0);
    opacity.set(1);
    width.set(100);
  };
  
  const motionValues = [
    { name: 'x', mv: x, value: currentX, unit: 'px' },
    { name: 'y', mv: y, value: currentY, unit: 'px' },
    { name: 'opacity', mv: opacity, value: currentOpacity, unit: '' },
    { name: 'width', mv: width, value: currentWidth, unit: 'px' },
  ];
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleAnimate}>Animate All</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        padding: '1rem',
        backgroundColor: '#f9fafb',
      }}>
        <h4 style={{ marginBottom: '0.75rem' }}>Motion Value Inspector</h4>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {motionValues.map(({ name, mv, value, unit }) => (
            <div key={name} style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '4px', 
              padding: '0.75rem',
              backgroundColor: 'white',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{name}</div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', display: 'grid', gap: '0.25rem' }}>
                <div>CSS Variable: <code>{mv.cssVarName}</code></div>
                <div>Current Value: {value.toFixed(2)}{unit}</div>
                <div>Transform Value: <code>{mv.getTransformValue()}</code></div>
                <div>GPU Accelerated: {mv.isGPUAccelerated ? '✅ Yes' : '❌ No'}</div>
                <div>Triggers Layout: {mv.triggersLayout ? '⚠️ Yes' : '✅ No'}</div>
                <div>ID: <code>{mv.id}</code></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


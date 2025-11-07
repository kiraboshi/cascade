/**
 * Demo page for Animation Controls
 */

import { useEffect, useState } from 'react';
import { Stack } from '@cascade/react';
import { useMotionValue } from '@cascade/motion-runtime';

export function AnimationControlsDemo() {
  return (
    <Stack spacing="lg">
      <div>
        <h2>Animation Controls</h2>
        <p>Control animation playback with play, pause, reverse, and seek methods</p>
      </div>
      
      <section>
        <h3>Basic Controls</h3>
        <p>Play, pause, reverse, and seek to specific positions</p>
        <BasicControlsExample />
      </section>
      
      <section>
        <h3>Timeline Scrubbing</h3>
        <p>Interactive timeline slider for scrubbing through animations</p>
        <TimelineScrubbingExample />
      </section>
      
      <section>
        <h3>State Monitoring</h3>
        <p>Monitor animation state changes in real-time</p>
        <StateMonitoringExample />
      </section>
      
      <section>
        <h3>Multiple Animations</h3>
        <p>Control multiple animations independently</p>
        <MultipleAnimationsExample />
      </section>
      
      <section>
        <h3>Spring Animation Controls</h3>
        <p>Control spring physics animations with play, pause, reverse, and seek</p>
        <SpringControlsExample />
      </section>
    </Stack>
  );
}

function BasicControlsExample() {
  const x = useMotionValue(0, { property: 'x', unit: 'px' });
  const [currentX, setCurrentX] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasTimeline, setHasTimeline] = useState(false);
  
  useEffect(() => {
    const unsubscribe = x.onChange(setCurrentX);
    return unsubscribe;
  }, [x]);
  
  // Check for timeline periodically and when state might change
  useEffect(() => {
    let unsubscribeState: (() => void) | undefined;
    let unsubscribeProgress: (() => void) | undefined;
    
    const checkTimeline = () => {
      const timeline = x.getTimeline();
      const timelineExists = timeline !== null;
      setHasTimeline(timelineExists);
      
      if (timeline) {
        // Update state immediately
        setIsPlaying(timeline.isPlaying);
        setIsPaused(timeline.isPaused);
        setIsReversed(timeline.isReversed);
        setProgress(timeline.progress);
        
        // Clean up old subscriptions
        unsubscribeState?.();
        unsubscribeProgress?.();
        
        // Subscribe to updates
        unsubscribeState = timeline.onStateChange((state) => {
          setIsPlaying(state.isPlaying);
          setIsPaused(state.isPaused);
          setIsReversed(state.isReversed);
          setProgress(state.progress);
        });
        
        unsubscribeProgress = timeline.onProgress(setProgress);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setIsReversed(false);
        setProgress(0);
        unsubscribeState?.();
        unsubscribeProgress?.();
      }
    };
    
    // Check immediately
    checkTimeline();
    
    // Check periodically to catch timeline creation
    const interval = setInterval(checkTimeline, 100);
    
    return () => {
      clearInterval(interval);
      unsubscribeState?.();
      unsubscribeProgress?.();
    };
  }, [x]);
  
  const handleStart = () => {
    // Start animation (don't await - timeline is created synchronously)
    x.animateTo(400, { duration: 2000, easing: 'ease-in-out' });
    // Check for timeline immediately - it's created synchronously
    setHasTimeline(x.getTimeline() !== null);
  };
  
  const handleReset = () => {
    x.stop();
    x.set(0);
    setCurrentX(0);
    setIsPlaying(false);
    setIsPaused(false);
    setIsReversed(false);
    setProgress(0);
    setHasTimeline(false);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={handleStart} disabled={isPlaying && !isPaused}>
          Start Animation
        </button>
        <button onClick={() => { x.play(); setHasTimeline(x.getTimeline() !== null); }} disabled={isPlaying || !hasTimeline}>
          ▶ Play
        </button>
        <button onClick={() => { x.pause(); }} disabled={!isPlaying || isPaused}>
          ⏸ Pause
        </button>
        <button onClick={() => { x.reverse(); }} disabled={!hasTimeline}>
          ↺ Reverse
        </button>
        <button onClick={() => { x.seek(0.25); }} disabled={!hasTimeline}>
          Seek 25%
        </button>
        <button onClick={() => { x.seek(0.5); }} disabled={!hasTimeline}>
          Seek 50%
        </button>
        <button onClick={() => { x.seek(0.75); }} disabled={!hasTimeline}>
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

function TimelineScrubbingExample() {
  const x = useMotionValue(0, { property: 'x', unit: 'px' });
  const [currentX, setCurrentX] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(2000);
  const [hasTimeline, setHasTimeline] = useState(false);
  
  useEffect(() => {
    const unsubscribe = x.onChange(setCurrentX);
    return unsubscribe;
  }, [x]);
  
  useEffect(() => {
    let unsubscribeState: (() => void) | undefined;
    let unsubscribeProgress: (() => void) | undefined;
    
    const checkTimeline = () => {
      const timeline = x.getTimeline();
      const timelineExists = timeline !== null;
      setHasTimeline(timelineExists);
      
      if (timeline) {
        setIsPlaying(timeline.isPlaying);
        setProgress(timeline.progress);
        
        unsubscribeState?.();
        unsubscribeProgress?.();
        
        unsubscribeProgress = timeline.onProgress(setProgress);
        unsubscribeState = timeline.onStateChange((state) => {
          setIsPlaying(state.isPlaying);
          setProgress(state.progress);
        });
      } else {
        setProgress(0);
        setIsPlaying(false);
        unsubscribeState?.();
        unsubscribeProgress?.();
      }
    };
    
    checkTimeline();
    const interval = setInterval(checkTimeline, 100);
    
    return () => {
      clearInterval(interval);
      unsubscribeState?.();
      unsubscribeProgress?.();
    };
  }, [x]);
  
  const handleStart = () => {
    x.animateTo(400, { duration, easing: 'ease-in-out' });
    // Timeline is created synchronously
    setHasTimeline(x.getTimeline() !== null);
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
    setHasTimeline(false);
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
        <button onClick={() => { x.play(); setHasTimeline(x.getTimeline() !== null); }} disabled={isPlaying || !hasTimeline}>
          ▶ Play
        </button>
        <button onClick={() => { x.pause(); }} disabled={!isPlaying || !hasTimeline}>
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
          disabled={!hasTimeline}
          style={{ width: '100%', cursor: hasTimeline ? 'pointer' : 'not-allowed' }}
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

function StateMonitoringExample() {
  const x = useMotionValue(0, { property: 'x', unit: 'px' });
  const [stateLog, setStateLog] = useState<Array<{ time: number; state: string }>>([]);
  const [hasTimeline, setHasTimeline] = useState(false);
  
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const checkTimeline = () => {
      const timeline = x.getTimeline();
      const timelineExists = timeline !== null;
      setHasTimeline(timelineExists);
      
      if (timeline) {
        unsubscribe?.();
        unsubscribe = timeline.onStateChange((state) => {
          const stateStr = `Playing: ${state.isPlaying}, Paused: ${state.isPaused}, Reversed: ${state.isReversed}, Completed: ${state.isCompleted}, Progress: ${Math.round(state.progress * 100)}%`;
          setStateLog(prev => [...prev.slice(-9), { time: Date.now(), state: stateStr }]);
        });
      } else {
        unsubscribe?.();
      }
    };
    
    checkTimeline();
    const interval = setInterval(checkTimeline, 100);
    
    return () => {
      clearInterval(interval);
      unsubscribe?.();
    };
  }, [x]);
  
  const handleStart = () => {
    setStateLog([]);
    x.animateTo(400, { duration: 2000, easing: 'ease-in-out' });
    setHasTimeline(x.getTimeline() !== null);
  };
  
  const handleReset = () => {
    x.stop();
    x.set(0);
    setStateLog([]);
    setHasTimeline(false);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleStart}>
          Start Animation
        </button>
        <button onClick={() => { x.play(); setHasTimeline(x.getTimeline() !== null); }} disabled={!hasTimeline}>
          ▶ Play
        </button>
        <button onClick={() => { x.pause(); }} disabled={!hasTimeline}>
          ⏸ Pause
        </button>
        <button onClick={() => { x.reverse(); }} disabled={!hasTimeline}>
          ↺ Reverse
        </button>
        <button onClick={handleReset}>
          Reset
        </button>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          State Changes ({stateLog.length}):
        </div>
        <div style={{ 
          fontFamily: 'monospace', 
          fontSize: '0.75rem', 
          maxHeight: '200px', 
          overflowY: 'auto',
          padding: '0.5rem',
          backgroundColor: '#f9fafb',
          borderRadius: '4px',
          border: '1px solid #e5e7eb'
        }}>
          {stateLog.length > 0 ? stateLog.map((entry, i) => (
            <div key={i} style={{ marginBottom: '0.25rem' }}>
              <span style={{ color: '#6b7280' }}>{new Date(entry.time).toLocaleTimeString()}:</span> {entry.state}
            </div>
          )) : 'No state changes yet. Start an animation to see state updates.'}
        </div>
      </div>
      
      <div
        style={{
          width: '100px',
          height: '100px',
          backgroundColor: '#8b5cf6',
          borderRadius: '8px',
          transform: `translateX(${x.get()}px)`,
        }}
      >
        Monitored
      </div>
    </div>
  );
}

function MultipleAnimationsExample() {
  const x1 = useMotionValue(0, { property: 'x', unit: 'px' });
  const x2 = useMotionValue(0, { property: 'x', unit: 'px' });
  const x3 = useMotionValue(0, { property: 'x', unit: 'px' });
  
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [progress3, setProgress3] = useState(0);
  const [hasTimelines, setHasTimelines] = useState(false);
  
  useEffect(() => {
    let unsub1: (() => void) | undefined;
    let unsub2: (() => void) | undefined;
    let unsub3: (() => void) | undefined;
    
    const checkTimelines = () => {
      const timeline1 = x1.getTimeline();
      const timeline2 = x2.getTimeline();
      const timeline3 = x3.getTimeline();
      
      const hasAny = timeline1 !== null || timeline2 !== null || timeline3 !== null;
      setHasTimelines(hasAny);
      
      unsub1?.();
      unsub2?.();
      unsub3?.();
      
      unsub1 = timeline1?.onProgress(setProgress1);
      unsub2 = timeline2?.onProgress(setProgress2);
      unsub3 = timeline3?.onProgress(setProgress3);
    };
    
    checkTimelines();
    const interval = setInterval(checkTimelines, 100);
    
    return () => {
      clearInterval(interval);
      unsub1?.();
      unsub2?.();
      unsub3?.();
    };
  }, [x1, x2, x3]);
  
  const handleStartAll = () => {
    x1.animateTo(300, { duration: 2000, easing: 'ease-out' });
    x2.animateTo(300, { duration: 2000, easing: 'ease-in-out' });
    x3.animateTo(300, { duration: 2000, easing: 'ease-in' });
    setHasTimelines(x1.getTimeline() !== null || x2.getTimeline() !== null || x3.getTimeline() !== null);
  };
  
  const handleReset = () => {
    x1.stop();
    x2.stop();
    x3.stop();
    x1.set(0);
    x2.set(0);
    x3.set(0);
    setProgress1(0);
    setProgress2(0);
    setProgress3(0);
    setHasTimelines(false);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={handleStartAll}>
          Start All
        </button>
        <button onClick={() => { x1.play(); x2.play(); x3.play(); setHasTimelines(true); }} disabled={!hasTimelines}>
          ▶ Play All
        </button>
        <button onClick={() => { x1.pause(); x2.pause(); x3.pause(); }} disabled={!hasTimelines}>
          ⏸ Pause All
        </button>
        <button onClick={() => { x1.reverse(); x2.reverse(); x3.reverse(); }} disabled={!hasTimelines}>
          ↺ Reverse All
        </button>
        <button onClick={handleReset}>
          Reset All
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            Animation 1 (ease-out): {Math.round(progress1 * 100)}%
          </div>
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#ef4444',
              borderRadius: '8px',
              transform: `translateX(${x1.get()}px)`,
            }}
          />
        </div>
        
        <div>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            Animation 2 (ease-in-out): {Math.round(progress2 * 100)}%
          </div>
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              transform: `translateX(${x2.get()}px)`,
            }}
          />
        </div>
        
        <div>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            Animation 3 (ease-in): {Math.round(progress3 * 100)}%
          </div>
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#10b981',
              borderRadius: '8px',
              transform: `translateX(${x3.get()}px)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function SpringControlsExample() {
  const x = useMotionValue(0, { property: 'x', unit: 'px' });
  const [currentX, setCurrentX] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasTimeline, setHasTimeline] = useState(false);
  const [stiffness, setStiffness] = useState(300);
  const [damping, setDamping] = useState(20);
  
  useEffect(() => {
    const unsubscribe = x.onChange(setCurrentX);
    return unsubscribe;
  }, [x]);
  
  useEffect(() => {
    let unsubscribeState: (() => void) | undefined;
    let unsubscribeProgress: (() => void) | undefined;
    
    const checkTimeline = () => {
      const timeline = x.getTimeline();
      const timelineExists = timeline !== null;
      setHasTimeline(timelineExists);
      
      if (timeline) {
        setIsPlaying(timeline.isPlaying);
        setIsPaused(timeline.isPaused);
        setIsReversed(timeline.isReversed);
        setProgress(timeline.progress);
        
        unsubscribeState?.();
        unsubscribeProgress?.();
        
        unsubscribeState = timeline.onStateChange((state) => {
          setIsPlaying(state.isPlaying);
          setIsPaused(state.isPaused);
          setIsReversed(state.isReversed);
          setProgress(state.progress);
        });
        
        unsubscribeProgress = timeline.onProgress(setProgress);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setIsReversed(false);
        setProgress(0);
        unsubscribeState?.();
        unsubscribeProgress?.();
      }
    };
    
    checkTimeline();
    const interval = setInterval(checkTimeline, 100);
    
    return () => {
      clearInterval(interval);
      unsubscribeState?.();
      unsubscribeProgress?.();
    };
  }, [x]);
  
  const handleStart = () => {
    console.log('[SpringControlsExample] handleStart called', {
      currentX,
      stiffness,
      damping,
      xValue: x.get(),
      xType: typeof x.get()
    });
    
    // Reset to 0 first to ensure we're animating from start
    x.set(0);
    setCurrentX(0);
    
    // Small delay to ensure reset is applied
    setTimeout(() => {
      try {
        console.log('[SpringControlsExample] Calling animateTo with:', {
          target: 400,
          config: {
            stiffness,
            damping,
            mass: 1,
            from: x.get(),
            to: 400,
            duration: 2000,
          }
        });
        
        x.animateTo(400, {
          stiffness,
          damping,
          mass: 1,
          from: x.get() as number,
          to: 400,
          duration: 2000,
        });
        
        console.log('[SpringControlsExample] animateTo called, checking timeline');
        const timeline = x.getTimeline();
        console.log('[SpringControlsExample] timeline after animateTo:', timeline);
        
        if (timeline) {
          console.log('[SpringControlsExample] Timeline details:', {
            duration: timeline.duration,
            progress: timeline.progress,
            isPlaying: timeline.isPlaying,
            isPaused: timeline.isPaused,
            isCompleted: timeline.isCompleted
          });
        }
        
        setHasTimeline(timeline !== null);
      } catch (error) {
        console.error('[SpringControlsExample] Error calling animateTo:', error);
      }
    }, 10);
  };
  
  const handleReset = () => {
    x.stop();
    x.set(0);
    setCurrentX(0);
    setIsPlaying(false);
    setIsPaused(false);
    setIsReversed(false);
    setProgress(0);
    setHasTimeline(false);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Stiffness: {stiffness}
          </label>
          <input
            type="range"
            min="100"
            max="500"
            step="10"
            value={stiffness}
            onChange={(e) => setStiffness(Number(e.target.value))}
            disabled={hasTimeline}
            style={{ width: '150px' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Damping: {damping}
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={damping}
            onChange={(e) => setDamping(Number(e.target.value))}
            disabled={hasTimeline}
            style={{ width: '150px' }}
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={handleStart} disabled={isPlaying && !isPaused}>
          Start Spring Animation
        </button>
        <button onClick={() => { x.play(); setHasTimeline(x.getTimeline() !== null); }} disabled={isPlaying || !hasTimeline}>
          ▶ Play
        </button>
        <button onClick={() => { x.pause(); }} disabled={!isPlaying || isPaused}>
          ⏸ Pause
        </button>
        <button onClick={() => { x.reverse(); }} disabled={!hasTimeline}>
          ↺ Reverse
        </button>
        <button onClick={() => { x.seek(0.25); }} disabled={!hasTimeline}>
          Seek 25%
        </button>
        <button onClick={() => { x.seek(0.5); }} disabled={!hasTimeline}>
          Seek 50%
        </button>
        <button onClick={() => { x.seek(0.75); }} disabled={!hasTimeline}>
          Seek 75%
        </button>
        <button onClick={handleReset}>
          Reset
        </button>
      </div>
      
      <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
        <div>Position: {Math.round(currentX)}px</div>
        <div>Progress: {Math.round(progress * 100)}%</div>
        <div>
          State: {isPlaying ? '▶ Playing' : isPaused ? '⏸ Paused' : '⏹ Stopped'}
          {isReversed && ' (Reversed)'}
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
        Spring
      </div>
      
      <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>
        <p>Spring animations use physics-based motion. Try adjusting stiffness and damping to see how it affects the animation feel!</p>
      </div>
    </div>
  );
}


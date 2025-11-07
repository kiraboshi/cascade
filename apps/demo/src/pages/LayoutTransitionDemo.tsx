/**
 * Demo page for Layout Transition Utilities
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Stack } from '@cascade/react';
import { 
  measureElement, 
  calculateTransformDelta, 
  detectLayoutChanges, 
  generateFLIPKeyframes,
  useLayoutTransition,
  useSharedLayoutTransition,
  useBatchLayoutTransition,
  MotionSequence,
  MotionStage,
  type BoundingBox, 
  type TransformDelta 
} from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';

export function LayoutTransitionDemo() {
  return (
    <Stack spacing="lg">
      <div>
        <h2>Layout Transition Utilities</h2>
        <p>FLIP animations for smooth layout changes</p>
      </div>
      
      <section>
        <h3>Element Measurement</h3>
        <p>Measure element bounding boxes and display the results</p>
        <MeasurementDemo />
      </section>
      
      <section>
        <h3>Transform Delta Calculation</h3>
        <p>Calculate the transform needed to animate between two positions</p>
        <TransformDeltaDemo />
      </section>
      
      <section>
        <h3>Layout Change Detection</h3>
        <p>Detect when elements change position or size</p>
        <ChangeDetectionDemo />
      </section>
      
      <section>
        <h3>Interactive Layout Changes</h3>
        <p>Move elements and see the detected changes</p>
        <InteractiveLayoutDemo />
      </section>
      
      <section>
        <h3>FLIP Keyframe Generation</h3>
        <p>Generate and preview FLIP animation keyframes</p>
        <FLIPKeyframeDemo />
      </section>
      
      <section>
        <h3>useLayoutTransition Hook</h3>
        <p>Automatically animate layout changes on a single element</p>
        <LayoutTransitionHookDemo />
      </section>
      
      <section>
        <h3>useSharedLayoutTransition Hook</h3>
        <p>Animate shared elements between different components/pages</p>
        <SharedLayoutTransitionDemo />
      </section>
      
      <section>
        <h3>useBatchLayoutTransition Hook</h3>
        <p>Animate multiple elements simultaneously (list reordering, grid changes)</p>
        <BatchLayoutTransitionDemo />
      </section>
      
      <section>
        <h3>MotionSequence Integration</h3>
        <p>Layout transitions integrated with MotionSequence and MotionStage components</p>
        <MotionSequenceIntegrationDemo />
      </section>
    </Stack>
  );
}

function MeasurementDemo() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<BoundingBox | null>(null);
  
  const measure = () => {
    if (elementRef.current) {
      const measured = measureElement(elementRef.current);
      setBounds(measured);
    }
  };
  
  useEffect(() => {
    measure();
    const handleResize = () => measure();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={measure}>Measure Element</button>
      </div>
      
      <div
        ref={elementRef}
        style={{
          width: '200px',
          height: '100px',
          backgroundColor: '#3b82f6',
          borderRadius: '8px',
          padding: '1rem',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Measurable Element
      </div>
      
      {bounds && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <h4>Bounding Box:</h4>
          <pre style={{ margin: 0, fontSize: '0.875rem' }}>
            {JSON.stringify(bounds, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function TransformDeltaDemo() {
  const [fromBounds, setFromBounds] = useState<BoundingBox>({ x: 0, y: 0, width: 100, height: 100 });
  const [toBounds, setToBounds] = useState<BoundingBox>({ x: 200, y: 150, width: 150, height: 120 });
  const [delta, setDelta] = useState<TransformDelta | null>(null);
  
  const calculate = () => {
    const calculated = calculateTransformDelta(fromBounds, toBounds);
    setDelta(calculated);
  };
  
  useEffect(() => {
    calculate();
  }, [fromBounds, toBounds]);
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <h4>From:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label>
              X: <input
                type="number"
                value={fromBounds.x}
                onChange={(e) => setFromBounds({ ...fromBounds, x: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
            <label>
              Y: <input
                type="number"
                value={fromBounds.y}
                onChange={(e) => setFromBounds({ ...fromBounds, y: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
            <label>
              Width: <input
                type="number"
                value={fromBounds.width}
                onChange={(e) => setFromBounds({ ...fromBounds, width: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
            <label>
              Height: <input
                type="number"
                value={fromBounds.height}
                onChange={(e) => setFromBounds({ ...fromBounds, height: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
          </div>
        </div>
        
        <div>
          <h4>To:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label>
              X: <input
                type="number"
                value={toBounds.x}
                onChange={(e) => setToBounds({ ...toBounds, x: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
            <label>
              Y: <input
                type="number"
                value={toBounds.y}
                onChange={(e) => setToBounds({ ...toBounds, y: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
            <label>
              Width: <input
                type="number"
                value={toBounds.width}
                onChange={(e) => setToBounds({ ...toBounds, width: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
            <label>
              Height: <input
                type="number"
                value={toBounds.height}
                onChange={(e) => setToBounds({ ...toBounds, height: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
          </div>
        </div>
      </div>
      
      {delta && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <h4>Transform Delta:</h4>
          <pre style={{ margin: 0, fontSize: '0.875rem' }}>
            {JSON.stringify(delta, null, 2)}
          </pre>
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            <p><strong>CSS Transform:</strong></p>
            <code>
              translate({delta.x.toFixed(2)}px, {delta.y.toFixed(2)}px) scale({delta.scaleX.toFixed(2)}, {delta.scaleY.toFixed(2)})
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

function ChangeDetectionDemo() {
  const element1Ref = useRef<HTMLDivElement>(null);
  const element2Ref = useRef<HTMLDivElement>(null);
  const [element1Pos, setElement1Pos] = useState({ x: 0, y: 0 });
  const [element2Pos, setElement2Pos] = useState({ x: 0, y: 0 });
  const [element1Size, setElement1Size] = useState({ width: 100, height: 100 });
  const [element2Size, setElement2Size] = useState({ width: 120, height: 80 });
  const [changes, setChanges] = useState<string[]>([]);
  const previousBoundsRef = useRef<Map<HTMLElement, BoundingBox>>(new Map());
  
  // Initialize baseline on mount
  useLayoutEffect(() => {
    const elements = [element1Ref.current, element2Ref.current].filter(
      (el): el is HTMLElement => el !== null
    );
    const newBounds = new Map<HTMLElement, BoundingBox>();
    for (const element of elements) {
      newBounds.set(element, measureElement(element));
    }
    previousBoundsRef.current = newBounds;
  }, []);
  
  // Detect changes when positions/sizes change
  useLayoutEffect(() => {
    const elements = [element1Ref.current, element2Ref.current].filter(
      (el): el is HTMLElement => el !== null
    );
    
    if (elements.length === 0 || previousBoundsRef.current.size === 0) return;
    
    const detected = detectLayoutChanges(elements, previousBoundsRef.current);
    
    if (detected.length > 0) {
      const changeMessages = detected.map((change, idx) => 
        `Change ${idx + 1}: Element moved (${change.delta.x.toFixed(1)}px, ${change.delta.y.toFixed(1)}px), scaled (${change.delta.scaleX.toFixed(2)}, ${change.delta.scaleY.toFixed(2)})`
      );
      setChanges(changeMessages);
      
      // Update previous bounds
      const newBounds = new Map<HTMLElement, BoundingBox>();
      for (const element of elements) {
        newBounds.set(element, measureElement(element));
      }
      previousBoundsRef.current = newBounds;
    } else {
      setChanges([]);
    }
  }, [element1Pos, element2Pos, element1Size, element2Size]);
  
  const reset = () => {
    setElement1Pos({ x: 0, y: 0 });
    setElement2Pos({ x: 0, y: 0 });
    setElement1Size({ width: 100, height: 100 });
    setElement2Size({ width: 120, height: 80 });
    const elements = [element1Ref.current, element2Ref.current].filter(
      (el): el is HTMLElement => el !== null
    );
    const newBounds = new Map<HTMLElement, BoundingBox>();
    for (const element of elements) {
      newBounds.set(element, measureElement(element));
    }
    previousBoundsRef.current = newBounds;
    setChanges([]);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={reset}>Reset Positions</button>
      </div>
      
      <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <h4>Element 1 Controls</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem' }}>
              X: {element1Pos.x}px
              <input
                type="range"
                min="-100"
                max="200"
                value={element1Pos.x}
                onChange={(e) => setElement1Pos({ ...element1Pos, x: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </label>
            <label style={{ fontSize: '0.875rem' }}>
              Y: {element1Pos.y}px
              <input
                type="range"
                min="-100"
                max="200"
                value={element1Pos.y}
                onChange={(e) => setElement1Pos({ ...element1Pos, y: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </label>
            <label style={{ fontSize: '0.875rem' }}>
              Width: {element1Size.width}px
              <input
                type="range"
                min="50"
                max="200"
                value={element1Size.width}
                onChange={(e) => setElement1Size({ ...element1Size, width: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </label>
            <label style={{ fontSize: '0.875rem' }}>
              Height: {element1Size.height}px
              <input
                type="range"
                min="50"
                max="200"
                value={element1Size.height}
                onChange={(e) => setElement1Size({ ...element1Size, height: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </label>
          </div>
        </div>
        
        <div>
          <h4>Element 2 Controls</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem' }}>
              X: {element2Pos.x}px
              <input
                type="range"
                min="-100"
                max="200"
                value={element2Pos.x}
                onChange={(e) => setElement2Pos({ ...element2Pos, x: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </label>
            <label style={{ fontSize: '0.875rem' }}>
              Y: {element2Pos.y}px
              <input
                type="range"
                min="-100"
                max="200"
                value={element2Pos.y}
                onChange={(e) => setElement2Pos({ ...element2Pos, y: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </label>
            <label style={{ fontSize: '0.875rem' }}>
              Width: {element2Size.width}px
              <input
                type="range"
                min="50"
                max="200"
                value={element2Size.width}
                onChange={(e) => setElement2Size({ ...element2Size, width: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </label>
            <label style={{ fontSize: '0.875rem' }}>
              Height: {element2Size.height}px
              <input
                type="range"
                min="50"
                max="200"
                value={element2Size.height}
                onChange={(e) => setElement2Size({ ...element2Size, height: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </label>
          </div>
        </div>
      </div>
      
      <div style={{ position: 'relative', height: '300px', border: '2px dashed #d1d5db', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
        <div
          ref={element1Ref}
          style={{
            position: 'absolute',
            left: `${element1Pos.x + 50}px`,
            top: `${element1Pos.y + 50}px`,
            width: `${element1Size.width}px`,
            height: `${element1Size.height}px`,
            backgroundColor: '#3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            transition: 'none',
          }}
        >
          Element 1
        </div>
        
        <div
          ref={element2Ref}
          style={{
            position: 'absolute',
            left: `${element2Pos.x + 200}px`,
            top: `${element2Pos.y + 50}px`,
            width: `${element2Size.width}px`,
            height: `${element2Size.height}px`,
            backgroundColor: '#10b981',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            transition: 'none',
          }}
        >
          Element 2
        </div>
      </div>
      
      {changes.length > 0 && (
        <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <h4>Detected Changes:</h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {changes.map((change, idx) => (
              <li key={idx} style={{ fontSize: '0.875rem' }}>{change}</li>
            ))}
          </ul>
        </div>
      )}
      
      {changes.length === 0 && (
        <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
            No changes detected. Use the controls above to move or resize the elements.
          </p>
        </div>
      )}
      
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
        Changes are detected automatically as you move or resize the elements. Threshold: 1px for position, 1% for scale.
      </p>
    </div>
  );
}

function InteractiveLayoutDemo() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 150, height: 100 });
  const [bounds, setBounds] = useState<BoundingBox | null>(null);
  const [delta, setDelta] = useState<TransformDelta | null>(null);
  const previousBoundsRef = useRef<BoundingBox | null>(null);
  
  // Use useLayoutEffect to measure synchronously after DOM updates but before paint
  useLayoutEffect(() => {
    if (elementRef.current) {
      const current = measureElement(elementRef.current);
      setBounds(current);
      
      if (previousBoundsRef.current) {
        const calculated = calculateTransformDelta(previousBoundsRef.current, current);
        setDelta(calculated);
      } else {
        // Initialize on first render
        previousBoundsRef.current = current;
      }
      
      previousBoundsRef.current = current;
    }
  }, [position, size]);
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div>
          <label>
            Position X: {position.x}px
            <input
              type="range"
              min="-200"
              max="400"
              value={position.x}
              onChange={(e) => setPosition({ ...position, x: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>
        </div>
        <div>
          <label>
            Position Y: {position.y}px
            <input
              type="range"
              min="-200"
              max="400"
              value={position.y}
              onChange={(e) => setPosition({ ...position, y: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>
        </div>
        <div>
          <label>
            Width: {size.width}px
            <input
              type="range"
              min="50"
              max="300"
              value={size.width}
              onChange={(e) => setSize({ ...size, width: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>
        </div>
        <div>
          <label>
            Height: {size.height}px
            <input
              type="range"
              min="50"
              max="300"
              value={size.height}
              onChange={(e) => setSize({ ...size, height: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>
        </div>
      </div>
      
      <div style={{ position: 'relative', height: '400px', border: '2px dashed #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
        <div
          ref={elementRef}
          style={{
            position: 'absolute',
            left: `${position.x + 200}px`,
            top: `${position.y + 150}px`,
            width: `${size.width}px`,
            height: `${size.height}px`,
            backgroundColor: '#8b5cf6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            transition: 'none', // No CSS transitions, we're measuring raw changes
          }}
        >
          Interactive Element
        </div>
      </div>
      
      <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {bounds && (
          <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <h4>Current Bounds:</h4>
            <pre style={{ margin: 0, fontSize: '0.875rem' }}>
              {JSON.stringify(bounds, null, 2)}
            </pre>
          </div>
        )}
        
        {delta && (
          <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <h4>Transform Delta:</h4>
            <pre style={{ margin: 0, fontSize: '0.875rem' }}>
              {JSON.stringify(delta, null, 2)}
            </pre>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              <code>
                translate({delta.x.toFixed(1)}px, {delta.y.toFixed(1)}px) scale({delta.scaleX.toFixed(2)}, {delta.scaleY.toFixed(2)})
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FLIPKeyframeDemo() {
  const [fromBounds, setFromBounds] = useState<BoundingBox>({ x: 0, y: 0, width: 100, height: 100 });
  const [toBounds, setToBounds] = useState<BoundingBox>({ x: 200, y: 150, width: 150, height: 120 });
  const [duration, setDuration] = useState(300);
  const [easing, setEasing] = useState('cubic-bezier(0.4, 0, 0.2, 1)');
  const [origin, setOrigin] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center');
  const [generatedCSS, setGeneratedCSS] = useState<string>('');
  const [className, setClassName] = useState<string>('');
  const [animationName, setAnimationName] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const animatedElementRef = useRef<HTMLDivElement>(null);
  const wrapperElementRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const animationEndHandlerRef = useRef<((e: AnimationEvent) => void) | null>(null);
  
  const generate = () => {
    // Clear any existing animation state using current className
    if (wrapperElementRef.current && className) {
      wrapperElementRef.current.classList.remove(className);
    }
    
    const name = `flip-demo-${Math.random().toString(36).substr(2, 9)}`;
    const result = generateFLIPKeyframes(name, {
      from: fromBounds,
      to: toBounds,
      duration,
      easing,
      origin,
    });
    
    // Remove old CSS first
    if (styleRef.current) {
      styleRef.current.remove();
      styleRef.current = null;
    }
    
    // Update state
    setGeneratedCSS(result.css);
    setClassName(result.className);
    setAnimationName(name); // Store the keyframe animation name
    
    // Inject new CSS immediately
    const styleElement = document.createElement('style');
    styleElement.textContent = result.css;
    document.head.appendChild(styleElement);
    styleRef.current = styleElement;
  };
  
  const animate = () => {
    if (!wrapperElementRef.current || !className) return;
    
    setIsAnimating(true);
    
    const wrapper = wrapperElementRef.current;
    
    // Remove any existing animation class first
    wrapper.classList.remove(className);
    
    // Force a reflow to reset any transforms
    void wrapper.offsetWidth;
    
    // Calculate transform-origin based on the selected origin
    // Transform-origin is relative to the element's CURRENT size (toBounds)
    // Use keyword values for better browser compatibility
    const transformOriginValue = origin === 'center' 
      ? 'center'
      : origin === 'top-left'
      ? '0 0'
      : origin === 'top-right'
      ? '100% 0'
      : origin === 'bottom-left'
      ? '0 100%'
      : '100% 100%';
    
    // Set transform-origin on the wrapper BEFORE adding animation class
    wrapper.style.setProperty('transform-origin', transformOriginValue, 'important');
    wrapper.style.transformOrigin = transformOriginValue;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set up timeout fallback
    timeoutRef.current = window.setTimeout(() => {
      if (wrapper) {
        wrapper.classList.remove(className);
      }
      setIsAnimating(false);
      timeoutRef.current = null;
    }, duration + 100);
    
    // Set up animation end handler
    const handleAnimationEnd = (e: AnimationEvent) => {
      if (e.animationName === animationName) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (wrapper) {
          wrapper.classList.remove(className);
        }
        setIsAnimating(false);
      }
    };
    
    wrapper.addEventListener('animationend', handleAnimationEnd, { once: true });
    
    // Ensure CSS is injected and up to date
    if (!styleRef.current || !document.head.contains(styleRef.current) || styleRef.current.textContent !== generatedCSS) {
      if (styleRef.current) {
        styleRef.current.remove();
      }
      const styleElement = document.createElement('style');
      styleElement.textContent = generatedCSS;
      document.head.appendChild(styleElement);
      styleRef.current = styleElement;
    }
    
    // Start animation - ensure transform-origin is set and persists
    // The transform-origin is already set in the wrapper's inline style (from the JSX)
    // But we'll also set it here to ensure it's correct
    wrapper.style.setProperty('transform-origin', transformOriginValue, 'important');
    wrapper.style.transformOrigin = transformOriginValue;
    
    // Force a reflow to ensure transform-origin is applied
    void wrapper.offsetWidth;
    
    // Use requestAnimationFrame to ensure everything is ready
    requestAnimationFrame(() => {
      if (wrapper) {
        // Verify transform-origin is still set and force it again
        wrapper.style.setProperty('transform-origin', transformOriginValue, 'important');
        wrapper.style.transformOrigin = transformOriginValue;
        
        // Debug: log the computed transform-origin
        const computedStyle = window.getComputedStyle(wrapper);
        console.log('Transform-origin before animation:', computedStyle.transformOrigin, 'Expected:', transformOriginValue);
        
        // Force a reflow
        void wrapper.offsetWidth;
        
        // Add the animation class to the wrapper
        wrapper.classList.add(className);
        
        // Check again after adding class
        requestAnimationFrame(() => {
          const computedAfter = window.getComputedStyle(wrapper);
          console.log('Transform-origin after adding class:', computedAfter.transformOrigin);
          console.log('Transform:', computedAfter.transform);
        });
      }
    });
  };
  
  useEffect(() => {
    generate();
    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromBounds, toBounds, duration, easing, origin]);
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <h4>From:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem' }}>
              X: <input
                type="number"
                value={fromBounds.x}
                onChange={(e) => setFromBounds({ ...fromBounds, x: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
            <label style={{ fontSize: '0.875rem' }}>
              Y: <input
                type="number"
                value={fromBounds.y}
                onChange={(e) => setFromBounds({ ...fromBounds, y: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
            <label style={{ fontSize: '0.875rem' }}>
              Width: <input
                type="number"
                value={fromBounds.width}
                onChange={(e) => setFromBounds({ ...fromBounds, width: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
            <label style={{ fontSize: '0.875rem' }}>
              Height: <input
                type="number"
                value={fromBounds.height}
                onChange={(e) => setFromBounds({ ...fromBounds, height: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
          </div>
        </div>
        
        <div>
          <h4>To:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem' }}>
              X: <input
                type="number"
                value={toBounds.x}
                onChange={(e) => setToBounds({ ...toBounds, x: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
            <label style={{ fontSize: '0.875rem' }}>
              Y: <input
                type="number"
                value={toBounds.y}
                onChange={(e) => setToBounds({ ...toBounds, y: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
            <label style={{ fontSize: '0.875rem' }}>
              Width: <input
                type="number"
                value={toBounds.width}
                onChange={(e) => setToBounds({ ...toBounds, width: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
            <label style={{ fontSize: '0.875rem' }}>
              Height: <input
                type="number"
                value={toBounds.height}
                onChange={(e) => setToBounds({ ...toBounds, height: Number(e.target.value) })}
                style={{ width: '80px' }}
              />
            </label>
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.875rem' }}>
            Duration (ms):
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="100"
              max="2000"
              step="50"
              style={{ width: '100%', marginTop: '0.25rem' }}
            />
          </label>
        </div>
        <div>
          <label style={{ fontSize: '0.875rem' }}>
            Easing:
            <select
              value={easing}
              onChange={(e) => setEasing(e.target.value)}
              style={{ width: '100%', marginTop: '0.25rem' }}
            >
              <option value="cubic-bezier(0.4, 0, 0.2, 1)">Ease Out</option>
              <option value="cubic-bezier(0.4, 0, 1, 1)">Ease In</option>
              <option value="cubic-bezier(0.4, 0, 0.2, 1)">Ease In Out</option>
              <option value="ease">Ease</option>
              <option value="linear">Linear</option>
            </select>
          </label>
        </div>
        <div>
          <label style={{ fontSize: '0.875rem' }}>
            Transform Origin:
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value as typeof origin)}
              style={{ width: '100%', marginTop: '0.25rem' }}
            >
              <option value="center">Center</option>
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </label>
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={generate}>Regenerate Keyframes</button>
        <button onClick={animate} disabled={isAnimating || !className}>
          {isAnimating ? 'Animating...' : 'Preview Animation'}
        </button>
      </div>
      
      <div style={{ position: 'relative', height: '300px', border: '2px dashed #d1d5db', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
        <div
          ref={wrapperElementRef}
          style={{
            position: 'absolute',
            // Start at "to" position - FLIP will animate from "from" to here
            left: `${toBounds.x}px`,
            top: `${toBounds.y}px`,
            width: `${toBounds.width}px`,
            height: `${toBounds.height}px`,
            // Set transform-origin on the wrapper (this element will receive the animation class)
            transformOrigin: origin === 'center' 
              ? 'center'
              : origin === 'top-left'
              ? '0 0'
              : origin === 'top-right'
              ? '100% 0'
              : origin === 'bottom-left'
              ? '0 100%'
              : '100% 100%',
          }}
        >
          <div
            ref={animatedElementRef}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#8b5cf6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            Animated Element
          </div>
        </div>
      </div>
      
      {generatedCSS && (
        <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <h4>Generated CSS:</h4>
          <pre style={{ margin: 0, fontSize: '0.75rem', overflow: 'auto', maxHeight: '300px' }}>
            {generatedCSS}
          </pre>
        </div>
      )}
    </div>
  );
}

function LayoutTransitionHookDemo() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 150, height: 100 });
  const elementRef = useRef<HTMLDivElement>(null);
  
  useLayoutTransition(elementRef, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    origin: 'center',
  });
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => setPosition({ x: Math.random() * 300, y: Math.random() * 200 })}>
          Random Position
        </button>
        <button onClick={() => setSize({ width: 100 + Math.random() * 200, height: 80 + Math.random() * 150 })}>
          Random Size
        </button>
        <button onClick={() => {
          setPosition({ x: 0, y: 0 });
          setSize({ width: 150, height: 100 });
        }}>
          Reset
        </button>
      </div>
      
      <div style={{ position: 'relative', height: '300px', border: '2px dashed #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
        <div
          ref={elementRef}
          style={{
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${size.width}px`,
            height: `${size.height}px`,
            backgroundColor: '#8b5cf6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          Animated Element
        </div>
      </div>
      
      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
        Position: ({Math.round(position.x)}, {Math.round(position.y)}) | 
        Size: {Math.round(size.width)} × {Math.round(size.height)}
      </div>
    </div>
  );
}

function SharedLayoutTransitionDemo() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Collapse' : 'Expand'} Card
        </button>
      </div>
      
      <div style={{ position: 'relative', minHeight: '200px', border: '2px dashed #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
        {expanded ? (
          <ExpandedCard layoutId="shared-card" onClose={() => setExpanded(false)} />
        ) : (
          <CollapsedCard layoutId="shared-card" onClick={() => setExpanded(true)} />
        )}
      </div>
    </div>
  );
}

function CollapsedCard({ layoutId, onClick }: { layoutId: string; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useSharedLayoutTransition(ref, {
    layoutId,
    duration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    origin: 'center',
  });
  
  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: '50px',
        top: '50px',
        width: '200px',
        height: '150px',
        backgroundColor: '#3b82f6',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div>Click to expand</div>
        <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.9 }}>Card Preview</div>
      </div>
    </div>
  );
}

function ExpandedCard({ layoutId, onClose }: { layoutId: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useSharedLayoutTransition(ref, {
    layoutId,
    duration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    origin: 'center',
  });
  
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: '20px',
        top: '20px',
        right: '20px',
        bottom: '20px',
        backgroundColor: '#3b82f6',
        borderRadius: '12px',
        padding: '2rem',
        color: 'white',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Expanded Card</h3>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Close
        </button>
      </div>
      <p style={{ margin: 0, opacity: 0.9 }}>
        This card animates smoothly from the collapsed state. The same layoutId
        allows the animation system to track the element across different component instances.
      </p>
    </div>
  );
}

function BatchLayoutTransitionDemo() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);
  const itemRefs = useRef<Map<number, React.RefObject<HTMLDivElement>>>(new Map());
  
  // Get or create refs for each item
  const getRef = (item: number): React.RefObject<HTMLDivElement> => {
    if (!itemRefs.current.has(item)) {
      itemRefs.current.set(item, React.createRef<HTMLDivElement>());
    }
    return itemRefs.current.get(item)!;
  };
  
  // Convert to array of refs for the hook (in item order)
  const refsArray = items.map(item => getRef(item));
  
  useBatchLayoutTransition(refsArray, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    origin: 'center',
  });
  
  const moveToFront = () => {
    setItems([items[items.length - 1], ...items.slice(0, -1)]);
  };
  
  const moveToBack = () => {
    setItems([...items.slice(1), items[0]]);
  };
  
  const shuffle = () => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setItems(shuffled);
  };
  
  const reverse = () => {
    setItems([...items].reverse());
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={moveToFront}>Move Last to Front</button>
        <button onClick={moveToBack}>Move First to Back</button>
        <button onClick={shuffle}>Shuffle</button>
        <button onClick={reverse}>Reverse</button>
        <button onClick={() => setItems([1, 2, 3, 4, 5])}>Reset</button>
      </div>
      
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '1rem',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
          minHeight: '300px',
        }}
      >
        {items.map((item, index) => (
          <div
            key={item}
            ref={getRef(item)}
            style={{
              padding: '1rem',
              backgroundColor: `hsl(${(item * 60) % 360}, 70%, 60%)`,
              borderRadius: '8px',
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <span>Item {item}</span>
            <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>Position: {index + 1}</span>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
        All items animate smoothly when reordered. The hook detects changes and animates each element to its new position.
      </div>
    </div>
  );
}

// Animation for MotionSequence examples
const motionSequenceAnimation = defineMotion({
  from: { transform: 'scale(0.9)', opacity: 0.8 },
  to: { transform: 'scale(1)', opacity: 1 },
  duration: '300ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
});

function MotionSequenceIntegrationDemo() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 100, height: 100 });
  const [items, setItems] = useState([1, 2, 3]);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    const styleId = 'motion-sequence-integration-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = motionSequenceAnimation.css;
      document.head.appendChild(styleElement);
    }
  }, []);

  return (
    <Stack spacing="lg">
      <div>
        <h4>Basic Layout Transition with MotionStage</h4>
        <p>Enable layout transitions on individual MotionStage components</p>
        
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setPosition({ x: Math.random() * 300, y: Math.random() * 200 })}>
            Random Position
          </button>
          <button onClick={() => setSize({ width: 50 + Math.random() * 150, height: 50 + Math.random() * 150 })}>
            Random Size
          </button>
          <button onClick={() => {
            setPosition({ x: 0, y: 0 });
            setSize({ width: 100, height: 100 });
          }}>
            Reset
          </button>
        </div>
        
        <div style={{ 
          marginTop: '2rem', 
          height: '300px',
          position: 'relative',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#f9fafb'
        }}>
          <MotionSequence layoutTransition={{ duration: 400, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <MotionStage
              layoutTransition={true}
              style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'var(--cascade-color-primary)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                Layout Transition Enabled
              </div>
            </MotionStage>
          </MotionSequence>
        </div>
      </div>
      
      <div>
        <h4>List Reordering with MotionSequence</h4>
        <p>Layout transitions work seamlessly with reorderable lists in MotionSequence</p>
        
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setItems([...items].reverse())}>
            Reverse Order
          </button>
          <button onClick={() => setItems([items[items.length - 1], ...items.slice(0, -1)])}>
            Move Last to First
          </button>
          <button onClick={() => setItems([1, 2, 3])}>
            Reset
          </button>
        </div>
        
        <div style={{ 
          marginTop: '2rem',
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9fafb'
        }}>
          <MotionSequence layoutTransition={{ duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }}>
            {items.map((item, index) => (
              <MotionStage
                key={item}
                layoutTransition={true}
                style={{
                  marginBottom: index < items.length - 1 ? '0.5rem' : 0,
                }}
              >
                <div
                  style={{
                    padding: '1rem',
                    background: 'var(--cascade-color-primary)',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Item {item}</span>
                  <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    Position: {index + 1}
                  </span>
                </div>
              </MotionStage>
            ))}
          </MotionSequence>
        </div>
      </div>
      
      <div>
        <h4>Expand/Collapse with Layout Transitions</h4>
        <p>Combine layout transitions with size changes for smooth expand/collapse animations</p>
        
        <div style={{ marginTop: '1rem' }}>
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Collapse' : 'Expand'} Card
          </button>
        </div>
        
        <div style={{ 
          marginTop: '2rem',
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9fafb'
        }}>
          <MotionSequence layoutTransition={{ duration: 400, origin: 'top-left' }}>
            <MotionStage
              layoutTransition={true}
              style={{
                width: expanded ? '100%' : '200px',
                height: expanded ? '300px' : '100px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '1rem',
                  background: 'var(--cascade-color-primary)',
                  borderRadius: '8px',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  alignItems: expanded ? 'flex-start' : 'center',
                }}
              >
                <h4 style={{ margin: 0, marginBottom: expanded ? '1rem' : 0 }}>
                  {expanded ? 'Expanded Card' : 'Click to expand'}
                </h4>
                {expanded && (
                  <div>
                    <p style={{ margin: 0, marginBottom: '0.5rem' }}>
                      This card expands and contracts smoothly with layout transitions enabled.
                    </p>
                    <p style={{ margin: 0 }}>
                      The layout transition animates the size change, making it feel natural.
                    </p>
                  </div>
                )}
              </div>
            </MotionStage>
          </MotionSequence>
        </div>
      </div>
      
      <details style={{ marginTop: '1rem' }}>
        <summary>Code Examples</summary>
        <pre style={{ 
          marginTop: '0.5rem', 
          padding: '1rem', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
{`// Basic usage
<MotionSequence layoutTransition={{ duration: 400 }}>
  <MotionStage
    animation={myAnimation}
    layoutTransition={true}
    style={{ left: \`\${x}px\`, top: \`\${y}px\` }}
  >
    <div>Content</div>
  </MotionStage>
</MotionSequence>

// List reordering
<MotionSequence layoutTransition={{ duration: 300 }}>
  {items.map((item) => (
    <MotionStage
      key={item}
      animation={myAnimation}
      layoutTransition={true}
    >
      <div>Item {item}</div>
    </MotionStage>
  ))}
</MotionSequence>

// Per-stage configuration
<MotionSequence layoutTransition={{ duration: 300 }}>
  {/* Inherits duration: 300 */}
  <MotionStage animation={anim} layoutTransition={true} />
  
  {/* Overrides with custom config */}
  <MotionStage 
    animation={anim} 
    layoutTransition={{ duration: 600, easing: 'ease-in-out' }} 
  />
</MotionSequence>`}
        </pre>
      </details>
    </Stack>
  );
}


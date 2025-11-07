/**
 * Demo page for Gesture & Scroll Bridges
 */

import { useState, useEffect, useRef } from 'react';
import { Stack } from '@cascade/react';
import { useMotionValue } from '@cascade/motion-runtime';
import { 
  useDrag, 
  usePan, 
  useScrollMotion, 
  useWheel,
  useHover,
  useHoverAnimation,
  useTap,
  useTapAnimation,
  useFocus,
  useFocusAnimation,
} from '@cascade/motion-gestures';
import type { SpringConfig } from '@cascade/compiler';

export function GestureDemo() {
  return (
    <Stack spacing="lg">
      <div>
        <h2>Gesture & Scroll Bridges</h2>
        <p>Gesture-driven animations using pointer events and scroll</p>
      </div>
      
      <section>
        <h3>Draggable Card with Velocity-Based Spring</h3>
        <p>Drag the card around and release it. The spring animation uses your drag velocity - fast drags create more momentum!</p>
        <DraggableCard />
      </section>
      
      <section>
        <h3>Scroll-Driven Animation</h3>
        <p>Scroll the page to see the element move.</p>
        <ScrollAnimation />
      </section>
      
      <section>
        <h3>Pan Gesture</h3>
        <p>Pan/drag with touch or pointer. Similar to drag but optimized for touch gestures.</p>
        <PanDemo />
      </section>
      
      <section>
        <h3>Wheel Zoom</h3>
        <p>Use your mouse wheel to zoom in/out.</p>
        <WheelZoom />
      </section>
      
      <section>
        <h3>Hover Animation</h3>
        <p>Hover over the card to see it scale and lift up.</p>
        <HoverDemo />
      </section>
      
      <section>
        <h3>Tap Animation</h3>
        <p>Tap/click the button to see it scale down and bounce back.</p>
        <TapDemo />
      </section>
      
      <section>
        <h3>Focus Animation</h3>
        <p>Click into the input field to see it scale up when focused.</p>
        <FocusDemo />
      </section>
    </Stack>
  );
}

function DraggableCard() {
  const x = useMotionValue(0, { unit: 'px' });
  const y = useMotionValue(0, { unit: 'px' });
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  
  const springConfig: SpringConfig = {
    stiffness: 300,
    damping: 30,
    mass: 1,
    from: 0,
    to: 0,
  };
  
  const [isDragging, setIsDragging] = useState(false);
  
  const dragRef = useDrag(
    { x, y },
    {
      spring: springConfig,
      constraints: {
        min: { x: -200, y: -200 },
        max: { x: 200, y: 200 },
      },
      onStart: () => {
        setIsDragging(true);
      },
      onEnd: () => {
        setIsDragging(false);
      },
    }
  );
  
  // Subscribe to changes
  useEffect(() => {
    const unsubscribeX = x.onChange((value: number) => {
      setCurrentX(value);
    });
    const unsubscribeY = y.onChange((value: number) => {
      setCurrentY(value);
    });
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y]);
  
  return (
    <div style={{ position: 'relative', height: '300px', border: '1px dashed #ccc', borderRadius: '8px' }}>
      <div
        ref={dragRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '100px',
          height: '100px',
          backgroundColor: '#3b82f6',
          borderRadius: '8px',
          transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`,
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        Drag Me
      </div>
    </div>
  );
}

function ScrollAnimation() {
  const scrollY = useMotionValue(0);
  const [currentY, setCurrentY] = useState(0);
  
  useScrollMotion(scrollY, { axis: 'y', multiplier: 1 });
  
  useEffect(() => {
    // Set initial value immediately
    const initialValue = scrollY.get() as number;
    setCurrentY(initialValue);
    
    // Subscribe to changes
    const unsubscribe = scrollY.onChange((value: number) => {
      setCurrentY(value);
    });
    
    return unsubscribe;
  }, [scrollY]);
  
  // Also check scroll value on scroll events as a fallback
  useEffect(() => {
    const handleScroll = () => {
      const value = scrollY.get() as number;
      setCurrentY(value);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollY]);
  
  return (
    <div>
      <div
        style={{
          height: '200px',
          backgroundColor: '#10b981',
          borderRadius: '8px',
          transform: `translateY(${Math.min(currentY * 0.2, 200)}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          marginBottom: '1rem',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div>Scroll the page to move me</div>
        <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.9, fontWeight: 'normal' }}>
          Scroll Y: {currentY.toFixed(0)}px | Transform: {(currentY * 0.2).toFixed(0)}px
        </div>
      </div>
      {/* Add some content to enable scrolling */}
      <div style={{ height: '200vh', padding: '2rem', background: 'linear-gradient(to bottom, #f3f4f6, #e5e7eb)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h4 style={{ marginBottom: '1rem' }}>Scroll down to see the animation</h4>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            As you scroll this page, the green box above will move based on the scroll position.
            The scroll value is multiplied by 0.5 and then used to translate the element.
          </p>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            Keep scrolling to see how the element responds to your scroll position.
          </p>
          <div style={{ height: '50vh' }}></div>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            The animation uses the scroll position to drive the transform, creating a scroll-driven effect.
          </p>
          <div style={{ height: '50vh' }}></div>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            Scroll back up to see the element return to its original position.
          </p>
        </div>
      </div>
    </div>
  );
}

function PanDemo() {
  const x = useMotionValue(0, { unit: 'px' });
  const y = useMotionValue(0, { unit: 'px' });
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  
  const panRef = usePan(
    { x, y },
    {
      constraints: {
        min: { x: -150, y: -150 },
        max: { x: 150, y: 150 },
      },
    }
  );
  
  useEffect(() => {
    const unsubscribeX = x.onChange((value: number) => {
      setCurrentX(value);
    });
    const unsubscribeY = y.onChange((value: number) => {
      setCurrentY(value);
    });
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y]);
  
  return (
    <div style={{ position: 'relative', height: '300px', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
      <div
        ref={panRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '120px',
          height: '120px',
          backgroundColor: '#10b981',
          borderRadius: '8px',
          transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`,
          cursor: 'grab',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          userSelect: 'none',
          touchAction: 'none',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div>Pan Me</div>
        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.9 }}>
          Touch/Pointer
        </div>
      </div>
    </div>
  );
}

function WheelZoom() {
  const scale = useMotionValue(1);
  const [currentScale, setCurrentScale] = useState(1);
  const scaleRef = useRef(1);
  
  const wheelRef = useWheel(
    { y: scale },
    {
      axis: 'y',
      multiplier: 0.005, // Smaller multiplier for smoother zoom
    }
  );
  
  // Update scale ref and state when motion value changes
  useEffect(() => {
    const unsubscribe = scale.onChange((value: number) => {
      // Clamp between 0.5 and 3 for zoom range
      const clamped = Math.max(0.5, Math.min(value, 3));
      scaleRef.current = clamped;
      setCurrentScale(clamped);
    });
    
    // Set initial value
    const initialValue = scale.get() as number;
    const clamped = Math.max(0.5, Math.min(initialValue, 3));
    scaleRef.current = clamped;
    setCurrentScale(clamped);
    
    return unsubscribe;
  }, [scale]);
  
  // Direct wheel handler to update state immediately
  useEffect(() => {
    const element = wheelRef.current;
    if (!element) return;
    
    const handleWheel = () => {
      // Use requestAnimationFrame to read the value after it's been updated
      requestAnimationFrame(() => {
        const value = scale.get() as number;
        const clamped = Math.max(0.5, Math.min(value, 3));
        if (clamped !== scaleRef.current) {
          scaleRef.current = clamped;
          setCurrentScale(clamped);
        }
      });
    };
    
    element.addEventListener('wheel', handleWheel, { passive: true });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [scale, wheelRef]);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        Hover over the box and use your mouse wheel to zoom
      </div>
      <div
        ref={wheelRef}
        style={{
          display: 'inline-block',
          cursor: 'zoom-in',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: '200px',
            height: '200px',
            backgroundColor: '#8b5cf6',
            borderRadius: '8px',
            transform: `scale(${currentScale})`,
            transformOrigin: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            transition: 'transform 0.05s ease-out',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          Wheel Zoom
        </div>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 'bold' }}>
        Scale: {currentScale.toFixed(2)}x
      </div>
    </div>
  );
}

function HoverDemo() {
  const scale = useMotionValue(1);
  const y = useMotionValue(0, { unit: 'px' });
  const [currentScale, setCurrentScale] = useState(1);
  const [currentY, setCurrentY] = useState(0);
  
  const hoverRef = useHoverAnimation(scale, {
    onHoverStart: {
      target: 1.05,
      config: { stiffness: 300, damping: 20 },
    },
    onHoverEnd: {
      target: 1,
      config: { stiffness: 300, damping: 20 },
    },
  });
  
  useHoverAnimation(y, {
    onHoverStart: {
      target: -5,
      config: { stiffness: 300, damping: 20 },
    },
    onHoverEnd: {
      target: 0,
      config: { stiffness: 300, damping: 20 },
    },
  });
  
  useEffect(() => {
    const unsubscribeScale = scale.onChange((value: number) => {
      setCurrentScale(value);
    });
    const unsubscribeY = y.onChange((value: number) => {
      setCurrentY(value);
    });
    return () => {
      unsubscribeScale();
      unsubscribeY();
    };
  }, [scale, y]);
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div
        ref={hoverRef}
        style={{
          width: '200px',
          height: '150px',
          backgroundColor: '#3b82f6',
          borderRadius: '12px',
          transform: `scale(${currentScale}) translateY(${currentY}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div>Hover Me</div>
        <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.9 }}>
          Scale & Lift
        </div>
      </div>
    </div>
  );
}

function TapDemo() {
  const scale = useMotionValue(1);
  const [currentScale, setCurrentScale] = useState(1);
  const [tapCount, setTapCount] = useState(0);
  
  const tapRef = useTapAnimation(scale, {
    onTapStart: {
      target: 0.95,
      config: { duration: 100 },
    },
    onTapEnd: {
      target: 1,
      config: { stiffness: 400, damping: 25 },
    },
    onTap: () => {
      setTapCount(prev => prev + 1);
    },
  });
  
  useEffect(() => {
    const unsubscribe = scale.onChange((value: number) => {
      setCurrentScale(value);
    });
    return unsubscribe;
  }, [scale]);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
      <button
        ref={tapRef}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.125rem',
          fontWeight: 'bold',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transform: `scale(${currentScale})`,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          userSelect: 'none',
        }}
      >
        Tap Me
      </button>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        Tap count: {tapCount}
      </div>
    </div>
  );
}

function FocusDemo() {
  const scale = useMotionValue(1);
  const [currentScale, setCurrentScale] = useState(1);
  const [isFocused, setIsFocused] = useState(false);
  
  const focusRef = useFocusAnimation(scale, {
    onFocusStart: {
      target: 1.02,
      config: { stiffness: 300, damping: 20 },
    },
    onFocusEnd: {
      target: 1,
      config: { stiffness: 300, damping: 20 },
    },
  });
  
  const [, focusState] = useFocus({
    onFocusChange: (focused) => {
      setIsFocused(focused);
    },
  });
  
  useEffect(() => {
    const unsubscribe = scale.onChange((value: number) => {
      setCurrentScale(value);
    });
    return unsubscribe;
  }, [scale]);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
      <input
        ref={focusRef}
        type="text"
        placeholder="Click to focus"
        style={{
          padding: '0.75rem 1rem',
          fontSize: '1rem',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          outline: 'none',
          transform: `scale(${currentScale})`,
          transition: 'border-color 0.2s',
          borderColor: isFocused ? '#3b82f6' : '#e5e7eb',
        }}
      />
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        {isFocused ? 'Focused' : 'Not focused'}
      </div>
    </div>
  );
}


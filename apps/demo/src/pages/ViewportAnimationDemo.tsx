/**
 * Demo page for Viewport Animations
 */

import { useRef, useState, useEffect } from 'react';
import { Stack } from '@cascade/react';
import {
  useInView,
  useInViewState,
  useFadeInOnScroll,
  useSlideInOnScroll,
  useViewportAnimationWithRef,
  useMotionValue,
} from '@cascade/motion-runtime';

export function ViewportAnimationDemo() {
  return (
    <Stack spacing="xl">
      <div>
        <h2>Viewport Animations</h2>
        <p>Scroll-triggered animations using IntersectionObserver API</p>
      </div>

      {/* Spacer to ensure elements start off-screen */}
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '1.5rem', color: '#666' }}>Scroll down to see animations</p>
      </div>

      <section>
        <h3>Basic Viewport Detection</h3>
        <p>Simple boolean detection when element enters viewport</p>
        <BasicInViewDemo />
      </section>

      <section>
        <h3>Detailed Viewport State</h3>
        <p>Access intersection ratio and bounding boxes</p>
        <DetailedStateDemo />
      </section>

      <section>
        <h3>Fade In On Scroll</h3>
        <p>Convenience hook for fade-in animations</p>
        <FadeInDemo />
      </section>

      <section>
        <h3>Slide In On Scroll</h3>
        <p>Slide-in animations from different directions</p>
        <SlideInDemo />
      </section>

      <section>
        <h3>Custom Viewport Animation</h3>
        <p>Animate motion values with custom enter/exit animations</p>
        <CustomAnimationDemo />
      </section>

      <section>
        <h3>Spring vs Keyframe</h3>
        <p>Compare spring physics with keyframe animations</p>
        <SpringVsKeyframeDemo />
      </section>

      <section>
        <h3>Multiple Elements</h3>
        <p>Staggered animations for multiple elements</p>
        <MultipleElementsDemo />
      </section>

      <section>
        <h3>Once Option</h3>
        <p>Animations that only trigger once</p>
        <OnceDemo />
      </section>

      {/* Final spacer */}
      <div style={{ height: '50vh' }} />
    </Stack>
  );
}

function BasicInViewDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    threshold: 0.1,
  });

  return (
    <div
      ref={ref}
      style={{
        padding: '2rem',
        backgroundColor: isInView ? '#d4edda' : '#f8d7da',
        borderRadius: '8px',
        transition: 'background-color 0.3s ease',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div>
        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          {isInView ? '✅ In View' : '❌ Out of View'}
        </p>
        <p style={{ color: '#666' }}>
          Threshold: 10% visibility
        </p>
      </div>
    </div>
  );
}

function DetailedStateDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const state = useInViewState(ref, {
    threshold: [0, 0.25, 0.5, 0.75, 1],
  });

  return (
    <div
      ref={ref}
      style={{
        padding: '2rem',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        minHeight: '200px',
      }}
    >
      <div>
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
          {state.isInView ? '✅ In View' : '❌ Out of View'}
        </p>
        {state.entry && (
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            <p>Intersection Ratio: {(state.entry.intersectionRatio * 100).toFixed(1)}%</p>
            <p>Bounding Client Rect: {state.entry.boundingClientRect.height.toFixed(0)}px tall</p>
            <p>Root Bounds: {state.entry.rootBounds?.height.toFixed(0)}px tall</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FadeInDemo() {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);

  useFadeInOnScroll(ref1, {
    threshold: 0.2,
    duration: 500,
    once: true,
  });

  useFadeInOnScroll(ref2, {
    threshold: 0.2,
    useSpring: true,
    spring: { stiffness: 300, damping: 30 },
    once: true,
  });

  useFadeInOnScroll(ref3, {
    threshold: 0.2,
    duration: 800,
    initial: 0.3,
    target: 1,
    once: true,
  });

  return (
    <Stack spacing="md">
      <div
        ref={ref1}
        style={{
          padding: '2rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '8px',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Keyframe Animation (500ms)</p>
      </div>
      <div
        ref={ref2}
        style={{
          padding: '2rem',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '8px',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Spring Animation</p>
      </div>
      <div
        ref={ref3}
        style={{
          padding: '2rem',
          backgroundColor: '#8b5cf6',
          color: 'white',
          borderRadius: '8px',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Custom Initial/Target Values</p>
      </div>
    </Stack>
  );
}

function SlideInDemo() {
  const refUp = useRef<HTMLDivElement>(null);
  const refDown = useRef<HTMLDivElement>(null);
  const refLeft = useRef<HTMLDivElement>(null);
  const refRight = useRef<HTMLDivElement>(null);

  useSlideInOnScroll(refUp, {
    direction: 'up',
    distance: 50,
    duration: 600,
    threshold: 0.2,
    once: true,
  });

  useSlideInOnScroll(refDown, {
    direction: 'down',
    distance: 50,
    duration: 600,
    threshold: 0.2,
    once: true,
  });

  useSlideInOnScroll(refLeft, {
    direction: 'left',
    distance: 100,
    duration: 600,
    threshold: 0.2,
    once: true,
  });

  useSlideInOnScroll(refRight, {
    direction: 'right',
    distance: 100,
    duration: 600,
    threshold: 0.2,
    once: true,
  });

  return (
    <Stack spacing="md">
      <div
        ref={refUp}
        style={{
          padding: '2rem',
          backgroundColor: '#f59e0b',
          color: 'white',
          borderRadius: '8px',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Slide Up</p>
      </div>
      <div
        ref={refDown}
        style={{
          padding: '2rem',
          backgroundColor: '#ef4444',
          color: 'white',
          borderRadius: '8px',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Slide Down</p>
      </div>
      <div
        ref={refLeft}
        style={{
          padding: '2rem',
          backgroundColor: '#06b6d4',
          color: 'white',
          borderRadius: '8px',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Slide Left</p>
      </div>
      <div
        ref={refRight}
        style={{
          padding: '2rem',
          backgroundColor: '#ec4899',
          color: 'white',
          borderRadius: '8px',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Slide Right</p>
      </div>
    </Stack>
  );
}

function CustomAnimationDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(0);
  const scale = useMotionValue(0.8);
  const rotate = useMotionValue(-10);

  useViewportAnimationWithRef(ref, opacity, {
    threshold: 0.2,
    initial: 0,
    onEnter: {
      target: 1,
      config: { duration: 600, easing: 'ease-out' },
    },
    onExit: {
      target: 0,
      config: { duration: 300 },
    },
  });

  useViewportAnimationWithRef(ref, scale, {
    threshold: 0.2,
    initial: 0.8,
    onEnter: {
      target: 1,
      config: { stiffness: 300, damping: 25 },
    },
    onExit: {
      target: 0.8,
      config: { stiffness: 300, damping: 25 },
    },
  });

  useViewportAnimationWithRef(ref, rotate, {
    threshold: 0.2,
    initial: -10,
    onEnter: {
      target: 0,
      config: { duration: 600, easing: 'ease-out' },
    },
    onExit: {
      target: -10,
      config: { duration: 300 },
    },
  });

  const [opacityValue, setOpacityValue] = useState(0);
  const [scaleValue, setScaleValue] = useState(0.8);
  const [rotateValue, setRotateValue] = useState(-10);

  useEffect(() => {
    const unsubscribeOpacity = opacity.onChange(setOpacityValue);
    const unsubscribeScale = scale.onChange(setScaleValue);
    const unsubscribeRotate = rotate.onChange(setRotateValue);

    return () => {
      unsubscribeOpacity();
      unsubscribeScale();
      unsubscribeRotate();
    };
  }, [opacity, scale, rotate]);

  return (
    <div
      ref={ref}
      style={{
        padding: '2rem',
        backgroundColor: '#6366f1',
        color: 'white',
        borderRadius: '8px',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: opacityValue,
        transform: `scale(${scaleValue}) rotate(${rotateValue}deg)`,
        transition: 'none', // Motion values handle the animation
      }}
    >
      <div>
        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Custom Multi-Property Animation</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          Opacity: {opacityValue.toFixed(2)} | Scale: {scaleValue.toFixed(2)} | Rotate: {rotateValue.toFixed(1)}°
        </p>
      </div>
    </div>
  );
}

function SpringVsKeyframeDemo() {
  const refSpring = useRef<HTMLDivElement>(null);
  const refKeyframe = useRef<HTMLDivElement>(null);
  const xSpring = useMotionValue(-100);
  const xKeyframe = useMotionValue(-100);

  useViewportAnimationWithRef(refSpring, xSpring, {
    threshold: 0.2,
    initial: -100,
    onEnter: {
      target: 0,
      config: { stiffness: 300, damping: 25 },
    },
    once: true,
  });

  useViewportAnimationWithRef(refKeyframe, xKeyframe, {
    threshold: 0.2,
    initial: -100,
    onEnter: {
      target: 0,
      config: { duration: 600, easing: 'ease-out' },
    },
    once: true,
  });

  const [xSpringValue, setXSpringValue] = useState(-100);
  const [xKeyframeValue, setXKeyframeValue] = useState(-100);

  useEffect(() => {
    const unsubscribeSpring = xSpring.onChange(setXSpringValue);
    const unsubscribeKeyframe = xKeyframe.onChange(setXKeyframeValue);

    return () => {
      unsubscribeSpring();
      unsubscribeKeyframe();
    };
  }, [xSpring, xKeyframe]);

  return (
    <Stack spacing="md">
      <div
        ref={refSpring}
        style={{
          padding: '2rem',
          backgroundColor: '#14b8a6',
          color: 'white',
          borderRadius: '8px',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateX(${xSpringValue}px)`,
        }}
      >
        <p>Spring Animation (bouncy physics)</p>
      </div>
      <div
        ref={refKeyframe}
        style={{
          padding: '2rem',
          backgroundColor: '#64748b',
          color: 'white',
          borderRadius: '8px',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateX(${xKeyframeValue}px)`,
        }}
      >
        <p>Keyframe Animation (ease-out)</p>
      </div>
    </Stack>
  );
}

function MultipleElementsDemo() {
  const items = Array.from({ length: 5 }, (_, i) => i);
  
  return (
    <Stack spacing="md">
      {items.map((i) => (
        <AnimatedCard key={i} index={i} />
      ))}
    </Stack>
  );
}

function AnimatedCard({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useFadeInOnScroll(ref, {
    threshold: 0.1,
    duration: 400,
    once: true,
  });

  return (
    <div
      ref={ref}
      style={{
        padding: '2rem',
        backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
        color: 'white',
        borderRadius: '8px',
        minHeight: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p>Card {index + 1}</p>
    </div>
  );
}

function OnceDemo() {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);

  useFadeInOnScroll(ref1, {
    threshold: 0.2,
    duration: 500,
    once: true, // Only animate once
  });

  useFadeInOnScroll(ref2, {
    threshold: 0.2,
    duration: 500,
    once: false, // Animate every time it enters viewport
  });

  return (
    <Stack spacing="md">
      <div
        ref={ref1}
        style={{
          padding: '2rem',
          backgroundColor: '#22c55e',
          color: 'white',
          borderRadius: '8px',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Once: true (animates only once)</p>
      </div>
      <div
        ref={ref2}
        style={{
          padding: '2rem',
          backgroundColor: '#f97316',
          color: 'white',
          borderRadius: '8px',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Once: false (animates every time)</p>
      </div>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        Scroll up and down to see the difference. The orange card will fade in/out each time,
        while the green card only animates once.
      </p>
    </Stack>
  );
}


/**
 * Fully Animated Landing Page
 * Demonstrates Cascade CSS Foundation layout primitives and motion capabilities
 * 
 * REFACTORED: Now uses reusable, parameterized components to prove Cascade's
 * support for component composition and reusability alongside integration features.
 */

import { useEffect, useRef, useState } from 'react';
import { Stack, Cluster } from '@cascade/react';
import {
  useMotionValue,
  useScale,
  useTranslateY,
  useTranslateX,
  useRotate,
  MotionSequence,
  MotionStage,
  usePauseWhenOffScreen,
} from '@cascade/motion-runtime';
import { defineMotion } from '@cascade/compiler';
import { tokens } from '@cascade/tokens';
import {
  AnimatedCard,
  AnimatedSection,
  AnimatedSequenceCard,
  AnimatedTestimonial,
  AnimatedHero,
  useMotionStyles,
} from '../components';

// Hero Section - Now using reusable AnimatedHero component
function HeroSection() {
  return (
    <AnimatedHero
      title="Cascade CSS Foundation"
      subtitle="A production-ready, universal layout system that treats CSS as a foundational rendering layer"
      ctaText="Get Started"
      onCtaClick={() => console.log('CTA clicked')}
    />
  );
}

// Feature Card - Now using reusable AnimatedCard component
// This demonstrates component reusability and parameterization

// Features Section - Now using reusable AnimatedSection and AnimatedCard components
function FeaturesSection() {
  const features = [
    {
      title: 'CSS-First Architecture',
      description: 'All styles compile to vanilla CSS with zero runtime overhead for static styles.',
      icon: '⚡',
    },
    {
      title: 'Type-Safe Tokens',
      description: 'Full TypeScript support with generated types for design tokens and components.',
      icon: '🎨',
    },
    {
      title: 'Layout Primitives',
      description: 'Composable layout components: Stack, Cluster, and Frame for flexible designs.',
      icon: '📐',
    },
    {
      title: 'Smooth Animations',
      description: 'Spring physics and GPU-accelerated animations with motion primitives.',
      icon: '✨',
    },
    {
      title: 'Framework Agnostic',
      description: 'Works with React, Vue, or any framework. Components compile to adapters.',
      icon: '🔧',
    },
    {
      title: 'Performance Optimized',
      description: 'Hardware-accelerated properties and layout-triggering warnings built-in.',
      icon: '🚀',
    },
  ];

  return (
    <AnimatedSection
      title="Powerful Features"
      subtitle="Everything you need to build beautiful, performant interfaces"
      background="white"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--cascade-space-lg)',
          width: '100%',
        }}
      >
        {features.map((feature, index) => (
          <AnimatedCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            delay={index * 100}
          />
        ))}
      </div>
    </AnimatedSection>
  );
}

// Testimonial - Now using reusable AnimatedTestimonial component

// Testimonials Section - Now using reusable AnimatedSection and AnimatedTestimonial components
function TestimonialsSection() {
  const testimonials = [
    {
      quote: 'Cascade CSS Foundation transformed how we build layouts. The type-safe tokens and layout primitives make development a joy.',
      author: 'Sarah Chen',
      role: 'Senior Frontend Engineer',
    },
    {
      quote: 'The CSS-first approach means zero runtime overhead. Our bundle size decreased significantly while gaining powerful animation capabilities.',
      author: 'Michael Rodriguez',
      role: 'Tech Lead',
    },
    {
      quote: 'Finally, a layout system that respects CSS as a first-class citizen. The motion primitives are incredibly smooth and performant.',
      author: 'Emily Johnson',
      role: 'UI/UX Designer',
    },
  ];

  return (
    <AnimatedSection
      title="What Developers Say"
      background={`linear-gradient(135deg, ${tokens.color.blue[100]} 0%, ${tokens.color.blue[50]} 100%)`}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--cascade-space-lg)',
          width: '100%',
        }}
      >
        {testimonials.map((testimonial) => (
          <AnimatedTestimonial
            key={testimonial.author}
            quote={testimonial.quote}
            author={testimonial.author}
            role={testimonial.role}
          />
        ))}
      </div>
    </AnimatedSection>
  );
}

// Footer Component - Now using reusable AnimatedSection component
function Footer() {
  return (
    <AnimatedSection
      title=""
      background={tokens.color.blue[900]}
      style={{ color: 'white', textAlign: 'center' }}
    >
      <Stack spacing="sm" align="center">
        <p style={{ fontSize: tokens.typography.fontSize.base, margin: 0 }}>
          Built with Cascade CSS Foundation
        </p>
        <p
          style={{
            fontSize: tokens.typography.fontSize.sm,
            opacity: 0.7,
            margin: 0,
          }}
        >
          © 2025 Cascade CSS Foundation. All rights reserved.
        </p>
      </Stack>
    </AnimatedSection>
  );
}

// CRAZY ANIMATION SEQUENCE SHOWCASE
// The most insane animation sequence possible with Cascade Motion

// Multiple overlapping animations
const crazySpinAnimation = defineMotion({
  type: 'spring',
  from: { transform: 'rotate(0deg) scale(0.5) translateY(100px)' },
  to: { transform: 'rotate(720deg) scale(1) translateY(0)' },
  duration: 1200,
});

const crazyBounceAnimation = defineMotion({
  type: 'spring',
  from: { transform: 'translateY(0) scale(1)' },
  to: { transform: 'translateY(-50px) scale(1.2)' },
  duration: 400,
});

const crazyFadeRotateAnimation = defineMotion({
  type: 'spring',
  from: { opacity: 0, transform: 'rotate(-180deg) translateX(-200px)' },
  to: { opacity: 1, transform: 'rotate(0deg) translateX(0)' },
  duration: 800,
});

const crazyScaleRotateAnimation = defineMotion({
  type: 'spring',
  from: { transform: 'scale(0) rotate(0deg)' },
  to: { transform: 'scale(1) rotate(360deg)' },
  duration: 1000,
});

const crazySlideRotateAnimation = defineMotion({
  type: 'spring',
  from: { transform: 'translateX(300px) rotate(90deg) scale(0.3)' },
  to: { transform: 'translateX(0) rotate(0deg) scale(1)' },
  duration: 900,
});

// Floating Particle Component
function FloatingParticle({ index }: { index: number }) {
  const particleX = useTranslateX(Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000));
  const particleY = useTranslateY(Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000));
  const particleRotate = useRotate(0);
  const particleScale = useScale(0.5 + Math.random() * 0.5);
  
  useEffect(() => {
    const animate = async () => {
      while (true) {
        const targetX = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000);
        const targetY = Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000);
        const targetScale = 0.5 + Math.random() * 0.5;
        
        await Promise.all([
          particleX.animateTo(targetX, { duration: 3000 + Math.random() * 2000, easing: 'ease-in-out' }),
          particleY.animateTo(targetY, { duration: 3000 + Math.random() * 2000, easing: 'ease-in-out' }),
          particleRotate.animateTo(360, { duration: 2000 + Math.random() * 1000, easing: 'linear' }),
          particleScale.animateTo(targetScale, { 
            duration: 1000 + Math.random() * 500,
            easing: 'ease-in-out',
          }),
        ]);
        particleRotate.set(0);
      }
    };
    animate();
  }, [particleX, particleY, particleRotate, particleScale]);

  return (
    <div
      style={{
        position: 'absolute',
        width: '20px',
        height: '20px',
        background: `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`,
        borderRadius: '50%',
        transform: `translate(var(${particleX.cssVarName}), var(${particleY.cssVarName})) rotate(var(${particleRotate.cssVarName}deg)) scale(var(${particleScale.cssVarName}))`,
      }}
    />
  );
}

function useCrazyAnimations() {
  useEffect(() => {
    const styleId = 'crazy-animations-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = 
        crazySpinAnimation.css + '\n' + 
        crazyBounceAnimation.css + '\n' + 
        crazyFadeRotateAnimation.css + '\n' + 
        crazyScaleRotateAnimation.css + '\n' + 
        crazySlideRotateAnimation.css;
      document.head.appendChild(styleElement);
    }
  }, []);
}

function CrazyAnimationShowcase() {
  // Use reusable hook for CSS injection - demonstrates reusability
  useMotionStyles([
    crazySpinAnimation,
    crazyBounceAnimation,
    crazyFadeRotateAnimation,
    crazyScaleRotateAnimation,
    crazySlideRotateAnimation,
  ], 'crazy-animations-styles');
  
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  
  // Multiple motion values for complex interactions
  const parallaxY = useTranslateY(0);
  const parallaxX = useTranslateX(0);
  const rotate1 = useRotate(0);
  const rotate2 = useRotate(0);
  const rotate3 = useRotate(0);
  const scale1 = useScale(1);
  const scale2 = useScale(1);
  const scale3 = useScale(1);
  const opacity = useMotionValue<number>(0, { property: 'opacity' });

  // Detect when section enters viewport to trigger animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          opacity.animateTo(1, { duration: 500, easing: 'ease-out' });
        } else {
          opacity.animateTo(0, { duration: 300, easing: 'ease-in' });
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [opacity]);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const elementTop = ref.current?.getBoundingClientRect().top || 0;
      const windowHeight = window.innerHeight;
      
      if (elementTop < windowHeight && elementTop > -windowHeight) {
        const progress = (windowHeight - elementTop) / (windowHeight * 2);
        parallaxY.set(progress * 100);
        parallaxX.set(progress * 50);
        rotate1.set(progress * 360);
        rotate2.set(progress * -360);
        rotate3.set(progress * 180);
        scale1.set(0.8 + progress * 0.4);
        scale2.set(1.2 - progress * 0.4);
        scale3.set(0.9 + progress * 0.2);
        opacity.set(Math.max(0, Math.min(1, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallaxY, parallaxX, rotate1, rotate2, rotate3, scale1, scale2, scale3, opacity]);

  // Pause animations when off-screen (performance optimization)
  usePauseWhenOffScreen(ref, {
    motionValues: [rotate1, rotate2, rotate3, scale1, scale2, scale3, parallaxY, parallaxX, opacity],
    threshold: 0.1,
  });

  // Continuous rotation animations
  useEffect(() => {
    // Only start animations if in view
    if (!isInView) return;
    
    const animateRotations = async () => {
      while (isInView) {
        await Promise.all([
          rotate1.animateTo(360, { duration: 3000, easing: 'linear' }),
          rotate2.animateTo(-360, { duration: 4000, easing: 'linear' }),
          rotate3.animateTo(180, { duration: 2500, easing: 'linear' }),
        ]);
        rotate1.set(0);
        rotate2.set(0);
        rotate3.set(0);
      }
    };
    animateRotations();
  }, [rotate1, rotate2, rotate3, isInView]);

  // Pulsing scale animations
  useEffect(() => {
    // Only start animations if in view
    if (!isInView) return;
    
    const pulse = async () => {
      while (isInView) {
        await Promise.all([
          scale1.animateTo(1.3, { stiffness: 200, damping: 15, from: scale1.get(), to: 1.3 }),
          scale2.animateTo(0.7, { stiffness: 150, damping: 20, from: scale2.get(), to: 0.7 }),
          scale3.animateTo(1.1, { stiffness: 300, damping: 25, from: scale3.get(), to: 1.1 }),
        ]);
        await Promise.all([
          scale1.animateTo(1, { stiffness: 200, damping: 15, from: scale1.get(), to: 1 }),
          scale2.animateTo(1, { stiffness: 150, damping: 20, from: scale2.get(), to: 1 }),
          scale3.animateTo(1, { stiffness: 300, damping: 25, from: scale3.get(), to: 1 }),
        ]);
      }
    };
    pulse();
  }, [scale1, scale2, scale3, isInView]);

  return (
    <section
      ref={ref}
      style={{
        minHeight: '150vh',
        padding: 'var(--cascade-space-xl)',
        background: `linear-gradient(135deg, ${tokens.color.blue[900]} 0%, ${tokens.color.primary} 50%, ${tokens.color.blue[50]} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Stack spacing="xl" align="center" style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            opacity: `var(${opacity.cssVarName})`,
          }}
        >
          🎪 CRAZY ANIMATION SHOWCASE 🎪
        </h2>

        <p
          style={{
            fontSize: tokens.typography.fontSize.lg,
            color: 'white',
            textAlign: 'center',
            opacity: `var(${opacity.cssVarName})`,
            maxWidth: '800px',
          }}
        >
          The most insane animation sequence possible with Cascade Motion
        </p>

        {/* Animated Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--cascade-space-xl)',
            width: '100%',
            marginTop: 'var(--cascade-space-xl)',
          }}
        >
          {/* Element 1: Spin + Scale + Translate - Using reusable AnimatedSequenceCard */}
          <AnimatedSequenceCard
            animation={crazySpinAnimation}
            title="Spin & Scale"
            description="Rotating 720° while scaling and translating"
            icon="🌪️"
            autoStart={isInView}
            additionalTransform={`translateY(var(${parallaxY.cssVarName})) rotate(var(${rotate1.cssVarName}deg)) scale(var(${scale1.cssVarName}))`}
          />

          {/* Element 2: Bounce + Rotate - Using reusable AnimatedSequenceCard */}
          <AnimatedSequenceCard
            animation={crazyBounceAnimation}
            title="Bounce & Rotate"
            description="Continuous bouncing with counter-rotation"
            icon="🎈"
            delay={200}
            autoStart={isInView}
            additionalTransform={`translateX(var(${parallaxX.cssVarName})) rotate(var(${rotate2.cssVarName}deg)) scale(var(${scale2.cssVarName}))`}
          />

          {/* Element 3: Fade + Rotate + Slide - Using reusable AnimatedSequenceCard */}
          <AnimatedSequenceCard
            animation={crazyFadeRotateAnimation}
            title="Fade & Slide"
            description="Fading in while rotating and sliding"
            icon="✨"
            delay={400}
            autoStart={isInView}
            additionalTransform={`translateY(calc(var(${parallaxY.cssVarName}) * -1)) rotate(var(${rotate3.cssVarName}deg)) scale(var(${scale3.cssVarName}))`}
          />

          {/* Element 4: Scale + Rotate - Using reusable AnimatedSequenceCard */}
          <AnimatedSequenceCard
            animation={crazyScaleRotateAnimation}
            title="Scale & Rotate"
            description="Scaling from 0 while rotating 360°"
            icon="🌀"
            delay={600}
            autoStart={isInView}
            additionalTransform={`translateY(var(${parallaxY.cssVarName})) rotate(calc(var(${rotate1.cssVarName}) * 0.5)) scale(calc(var(${scale1.cssVarName}) * 1.1))`}
          />

          {/* Element 5: Slide + Rotate + Scale - Using reusable AnimatedSequenceCard */}
          <AnimatedSequenceCard
            animation={crazySlideRotateAnimation}
            title="Slide & Morph"
            description="Sliding from right while rotating and scaling"
            icon="🎭"
            delay={800}
            autoStart={isInView}
            additionalTransform={`translateX(calc(var(${parallaxX.cssVarName}) * -1)) rotate(calc(var(${rotate2.cssVarName}) * 0.7)) scale(var(${scale2.cssVarName}))`}
          />

          {/* Element 6: All Combined - Using reusable AnimatedSequenceCard */}
          <AnimatedSequenceCard
            animation={crazySpinAnimation}
            title="ALL COMBINED"
            description="Parallax + Rotation + Scale + All animations!"
            icon="🎪"
            delay={1000}
            autoStart={isInView}
            additionalTransform={`
              translateY(var(${parallaxY.cssVarName})) 
              translateX(var(${parallaxX.cssVarName})) 
              rotate(var(${rotate3.cssVarName}deg)) 
              scale(var(${scale3.cssVarName}))
            `}
          />
        </div>

        {/* Floating particles effect - simplified to avoid hook rules */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <FloatingParticle key={i} index={i} />
          ))}
        </div>
      </Stack>
    </section>
  );
}

// Main Landing Page Component
export function LandingPage() {
  return (
    <div style={{ width: '100%' }}>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CrazyAnimationShowcase />
      <Footer />
    </div>
  );
}


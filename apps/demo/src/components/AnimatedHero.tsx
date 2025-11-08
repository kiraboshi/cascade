/**
 * Reusable Animated Hero Component
 * Parameterized hero section with sequenced animations
 */

import { useEffect, useRef } from 'react';
import { Stack } from '@cascade/react';
import { useMotionValue, MotionSequence, MotionStage, useAnimationStatesWithGestures } from '@cascade/motion-runtime';
import { defineMotion, defineAnimationStates } from '@cascade/compiler';
import { tokens } from '@cascade/tokens';
import { useMotionStyles } from './useMotionStyles';

export interface AnimatedHeroProps {
  /** Hero title */
  title: string;
  /** Hero subtitle */
  subtitle: string;
  /** CTA button text */
  ctaText?: string;
  /** CTA button onClick handler */
  onCtaClick?: () => void;
  /** Background gradient */
  background?: string;
  /** Maximum width of content */
  maxWidth?: string;
}

// Define animations once at module level (can be shared across instances)
// Fade in and slide down from top left with ease-in-out
// animation-fill-mode: backwards is now included by default to prevent flash
const heroTitleAnimation = defineMotion({
  from: { opacity: 0, transform: 'translate(-50px, -50px)' },
  to: { opacity: 1, transform: 'translate(0, 0)' },
  duration: '800ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
});

const heroSubtitleAnimation = defineMotion({
  from: { opacity: 0, transform: 'translate(-40px, -40px)' },
  to: { opacity: 1, transform: 'translate(0, 0)' },
  duration: '700ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
});

const heroCTAAnimation = defineMotion({
  from: { opacity: 0, transform: 'translate(-30px, -30px)' },
  to: { opacity: 1, transform: 'translate(0, 0)' },
  duration: '600ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
});

/**
 * Reusable animated hero component with sequenced title, subtitle, and CTA animations
 * Includes animated gradient background that rotates smoothly
 */
export function AnimatedHero({
  title,
  subtitle,
  ctaText = 'Get Started',
  onCtaClick,
  background = `linear-gradient(135deg, ${tokens.color.blue[50]} 0%, ${tokens.color.blue[100]} 100%)`,
  maxWidth = '800px',
}: AnimatedHeroProps) {
  // Inject CSS styles using reusable hook
  useMotionStyles([heroTitleAnimation, heroSubtitleAnimation, heroCTAAnimation], 'hero-animations');
  
  const gradientProgress = useMotionValue(0, { property: 'background' });
  const sectionRef = useRef<HTMLElement>(null);
  
  // Define CTA button animation states
  const ctaButtonStates = defineAnimationStates({
    initial: { scale: 0.95 },
    animate: { scale: 1, transition: { duration: 300 } },
    hover: { scale: 1.05, transition: { duration: 200 } },
    tap: { scale: 0.95, transition: { duration: 100 } },
  });
  
  const ctaAnimation = useAnimationStatesWithGestures(ctaButtonStates, {
    initial: 'initial',
    animate: 'animate',
    hover: true,
    tap: true,
  });

  // Animate gradient background
  useEffect(() => {
    if (!sectionRef.current) return;

    // Use actual token colors (OKLCH format)
    const fromColor = tokens.color.blue[50]; // oklch(0.95 0.02 250)
    const toColor = tokens.color.blue[100]; // oklch(0.90 0.04 250)

    const updateGradient = () => {
      const p = gradientProgress.get();
      
      // Rotate gradient angle smoothly (full rotation)
      const angle = 135 + (p * 360);
      
      // Create gradient with animated angle and color transitions
      // Use the actual OKLCH colors from tokens
      const gradient = `linear-gradient(${angle}deg, ${fromColor} 0%, ${toColor} 50%, ${fromColor} 100%)`;
      
      if (sectionRef.current) {
        sectionRef.current.style.background = gradient;
      }
    };

    const unsubscribe = gradientProgress.onChange(() => updateGradient());
    updateGradient();

    // Animate gradient in a smooth loop
    const animateGradient = async () => {
      while (true) {
        await (gradientProgress as any).animateTo(1, {
          duration: 10000,
          easing: 'ease-in-out',
        });
        await (gradientProgress as any).animateTo(0, {
          duration: 10000,
          easing: 'ease-in-out',
        });
      }
    };
    
    animateGradient();

    return unsubscribe;
  }, [gradientProgress]);

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        padding: 'var(--cascade-space-xl)',
        transition: 'background 0.3s ease',
      }}
    >
      <Stack spacing="lg" align="center" style={{ maxWidth, textAlign: 'center' }}>
        <MotionSequence autoStart>
          <MotionStage
            animation={{
              className: heroTitleAnimation.className,
              css: heroTitleAnimation.css,
            }}
          >
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 'var(--cascade-space-md)',
              }}
            >
              <h1
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 'bold',
                  color: tokens.color.blue[900],
                  margin: 0,
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  color: tokens.color.blue[900],
                  opacity: 0.8,
                  maxWidth: '600px',
                  margin: 0,
                }}
              >
                {subtitle}
              </p>
              {ctaText && (
                <div
                  ref={(el) => {
                    if (ctaAnimation.ref.current !== el && el) {
                      (ctaAnimation.ref as any).current = el.querySelector('button');
                    }
                  }}
                  style={{
                    marginTop: 'var(--cascade-space-sm)',
                  }}
                >
                  <button
                    ref={(el) => {
                      if (ctaAnimation.ref.current !== el && el) {
                        (ctaAnimation.ref as any).current = el;
                      }
                    }}
                    className={ctaAnimation.className}
                    style={{
                      padding: 'var(--cascade-space-md) var(--cascade-space-xl)',
                      fontSize: tokens.typography.fontSize.base,
                      fontWeight: '600',
                      color: 'white',
                      background: tokens.color.primary,
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                    onClick={onCtaClick}
                  >
                    {ctaText}
                  </button>
                </div>
              )}
            </div>
          </MotionStage>
        </MotionSequence>
      </Stack>
    </section>
  );
}


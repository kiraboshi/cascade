import { useState, useEffect } from 'react';
import { Stack } from '@cascade/react';
import { MotionSequence, MotionStage } from '@cascade/motion-runtime';
import { defineMotionSequence, defineMotion } from '@cascade/compiler';

// Define the slide and fade sequence
const slideAndFadeSequence = defineMotionSequence({
  stages: [
    {
      name: 'slide',
      from: { transform: 'translateX(0)' },
      to: { transform: 'translateX(400px)' },
      duration: '800ms',
      easing: 'cubic-bezier(0, 0, 0.2, 1)',
    },
    {
      name: 'fade',
      startAt: '60%', // Fade starts at 60% of slide duration
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: '400ms',
      easing: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  ],
});

// Next animation after fade completes
const nextAnimation = defineMotion({
  from: { transform: 'scale(0.8)', opacity: 0 },
  to: { transform: 'scale(1)', opacity: 1 },
  duration: '500ms',
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
});

export function SequenceDemo() {
  const [key, setKey] = useState(0);
  
  // Inject CSS from motion compiler
  useEffect(() => {
    const styleId = 'sequence-demo-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = slideAndFadeSequence.css + '\n' + nextAnimation.css;
      document.head.appendChild(styleElement);
    }
  }, []);

  return (
    <Stack spacing="lg">
      <h2>Motion Sequences</h2>
      
      <section>
        <h3>Complex Animation Sequence</h3>
        <p>
          Element slides across screen, fades out at 60% of the slide duration,
          then triggers a new animation once fade completes.
        </p>
        
        <button onClick={() => setKey((k) => k + 1)}>
          Restart Sequence
        </button>
        
        <div style={{ 
          marginTop: '2rem', 
          height: '200px', 
          position: 'relative',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <MotionSequence
            key={key}
            autoStart={true}
            onComplete={() => {
              console.log('Sequence complete!');
            }}
          >
            <MotionStage
              animation={{
                className: slideAndFadeSequence.className,
                css: slideAndFadeSequence.css,
              }}
              onComplete={(e) => {
                console.log('Slide and fade complete');
                e.next();
              }}
            >
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  background: 'var(--cascade-color-primary)',
                  borderRadius: '8px',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            </MotionStage>
            
            <MotionStage
              animation={{
                className: nextAnimation.className,
                css: nextAnimation.css,
              }}
              delay="until-previous-completes"
            >
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  background: 'var(--cascade-color-blue-500)',
                  borderRadius: '8px',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </MotionStage>
          </MotionSequence>
        </div>
        
        <details style={{ marginTop: '1rem' }}>
          <summary>Generated CSS & Config</summary>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '4px',
            overflow: 'auto',
            marginTop: '0.5rem',
            fontSize: '0.875rem'
          }}>
            {slideAndFadeSequence.css}
          </pre>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '4px',
            overflow: 'auto',
            marginTop: '0.5rem',
            fontSize: '0.875rem'
          }}>
            {JSON.stringify(slideAndFadeSequence.jsConfig, null, 2)}
          </pre>
        </details>
      </section>
    </Stack>
  );
}


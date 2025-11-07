import { useState, useEffect } from 'react';
import { Stack } from '@cascade/react';
import { defineMotion } from '@cascade/compiler';

// Define a simple spring animation
const fadeIn = defineMotion({
  type: 'spring',
  stiffness: 300,
  damping: 20,
  from: { opacity: 0, transform: 'translateY(20px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
  duration: 300,
});

export function MotionDemo() {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Inject CSS from motion compiler
  useEffect(() => {
    const styleId = 'motion-demo-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = fadeIn.css;
      document.head.appendChild(styleElement);
    }
  }, []);

  return (
    <Stack spacing="lg">
      <h2>Motion Compiler</h2>
      
      <section>
        <h3>Spring Animation</h3>
        <p>Spring physics compiled to CSS keyframes</p>
        
        <button onClick={() => setIsAnimating(!isAnimating)}>
          {isAnimating ? 'Reset' : 'Animate'}
        </button>
        
        <div
          className={isAnimating ? fadeIn.className : ''}
          style={{
            width: '200px',
            height: '200px',
            background: 'var(--cascade-color-primary)',
            borderRadius: '8px',
            marginTop: '1rem',
            opacity: isAnimating ? 1 : 0,
            transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
          }}
        />
        
        <details style={{ marginTop: '1rem' }}>
          <summary>Generated CSS</summary>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '4px',
            overflow: 'auto',
            marginTop: '0.5rem'
          }}>
            {fadeIn.css}
          </pre>
        </details>
      </section>
    </Stack>
  );
}


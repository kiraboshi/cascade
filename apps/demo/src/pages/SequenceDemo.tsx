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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 100, height: 100 });
  const [items, setItems] = useState([1, 2, 3]);
  const [expanded, setExpanded] = useState(false);
  
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
      
      <section style={{ marginTop: '2rem' }}>
        <h3>Layout Transition Integration</h3>
        <p>
          MotionStage now supports layout transitions! Enable layout transitions
          to automatically animate position and size changes.
        </p>
        
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
        
        <details style={{ marginTop: '1rem' }}>
          <summary>Code Example</summary>
          <pre style={{ 
            marginTop: '0.5rem', 
            padding: '1rem', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '0.875rem'
          }}>
{`<MotionSequence layoutTransition={{ duration: 400 }}>
  <MotionStage
    animation={myAnimation}
    layoutTransition={true}
    style={{ left: \`\${x}px\`, top: \`\${y}px\` }}
  >
    <div>Content</div>
  </MotionStage>
</MotionSequence>`}
          </pre>
        </details>
      </section>
      
      <section style={{ marginTop: '2rem' }}>
        <h3>Layout Transition with List Reordering</h3>
        <p>
          Layout transitions work seamlessly with list reordering. Each stage
          automatically animates to its new position when items are reordered.
        </p>
        
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
      </section>
      
      <section style={{ marginTop: '2rem' }}>
        <h3>Layout Transition with Expand/Collapse</h3>
        <p>
          Combine layout transitions with size changes for smooth expand/collapse animations.
        </p>
        
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
      </section>
      
      <section style={{ marginTop: '2rem' }}>
        <h3>Per-Stage Layout Transition Configuration</h3>
        <p>
          Each stage can have its own layout transition configuration, or inherit
          from the parent MotionSequence.
        </p>
        
        <div style={{ 
          marginTop: '2rem',
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <MotionSequence layoutTransition={{ duration: 300 }}>
            <MotionStage
              layoutTransition={true}
              style={{
                width: '100px',
                height: '100px',
                background: 'var(--cascade-color-primary)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              Default
            </MotionStage>
            
            <MotionStage
              layoutTransition={{ duration: 600, easing: 'ease-in-out' }}
              style={{
                width: '100px',
                height: '100px',
                background: 'var(--cascade-color-blue-500)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              Slow
            </MotionStage>
            
            <MotionStage
              layoutTransition={{ duration: 200, origin: 'top-right' }}
              style={{
                width: '100px',
                height: '100px',
                background: 'var(--cascade-color-green-500)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              Fast
            </MotionStage>
          </MotionSequence>
        </div>
        
        <details style={{ marginTop: '1rem' }}>
          <summary>Code Example</summary>
          <pre style={{ 
            marginTop: '0.5rem', 
            padding: '1rem', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '0.875rem'
          }}>
{`<MotionSequence layoutTransition={{ duration: 300 }}>
  {/* Inherits duration: 300 */}
  <MotionStage animation={anim} layoutTransition={true} />
  
  {/* Overrides with custom config */}
  <MotionStage 
    animation={anim} 
    layoutTransition={{ duration: 600, easing: 'ease-in-out' }} 
  />
  
  {/* Different origin point */}
  <MotionStage 
    animation={anim} 
    layoutTransition={{ duration: 200, origin: 'top-right' }} 
  />
</MotionSequence>`}
          </pre>
        </details>
      </section>
    </Stack>
  );
}


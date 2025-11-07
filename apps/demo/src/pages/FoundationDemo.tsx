import { Stack } from '@cascade/react';

export function FoundationDemo() {
  return (
    <Stack spacing="lg">
      <h2>Foundation Layer</h2>
      
      <section>
        <h3>Design Tokens</h3>
        <Stack spacing="md">
          <div>
            <strong>Colors:</strong>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginTop: '0.5rem' 
            }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                background: 'var(--cascade-color-primary)',
                borderRadius: '4px'
              }} />
              <div style={{ 
                width: '50px', 
                height: '50px', 
                background: 'var(--cascade-color-blue-500)',
                borderRadius: '4px'
              }} />
            </div>
          </div>
          
          <div>
            <strong>Spacing:</strong>
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ 
                height: '20px', 
                background: '#ccc', 
                width: 'var(--cascade-space-xs)',
                marginBottom: '0.5rem'
              }}>xs</div>
              <div style={{ 
                height: '20px', 
                background: '#ccc', 
                width: 'var(--cascade-space-sm)',
                marginBottom: '0.5rem'
              }}>sm</div>
              <div style={{ 
                height: '20px', 
                background: '#ccc', 
                width: 'var(--cascade-space-md)',
                marginBottom: '0.5rem'
              }}>md</div>
              <div style={{ 
                height: '20px', 
                background: '#ccc', 
                width: 'var(--cascade-space-lg)',
                marginBottom: '0.5rem'
              }}>lg</div>
            </div>
          </div>
        </Stack>
      </section>
      
      <section>
        <h3>CSS Layers</h3>
        <p>The foundation uses CSS @layer to manage cascade priority:</p>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '1rem', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
{`@layer reset, tokens, base, layouts, components, utilities, motion, overrides;`}
        </pre>
      </section>
    </Stack>
  );
}


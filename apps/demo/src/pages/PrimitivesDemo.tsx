import { Stack, Cluster, Frame } from '@cascade/react';

export function PrimitivesDemo() {
  return (
    <Stack spacing="xl">
      <h2>Layout Primitives</h2>
      
      <section>
        <h3>Stack</h3>
        <p>Vertical flex container with configurable spacing</p>
        <Stack spacing="md" style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <div style={{ background: '#e3f2fd', padding: '0.5rem' }}>Item 1</div>
          <div style={{ background: '#e3f2fd', padding: '0.5rem' }}>Item 2</div>
          <div style={{ background: '#e3f2fd', padding: '0.5rem' }}>Item 3</div>
        </Stack>
      </section>
      
      <section>
        <h3>Cluster</h3>
        <p>Horizontal flex container with wrapping</p>
        <Cluster spacing="sm" style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <div style={{ background: '#fff3e0', padding: '0.5rem' }}>Tag 1</div>
          <div style={{ background: '#fff3e0', padding: '0.5rem' }}>Tag 2</div>
          <div style={{ background: '#fff3e0', padding: '0.5rem' }}>Tag 3</div>
          <div style={{ background: '#fff3e0', padding: '0.5rem' }}>Tag 4</div>
          <div style={{ background: '#fff3e0', padding: '0.5rem' }}>Tag 5</div>
        </Cluster>
      </section>
      
      <section>
        <h3>Frame</h3>
        <p>Aspect ratio container</p>
        <Frame ratio="16/9" style={{ border: '1px solid #ccc', maxWidth: '500px' }}>
          <div style={{ 
            width: '100%', 
            height: '100%', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem'
          }}>
            16:9
          </div>
        </Frame>
      </section>
    </Stack>
  );
}


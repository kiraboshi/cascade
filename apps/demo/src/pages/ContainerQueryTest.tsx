import React from 'react';
import { Grid } from '@cascade/react';

export function ContainerQueryTest() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Container Query Test</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Testing CSS container queries. Each grid should respond to its container size.
      </p>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Test 1: Narrow Container (300px, should show 1 column)</h2>
        <div style={{ width: '300px', border: '2px solid red', padding: '1rem' }}>
          <Grid 
            columns={1}
            containerQueries={{
              minWidth: {
                '30rem': { columns: 2 },
                '50rem': { columns: 3 }
              }
            }}
            gap="md"
            style={{ backgroundColor: '#f0f0f0' }}
          >
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>1</div>
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>2</div>
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>3</div>
          </Grid>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Test 2: Medium Container (520px = ~32.5rem, should trigger 30rem query = 2 columns)</h2>
        <div 
          id="test-2-container"
          style={{ 
            width: '520px', 
            border: '2px solid red', 
            padding: '1rem'
          }}
        >
          <Grid 
            id="test-2-grid"
            columns={1}
            containerQueries={{
              minWidth: {
                '30rem': { columns: 2 },
                '50rem': { columns: 3 }
              }
            }}
            gap="md"
            style={{ backgroundColor: '#f0f0f0' }}
          >
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>1</div>
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>2</div>
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>3</div>
          </Grid>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            <strong>Note:</strong> Grid automatically wraps itself in a container when <code>containerQueries</code> prop is used.
            Container queries check the wrapper container's size, which matches the parent's size.
            <br />
            <strong>Debug Test 3:</strong> Run in console:
            <pre style={{ background: '#f5f5f5', padding: '0.5rem', marginTop: '0.25rem', fontSize: '0.75rem', overflow: 'auto' }}>
{`const container = document.querySelector('#test-3-container');
const wrapper = container?.querySelector('div[style*="container-type"]');
const grid = container?.querySelector('#test-3-grid');
if (wrapper && grid) {
  const computed = getComputedStyle(grid);
  console.log('Container width:', container.offsetWidth, 'px');
  console.log('Wrapper width:', wrapper.offsetWidth, 'px');
  console.log('Grid width:', grid.offsetWidth, 'px');
  console.log('grid-template-columns:', computed.gridTemplateColumns);
  console.log('--grid-columns:', computed.getPropertyValue('--grid-columns'));
  console.log('Expected: Wrapper should be 800px (832px - 32px padding)');
}`}
            </pre>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Test 3: Wide Container (836px, should trigger 50rem query = 3 columns)</h2>
        <div id="test-3-container" style={{ width: '836px', border: '2px solid red', padding: '1rem' }}>
          <Grid 
            id="test-3-grid"
            columns={1}
            containerQueries={{
              minWidth: {
                '30rem': { columns: 2 },
                '50rem': { columns: 3 }
              }
            }}
            gap="md"
            style={{ backgroundColor: '#f0f0f0' }}
          >
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>1</div>
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>2</div>
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>3</div>
          </Grid>
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            <strong>Debug Test 3:</strong> Run in console:
            <pre style={{ background: '#f5f5f5', padding: '0.5rem', marginTop: '0.25rem', fontSize: '0.75rem', overflow: 'auto' }}>
{`const container = document.querySelector('#test-3-container');
const wrapper = container?.querySelector('div[style*="container-type"]');
const grid = container?.querySelector('#test-3-grid');
if (wrapper && grid) {
  const computed = getComputedStyle(grid);
  console.log('Container width:', container.offsetWidth, 'px');
  console.log('Wrapper width:', wrapper.offsetWidth, 'px');
  console.log('Grid width:', grid.offsetWidth, 'px');
  console.log('grid-template-columns:', computed.gridTemplateColumns);
  console.log('--grid-columns:', computed.getPropertyValue('--grid-columns'));
  console.log('Expected: Wrapper should be 804px (836px - 32px padding)');
}`}
            </pre>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Test 4: Direct Width Test (500px Grid, should trigger 30rem = 2 columns)</h2>
        <div style={{ width: '500px' }}>
          <Grid 
            columns={1}
            containerQueries={{
              minWidth: {
                '30rem': { columns: 2 },
                '50rem': { columns: 3 }
              }
            }}
            gap="md"
            style={{ backgroundColor: '#f0f0f0', border: '2px solid green' }}
          >
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>1</div>
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>2</div>
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>3</div>
          </Grid>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Test 5: Resizable Container</h2>
        <div 
          id="resizable-container"
          style={{ 
            width: '400px', 
            border: '2px solid red', 
            padding: '1rem',
            resize: 'horizontal',
            overflow: 'auto'
          }}
        >
          <Grid 
            columns={1}
            containerQueries={{
              minWidth: {
                '30rem': { columns: 2 },
                '50rem': { columns: 3 }
              }
            }}
            gap="md"
            style={{ backgroundColor: '#f0f0f0' }}
          >
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>1</div>
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>2</div>
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', textAlign: 'center' }}>3</div>
          </Grid>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            Resize this container horizontally to see container queries in action. At 480px (30rem) it should show 2 columns, at 800px (50rem) it should show 3 columns.
            <br />
            <strong>Note:</strong> Account for padding (1rem = 16px on each side) when calculating container size.
          </p>
        </div>
      </div>
    </div>
  );
}

import { Stack, Cluster, Frame, Box, Grid, Center, Sidebar, Split, Flex } from '@cascade/react';

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
      
      <section>
        <h3>Box</h3>
        <p>Basic container primitive for padding, margin, background, border</p>
        <Box 
          padding="lg" 
          margin={['md', 'sm']}
          background="oklch(0.95 0.02 250)"
          border="1px solid oklch(0.637 0.237 25.331)"
          borderRadius="md"
          style={{ maxWidth: '400px' }}
        >
          <p>Box content with padding, margin, background, and border</p>
        </Box>
      </section>
      
      <section>
        <h3>Grid</h3>
        <p>CSS Grid container with token-based gaps</p>
        <Grid columns={3} gap="md" style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <div style={{ background: '#e8f5e9', padding: '1rem', textAlign: 'center' }}>Item 1</div>
          <div style={{ background: '#e8f5e9', padding: '1rem', textAlign: 'center' }}>Item 2</div>
          <div style={{ background: '#e8f5e9', padding: '1rem', textAlign: 'center' }}>Item 3</div>
          <div style={{ background: '#e8f5e9', padding: '1rem', textAlign: 'center' }}>Item 4</div>
          <div style={{ background: '#e8f5e9', padding: '1rem', textAlign: 'center' }}>Item 5</div>
          <div style={{ background: '#e8f5e9', padding: '1rem', textAlign: 'center' }}>Item 6</div>
        </Grid>
      </section>
      
      <section>
        <h3>Grid with Auto-fit</h3>
        <p>Grid with auto-fit columns</p>
        <Grid 
          autoFit 
          minColumnWidth="200px" 
          gap="md" 
          style={{ border: '1px solid #ccc', padding: '1rem' }}
        >
          <div style={{ background: '#fff3e0', padding: '1rem', textAlign: 'center' }}>Auto</div>
          <div style={{ background: '#fff3e0', padding: '1rem', textAlign: 'center' }}>Fit</div>
          <div style={{ background: '#fff3e0', padding: '1rem', textAlign: 'center' }}>Grid</div>
        </Grid>
      </section>
      
      <section>
        <h3>Center</h3>
        <p>Centering container with optional max-width</p>
        <Center 
          maxWidth="600px" 
          padding="lg"
          centerText
          centerChildren
          style={{ border: '1px solid #ccc', background: '#f5f5f5' }}
        >
          <h4>Centered Content</h4>
          <p>This content is centered both horizontally and vertically (if centerChildren is true)</p>
        </Center>
      </section>
      
      <section>
        <h3>Sidebar</h3>
        <p>Sidebar layout pattern (main content + sidebar)</p>
        <Sidebar 
          side="left"
          sidebarWidth="200px"
          contentMin="300px"
          gap="md"
          style={{ border: '1px solid #ccc', padding: '1rem' }}
        >
          {[
            <Box key="sidebar" padding="md" background="oklch(0.95 0.02 250)" borderRadius="sm">
              <h4>Sidebar</h4>
              <p>Navigation or secondary content</p>
            </Box>,
            <Box key="content" padding="md" background="#f5f5f5" borderRadius="sm">
              <h4>Main Content</h4>
              <p>Primary content area that takes remaining space</p>
            </Box>
          ]}
        </Sidebar>
      </section>
      
      <section>
        <h3>Sidebar (Right)</h3>
        <p>Sidebar on the right side</p>
        <Sidebar 
          side="right"
          sidebarWidth="250px"
          contentMin="400px"
          gap="md"
          style={{ border: '1px solid #ccc', padding: '1rem' }}
        >
          {[
            <Box key="sidebar" padding="md" background="oklch(0.95 0.02 250)" borderRadius="sm">
              <h4>Right Sidebar</h4>
              <p>Sidebar content</p>
            </Box>,
            <Box key="content" padding="md" background="#f5f5f5" borderRadius="sm">
              <h4>Main Content</h4>
              <p>Content appears first, sidebar on the right</p>
            </Box>
          ]}
        </Sidebar>
      </section>
      
      <section>
        <h3>Split</h3>
        <p>Two-column responsive layout with fraction-based sizing</p>
        <Split 
          fraction="1/2"
          gutter="md"
          switchTo="stack"
          style={{ border: '1px solid #ccc', padding: '1rem' }}
        >
          {[
            <Box key="left" padding="md" background="#e8f5e9" borderRadius="sm">
              <h4>Left Column</h4>
              <p>50% width (1/2 fraction)</p>
            </Box>,
            <Box key="right" padding="md" background="#fff3e0" borderRadius="sm">
              <h4>Right Column</h4>
              <p>50% width (1/2 fraction)</p>
            </Box>
          ]}
        </Split>
      </section>
      
      <section>
        <h3>Split (1/3)</h3>
        <p>Split with 1/3 and 2/3 fractions</p>
        <Split 
          fraction="1/3"
          gutter="lg"
          switchTo="stack"
          style={{ border: '1px solid #ccc', padding: '1rem' }}
        >
          {[
            <Box key="left" padding="md" background="#e3f2fd" borderRadius="sm">
              <h4>Narrow Column</h4>
              <p>33% width (1/3 fraction)</p>
            </Box>,
            <Box key="right" padding="md" background="#fce4ec" borderRadius="sm">
              <h4>Wide Column</h4>
              <p>67% width (2/3 fraction)</p>
            </Box>
          ]}
        </Split>
      </section>
      
      <section>
        <h3>Flex - Horizontal Row</h3>
        <p>General-purpose flexbox container (horizontal, no wrap)</p>
        <Flex 
          direction="row"
          gap="md"
          align="center"
          justify="between"
          style={{ border: '1px solid #ccc', padding: '1rem' }}
        >
          <Box padding="sm" background="#e8f5e9" borderRadius="sm">Item 1</Box>
          <Box padding="sm" background="#e8f5e9" borderRadius="sm">Item 2</Box>
          <Box padding="sm" background="#e8f5e9" borderRadius="sm">Item 3</Box>
        </Flex>
      </section>
      
      <section>
        <h3>Flex - Vertical Column</h3>
        <p>Flex container with column direction</p>
        <Flex 
          direction="column"
          gap="sm"
          align="stretch"
          style={{ border: '1px solid #ccc', padding: '1rem', maxWidth: '300px' }}
        >
          <Box padding="md" background="#fff3e0" borderRadius="sm">Top</Box>
          <Box padding="md" background="#fff3e0" borderRadius="sm">Middle</Box>
          <Box padding="md" background="#fff3e0" borderRadius="sm">Bottom</Box>
        </Flex>
      </section>
      
      <section>
        <h3>Flex - With Wrapping</h3>
        <p>Flex container with wrapping enabled</p>
        <Flex 
          direction="row"
          wrap={true}
          gap="md"
          justify="start"
          style={{ border: '1px solid #ccc', padding: '1rem' }}
        >
          <Box padding="md" background="#e3f2fd" borderRadius="sm" style={{ minWidth: '150px' }}>Flex Item 1</Box>
          <Box padding="md" background="#e3f2fd" borderRadius="sm" style={{ minWidth: '150px' }}>Flex Item 2</Box>
          <Box padding="md" background="#e3f2fd" borderRadius="sm" style={{ minWidth: '150px' }}>Flex Item 3</Box>
          <Box padding="md" background="#e3f2fd" borderRadius="sm" style={{ minWidth: '150px' }}>Flex Item 4</Box>
        </Flex>
      </section>
      
      <section>
        <h3>Flex - Centered Content</h3>
        <p>Flex container with centered alignment</p>
        <Flex 
          direction="row"
          gap="lg"
          align="center"
          justify="center"
          style={{ border: '1px solid #ccc', padding: '2rem', minHeight: '150px' }}
        >
          <Box padding="md" background="#fce4ec" borderRadius="sm">Centered</Box>
          <Box padding="md" background="#fce4ec" borderRadius="sm">Items</Box>
        </Flex>
      </section>
    </Stack>
  );
}


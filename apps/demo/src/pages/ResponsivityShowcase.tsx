/**
 * Responsivity Showcase
 * Demonstrates viewport-based and container-based responsive behavior
 * Shows the difference between responsive and containerQueries props
 */

import React from 'react';
import {
  Stack,
  Box,
  Grid,
  Sidebar,
  Split,
  Center,
} from '@cascade/react';
import { tokens } from '@cascade/tokens';

// Demo Card Component
function DemoCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Box
      padding="lg"
      borderRadius="md"
      background="white"
      style={{
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
      }}
    >
      <Stack spacing="md">
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
          {description && (
            <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
              {description}
            </p>
          )}
        </div>
        {children}
      </Stack>
    </Box>
  );
}

// Item component for grids
function GridItem({ index }: { index: number }) {
  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '0.375rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        fontWeight: 600,
        minHeight: '80px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}
    >
      Item {index}
    </div>
  );
}

// Viewport-Based Responsive Grid Demo
function ViewportResponsiveGridDemo() {
  return (
    <DemoCard
      title="Viewport-Based Responsive Grid"
      description="Uses responsive prop - responds to viewport size, not container size"
    >
      <Box padding="sm" background="#f3f4f6" borderRadius="sm">
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
          Resize the browser window to see the grid adapt to viewport breakpoints.
          This grid will always respond to the full viewport width, even if nested in a narrow container.
        </p>
      </Box>
      <Grid
        columns={1}
        gap="md"
        responsive={{
          sm: { columns: 2 },
          md: { columns: 3 },
          lg: { columns: 4 },
        }}
        style={{ width: '100%' }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <GridItem key={i} index={i + 1} />
        ))}
      </Grid>
    </DemoCard>
  );
}

// Container-Based Responsive Grid Demo
function ContainerResponsiveGridDemo() {
  return (
    <DemoCard
      title="Container-Based Responsive Grid"
      description="Uses containerQueries prop - responds to container size, not viewport size"
    >
      <Box padding="sm" background="#f3f4f6" borderRadius="sm">
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
          This grid adapts to its container's width. Resize the container below to see it respond.
          Works correctly even when nested in narrow containers like sidebars or modals.
        </p>
      </Box>
      <Grid
        columns={1}
        gap="md"
        containerQueries={{
          minWidth: {
            '30rem': { columns: 2 },
            '50rem': { columns: 3 },
            '70rem': { columns: 4 },
          },
        }}
        style={{ width: '100%' }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <GridItem key={i} index={i + 1} />
        ))}
      </Grid>
    </DemoCard>
  );
}

// Side-by-Side Comparison Demo
function ComparisonDemo() {
  return (
    <DemoCard
      title="Viewport vs Container Queries Comparison"
      description="See the difference when components are nested in a narrow container"
    >
      <Box padding="sm" background="#fef3c7" borderRadius="sm" style={{ border: '1px solid #fbbf24' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
          <strong>Try this:</strong> Resize your browser window. Notice how the viewport-based grid
          responds to the full window width, while the container-based grid responds to its narrow container.
        </p>
      </Box>
      <Split fraction="1/2" gutter="lg">
        <Box padding="md" background="#f9fafb" borderRadius="sm">
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Viewport-Based (responsive)</h4>
          <Grid
            columns={1}
            gap="sm"
            responsive={{
              md: { columns: 2 },
              lg: { columns: 3 },
            }}
            style={{ width: '100%' }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <GridItem key={i} index={i + 1} />
            ))}
          </Grid>
        </Box>
        <Box padding="md" background="#f0f9ff" borderRadius="sm">
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Container-Based (containerQueries)</h4>
          <Grid
            columns={1}
            gap="sm"
            containerQueries={{
              minWidth: {
                '20rem': { columns: 2 },
                '30rem': { columns: 3 },
              },
            }}
            style={{ width: '100%' }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <GridItem key={i} index={i + 1} />
            ))}
          </Grid>
        </Box>
      </Split>
    </DemoCard>
  );
}

// Nested in Sidebar Demo
function SidebarNestedDemo() {
  return (
    <DemoCard
      title="Grid Nested in Sidebar"
      description="Container queries ensure correct behavior in nested contexts"
    >
      <Box padding="sm" background="#f3f4f6" borderRadius="sm">
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
          The grid in the sidebar content area uses container queries to adapt to the available space,
          not the full viewport width. This ensures proper layout even when the sidebar is narrow.
        </p>
      </Box>
      <Sidebar
        sidebarWidth="20rem"
        gap="lg"
        containerQueries={{
          maxWidth: {
            '50rem': { sidebarWidth: '0' },
          },
        }}
      >
        <Box
          padding="md"
          background="#e0e7ff"
          borderRadius="sm"
          style={{ minHeight: '200px' }}
        >
          <h4 style={{ margin: '0 0 1rem 0' }}>Sidebar</h4>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Navigation content</p>
        </Box>
        <Box padding="md">
          <h4 style={{ margin: '0 0 1rem 0' }}>Main Content</h4>
          <Grid
            columns={1}
            gap="md"
            containerQueries={{
              minWidth: {
                '30rem': { columns: 2 },
                '50rem': { columns: 3 },
              },
            }}
            style={{ width: '100%' }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <GridItem key={i} index={i + 1} />
            ))}
          </Grid>
        </Box>
      </Sidebar>
    </DemoCard>
  );
}

// Split with Container Queries Demo
function SplitContainerDemo() {
  return (
    <DemoCard
      title="Split with Container Queries"
      description="Split component stacking based on container width"
    >
      <Box padding="sm" background="#f3f4f6" borderRadius="sm">
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
          The split component stacks when its container is narrow, not when the viewport is narrow.
          Resize the container below to see it stack.
        </p>
      </Box>
      <Box padding="md" background="#f9fafb" borderRadius="sm" style={{ maxWidth: '600px' }}>
        <Split
          fraction="1/2"
          gutter="lg"
          containerQueries={{
            maxWidth: {
              '40rem': { switchTo: 'stack' },
            },
          }}
        >
          <Box
            padding="lg"
            background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="sm"
            style={{ color: 'white', minHeight: '150px' }}
          >
            <h4 style={{ margin: 0 }}>Left Column</h4>
            <p style={{ margin: '0.5rem 0 0 0' }}>Content adapts to container</p>
          </Box>
          <Box
            padding="lg"
            background="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            borderRadius="sm"
            style={{ color: 'white', minHeight: '150px' }}
          >
            <h4 style={{ margin: 0 }}>Right Column</h4>
            <p style={{ margin: '0.5rem 0 0 0' }}>Stacks when container is narrow</p>
          </Box>
        </Split>
      </Box>
    </DemoCard>
  );
}

// Modal/Imposter Context Demo
function ModalContextDemo() {
  return (
    <DemoCard
      title="Grid in Modal Context"
      description="Container queries work correctly in constrained contexts like modals"
    >
      <Box padding="sm" background="#f3f4f6" borderRadius="sm">
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
          This simulates a modal with a max-width. The grid inside uses container queries
          to adapt to the modal's width, not the full viewport.
        </p>
      </Box>
      <Center maxWidth="600px" padding="lg" background="#ffffff" borderRadius="md" style={{ border: '2px solid #e5e7eb' }}>
        <Stack spacing="md">
          <h4 style={{ margin: 0 }}>Modal Title</h4>
          <p style={{ margin: 0, color: '#6b7280' }}>
            This modal has a max-width of 600px. The grid below adapts to this width.
          </p>
          <Grid
            columns={1}
            gap="md"
            containerQueries={{
              minWidth: {
                '30rem': { columns: 2 },
                '50rem': { columns: 3 },
              },
            }}
            style={{ width: '100%' }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <GridItem key={i} index={i + 1} />
            ))}
          </Grid>
        </Stack>
      </Center>
    </DemoCard>
  );
}

// Breakpoint Reference
function BreakpointReference() {
  return (
    <DemoCard
      title="Breakpoint Reference"
      description="Design system breakpoints for responsive design"
    >
      <Grid columns={1} gap="sm" responsive={{ md: { columns: 2 } }}>
        <Box padding="md" background="#f9fafb" borderRadius="sm">
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>xs: 20rem (320px)</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Extra small devices</div>
        </Box>
        <Box padding="md" background="#f9fafb" borderRadius="sm">
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>sm: 40rem (640px)</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Small devices (tablets)</div>
        </Box>
        <Box padding="md" background="#f9fafb" borderRadius="sm">
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>md: 64rem (1024px)</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Medium devices (laptops)</div>
        </Box>
        <Box padding="md" background="#f9fafb" borderRadius="sm">
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>lg: 80rem (1280px)</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Large devices (desktops)</div>
        </Box>
        <Box padding="md" background="#f9fafb" borderRadius="sm">
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>xl: 90rem (1440px)</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Extra large devices</div>
        </Box>
      </Grid>
      <Box padding="md" background="#eff6ff" borderRadius="sm" style={{ marginTop: '1rem', border: '1px solid #93c5fd' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af' }}>
          <strong>Tip:</strong> Use viewport breakpoints (responsive) for full-page layouts.
          Use container breakpoints (containerQueries) for components that need to adapt to their container.
        </p>
      </Box>
    </DemoCard>
  );
}

// Main Showcase Component
export function ResponsivityShowcase() {
  return (
    <Center maxWidth="1200px" padding="lg">
      <Stack spacing="xl">
        <Box>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700 }}>
            Responsivity Showcase
          </h1>
          <p style={{ margin: '1rem 0 0 0', fontSize: '1.125rem', color: '#6b7280' }}>
            Explore viewport-based and container-based responsive behavior with Cascade's layout primitives.
            Learn when to use <code>responsive</code> vs <code>containerQueries</code> props.
          </p>
        </Box>

        <BreakpointReference />
        <ViewportResponsiveGridDemo />
        <ContainerResponsiveGridDemo />
        <ComparisonDemo />
        <SidebarNestedDemo />
        <SplitContainerDemo />
        <ModalContextDemo />
      </Stack>
    </Center>
  );
}


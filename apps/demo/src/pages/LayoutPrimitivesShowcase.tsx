/**
 * Comprehensive showcase of layout primitives with animations
 * Demonstrates real-world usage patterns and motion-runtime integration
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Stack,
  Cluster,
  Frame,
  Box,
  Grid,
  Center,
  Sidebar,
  Split,
  Flex,
  Switcher,
  Reel,
} from '@cascade/react';
import {
  useMotionValue,
  useTranslateX,
  useTranslateY,
  useScale,
  useFadeInOnScroll,
  useSlideInOnScroll,
} from '@cascade/motion-runtime';
import { tokens } from '@cascade/tokens';

// Animated Card Component
function AnimatedCard({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const opacity = useMotionValue(0, { property: 'opacity', element: element || undefined });
  const y = useTranslateY(30, { element: element || undefined });
  const scale = useScale(0.95, { element: element || undefined });
  const [currentY, setCurrentY] = useState(30);
  const [currentScale, setCurrentScale] = useState(0.95);
  const [transformVarName, setTransformVarName] = useState('');

  // Set element when ref is available
  useEffect(() => {
    if (cardRef.current) {
      setElement(cardRef.current);
    }
  }, []);

  // Wait for element ID to be assigned
  useEffect(() => {
    if (!element) return;
    
    const checkId = () => {
      if (element.dataset.motionElementId) {
        const varName = `--motion-transform-${element.dataset.motionElementId}`;
        setTransformVarName(varName);
      } else {
        requestAnimationFrame(checkId);
      }
    };
    checkId();
  }, [element]);

  // Subscribe to value changes
  useEffect(() => {
    const unsubY = y.onChange(setCurrentY);
    const unsubScale = scale.onChange(setCurrentScale);
    return () => {
      unsubY();
      unsubScale();
    };
  }, [y, scale]);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.animateTo(1, { duration: 600, easing: 'ease-out' });
      y.animateTo(0, { duration: 600, easing: 'ease-out' });
      scale.animateTo(1, { duration: 600, easing: 'ease-out' });
    }, delay);

    return () => clearTimeout(timer);
  }, [opacity, y, scale, delay]);

  return (
    <Box
      ref={cardRef}
      padding="lg"
      borderRadius="md"
      background="white"
      style={{
        opacity: `var(${opacity.cssVarName})`,
        transform: transformVarName 
          ? `var(${transformVarName})` 
          : `translateY(${currentY}px) scale(${currentScale})`,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      }}
    >
      {children}
    </Box>
  );
}

// Hero Section with animated layout primitives
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  useFadeInOnScroll(ref, { threshold: 0.1, duration: 800, once: true });

  return (
    <Center
      maxWidth="1200px"
      padding={['xl', 'lg']}
      centerChildren
      style={{ minHeight: '60vh' }}
    >
      <Stack spacing="xl" align="center">
        <Box
          ref={ref}
          padding="lg"
          borderRadius="lg"
          background="linear-gradient(135deg, oklch(0.637 0.237 25.331) 0%, oklch(0.30 0.15 250) 100%)"
          style={{ color: 'white', textAlign: 'center' }}
        >
          <h1 style={{ fontSize: '3rem', margin: 0 }}>Layout Primitives Showcase</h1>
          <p style={{ fontSize: '1.25rem', marginTop: '1rem', opacity: 0.9 }}>
            Beautiful layouts with smooth animations
          </p>
        </Box>
      </Stack>
    </Center>
  );
}

// Animated Grid Gallery
function AnimatedGridGallery() {
  const ref = useRef<HTMLDivElement>(null);
  useSlideInOnScroll(ref, { direction: 'up', distance: 50, duration: 600, threshold: 0.2, once: true });

  const items = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    title: `Item ${i + 1}`,
    color: `hsl(${i * 60}, 70%, 80%)`,
  }));

  return (
    <Box padding="xl" style={{ background: '#f8f9fa' }}>
      <div ref={ref}>
        <Stack spacing="lg">
          <h2 style={{ textAlign: 'center', fontSize: '2rem' }}>Animated Grid Gallery</h2>
          <Grid columns={3} gap="md" responsive={{ sm: { columns: 1 }, md: { columns: 2 } }}>
            {items.map((item, index) => (
              <AnimatedCard key={item.id} delay={index * 100}>
                <Frame ratio="16/9" style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      color: 'white',
                    }}
                  >
                    {item.title}
                  </div>
                </Frame>
                <h3 style={{ margin: 0 }}>{item.title}</h3>
                <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                  Grid item with animated entrance
                </p>
              </AnimatedCard>
            ))}
          </Grid>
        </Stack>
      </div>
    </Box>
  );
}

// Animated Sidebar Layout
function AnimatedSidebarLayout() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const sidebarOpacity = useMotionValue(isExpanded ? 1 : 0, { property: 'opacity' });

  useEffect(() => {
    setSidebarWidth(isExpanded ? 250 : 0);
    sidebarOpacity.animateTo(isExpanded ? 1 : 0, { duration: 300, easing: 'ease-in-out' });
  }, [isExpanded, sidebarOpacity]);

  return (
    <Box padding="xl" style={{ background: 'white' }}>
      <Stack spacing="lg">
        <h2 style={{ fontSize: '2rem' }}>Animated Sidebar Layout</h2>
        <Cluster spacing="sm">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              padding: '0.5rem 1rem',
              background: tokens.color.blue[500],
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {isExpanded ? 'Collapse' : 'Expand'} Sidebar
          </button>
        </Cluster>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `${sidebarWidth}px 1fr`,
            gap: tokens.space.md,
            minHeight: '400px',
            transition: 'grid-template-columns 0.3s ease-in-out',
          }}
        >
          <Box
            padding="lg"
            background={tokens.color.blue[50]}
            borderRadius="md"
            style={{
              opacity: `var(${sidebarOpacity.cssVarName})`,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <h3 style={{ margin: 0 }}>Sidebar</h3>
            <Stack spacing="md" style={{ marginTop: '1rem' }}>
              <div>Navigation Item 1</div>
              <div>Navigation Item 2</div>
              <div>Navigation Item 3</div>
            </Stack>
          </Box>
          <Box padding="lg" background="#f5f5f5" borderRadius="md">
            <h3 style={{ margin: 0 }}>Main Content</h3>
            <p>
              This sidebar animates its width when toggled. The content area
              automatically adjusts to fill the remaining space.
            </p>
          </Box>
        </div>
      </Stack>
    </Box>
  );
}

// Animated Split Panel Component
function AnimatedSplitPanel({
  isActive,
  onActivate,
  background,
  hoverBackground,
  title,
  description,
  scaleMotionValue,
}: {
  isActive: boolean;
  onActivate: () => void;
  background: string;
  hoverBackground: string;
  title: string;
  description: string;
  scaleMotionValue: ReturnType<typeof useScale>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [currentScale, setCurrentScale] = useState(1);

  // Set element when ref is available
  useEffect(() => {
    if (panelRef.current) {
      setElement(panelRef.current);
    }
  }, []);

  // Update scale motion value element reference
  useEffect(() => {
    if (element && scaleMotionValue) {
      const mv = scaleMotionValue as any;
      if (mv.elementRef !== element) {
        mv.elementRef = element;
      }
    }
  }, [element, scaleMotionValue]);

  // Subscribe to scale changes
  useEffect(() => {
    if (!scaleMotionValue) return;
    const unsubscribe = scaleMotionValue.onChange(setCurrentScale);
    return unsubscribe;
  }, [scaleMotionValue]);

  // Animate scale when active state changes
  useEffect(() => {
    if (scaleMotionValue) {
      scaleMotionValue.animateTo(isActive ? 1.05 : 1, { duration: 300, easing: 'ease-out' });
    }
  }, [isActive, scaleMotionValue]);

  return (
    <Box
      ref={panelRef}
      padding="lg"
      background={background}
      borderRadius="md"
      style={{
        transform: `scale(${currentScale})`,
        transformOrigin: 'center',
        cursor: 'pointer',
        transition: 'background 0.3s ease',
        overflow: 'hidden', // Prevent content from overflowing when scaled
      }}
      onClick={onActivate}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = hoverBackground;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = background;
        }
      }}
    >
      <h3 style={{ margin: 0 }}>{title}</h3>
      <p style={{ margin: '0.5rem 0 0 0' }}>{description}</p>
    </Box>
  );
}

// Animated Split Layout
function AnimatedSplitLayout() {
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left');
  const leftScale = useScale(1);
  const rightScale = useScale(1);

  return (
    <Box padding="xl" style={{ background: '#f8f9fa' }}>
      <Stack spacing="lg">
        <h2 style={{ fontSize: '2rem', textAlign: 'center' }}>Animated Split Layout</h2>
        <p style={{ textAlign: 'center', color: '#666', margin: 0 }}>
          Click either panel to activate it. The active panel scales up smoothly.
        </p>
        <Split fraction="1/2" gutter="lg" switchTo="stack">
          {[
            <AnimatedSplitPanel
              key="left"
              isActive={activeSide === 'left'}
              onActivate={() => setActiveSide('left')}
              background="#e8f5e9"
              hoverBackground="#c8e6c9"
              title="Left Panel"
              description="Click to activate. This panel scales up when active."
              scaleMotionValue={leftScale}
            />,
            <AnimatedSplitPanel
              key="right"
              isActive={activeSide === 'right'}
              onActivate={() => setActiveSide('right')}
              background="#fff3e0"
              hoverBackground="#ffe0b2"
              title="Right Panel"
              description="Click to activate. This panel scales up when active."
              scaleMotionValue={rightScale}
            />,
          ]}
        </Split>
      </Stack>
    </Box>
  );
}

// Feature Card Component
function FeatureCard({
  feature,
  index,
}: {
  feature: { title: string; description: string; icon: string };
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFadeInOnScroll(ref, {
    threshold: 0.2,
    duration: 600,
    once: true,
  });

  return (
    <div ref={ref}>
      <AnimatedCard delay={index * 50}>
        <Stack spacing="md" align="center">
          <div style={{ fontSize: '3rem' }}>{feature.icon}</div>
          <h3 style={{ margin: 0, textAlign: 'center' }}>{feature.title}</h3>
          <p style={{ margin: 0, textAlign: 'center', color: '#666' }}>
            {feature.description}
          </p>
        </Stack>
      </AnimatedCard>
    </div>
  );
}

// Feature Cards with Scroll Animations
function FeatureCards() {
  const features = [
    {
      title: 'Box Primitive',
      description: 'Basic container with padding, margin, and styling',
      icon: '📦',
    },
    {
      title: 'Grid Layout',
      description: 'Flexible grid system with responsive columns',
      icon: '🔲',
    },
    {
      title: 'Center Content',
      description: 'Perfect centering with max-width constraints',
      icon: '🎯',
    },
    {
      title: 'Sidebar Pattern',
      description: 'Sidebar layouts with animated transitions',
      icon: '📋',
    },
    {
      title: 'Split View',
      description: 'Two-column layouts with fraction-based sizing',
      icon: '✂️',
    },
    {
      title: 'Smooth Animations',
      description: 'Integrated motion-runtime for fluid animations',
      icon: '✨',
    },
  ];

  return (
    <Box padding="xl" style={{ background: 'white' }}>
      <Stack spacing="xl">
        <h2 style={{ fontSize: '2rem', textAlign: 'center' }}>Layout Features</h2>
        <Grid columns={3} gap="lg" responsive={{ sm: { columns: 1 }, md: { columns: 2 } }}>
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}

// Animated Tag Component
function AnimatedTag({
  item,
  index,
  hoveredIndex,
  onRemove,
}: {
  item: string;
  index: number;
  hoveredIndex: number | null;
  onRemove: () => void;
}) {
  const scale = useScale(hoveredIndex === index ? 1.1 : 1);
  const opacity = useMotionValue(1, { property: 'opacity' });

  useEffect(() => {
    scale.animateTo(hoveredIndex === index ? 1.1 : 1, { duration: 200 });
  }, [hoveredIndex, index, scale]);

  return (
    <Box
      padding={['sm', 'md']}
      background={tokens.color.blue[50]}
      borderRadius="md"
      style={{
        transform: `scale(var(${scale.cssVarName}))`,
        opacity: `var(${opacity.cssVarName})`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
      onMouseEnter={() => {}}
      onClick={() => {
        opacity.animateTo(0, { duration: 200 }).then(() => {
          onRemove();
        });
      }}
    >
      <span>{item}</span>
      <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>×</span>
    </Box>
  );
}

// Interactive Cluster Demo
function InteractiveClusterDemo() {
  const [items, setItems] = useState(['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4']);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const addItem = () => {
    setItems([...items, `Tag ${items.length + 1}`]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <Box padding="xl" style={{ background: '#f8f9fa' }}>
      <Stack spacing="lg">
        <h2 style={{ fontSize: '2rem' }}>Interactive Cluster</h2>
        <Cluster spacing="md" justify="start">
          <button
            onClick={addItem}
            style={{
              padding: '0.5rem 1rem',
              background: tokens.color.blue[500],
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Add Tag
          </button>
        </Cluster>
        <Cluster spacing="sm" justify="start">
          {items.map((item, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <AnimatedTag
                item={item}
                index={index}
                hoveredIndex={hoveredIndex}
                onRemove={() => removeItem(index)}
              />
            </div>
          ))}
        </Cluster>
      </Stack>
    </Box>
  );
}

// Interactive Flex Demo
function InteractiveFlexDemo() {
  const [direction, setDirection] = useState<'row' | 'column'>('row');
  const [wrap, setWrap] = useState(false);
  const [justify, setJustify] = useState<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>('start');
  const [align, setAlign] = useState<'start' | 'center' | 'end' | 'stretch'>('stretch');

  const items = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    label: `Item ${i + 1}`,
    color: [
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // green
      '#ef4444', // red
    ][i],
  }));

  return (
    <Box padding="xl" style={{ background: 'white' }}>
      <Stack spacing="lg">
        <h2 style={{ fontSize: '2rem', textAlign: 'center' }}>Interactive Flex Container</h2>
        <p style={{ textAlign: 'center', color: '#666', margin: 0 }}>
          Adjust the controls to see how Flex properties affect the layout
        </p>
        
        <Box padding="lg" background="#f8f9fa" borderRadius="md">
          <Stack spacing="md">
            <Flex direction="row" gap="sm" wrap={true} justify="between">
              <Box padding="sm" background="white" borderRadius="sm">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="direction"
                    checked={direction === 'row'}
                    onChange={() => setDirection('row')}
                  />
                  <span>Row</span>
                </label>
              </Box>
              <Box padding="sm" background="white" borderRadius="sm">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="direction"
                    checked={direction === 'column'}
                    onChange={() => setDirection('column')}
                  />
                  <span>Column</span>
                </label>
              </Box>
              <Box padding="sm" background="white" borderRadius="sm">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={wrap}
                    onChange={(e) => setWrap(e.target.checked)}
                  />
                  <span>Wrap</span>
                </label>
              </Box>
            </Flex>
            
            <Flex direction="row" gap="sm" wrap={true} justify="start">
              <Box padding="sm" background="white" borderRadius="sm">
                <label style={{ fontSize: '0.875rem' }}>Justify:</label>
                <select
                  value={justify}
                  onChange={(e) => setJustify(e.target.value as any)}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
                >
                  <option value="start">Start</option>
                  <option value="center">Center</option>
                  <option value="end">End</option>
                  <option value="between">Between</option>
                  <option value="around">Around</option>
                  <option value="evenly">Evenly</option>
                </select>
              </Box>
              <Box padding="sm" background="white" borderRadius="sm">
                <label style={{ fontSize: '0.875rem' }}>Align:</label>
                <select
                  value={align}
                  onChange={(e) => setAlign(e.target.value as any)}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
                >
                  <option value="start">Start</option>
                  <option value="center">Center</option>
                  <option value="end">End</option>
                  <option value="stretch">Stretch</option>
                </select>
              </Box>
            </Flex>
          </Stack>
        </Box>

        <Box
          padding="lg"
          background="#f8f9fa"
          borderRadius="md"
          style={{ 
            border: '2px dashed #ccc', 
            minHeight: '300px',
            position: 'relative',
            overflow: 'visible',
            color: 'oklch(0.20 0 0)'
          }}
        >
          <Flex
            direction={direction}
            wrap={wrap}
            gap="md"
            justify={justify}
            align={align}
            animate={{ duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            style={{ 
              minHeight: '250px', 
              width: '100%'
            }}
          >
            {items.map((item) => (
              <Box
                key={item.id}
                padding="lg"
                background={item.color}
                borderRadius="md"
                style={{
                  backgroundColor: item.color,
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: direction === 'row' ? '120px' : '100%',
                  minHeight: direction === 'column' ? '80px' : '80px',
                  width: direction === 'row' ? 'auto' : '100%',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  flexShrink: 0,
                  userSelect: 'none',
                  border: 'none',
                }}
              >
                {item.label}
              </Box>
            ))}
          </Flex>
        </Box>
      </Stack>
    </Box>
  );
}

// Animated Flex Cards
function AnimatedFlexCards() {
  const ref = useRef<HTMLDivElement>(null);
  useFadeInOnScroll(ref, { threshold: 0.2, duration: 600, once: true });

  return (
    <Box padding="xl" style={{ background: '#f8f9fa' }}>
      <Stack spacing="lg" ref={ref}>
        <h2 style={{ fontSize: '2rem', textAlign: 'center' }}>Flex Layout Patterns</h2>
        
        <Box padding="md" background="white" borderRadius="md" style={{ border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <Flex direction="row" gap="md" wrap={true} justify="start" align="stretch" style={{ width: '100%' }}>
            {[
              { title: 'Card 1', color: '#e3f2fd' },
              { title: 'Card 2', color: '#f3e5f5' },
              { title: 'Card 3', color: '#e8f5e9' },
              { title: 'Card 4', color: '#fff3e0' },
            ].map((card, index) => (
              <Box
                key={card.title}
                padding="lg"
                background={card.color}
                borderRadius="md"
                style={{ 
                  minWidth: '200px', 
                  flex: '1 1 auto', 
                  maxWidth: '100%',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <h3 style={{ margin: 0 }}>{card.title}</h3>
                <p style={{ margin: '0.5rem 0 0 0' }}>
                  Flex item that grows and shrinks
                </p>
              </Box>
            ))}
          </Flex>
        </Box>

        <Box padding="md" background="white" borderRadius="md" style={{ border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <Flex direction="row" gap="lg" justify="center" align="center" style={{ minHeight: '150px', width: '100%' }}>
            <Box padding="lg" background={tokens.color.blue[500]} borderRadius="md" style={{ color: 'white' }}>
              Centered
            </Box>
            <Box padding="lg" background={tokens.color.blue[500]} borderRadius="md" style={{ color: 'white' }}>
              Content
            </Box>
          </Flex>
        </Box>

        <Box padding="md" background="white" borderRadius="md" style={{ border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <Flex direction="row" gap="md" justify="between" align="center" style={{ minHeight: '100px', width: '100%' }}>
            <Box padding="md" background="#e8f5e9" borderRadius="sm">Left</Box>
            <Box padding="md" background="#fff3e0" borderRadius="sm">Center</Box>
            <Box padding="md" background="#fce4ec" borderRadius="sm">Right</Box>
          </Flex>
        </Box>
      </Stack>
    </Box>
  );
}

// Interactive Switcher Demo
function InteractiveSwitcherDemo() {
  const [limit, setLimit] = useState<number | undefined>(4);
  const [threshold, setThreshold] = useState('30rem');

  const items = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    label: `Item ${i + 1}`,
    color: [
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // green
      '#ef4444', // red
      '#06b6d4', // cyan
      '#f97316', // orange
    ][i],
  }));

  return (
    <Box padding="xl" style={{ background: 'white' }}>
      <Stack spacing="lg">
        <h2 style={{ fontSize: '2rem', textAlign: 'center' }}>Switcher Component</h2>
        <p style={{ textAlign: 'center', color: '#666', margin: 0 }}>
          Responsive container that switches between horizontal (row) and vertical (column) layouts based on container width threshold
        </p>
        
        <Box padding="lg" background="#f8f9fa" borderRadius="md">
          <Stack spacing="md">
            <Flex direction="row" gap="sm" wrap={true} justify="start">
              <Box padding="sm" background="white" borderRadius="sm">
                <label style={{ fontSize: '0.875rem' }}>Limit:</label>
                <select
                  value={limit || ''}
                  onChange={(e) => setLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
                >
                  <option value="">None</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </Box>
              <Box padding="sm" background="white" borderRadius="sm">
                <label style={{ fontSize: '0.875rem' }}>Threshold:</label>
                <select
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
                >
                  <option value="20rem">20rem</option>
                  <option value="30rem">30rem</option>
                  <option value="40rem">40rem</option>
                  <option value="50rem">50rem</option>
                </select>
              </Box>
            </Flex>
          </Stack>
        </Box>

        <Box
          padding="lg"
          background="#f8f9fa"
          borderRadius="md"
          style={{ 
            border: '2px dashed #ccc', 
            minHeight: '200px',
            overflow: 'visible',
          }}
        >
          <Switcher
            limit={limit}
            threshold={threshold}
            gap="md"
            justify="start"
            animate={{ duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            {items.map((item) => (
              <Box
                key={item.id}
                padding="lg"
                background={item.color}
                borderRadius="md"
                style={{
                  backgroundColor: item.color,
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '120px',
                  minHeight: '80px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  flexShrink: 0,
                  userSelect: 'none',
                }}
              >
                {item.label}
              </Box>
            ))}
          </Switcher>
        </Box>
        
        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.875rem', margin: 0 }}>
          Resize the container (or browser window) to see the switcher switch between horizontal and vertical layouts at the threshold. With a limit set, items wrap after that count.
        </p>
      </Stack>
    </Box>
  );
}

// Interactive Reel Demo
function InteractiveReelDemo() {
  const [snap, setSnap] = useState(true);
  const [snapAlign, setSnapAlign] = useState<'start' | 'center' | 'end'>('start');
  const [itemWidth, setItemWidth] = useState<string | undefined>('300px');

  const items = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    label: `Card ${i + 1}`,
    color: [
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // green
      '#ef4444', // red
      '#06b6d4', // cyan
      '#f97316', // orange
      '#6366f1', // indigo
      '#14b8a6', // teal
    ][i],
  }));

  return (
    <Box padding="xl" style={{ background: '#f8f9fa' }}>
      <Stack spacing="lg">
        <h2 style={{ fontSize: '2rem', textAlign: 'center' }}>Reel Component</h2>
        <p style={{ textAlign: 'center', color: '#666', margin: 0 }}>
          Horizontal scrolling container with optional snap scrolling
        </p>
        
        <Box padding="lg" background="white" borderRadius="md">
          <Stack spacing="md">
            <Flex direction="row" gap="sm" wrap={true} justify="start">
              <Box padding="sm" background="#f8f9fa" borderRadius="sm">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={snap}
                    onChange={(e) => setSnap(e.target.checked)}
                  />
                  <span>Snap Scrolling</span>
                </label>
              </Box>
              {snap && (
                <Box padding="sm" background="#f8f9fa" borderRadius="sm">
                  <label style={{ fontSize: '0.875rem' }}>Snap Align:</label>
                  <select
                    value={snapAlign}
                    onChange={(e) => setSnapAlign(e.target.value as 'start' | 'center' | 'end')}
                    style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
                  >
                    <option value="start">Start</option>
                    <option value="center">Center</option>
                    <option value="end">End</option>
                  </select>
                </Box>
              )}
              <Box padding="sm" background="#f8f9fa" borderRadius="sm">
                <label style={{ fontSize: '0.875rem' }}>Item Width:</label>
                <select
                  value={itemWidth || ''}
                  onChange={(e) => setItemWidth(e.target.value || undefined)}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
                >
                  <option value="">Auto</option>
                  <option value="200px">200px</option>
                  <option value="300px">300px</option>
                  <option value="400px">400px</option>
                </select>
              </Box>
            </Flex>
          </Stack>
        </Box>

        <Box
          padding="lg"
          background="white"
          borderRadius="md"
          style={{ 
            border: '2px solid #e5e7eb',
            overflow: 'visible',
          }}
        >
          <Reel
            snap={snap}
            snapAlign={snapAlign}
            itemWidth={itemWidth}
            gap="md"
            scrollPadding="1rem"
            animate={{ duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            style={{
              width: '100%',
              maxWidth: '100%',
            }}
          >
            {items.map((item) => (
              <Box
                key={item.id}
                padding="xl"
                background={item.color}
                borderRadius="md"
                style={{
                  backgroundColor: item.color,
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // Width is handled by Reel component via itemWidth prop
                  // If itemWidth is not set, items will use their natural width (200px from minWidth)
                  minWidth: itemWidth || '200px',
                  minHeight: '200px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  userSelect: 'none',
                }}
              >
                {item.label}
              </Box>
            ))}
          </Reel>
        </Box>
        
        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.875rem', margin: 0 }}>
          Scroll horizontally to see all items. With snap scrolling enabled, items will snap into place.
        </p>
      </Stack>
    </Box>
  );
}

// Carousel Component with infinite scroll, peeked items, and auto-advance
function CarouselDemo() {
  const reelRef = useRef<HTMLDivElement>(null);
  const itemRefsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Use motion value to track scroll position - it will animate smoothly
  const scrollPosition = useMotionValue(0);
  const containerWidthRef = useRef(0);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const items = [
    { id: 1, label: 'Item 1', color: '#8b5cf6' },
    { id: 2, label: 'Item 2', color: '#ec4899' },
    { id: 3, label: 'Item 3', color: '#f59e0b' },
    { id: 4, label: 'Item 4', color: '#10b981' },
    { id: 5, label: 'Item 5', color: '#3b82f6' },
    { id: 6, label: 'Item 6', color: '#ef4444' },
  ];
  
  const itemWidth = 300;
  const gap = 16; // md gap
  const peekWidth = 60; // Width of peeked items on sides
  
  // Create infinite scroll illusion by duplicating items
  const infiniteItems = [...items, ...items, ...items];
  const startOffset = items.length; // Start at the middle set
  
  // Update item styles based on scroll position
  const updateItemStyles = useCallback((scrollLeft: number) => {
    const scrollContainer = reelRef.current;
    if (!scrollContainer) return;
    
    containerWidthRef.current = scrollContainer.clientWidth;
    const containerWidth = containerWidthRef.current;
    const containerCenter = containerWidth / 2;
    const maxDistance = containerWidth / 2 + peekWidth;
    
    // Update styles directly on DOM elements for better performance
    itemRefsRef.current.forEach((itemEl, index) => {
      if (!itemEl) return;
      
      const itemLeft = index * (itemWidth + gap);
      const itemCenter = itemLeft + (itemWidth / 2) - scrollLeft;
      const distanceFromCenter = Math.abs(itemCenter - containerCenter);
      
      // Opacity: 1 at center, 0.3 at peek distance, 0 beyond
      const opacity = Math.max(0, Math.min(1, 1 - (distanceFromCenter / maxDistance) * 0.7));
      
      // Scale: 1 at center, 0.85 at peek distance
      const scale = Math.max(0.85, 1 - (distanceFromCenter / maxDistance) * 0.15);
      
      // Use will-change for GPU acceleration
      itemEl.style.opacity = opacity.toString();
      itemEl.style.transform = `scale(${scale})`;
    });
  }, [itemWidth, gap, peekWidth]);
  
  // Subscribe to motion value changes - this drives the carousel animation
  useEffect(() => {
    const unsubscribe = scrollPosition.onChange((value: number) => {
      if (reelRef.current) {
        // Motion value drives scrollLeft - this is how Cascade animates DOM properties
        reelRef.current.scrollLeft = value;
        updateItemStyles(value);
      }
    });
    return unsubscribe;
  }, [scrollPosition, updateItemStyles]);
  
  // Scroll to index with bounce animation using Cascade motion primitives
  const scrollToIndex = useCallback(async (index: number, immediate = false) => {
    if (!reelRef.current) return;
    
    const scrollContainer = reelRef.current;
    const containerWidth = scrollContainer.clientWidth;
    // Calculate center offset, but clamp to 0 for narrow containers
    // When container is narrower than item, center at start (offset = 0)
    const centerOffset = Math.max(0, (containerWidth - itemWidth) / 2);
    const singleSetWidth = items.length * (itemWidth + gap);
    const currentScrollLeft = scrollPosition.get() as number;
    
    // Determine which copy of the item to scroll to for unidirectional scrolling
    let targetIndex = index;
    const relativeIndex = index - startOffset;
    
    // Check if we're wrapping from end to beginning
    if (currentScrollLeft > singleSetWidth * 1.2 && relativeIndex < 0) {
      targetIndex = index + (items.length * 2); // Third copy
    } else if (relativeIndex < 0 && currentScrollLeft > singleSetWidth) {
      targetIndex = index + (items.length * 2);
    }
    
    const itemPosition = targetIndex * (itemWidth + gap);
    // Ensure scroll position is never negative
    const targetScroll = Math.max(0, itemPosition - centerOffset);
    
    if (immediate) {
      scrollPosition.set(targetScroll);
      return;
    }
    
    try {
      // Smooth scroll animation - Cascade's animateTo handles the easing
      await scrollPosition.animateTo(targetScroll, {
        duration: 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      });
      
      // Handle infinite scroll reset if needed
      const finalScroll = scrollPosition.get() as number;
      if (finalScroll > singleSetWidth * 2) {
        scrollPosition.set(finalScroll - singleSetWidth);
      }
      
      // Bounce effect using Cascade's spring animation
      const bounceStart = scrollPosition.get() as number;
      const bounceDistance = 10;
      
      // Bounce forward
      await scrollPosition.animateTo(bounceStart + bounceDistance, {
        stiffness: 400,
        damping: 15,
        mass: 1,
      });
      
      // Bounce back
      await scrollPosition.animateTo(bounceStart, {
        stiffness: 400,
        damping: 25,
        mass: 1,
      });
      
    } catch (error) {
      // Animation was cancelled - that's okay
      console.debug('Animation cancelled:', error);
    }
  }, [scrollPosition, itemWidth, gap, items.length, startOffset]);
  
  // Auto-advance logic - uses Cascade's animation promises for sequential navigation
  useEffect(() => {
    let isRunning = true;
    
    const advance = async () => {
      if (!isRunning) return;
      
      setCurrentIndex((prev) => {
        const next = (prev + 1) % items.length;
        const targetIndex = startOffset + next;
        
        // Cascade's animateTo returns a promise - wait for it to complete
        scrollToIndex(targetIndex).then(() => {
          // Schedule next after animation completes + 2s pause
          if (isRunning) {
            autoAdvanceTimeoutRef.current = setTimeout(advance, 2000);
          }
        }).catch(() => {
          // If animation fails, still schedule next
          if (isRunning) {
            autoAdvanceTimeoutRef.current = setTimeout(advance, 2000);
          }
        });
        
        return next;
      });
    };
    
    // Start auto-advance
    autoAdvanceTimeoutRef.current = setTimeout(advance, 2000);
    
    return () => {
      isRunning = false;
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, [items.length, startOffset, scrollToIndex]);
  
  // Handle scroll events for infinite scroll reset (manual scrolling)
  useEffect(() => {
    const scrollContainer = reelRef.current;
    if (!scrollContainer) return;
    
    const handleScroll = () => {
      // Check if this is from our animation (motion value is driving it)
      const motionValue = scrollPosition.get() as number;
      const domScrollLeft = scrollContainer.scrollLeft;
      
      // If they're close, this is from our animation - skip manual handling
      if (Math.abs(motionValue - domScrollLeft) < 1) {
        return;
      }
      
      // Manual scroll - update motion value and handle infinite scroll
      scrollPosition.set(domScrollLeft);
      
      const singleSetWidth = items.length * (itemWidth + gap);
      
      // Reset to middle set if scrolled too far (infinite scroll)
      if (domScrollLeft < singleSetWidth) {
        const adjustedScroll = singleSetWidth + domScrollLeft;
        scrollContainer.scrollLeft = adjustedScroll;
        scrollPosition.set(adjustedScroll);
      } else if (domScrollLeft > singleSetWidth * 2) {
        const adjustedScroll = singleSetWidth + (domScrollLeft - singleSetWidth * 2);
        scrollContainer.scrollLeft = adjustedScroll;
        scrollPosition.set(adjustedScroll);
      }
    };
    
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [items.length, itemWidth, gap, scrollPosition]);
  
  // Initialize scroll position to center first item
  useEffect(() => {
    if (reelRef.current) {
      const containerWidth = reelRef.current.clientWidth;
      containerWidthRef.current = containerWidth;
      // Calculate center offset, but clamp to 0 for narrow containers
      const centerOffset = Math.max(0, (containerWidth - itemWidth) / 2);
      const itemPosition = startOffset * (itemWidth + gap);
      // Ensure scroll position is never negative
      const initialScroll = Math.max(0, itemPosition - centerOffset);
      scrollPosition.set(initialScroll);
      reelRef.current.scrollLeft = initialScroll;
    }
  }, [startOffset, itemWidth, gap, scrollPosition]);
  
  return (
    <Box padding="xl" style={{ background: '#f8f9fa' }}>
      <Stack spacing="lg">
        <h2 style={{ fontSize: '2rem', textAlign: 'center' }}>Carousel Component</h2>
        <p style={{ textAlign: 'center', color: '#666', margin: 0 }}>
          Auto-advancing carousel with infinite scroll, peeked adjacent items, and bounce animation
        </p>
        
        <Box
          padding="lg"
          background="white"
          borderRadius="md"
          style={{ 
            border: '2px solid #e5e7eb',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Reel
            ref={reelRef}
            itemWidth={`${itemWidth}px`}
            gap="md"
            snap={false}
            style={{
              width: '100%',
              maxWidth: '100%',
              scrollBehavior: 'auto', // We handle scrolling manually
            }}
          >
            {infiniteItems.map((item, index) => {
              return (
                <Box
                  key={`${item.id}-${index}`}
                  ref={(el) => {
                    itemRefsRef.current[index] = el;
                  }}
                  padding="xl"
                  background={item.color}
                  borderRadius="md"
                  style={{
                    backgroundColor: item.color,
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: `${itemWidth}px`,
                    minWidth: `${itemWidth}px`,
                    maxWidth: `${itemWidth}px`,
                    minHeight: '200px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                    userSelect: 'none',
                    willChange: 'transform, opacity', // GPU acceleration hint
                    backfaceVisibility: 'hidden', // Prevent flickering
                    transform: 'translateZ(0)', // Force GPU acceleration
                  }}
                >
                  {item.label}
                </Box>
              );
            })}
          </Reel>
        </Box>
        
        <Flex justify="center" gap="sm">
          {items.map((item, index) => (
            <Box
              key={item.id}
              padding="xs"
              background={index === currentIndex ? '#8b5cf6' : '#e5e7eb'}
              borderRadius="full"
              style={{
                width: '12px',
                height: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onClick={() => {
                setCurrentIndex(index);
                scrollToIndex(startOffset + index);
              }}
            />
          ))}
        </Flex>
        
        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.875rem', margin: 0 }}>
          Auto-advances every 2 seconds. Click dots to navigate manually.
        </p>
      </Stack>
    </Box>
  );
}

// Main Showcase Component
export function LayoutPrimitivesShowcase() {
  return (
    <Stack spacing={0} style={{ width: '100%' }}>
      <HeroSection />
      <AnimatedGridGallery />
      <AnimatedSidebarLayout />
      <AnimatedSplitLayout />
      <FeatureCards />
      <InteractiveClusterDemo />
      <InteractiveFlexDemo />
      <AnimatedFlexCards />
      <InteractiveSwitcherDemo />
      <InteractiveReelDemo />
      <CarouselDemo />
    </Stack>
  );
}


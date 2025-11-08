import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { Stack, Cluster } from '@cascade/react';
import { FoundationDemo } from './pages/FoundationDemo';
import { PrimitivesDemo } from './pages/PrimitivesDemo';
import { MotionDemo } from './pages/MotionDemo';
import { SequenceDemo } from './pages/SequenceDemo';
import { MotionValueDemo } from './pages/MotionValueDemo';
import { GestureDemo } from './pages/GestureDemo';
import { LayoutTransitionDemo } from './pages/LayoutTransitionDemo';
import { ViewportAnimationDemo } from './pages/ViewportAnimationDemo';
import { AnimatePresenceDemo } from './pages/AnimatePresenceDemo';
import { AnimationControlsDemo } from './pages/AnimationControlsDemo';
import { LandingPage } from './pages/LandingPage';
import { LayoutAnimationsDemo } from './pages/LayoutAnimationsDemo';
import { GradientAnimationDemo } from './pages/GradientAnimationDemo';
import { LayoutPrimitivesShowcase } from './pages/LayoutPrimitivesShowcase';
import { ResponsivityShowcase } from './pages/ResponsivityShowcase';
import { ContainerQueryTest } from './pages/ContainerQueryTest';
import './App.css';

type RoutePath = 
  | 'landing' 
  | 'foundation' 
  | 'primitives' 
  | 'motion' 
  | 'sequence' 
  | 'motion-values' 
  | 'gestures' 
  | 'layout-transitions' 
  | 'viewport-animations' 
  | 'animate-presence' 
  | 'animation-controls' 
  | 'layout-animations' 
  | 'gradient-animations' 
  | 'layout-primitives-showcase' 
  | 'responsivity-showcase' 
  | 'container-query-test';

function LandingPageWrapper() {
  const navigate = useNavigate();
  return <LandingPage onNavigate={(path) => navigate(`/${path}`)} />;
}

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.slice(1) || 'landing';

  const routes: { path: RoutePath; label: string }[] = [
    { path: 'landing', label: 'Landing Page' },
    { path: 'foundation', label: 'Foundation' },
    { path: 'primitives', label: 'Primitives' },
    { path: 'motion', label: 'Motion' },
    { path: 'sequence', label: 'Sequences' },
    { path: 'motion-values', label: 'Motion Values' },
    { path: 'gestures', label: 'Gestures' },
    { path: 'layout-transitions', label: 'Layout Transitions' },
    { path: 'viewport-animations', label: 'Viewport Animations' },
    { path: 'animate-presence', label: 'AnimatePresence' },
    { path: 'animation-controls', label: 'Animation Controls' },
    { path: 'layout-animations', label: 'Layout Animations' },
    { path: 'gradient-animations', label: 'Gradient Animations' },
    { path: 'layout-primitives-showcase', label: 'Layout Showcase' },
    { path: 'responsivity-showcase', label: 'Responsivity' },
    { path: 'container-query-test', label: 'Container Query Test' },
  ];

  return (
    <nav>
      <Cluster spacing="md">
        {routes.map(({ path, label }) => (
          <button
            key={path}
            onClick={() => navigate(`/${path}`)}
            className={currentPath === path ? 'active' : ''}
          >
            {label}
          </button>
        ))}
      </Cluster>
    </nav>
  );
}

function App() {
  const location = useLocation();
  const isLanding = location.pathname === '/' || location.pathname === '/landing';

  return (
    <Stack spacing="lg" style={{ minHeight: '100vh', padding: isLanding ? '0' : '2rem' }}>
      {!isLanding && (
        <>
          <header>
            <h1>Cascade CSS Foundation</h1>
            <p>A CSS-first layout system with type-safe abstractions</p>
          </header>
          <Navigation />
        </>
      )}

      <main>
        <Routes>
          <Route path="/" element={<LandingPageWrapper />} />
          <Route path="/landing" element={<LandingPageWrapper />} />
          <Route path="/foundation" element={<FoundationDemo />} />
          <Route path="/primitives" element={<PrimitivesDemo />} />
          <Route path="/motion" element={<MotionDemo />} />
          <Route path="/sequence" element={<SequenceDemo />} />
          <Route path="/motion-values" element={<MotionValueDemo />} />
          <Route path="/gestures" element={<GestureDemo />} />
          <Route path="/layout-transitions" element={<LayoutTransitionDemo />} />
          <Route path="/viewport-animations" element={<ViewportAnimationDemo />} />
          <Route path="/animate-presence" element={<AnimatePresenceDemo />} />
          <Route path="/animation-controls" element={<AnimationControlsDemo />} />
          <Route path="/layout-animations" element={<LayoutAnimationsDemo />} />
          <Route path="/gradient-animations" element={<GradientAnimationDemo />} />
          <Route path="/layout-primitives-showcase" element={<LayoutPrimitivesShowcase />} />
          <Route path="/responsivity-showcase" element={<ResponsivityShowcase />} />
          <Route path="/container-query-test" element={<ContainerQueryTest />} />
        </Routes>
      </main>
    </Stack>
  );
}

export default App;

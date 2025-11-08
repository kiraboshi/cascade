import { useState } from 'react';
import { Stack, Cluster, Frame } from '@cascade/react';
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
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'foundation' | 'primitives' | 'motion' | 'sequence' | 'motion-values' | 'gestures' | 'layout-transitions' | 'viewport-animations' | 'animate-presence' | 'animation-controls' | 'layout-animations' | 'gradient-animations' | 'layout-primitives-showcase'>('landing');

  return (
    <Stack spacing="lg" style={{ minHeight: '100vh', padding: activeTab === 'landing' ? '0' : '2rem' }}>
      {activeTab !== 'landing' && (
        <>
          <header>
            <h1>Cascade CSS Foundation</h1>
            <p>A CSS-first layout system with type-safe abstractions</p>
          </header>

          <nav>
            <Cluster spacing="md">
              <button
                onClick={() => setActiveTab('landing')}
                className={activeTab === 'landing' ? 'active' : ''}
              >
                Landing Page
              </button>
          <button
            onClick={() => setActiveTab('foundation')}
            className={activeTab === 'foundation' ? 'active' : ''}
          >
            Foundation
          </button>
          <button
            onClick={() => setActiveTab('primitives')}
            className={activeTab === 'primitives' ? 'active' : ''}
          >
            Primitives
          </button>
          <button
            onClick={() => setActiveTab('motion')}
            className={activeTab === 'motion' ? 'active' : ''}
          >
            Motion
          </button>
          <button
            onClick={() => setActiveTab('sequence')}
            className={activeTab === 'sequence' ? 'active' : ''}
          >
            Sequences
          </button>
          <button
            onClick={() => setActiveTab('motion-values')}
            className={activeTab === 'motion-values' ? 'active' : ''}
          >
            Motion Values
          </button>
          <button
            onClick={() => setActiveTab('gestures')}
            className={activeTab === 'gestures' ? 'active' : ''}
          >
            Gestures
          </button>
          <button
            onClick={() => setActiveTab('layout-transitions')}
            className={activeTab === 'layout-transitions' ? 'active' : ''}
          >
            Layout Transitions
          </button>
          <button
            onClick={() => setActiveTab('viewport-animations')}
            className={activeTab === 'viewport-animations' ? 'active' : ''}
          >
            Viewport Animations
          </button>
          <button
            onClick={() => setActiveTab('animate-presence')}
            className={activeTab === 'animate-presence' ? 'active' : ''}
          >
            AnimatePresence
          </button>
          <button
            onClick={() => setActiveTab('animation-controls')}
            className={activeTab === 'animation-controls' ? 'active' : ''}
          >
            Animation Controls
          </button>
          <button
            onClick={() => setActiveTab('layout-animations')}
            className={activeTab === 'layout-animations' ? 'active' : ''}
          >
            Layout Animations
          </button>
          <button
            onClick={() => setActiveTab('gradient-animations')}
            className={activeTab === 'gradient-animations' ? 'active' : ''}
          >
            Gradient Animations
          </button>
          <button
            onClick={() => setActiveTab('layout-primitives-showcase')}
            className={activeTab === 'layout-primitives-showcase' ? 'active' : ''}
          >
            Layout Showcase
          </button>
        </Cluster>
      </nav>
        </>
      )}

      <main>
        {activeTab === 'landing' && <LandingPage onNavigate={setActiveTab} />}
        {activeTab === 'foundation' && <FoundationDemo />}
        {activeTab === 'primitives' && <PrimitivesDemo />}
        {activeTab === 'motion' && <MotionDemo />}
        {activeTab === 'sequence' && <SequenceDemo />}
        {activeTab === 'motion-values' && <MotionValueDemo />}
        {activeTab === 'gestures' && <GestureDemo />}
        {activeTab === 'layout-transitions' && <LayoutTransitionDemo />}
        {activeTab === 'viewport-animations' && <ViewportAnimationDemo />}
        {activeTab === 'animate-presence' && <AnimatePresenceDemo />}
        {activeTab === 'animation-controls' && <AnimationControlsDemo />}
        {activeTab === 'layout-animations' && <LayoutAnimationsDemo />}
        {activeTab === 'gradient-animations' && <GradientAnimationDemo />}
        {activeTab === 'layout-primitives-showcase' && <LayoutPrimitivesShowcase />}
      </main>
    </Stack>
  );
}

export default App;


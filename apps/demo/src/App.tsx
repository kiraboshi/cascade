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
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'foundation' | 'primitives' | 'motion' | 'sequence' | 'motion-values' | 'gestures' | 'layout-transitions' | 'viewport-animations' | 'animate-presence' | 'animation-controls'>('foundation');

  return (
    <Stack spacing="lg" style={{ minHeight: '100vh', padding: '2rem' }}>
      <header>
        <h1>Cascade CSS Foundation</h1>
        <p>A CSS-first layout system with type-safe abstractions</p>
      </header>

      <nav>
        <Cluster spacing="md">
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
        </Cluster>
      </nav>

      <main>
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
      </main>
    </Stack>
  );
}

export default App;


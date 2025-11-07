import { useState } from 'react';
import { Stack, Cluster, Frame } from '@cascade/react';
import { FoundationDemo } from './pages/FoundationDemo';
import { PrimitivesDemo } from './pages/PrimitivesDemo';
import { MotionDemo } from './pages/MotionDemo';
import { SequenceDemo } from './pages/SequenceDemo';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'foundation' | 'primitives' | 'motion' | 'sequence'>('foundation');

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
        </Cluster>
      </nav>

      <main>
        {activeTab === 'foundation' && <FoundationDemo />}
        {activeTab === 'primitives' && <PrimitivesDemo />}
        {activeTab === 'motion' && <MotionDemo />}
        {activeTab === 'sequence' && <SequenceDemo />}
      </main>
    </Stack>
  );
}

export default App;


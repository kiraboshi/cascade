/**
 * Demo page for AnimatePresence
 * Examples of enter/exit animations for mounting/unmounting components
 */

import { useState, useEffect } from 'react';
import { Stack, Cluster } from '@cascade/react';
import { AnimatePresence, useAnimatePresence } from '@cascade/motion-runtime';

export function AnimatePresenceDemo() {
  return (
    <Stack spacing="lg">
      <div>
        <h2>AnimatePresence</h2>
        <p>Animate components as they mount and unmount with smooth enter/exit animations</p>
      </div>
      
      <section>
        <h3>Basic List Animation</h3>
        <p>Add and remove items from a list with fade animations</p>
        <BasicListExample />
      </section>
      
      <section>
        <h3>Exit Animation with Transform</h3>
        <p>Items slide out when removed</p>
        <SlideOutExample />
      </section>
      
      <section>
        <h3>Wait Mode</h3>
        <p>Wait for exit animation to complete before entering next item</p>
        <WaitModeExample />
      </section>
      
      <section>
        <h3>Route Transitions</h3>
        <p>Animate between different views</p>
        <RouteTransitionExample />
      </section>
      
      <section>
        <h3>Modal/Dialog Animation</h3>
        <p>Animate modals in and out</p>
        <ModalExample />
      </section>
      
      <section>
        <h3>PopLayout Mode</h3>
        <p>Remove from layout immediately, then animate</p>
        <PopLayoutExample />
      </section>
      
      <section>
        <h3>Custom Spring Config</h3>
        <p>Use spring physics for natural motion</p>
        <SpringConfigExample />
      </section>
      
      <section>
        <h3>Layout Transitions</h3>
        <p>Elements collapse smoothly and remaining items shift to fill the gap</p>
        <LayoutTransitionExample />
      </section>
      
      <section>
        <h3>Hook API (useAnimatePresence)</h3>
        <p>Programmatic control with the useAnimatePresence hook</p>
        <HookAPIExample />
      </section>
    </Stack>
  );
}

function BasicListExample() {
  const [items, setItems] = useState([1, 2, 3]);
  
  return (
    <Stack spacing="md">
      <Cluster spacing="sm">
        <button onClick={() => setItems([...items, items.length + 1])}>
          Add Item
        </button>
        <button onClick={() => setItems(items.slice(0, -1))}>
          Remove Item
        </button>
        <button onClick={() => setItems([1, 2, 3])}>
          Reset
        </button>
      </Cluster>
      
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '1rem',
        minHeight: '200px'
      }}>
        <AnimatePresence
          exit={{
            opacity: 0,
            config: { duration: 300, easing: 'ease-out' },
          }}
          enter={{
            opacity: 0,
            config: { duration: 300, easing: 'ease-in' },
          }}
        >
          {items.map(item => (
            <div
              key={item}
              style={{
                padding: '0.75rem',
                margin: '0.5rem 0',
                background: '#f0f0f0',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            >
              Item {item}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </Stack>
  );
}

function SlideOutExample() {
  const [items, setItems] = useState(['Apple', 'Banana', 'Cherry']);
  
  return (
    <Stack spacing="md">
      <Cluster spacing="sm">
        <button onClick={() => {
          const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
          const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
          setItems([...items, randomFruit]);
        }}>
          Add Random Fruit
        </button>
        <button onClick={() => setItems(items.slice(0, -1))}>
          Remove Last
        </button>
        <button onClick={() => setItems(['Apple', 'Banana', 'Cherry'])}>
          Reset
        </button>
      </Cluster>
      
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '1rem',
        minHeight: '200px'
      }}>
        <AnimatePresence
          exit={{
            opacity: 0,
            transform: 'translateX(-100px)',
            config: { duration: 400, easing: 'ease-in-out' },
          }}
          enter={{
            opacity: 0,
            transform: 'translateX(100px)',
            config: { duration: 400, easing: 'ease-in-out' },
          }}
        >
          {items.map(item => (
            <div
              key={item}
              style={{
                padding: '0.75rem',
                margin: '0.5rem 0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '4px',
                fontWeight: '500',
              }}
            >
              {item}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </Stack>
  );
}

function WaitModeExample() {
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'contact'>('home');
  
  const views = {
    home: { title: 'Home', color: '#667eea' },
    about: { title: 'About', color: '#f093fb' },
    contact: { title: 'Contact', color: '#4facfe' },
  };
  
  return (
    <Stack spacing="md">
      <Cluster spacing="sm">
        <button onClick={() => setCurrentView('home')}>Home</button>
        <button onClick={() => setCurrentView('about')}>About</button>
        <button onClick={() => setCurrentView('contact')}>Contact</button>
      </Cluster>
      
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '2rem',
        minHeight: '300px',
        position: 'relative',
      }}>
        <AnimatePresence
          mode="wait"
          onExitComplete={() => {
            console.log('Exit complete, entering next view');
          }}
          exit={{
            opacity: 0,
            transform: 'scale(0.9)',
            config: { duration: 300, easing: 'ease-out' },
          }}
          enter={{
            opacity: 0,
            transform: 'scale(1.1)',
            config: { duration: 300, easing: 'ease-in' },
          }}
        >
          {currentView === 'home' && (
            <div
              key="home"
              style={{
                padding: '2rem',
                background: views.home.color,
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <h3>{views.home.title}</h3>
              <p>Welcome to the home page!</p>
            </div>
          )}
          {currentView === 'about' && (
            <div
              key="about"
              style={{
                padding: '2rem',
                background: views.about.color,
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <h3>{views.about.title}</h3>
              <p>Learn more about us.</p>
            </div>
          )}
          {currentView === 'contact' && (
            <div
              key="contact"
              style={{
                padding: '2rem',
                background: views.contact.color,
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <h3>{views.contact.title}</h3>
              <p>Get in touch with us.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Stack>
  );
}

function RouteTransitionExample() {
  const [route, setRoute] = useState<'page1' | 'page2' | 'page3'>('page1');
  
  return (
    <Stack spacing="md">
      <Cluster spacing="sm">
        <button onClick={() => setRoute('page1')}>Page 1</button>
        <button onClick={() => setRoute('page2')}>Page 2</button>
        <button onClick={() => setRoute('page3')}>Page 3</button>
      </Cluster>
      
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '2rem',
        minHeight: '300px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <AnimatePresence
          mode="wait"
          exit={{
            opacity: 0,
            transform: 'translateX(-50px)',
            config: { duration: 300 },
          }}
          enter={{
            opacity: 0,
            transform: 'translateX(50px)',
            config: { duration: 300 },
          }}
        >
          {route === 'page1' && (
            <div key="page1" style={{ padding: '1rem' }}>
              <h3>Page 1</h3>
              <p>This is the first page with slide transitions.</p>
            </div>
          )}
          {route === 'page2' && (
            <div key="page2" style={{ padding: '1rem' }}>
              <h3>Page 2</h3>
              <p>This is the second page with slide transitions.</p>
            </div>
          )}
          {route === 'page3' && (
            <div key="page3" style={{ padding: '1rem' }}>
              <h3>Page 3</h3>
              <p>This is the third page with slide transitions.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Stack>
  );
}

function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Stack spacing="md">
      <button onClick={() => setIsOpen(true)}>
        Open Modal
      </button>
      
      <AnimatePresence
        exit={{
          opacity: 0,
          config: { duration: 200 },
        }}
        enter={{
          opacity: 0,
          config: { duration: 200 },
        }}
      >
        {isOpen && (
          <div
            key="modal-overlay"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              key="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '8px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h3>Modal Dialog</h3>
              <p>This is a modal that animates in and out.</p>
              <button onClick={() => setIsOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </Stack>
  );
}

function PopLayoutExample() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);
  
  return (
    <Stack spacing="md">
      <Cluster spacing="sm">
        <button onClick={() => {
          const randomIndex = Math.floor(Math.random() * items.length);
          setItems(items.filter((_, i) => i !== randomIndex));
        }}>
          Remove Random Item
        </button>
        <button onClick={() => setItems([1, 2, 3, 4, 5])}>
          Reset
        </button>
      </Cluster>
      
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '1rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '1rem',
      }}>
        <AnimatePresence
          mode="popLayout"
          exit={{
            opacity: 0,
            transform: 'scale(0)',
            config: { duration: 300 },
          }}
          enter={{
            opacity: 0,
            transform: 'scale(0)',
            config: { duration: 300 },
          }}
        >
          {items.map(item => (
            <div
              key={item}
              style={{
                padding: '1rem',
                background: '#667eea',
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {item}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </Stack>
  );
}

function SpringConfigExample() {
  const [items, setItems] = useState([1, 2]);
  
  return (
    <Stack spacing="md">
      <Cluster spacing="sm">
        <button onClick={() => setItems([...items, items.length + 1])}>
          Add Item
        </button>
        <button onClick={() => setItems(items.slice(0, -1))}>
          Remove Item
        </button>
        <button onClick={() => setItems([1, 2])}>
          Reset
        </button>
      </Cluster>
      
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '1rem',
        minHeight: '200px'
      }}>
        <AnimatePresence
          exit={{
            opacity: 0,
            transform: 'translateY(-20px)',
            config: {
              stiffness: 300,
              damping: 30,
              mass: 1,
              from: 1,
              to: 0,
            },
          }}
          enter={{
            opacity: 0,
            transform: 'translateY(20px)',
            config: {
              stiffness: 300,
              damping: 30,
              mass: 1,
              from: 0,
              to: 1,
            },
          }}
        >
          {items.map(item => (
            <div
              key={item}
              style={{
                padding: '1rem',
                margin: '0.5rem 0',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500',
              }}
            >
              Item {item} (Spring Animation)
            </div>
          ))}
        </AnimatePresence>
      </div>
    </Stack>
  );
}

function LayoutTransitionExample() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);
  
  return (
    <Stack spacing="md">
      <Cluster spacing="sm">
        <button onClick={() => {
          const randomIndex = Math.floor(Math.random() * items.length);
          setItems(items.filter((_, i) => i !== randomIndex));
        }}>
          Remove Random Item
        </button>
        <button onClick={() => setItems([1, 2, 3, 4, 5])}>
          Reset
        </button>
      </Cluster>
      
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '1rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <AnimatePresence
          layout
          exit={{
            opacity: 0,
            config: { duration: 300, easing: 'ease-out' },
          }}
          enter={{
            opacity: 0,
            config: { duration: 300, easing: 'ease-in' },
          }}
        >
          {items.map(item => (
            <div
              key={item}
              style={{
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '6px',
                fontWeight: '500',
                minWidth: '60px',
                textAlign: 'center',
              }}
            >
              {item}
            </div>
          ))}
        </AnimatePresence>
      </div>
      
      <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
        With <code>layout</code> prop enabled, elements collapse smoothly and remaining items shift to fill the gap using FLIP animations.
      </p>
    </Stack>
  );
}

function HookAPIExample() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'basic' | 'modal' | 'wait'>('basic');
  
  return (
    <Stack spacing="md">
      <Cluster spacing="sm">
        <button onClick={() => setSelectedTab('basic')}>
          Basic Toggle
        </button>
        <button onClick={() => setSelectedTab('modal')}>
          Modal Example
        </button>
        <button onClick={() => setSelectedTab('wait')}>
          Wait Mode
        </button>
      </Cluster>
      
      {selectedTab === 'basic' && (
        <BasicHookExample isVisible={isVisible} setIsVisible={setIsVisible} />
      )}
      
      {selectedTab === 'modal' && (
        <ModalHookExample isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      )}
      
      {selectedTab === 'wait' && (
        <WaitModeHookExample />
      )}
    </Stack>
  );
}

function BasicHookExample({ 
  isVisible, 
  setIsVisible 
}: { 
  isVisible: boolean; 
  setIsVisible: (value: boolean) => void;
}) {
  const { ref, isExiting, isEntering, shouldRender } = useAnimatePresence(isVisible, {
    exit: {
      opacity: 0,
      transform: 'translateY(-20px)',
      config: { duration: 300, easing: 'ease-out' },
    },
    enter: {
      opacity: 0,
      transform: 'translateY(20px)',
      config: { duration: 300, easing: 'ease-in' },
    },
  });
  
  return (
    <Stack spacing="md">
      <button onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? 'Hide' : 'Show'} Content
      </button>
      
      {shouldRender && (
        <div
          ref={ref}
          style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '8px',
            minHeight: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
            Hook API Example
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            {isExiting && 'Exiting...'}
            {isEntering && 'Entering...'}
            {!isExiting && !isEntering && 'Visible'}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
            Use the hook for programmatic control
          </div>
        </div>
      )}
      
      <p style={{ fontSize: '0.875rem', color: '#666' }}>
        The <code>useAnimatePresence</code> hook provides <code>ref</code>, <code>isExiting</code>, <code>isEntering</code>, and <code>shouldRender</code> for programmatic control.
      </p>
    </Stack>
  );
}

function ModalHookExample({ 
  isModalOpen, 
  setIsModalOpen 
}: { 
  isModalOpen: boolean; 
  setIsModalOpen: (value: boolean) => void;
}) {
  const overlay = useAnimatePresence(isModalOpen, {
    exit: {
      opacity: 0,
      config: { duration: 200 },
    },
    enter: {
      opacity: 0,
      config: { duration: 200 },
    },
  });
  
  const content = useAnimatePresence(isModalOpen, {
    exit: {
      opacity: 0,
      transform: 'scale(0.9)',
      config: { duration: 200 },
    },
    enter: {
      opacity: 0,
      transform: 'scale(1.1)',
      config: { duration: 200 },
    },
  });
  
  return (
    <Stack spacing="md">
      <button onClick={() => setIsModalOpen(true)}>
        Open Modal (Hook)
      </button>
      
      {overlay.shouldRender && (
        <div
          ref={overlay.ref}
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            opacity: overlay.isExiting ? 0 : overlay.isEntering ? 0 : 1,
          }}
        >
          {content.shouldRender && (
            <div
              ref={content.ref}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '8px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h3 style={{ marginTop: 0 }}>Modal Dialog (Hook)</h3>
              <p>This modal is controlled using the useAnimatePresence hook.</p>
              <button onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>
          )}
        </div>
      )}
      
      <p style={{ fontSize: '0.875rem', color: '#666' }}>
        Multiple hooks can be used together to animate different parts of a component (overlay and content).
      </p>
    </Stack>
  );
}

function WaitModeHookExample() {
  const [currentView, setCurrentView] = useState<'view1' | 'view2' | 'view3'>('view1');
  const [isWaiting, setIsWaiting] = useState(false);
  
  const view1 = useAnimatePresence(currentView === 'view1', {
    mode: 'wait',
    exit: {
      opacity: 0,
      transform: 'scale(0.9)',
      config: { duration: 300, easing: 'ease-out' },
    },
    enter: {
      opacity: 0,
      transform: 'scale(1.1)',
      config: { duration: 300, easing: 'ease-in' },
    },
  });
  
  const view2 = useAnimatePresence(currentView === 'view2', {
    mode: 'wait',
    exit: {
      opacity: 0,
      transform: 'scale(0.9)',
      config: { duration: 300, easing: 'ease-out' },
    },
    enter: {
      opacity: 0,
      transform: 'scale(1.1)',
      config: { duration: 300, easing: 'ease-in' },
    },
  });
  
  const view3 = useAnimatePresence(currentView === 'view3', {
    mode: 'wait',
    exit: {
      opacity: 0,
      transform: 'scale(0.9)',
      config: { duration: 300, easing: 'ease-out' },
    },
    enter: {
      opacity: 0,
      transform: 'scale(1.1)',
      config: { duration: 300, easing: 'ease-in' },
    },
  });
  
  // Track waiting state
  useEffect(() => {
    setIsWaiting(view1.isExiting || view2.isExiting || view3.isExiting);
  }, [view1.isExiting, view2.isExiting, view3.isExiting]);
  
  return (
    <Stack spacing="md">
      <Cluster spacing="sm">
        <button 
          onClick={() => setCurrentView('view1')}
          disabled={isWaiting}
        >
          View 1
        </button>
        <button 
          onClick={() => setCurrentView('view2')}
          disabled={isWaiting}
        >
          View 2
        </button>
        <button 
          onClick={() => setCurrentView('view3')}
          disabled={isWaiting}
        >
          View 3
        </button>
      </Cluster>
      
      {isWaiting && (
        <div style={{ fontSize: '0.875rem', color: '#666', fontStyle: 'italic' }}>
          Waiting for exit animation to complete...
        </div>
      )}
      
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '2rem',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {view1.shouldRender && (
          <div
            ref={view1.ref}
            style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ marginTop: 0 }}>View 1</h3>
            <p>First view content</p>
          </div>
        )}
        
        {view2.shouldRender && (
          <div
            ref={view2.ref}
            style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ marginTop: 0 }}>View 2</h3>
            <p>Second view content</p>
          </div>
        )}
        
        {view3.shouldRender && (
          <div
            ref={view3.ref}
            style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ marginTop: 0 }}>View 3</h3>
            <p>Third view content</p>
          </div>
        )}
      </div>
      
      <p style={{ fontSize: '0.875rem', color: '#666' }}>
        Wait mode ensures the previous view exits completely before the next view enters. The hook provides <code>isExiting</code> state to track this.
      </p>
    </Stack>
  );
}


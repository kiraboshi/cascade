/**
 * Example component demonstrating parent-child orchestration with staggerChildren
 */

import React, { useEffect } from 'react';
import { defineAnimationStates } from '@cascade/compiler';
import { useAnimationStatesWithChildren, useAnimationStates } from '@cascade/motion-runtime';

// Parent container states with orchestration
const containerStates = defineAnimationStates({
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 300,
      staggerChildren: 100, // Stagger children by 100ms
      delayChildren: 200,   // Wait 200ms before starting children
    },
  },
});

// Child item states
const itemStates = defineAnimationStates({
  initial: {
    opacity: 0,
    transform: 'translateY(20px)',
  },
  animate: {
    opacity: 1,
    transform: 'translateY(0)',
    transition: {
      duration: 400,
      easing: 'ease-out',
    },
  },
});

export interface StaggeredListProps {
  items: string[];
  title?: string;
}

/**
 * Staggered list component demonstrating parent-child orchestration
 */
export function StaggeredList({ items, title = 'Staggered List' }: StaggeredListProps) {
  const container = useAnimationStatesWithChildren(containerStates, {
    initial: 'initial',
    animate: 'animate',
    autoOrchestrate: true,
  });
  
  // Trigger child animations when container animates
  useEffect(() => {
    if (container.currentState === 'animate') {
      // Small delay to ensure parent state is applied
      setTimeout(() => {
        container.animateChildrenTo('animate');
      }, 50);
    }
  }, [container.currentState, container]);
  
  return (
    <div className={container.className} style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
        {title}
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item, index) => (
          <StaggeredListItem
            key={index}
            item={item}
            index={index}
            container={container}
          />
        ))}
      </ul>
    </div>
  );
}

/**
 * Individual list item component
 */
function StaggeredListItem({
  item,
  index,
  container,
}: {
  item: string;
  index: number;
  container: ReturnType<typeof useAnimationStatesWithChildren>;
}) {
  const childAnimation = useAnimationStates(itemStates, {
    initial: 'initial',
    animate: false, // Controlled by parent
  });
  
  // Register this child with parent
  useEffect(() => {
    const id = `item-${index}`;
    container.registerChild(id, childAnimation);
    
    return () => {
      container.unregisterChild(id);
    };
  }, [container, childAnimation, index]);
  
  return (
    <li
      className={childAnimation.className}
      style={{
        padding: '0.75rem',
        marginBottom: '0.5rem',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {item}
    </li>
  );
}


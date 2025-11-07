/**
 * Tests for motion compiler
 */

import { describe, it, expect } from 'vitest';
import { defineMotion, defineMotionSequence } from '../motion-compiler';
import { solveSpring } from '../spring-solver';

describe('Motion Compiler', () => {
  it('should generate CSS keyframes for spring animation', () => {
    const motion = defineMotion({
      type: 'spring',
      stiffness: 300,
      damping: 20,
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      duration: 300,
    });
    
    expect(motion.css).toBeTruthy();
    expect(motion.css).toContain('@keyframes');
    expect(motion.className).toBeTruthy();
  });
  
  it('should generate sequence with overlapping stages', () => {
    const sequence = defineMotionSequence({
      stages: [
        {
          name: 'slide',
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(400px)' },
          duration: '800ms',
        },
        {
          name: 'fade',
          startAt: '60%',
          from: { opacity: 1 },
          to: { opacity: 0 },
          duration: '400ms',
        },
      ],
    });
    
    expect(sequence.css).toBeTruthy();
    expect(sequence.css).toContain('@keyframes');
    expect(sequence.jsConfig).toBeTruthy();
    expect(sequence.jsConfig.type).toBe('sequence');
    expect(sequence.jsConfig.stages.length).toBe(2);
  });
});

describe('Spring Solver', () => {
  it('should solve spring physics', () => {
    const values = solveSpring({
      stiffness: 300,
      damping: 20,
      mass: 1,
      from: 0,
      to: 100,
    }, 300, 10);
    
    expect(values.length).toBe(11); // 0-10 steps
    expect(values[0]).toBe(0);
    expect(values[values.length - 1]).toBeCloseTo(100, 0);
  });
});



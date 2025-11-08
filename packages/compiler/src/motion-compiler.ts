/**
 * Motion compiler: Spring physics to CSS keyframes + JS configs
 */

import { generateKeyframes, generateSpringKeyframes, type KeyframeConfig, type SpringKeyframeConfig } from './keyframe-generator';
import { shouldPrecompute } from './spring-solver';
import { tokens } from '@cascade/tokens';

export interface SpringMotionConfig {
  type: 'spring';
  stiffness: number;
  damping: number;
  mass?: number;
  from: Record<string, string | number>;
  to: Record<string, string | number>;
  duration?: number;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface SequenceStage {
  name: string;
  from: Record<string, string | number>;
  to: Record<string, string | number>;
  duration: string | number;
  easing?: string;
  startAt?: string | number; // Percentage or absolute time
}

export interface SequenceConfig {
  stages: SequenceStage[];
  onComplete?: string;
}

export interface MotionOutput {
  css: string;
  className: string;
  jsConfig?: {
    type: 'css';
    className: string;
    duration: number;
  };
}

export interface SequenceOutput {
  css: string;
  className: string;
  jsConfig: {
    type: 'sequence';
    stages: Array<{
      name: string;
      startAt: number;
      duration: number;
      className: string;
    }>;
    totalDuration: number;
  };
}

/**
 * Define a single motion animation
 */
export function defineMotion(config: SpringMotionConfig | KeyframeConfig): MotionOutput {
  // Check if it's a spring animation
  if ('type' in config && config.type === 'spring') {
    const springConfig = config as SpringMotionConfig;
    const duration = springConfig.duration || 300;
    
    // Convert properties to numeric values for spring solver
    const properties: Record<string, { from: number; to: number }> = {};
    
    for (const [prop, fromValue] of Object.entries(springConfig.from)) {
      const toValue = springConfig.to[prop];
      if (typeof fromValue === 'number' && typeof toValue === 'number') {
        properties[prop] = { from: fromValue, to: toValue };
      } else {
        // Fallback to regular keyframes for non-numeric values
        return defineMotion({
          from: springConfig.from,
          to: springConfig.to,
          duration: `${duration}ms`,
          easing: tokens.motion.easing.easeOut,
          fillMode: springConfig.fillMode || 'backwards',
        } as KeyframeConfig);
      }
    }
    
    const springKeyframeConfig: SpringKeyframeConfig = {
      stiffness: springConfig.stiffness,
      damping: springConfig.damping,
      mass: springConfig.mass || 1,
      properties,
      duration,
      easing: tokens.motion.easing.bounce,
      fillMode: springConfig.fillMode || 'backwards',
    };
    
    const name = `motion-${Math.random().toString(36).substr(2, 9)}`;
    const { css, className } = generateSpringKeyframes(name, springKeyframeConfig);
    
    return {
      css,
      className,
      jsConfig: shouldPrecompute(duration)
        ? undefined
        : {
            type: 'css',
            className,
            duration,
          },
    };
  }
  
  // Regular keyframe animation
  const keyframeConfig = config as KeyframeConfig;
  const name = `motion-${Math.random().toString(36).substr(2, 9)}`;
  const { css, className } = generateKeyframes(name, keyframeConfig);
  
  return {
    css,
    className,
  };
}

/**
 * Parse timing value (percentage or absolute)
 */
function parseTiming(value: string | number, totalDuration: number): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && value.endsWith('%')) {
    return (parseFloat(value) / 100) * totalDuration;
  }
  if (typeof value === 'string' && value.endsWith('ms')) {
    return parseFloat(value);
  }
  return 0;
}

/**
 * Define a motion sequence with multiple stages
 */
export function defineMotionSequence(config: SequenceConfig): SequenceOutput {
  const stages: Array<{
    name: string;
    startAt: number;
    duration: number;
    className: string;
    css: string;
  }> = [];
  
  // Calculate total duration (estimate if not all stages have explicit timing)
  let totalDuration = 0;
  for (const stage of config.stages) {
    const duration = parseTiming(stage.duration, 0);
    totalDuration = Math.max(totalDuration, duration);
  }
  
  // Calculate actual timings for all stages first
  const stageTimings: Array<{
    stage: SequenceStage;
    startAt: number;
    duration: number;
    end: number;
  }> = [];
  
  let currentTime = 0;
  for (let i = 0; i < config.stages.length; i++) {
    const stage = config.stages[i];
    const duration = parseTiming(stage.duration, totalDuration);
    
    let startAt: number;
    if (stage.startAt) {
      if (typeof stage.startAt === 'string' && stage.startAt.endsWith('%')) {
        // Percentage relative to previous stage or total
        const percentage = parseFloat(stage.startAt);
        if (i === 0) {
          startAt = (percentage / 100) * totalDuration;
        } else {
          const prevDuration = stageTimings[i - 1].duration;
          startAt = stageTimings[i - 1].startAt + (percentage / 100) * prevDuration;
        }
      } else {
        startAt = parseTiming(stage.startAt, totalDuration);
      }
    } else {
      startAt = currentTime;
    }
    
    const end = startAt + duration;
    stageTimings.push({ stage, startAt, duration, end });
    currentTime = Math.max(currentTime, end);
  }
  
  // Check if stages overlap
  const hasOverlappingStages = stageTimings.some((timing, index) => {
    if (index === 0) return false;
    return timing.startAt < stageTimings[index - 1].end;
  });
  
  // If stages overlap, create a combined keyframe
  if (hasOverlappingStages) {
    const sequenceName = `sequence-${Math.random().toString(36).substr(2, 9)}`;
    const combinedKeyframes: Array<{ percentage: number; values: Record<string, string | number> }> = [];
    
    const totalSequenceDuration = currentTime;
    
    // Generate keyframes at key points
    const keyPoints = new Set<number>([0, 100]);
    stageTimings.forEach(({ startAt, end }) => {
      keyPoints.add((startAt / totalSequenceDuration) * 100);
      keyPoints.add((end / totalSequenceDuration) * 100);
    });
    
    const sortedPoints = Array.from(keyPoints).sort((a, b) => a - b);
    
    // Calculate values at each keyframe point
    sortedPoints.forEach((percentage) => {
      const time = (percentage / 100) * totalSequenceDuration;
      const combinedValues: Record<string, string | number> = {};
      
      // Start with initial values from first stage
      if (stageTimings.length > 0) {
        Object.assign(combinedValues, stageTimings[0].stage.from);
      }
      
      // Merge values from all active stages at this time
      stageTimings.forEach(({ stage, startAt, duration, end }) => {
        if (time >= startAt && time <= end) {
          // Stage is active, interpolate its values
          const stageProgress = (time - startAt) / duration;
          
          Object.keys(stage.from).forEach((key) => {
            const fromValue = stage.from[key];
            const toValue = stage.to[key];
            
            if (typeof fromValue === 'number' && typeof toValue === 'number') {
              combinedValues[key] = fromValue + (toValue - fromValue) * stageProgress;
            } else {
              // For non-numeric (like transform strings), interpolate based on progress
              combinedValues[key] = stageProgress >= 1 ? toValue : fromValue;
            }
          });
        } else if (time > end) {
          // Stage completed, use its final values (overrides previous)
          Object.assign(combinedValues, stage.to);
        }
        // If stage hasn't started yet, don't apply its values
      });
      
      combinedKeyframes.push({ percentage, values: combinedValues });
    });
    
    // Generate CSS keyframes
    const keyframeRules = combinedKeyframes
      .map(({ percentage, values }) => {
        const props = Object.entries(values)
          .map(([prop, value]) => {
            if (prop === 'transform') {
              return `transform: ${value};`;
            }
            return `${prop}: ${value};`;
          })
          .join('\n    ');
        return `  ${percentage}% {\n    ${props}\n  }`;
      })
      .join('\n');
    
    const css = `
@keyframes ${sequenceName} {
${keyframeRules}
}

.${sequenceName} {
  animation: ${sequenceName} ${totalSequenceDuration}ms ${tokens.motion.easing.easeOut};
  animation-fill-mode: backwards;
}
    `.trim();
    
    // Create stage entries for jsConfig
    const jsStages = stageTimings.map(({ stage, startAt, duration }) => ({
      name: stage.name,
      startAt,
      duration,
      className: sequenceName, // All stages use the same combined animation
    }));
    
    return {
      css,
      className: sequenceName,
      jsConfig: {
        type: 'sequence',
        stages: jsStages,
        totalDuration: totalSequenceDuration,
      },
    };
  }
  
  // Non-overlapping stages: generate separate keyframes
  // Reset currentTime for non-overlapping case
  currentTime = 0;
  const cssParts: string[] = [];
  
  for (const stage of config.stages) {
    const duration = parseTiming(stage.duration, totalDuration);
    const startAt = stage.startAt 
      ? parseTiming(stage.startAt, totalDuration)
      : currentTime;
    
    const name = `sequence-${stage.name}-${Math.random().toString(36).substr(2, 9)}`;
    const { css, className } = generateKeyframes(name, {
      from: stage.from,
      to: stage.to,
      duration: `${duration}ms`,
      easing: stage.easing || tokens.motion.easing.easeOut,
    });
    
    cssParts.push(css);
    
    stages.push({
      name: stage.name,
      startAt,
      duration,
      className,
      css,
    });
    
    currentTime = startAt + duration;
  }
  
  const sequenceName = `sequence-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    css: cssParts.join('\n\n'),
    className: sequenceName,
    jsConfig: {
      type: 'sequence',
      stages: stages.map(({ name, startAt, duration, className }) => ({
        name,
        startAt,
        duration,
        className,
      })),
      totalDuration: currentTime,
    },
  };
}

/**
 * Define motion animation that uses CSS variables (for runtime control)
 */
export interface MotionValueKeyframeConfig {
  values: Record<string, {
    from: string; // CSS variable name or value
    to: string;   // CSS variable name or value
  }>;
  duration?: number | string;
  easing?: string;
}

export function defineMotionWithValues(
  config: MotionValueKeyframeConfig
): MotionOutput {
  const name = `motion-values-${Math.random().toString(36).substr(2, 9)}`;
  const duration = typeof config.duration === 'number'
    ? `${config.duration}ms`
    : config.duration || '300ms';
  const easing = config.easing || 'ease';
  
  // Helper to format CSS variable reference
  const formatValue = (value: string): string => {
    if (value.startsWith('--')) {
      return `var(${value})`;
    }
    return value;
  };
  
  const keyframeRules = `
  0% {
    ${Object.entries(config.values).map(([prop, { from }]) => {
      return `${prop}: ${formatValue(from)};`;
    }).join('\n    ')}
  }
  100% {
    ${Object.entries(config.values).map(([prop, { to }]) => {
      return `${prop}: ${formatValue(to)};`;
    }).join('\n    ')}
  }
  `;
  
  const css = `
@keyframes ${name} {
  ${keyframeRules}
}

.${name} {
  animation: ${name} ${duration} ${easing};
}
  `.trim();
  
  return {
    css,
    className: name,
  };
}


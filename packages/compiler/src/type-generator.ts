/**
 * TypeScript type generator for tokens and components
 * Generates .d.ts files with full autocomplete support
 */

import { compileTokens } from './token-compiler';

export interface TypeGenerationOptions {
  outputDir?: string;
  generateTokenTypes?: boolean;
  generateComponentTypes?: boolean;
  generateMotionTypes?: boolean;
}

/**
 * Generate TypeScript type definitions
 */
export function generateTypes(options: TypeGenerationOptions = {}): string {
  const {
    generateTokenTypes = true,
    generateComponentTypes = true,
    generateMotionTypes = true,
  } = options;
  
  const declarations: string[] = [];
  
  declarations.push(`/**
 * Generated TypeScript type definitions for Cascade CSS Foundation
 * This file is auto-generated - do not edit manually
 */\n`);
  
  declarations.push('declare module "@cascade/core" {');
  declarations.push('  export * from "@cascade/core";');
  declarations.push('}\n');
  
  if (generateTokenTypes) {
    declarations.push('declare module "@cascade/tokens" {');
    const compiled = compileTokens();
    declarations.push(compiled.ts);
    declarations.push('}\n');
  }
  
  if (generateComponentTypes) {
    declarations.push('declare module "@cascade/react" {');
    declarations.push('  import type { HTMLAttributes } from "react";');
    declarations.push('  import type { SpaceToken } from "@cascade/tokens";\n');
    
    declarations.push('  export interface StackProps extends Omit<HTMLAttributes<HTMLDivElement>, "style"> {');
    declarations.push('    spacing: SpaceToken;');
    declarations.push('    align?: "start" | "center" | "end" | "stretch";');
    declarations.push('    justify?: "start" | "center" | "end" | "between";');
    declarations.push('    responsive?: Record<string, Partial<Omit<StackProps, "responsive">>>;');
    declarations.push('    as?: keyof JSX.IntrinsicElements;');
    declarations.push('  }\n');
    
    declarations.push('  export interface ClusterProps extends Omit<HTMLAttributes<HTMLDivElement>, "style"> {');
    declarations.push('    spacing?: SpaceToken;');
    declarations.push('    justify?: "start" | "center" | "end" | "between";');
    declarations.push('    detectWrapping?: boolean;');
    declarations.push('    as?: keyof JSX.IntrinsicElements;');
    declarations.push('  }\n');
    
    declarations.push('  export interface FrameProps extends Omit<HTMLAttributes<HTMLDivElement>, "style"> {');
    declarations.push('    ratio: \`\${number}/\${number}\`;');
    declarations.push('    objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";');
    declarations.push('    as?: keyof JSX.IntrinsicElements;');
    declarations.push('  }\n');
    
    declarations.push('  export const Stack: React.ComponentType<StackProps>;');
    declarations.push('  export const Cluster: React.ComponentType<ClusterProps>;');
    declarations.push('  export const Frame: React.ComponentType<FrameProps>;');
    declarations.push('}\n');
  }
  
  if (generateMotionTypes) {
    declarations.push('declare module "@cascade/compiler" {');
    declarations.push('  export interface SpringMotionConfig {');
    declarations.push('    type: "spring";');
    declarations.push('    stiffness: number;');
    declarations.push('    damping: number;');
    declarations.push('    mass?: number;');
    declarations.push('    from: Record<string, string | number>;');
    declarations.push('    to: Record<string, string | number>;');
    declarations.push('    duration?: number;');
    declarations.push('  }\n');
    
    declarations.push('  export interface SequenceStage {');
    declarations.push('    name: string;');
    declarations.push('    from: Record<string, string | number>;');
    declarations.push('    to: Record<string, string | number>;');
    declarations.push('    duration: string | number;');
    declarations.push('    easing?: string;');
    declarations.push('    startAt?: string | number;');
    declarations.push('  }\n');
    
    declarations.push('  export interface SequenceConfig {');
    declarations.push('    stages: SequenceStage[];');
    declarations.push('    onComplete?: string;');
    declarations.push('  }\n');
    
    declarations.push('  export interface MotionOutput {');
    declarations.push('    css: string;');
    declarations.push('    className: string;');
    declarations.push('    jsConfig?: {');
    declarations.push('      type: "css";');
    declarations.push('      className: string;');
    declarations.push('      duration: number;');
    declarations.push('    };');
    declarations.push('  }\n');
    
    declarations.push('  export interface SequenceOutput {');
    declarations.push('    css: string;');
    declarations.push('    className: string;');
    declarations.push('    jsConfig: {');
    declarations.push('      type: "sequence";');
    declarations.push('      stages: Array<{');
    declarations.push('        name: string;');
    declarations.push('        startAt: number;');
    declarations.push('        duration: number;');
    declarations.push('        className: string;');
    declarations.push('      }>;');
    declarations.push('      totalDuration: number;');
    declarations.push('    };');
    declarations.push('  }\n');
    
    declarations.push('  export function defineMotion(config: SpringMotionConfig | KeyframeConfig): MotionOutput;');
    declarations.push('  export function defineMotionSequence(config: SequenceConfig): SequenceOutput;');
    declarations.push('}\n');
    
    declarations.push('declare module "@cascade/motion-runtime" {');
    declarations.push('  import type { ReactNode, CSSProperties } from "react";\n');
    
    declarations.push('  export interface MotionStageProps {');
    declarations.push('    animation: string | { className: string; css?: string };');
    declarations.push('    delay?: number | "until-previous-completes";');
    declarations.push('    onComplete?: (event: { next: () => void }) => void;');
    declarations.push('    onStart?: () => void;');
    declarations.push('    style?: CSSProperties;');
    declarations.push('    className?: string;');
    declarations.push('    children?: ReactNode;');
    declarations.push('  }\n');
    
    declarations.push('  export interface MotionSequenceProps {');
    declarations.push('    children: ReactNode;');
    declarations.push('    onComplete?: () => void;');
    declarations.push('    autoStart?: boolean;');
    declarations.push('    respectReducedMotion?: boolean;');
    declarations.push('    pauseOnHover?: boolean;');
    declarations.push('  }\n');
    
    declarations.push('  export const MotionSequence: React.ComponentType<MotionSequenceProps>;');
    declarations.push('  export const MotionStage: React.ComponentType<MotionStageProps>;');
    declarations.push('  export function useMotionSequence(stageCount: number, options?: UseMotionSequenceOptions): MotionSequenceControls;');
    declarations.push('}\n');
  }
  
  return declarations.join('\n');
}

/**
 * Write type definitions to file
 */
export async function writeTypes(
  outputPath: string,
  options: TypeGenerationOptions = {}
): Promise<void> {
  const types = generateTypes(options);
  const fs = await import('fs/promises');
  await fs.writeFile(outputPath, types, 'utf-8');
}


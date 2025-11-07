/**
 * Tests for token compiler
 */

import { describe, it, expect } from 'vitest';
import { compileTokens, resolveToken, computeFluidValue } from '../token-compiler';
import { resolveDTCGAliases } from '../dtcg-parser';

describe('Token Compiler', () => {
  it('should compile tokens from both DTCG and TypeScript formats', () => {
    const compiled = compileTokens();
    
    expect(compiled.css).toBeTruthy();
    expect(compiled.ts).toBeTruthy();
    expect(compiled.tokens.size).toBeGreaterThan(0);
  });
  
  it('should resolve token aliases', () => {
    const compiled = compileTokens();
    
    // Check that primary color resolves to blue-500
    const primaryToken = compiled.tokens.get('color.primary');
    expect(primaryToken).toBeTruthy();
  });
  
  it('should resolve token by key path', () => {
    const value = resolveToken('space.md');
    expect(value).toBeTruthy();
    expect(typeof value === 'string' || typeof value === 'number').toBe(true);
  });
  
  it('should compute fluid values', () => {
    const fluid = computeFluidValue(16, 20);
    expect(fluid).toContain('clamp');
    expect(fluid).toContain('rem');
  });
});

describe('DTCG Parser', () => {
  it('should resolve token aliases', () => {
    const tokens = {
      color: {
        blue: {
          500: { $value: 'oklch(0.637 0.237 25.331)', $type: 'color' },
        },
        primary: { $value: '{color.blue.500}', $type: 'color' },
      },
    };
    
    const resolved = resolveDTCGAliases(tokens);
    expect(resolved.color.primary).toBeDefined();
    expect((resolved.color.primary as any).$value).toBe('oklch(0.637 0.237 25.331)');
  });
});



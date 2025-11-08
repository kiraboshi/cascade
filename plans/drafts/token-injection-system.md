---
title: Token Injection System - Design Proposal
type: plan
status: draft
scope: foundation
created_at: 2025-01-27
---

# Token Injection System: Design Proposal

## Problem Statement

Currently, Cascade's token system is tightly coupled to the `@cascade/tokens` package. All token loading, compilation, and resolution happens through hardcoded imports from this package. This prevents users from:

1. **Using their own token systems** - Users with existing design token systems (e.g., Style Dictionary, Figma Tokens, custom systems) cannot integrate them
2. **Customizing token sources** - Users cannot load tokens from different locations, formats, or build processes
3. **Multi-brand support** - Users cannot easily switch between different token sets for different brands/themes
4. **Build-time flexibility** - Users cannot customize how tokens are processed or transformed

## Goals

1. **Enable token injection** - Allow users to provide their own token sources (DTCG JSON, TypeScript, or custom loaders)
2. **Maintain backward compatibility** - Default behavior should remain unchanged for existing users
3. **Support multiple formats** - Continue supporting DTCG JSON and TypeScript formats, with extensibility for custom formats
4. **Type safety** - Preserve TypeScript type generation and type-safe token access
5. **Build-time integration** - Support both Vite plugin configuration and programmatic API
6. **Runtime flexibility** - Allow token switching at runtime (for theming/multi-brand scenarios)

## Architecture Design

### Core Concept: Token Provider Pattern

Introduce a **Token Provider** abstraction that defines how tokens are loaded, resolved, and transformed. The system will support:

1. **Default Provider** - Uses `@cascade/tokens` (backward compatible)
2. **File-based Provider** - Loads from user-specified file paths
3. **Module Provider** - Loads from user-specified module exports
4. **Custom Provider** - User-implemented provider for custom token systems

### Token Provider Interface

```typescript
/**
 * Token value structure matching DTCG format
 */
export interface TokenValue {
  $value: string | number | string[];
  $type?: string;
  $description?: string;
}

/**
 * DTCG-compliant token tree structure
 */
export interface DTCGTokenTree {
  [key: string]: TokenValue | DTCGTokenTree;
}

/**
 * TypeScript token structure (flat values)
 */
export interface TSTokenTree {
  [key: string]: string | number | string[] | TSTokenTree;
}

/**
 * Unified token data structure
 */
export interface TokenData {
  dtcg?: DTCGTokenTree;
  ts?: TSTokenTree;
}

/**
 * Token Provider - abstraction for loading tokens
 */
export interface TokenProvider {
  /**
   * Provider name for debugging/logging
   */
  name: string;

  /**
   * Load DTCG JSON tokens
   * Returns null if provider doesn't support DTCG format
   */
  loadDTCG?(): Promise<DTCGTokenTree | null>;

  /**
   * Load TypeScript tokens
   * Returns null if provider doesn't support TS format
   */
  loadTS?(): Promise<TSTokenTree | null>;

  /**
   * Load both formats (preferred method)
   * Should return at least one format
   */
  load(): Promise<TokenData>;

  /**
   * Watch for token changes (optional, for HMR)
   * Returns cleanup function
   */
  watch?(onChange: () => void): () => void;
}
```

### Provider Implementations

#### 1. Default Provider (Backward Compatible)

```typescript
export class DefaultTokenProvider implements TokenProvider {
  name = 'default';

  async load(): Promise<TokenData> {
    const [tokensModule] = await Promise.all([
      import('@cascade/tokens'),
    ]);

    return {
      dtcg: tokensModule.dtcgTokens,
      ts: tokensModule.tokens,
    };
  }
}
```

#### 2. File-based Provider

```typescript
export interface FileTokenProviderOptions {
  dtcgPath?: string;
  tsPath?: string;
  watch?: boolean;
}

export class FileTokenProvider implements TokenProvider {
  constructor(private options: FileTokenProviderOptions) {}

  name = 'file';

  async loadDTCG(): Promise<DTCGTokenTree | null> {
    if (!this.options.dtcgPath) return null;
    const content = await fs.readFile(this.options.dtcgPath, 'utf-8');
    return JSON.parse(content);
  }

  async loadTS(): Promise<TSTokenTree | null> {
    if (!this.options.tsPath) return null;
    // Dynamic import of TypeScript file
    const module = await import(this.options.tsPath);
    return module.tokens || module.default;
  }

  async load(): Promise<TokenData> {
    const [dtcg, ts] = await Promise.all([
      this.loadDTCG(),
      this.loadTS(),
    ]);

    return { dtcg: dtcg || undefined, ts: ts || undefined };
  }

  watch(onChange: () => void): () => void {
    if (!this.options.watch) return () => {};
    
    const watchers: fs.FSWatcher[] = [];
    
    if (this.options.dtcgPath) {
      watchers.push(fs.watch(this.options.dtcgPath, onChange));
    }
    if (this.options.tsPath) {
      watchers.push(fs.watch(this.options.tsPath, onChange));
    }

    return () => watchers.forEach(w => w.close());
  }
}
```

#### 3. Module Provider

```typescript
export interface ModuleTokenProviderOptions {
  moduleId: string;
  dtcgExport?: string; // default: 'dtcgTokens'
  tsExport?: string;  // default: 'tokens'
}

export class ModuleTokenProvider implements TokenProvider {
  constructor(private options: ModuleTokenProviderOptions) {}

  name = 'module';

  async load(): Promise<TokenData> {
    const module = await import(this.options.moduleId);
    
    return {
      dtcg: module[this.options.dtcgExport || 'dtcgTokens'],
      ts: module[this.options.tsExport || 'tokens'],
    };
  }
}
```

#### 4. Custom Provider Example (Style Dictionary)

```typescript
export class StyleDictionaryProvider implements TokenProvider {
  constructor(private configPath: string) {}

  name = 'style-dictionary';

  async load(): Promise<TokenData> {
    // Load Style Dictionary config
    const config = await import(this.configPath);
    const StyleDictionary = await import('style-dictionary');
    
    const sd = StyleDictionary.extend(config);
    const tokens = sd.tokens;
    
    // Convert Style Dictionary format to DTCG
    return {
      dtcg: this.convertToDTCG(tokens),
    };
  }

  private convertToDTCG(tokens: any): DTCGTokenTree {
    // Conversion logic
    // ...
  }
}
```

### Token Registry

Central registry for managing token providers and current token state:

```typescript
export class TokenRegistry {
  private provider: TokenProvider;
  private cache: TokenData | null = null;
  private watcherCleanup: (() => void) | null = null;

  constructor(provider: TokenProvider) {
    this.provider = provider;
  }

  /**
   * Set a new token provider
   */
  setProvider(provider: TokenProvider): void {
    this.cleanup();
    this.provider = provider;
    this.cache = null;
  }

  /**
   * Load tokens (with caching)
   */
  async load(): Promise<TokenData> {
    if (!this.cache) {
      this.cache = await this.provider.load();
    }
    return this.cache;
  }

  /**
   * Invalidate cache and reload
   */
  async reload(): Promise<TokenData> {
    this.cache = null;
    return this.load();
  }

  /**
   * Enable watching for changes
   */
  watch(onChange: () => void): void {
    this.cleanup();
    
    if (this.provider.watch) {
      this.watcherCleanup = this.provider.watch(() => {
        this.cache = null;
        onChange();
      });
    }
  }

  private cleanup(): void {
    if (this.watcherCleanup) {
      this.watcherCleanup();
      this.watcherCleanup = null;
    }
  }
}

// Global registry instance
let globalRegistry: TokenRegistry | null = null;

export function getTokenRegistry(): TokenRegistry {
  if (!globalRegistry) {
    globalRegistry = new TokenRegistry(new DefaultTokenProvider());
  }
  return globalRegistry;
}

export function setTokenProvider(provider: TokenProvider): void {
  const registry = getTokenRegistry();
  registry.setProvider(provider);
}
```

## Integration Points

### 1. Vite Plugin Configuration

```typescript
export interface CascadeVitePluginOptions {
  watchTokens?: boolean;
  generateFoundationCSS?: boolean;
  
  // NEW: Token provider configuration
  tokens?: {
    provider?: TokenProvider;
    // OR convenience options for common cases
    dtcgPath?: string;
    tsPath?: string;
    moduleId?: string;
  };
}

export function cascadeVitePlugin(options: CascadeVitePluginOptions = {}): Plugin {
  const { tokens: tokenConfig, ...rest } = options;
  
  // Initialize token provider
  if (tokenConfig) {
    let provider: TokenProvider;
    
    if (tokenConfig.provider) {
      provider = tokenConfig.provider;
    } else if (tokenConfig.moduleId) {
      provider = new ModuleTokenProvider({ moduleId: tokenConfig.moduleId });
    } else if (tokenConfig.dtcgPath || tokenConfig.tsPath) {
      provider = new FileTokenProvider({
        dtcgPath: tokenConfig.dtcgPath,
        tsPath: tokenConfig.tsPath,
        watch: options.watchTokens,
      });
    } else {
      provider = new DefaultTokenProvider();
    }
    
    setTokenProvider(provider);
  }
  
  // ... rest of plugin implementation
}
```

### 2. Token Compiler Updates

```typescript
// packages/compiler/src/token-compiler.ts

import { getTokenRegistry } from './token-registry';

export async function compileTokens(): Promise<CompiledTokens> {
  const registry = getTokenRegistry();
  const tokenData = await registry.load();
  
  // Use provided tokens instead of hardcoded imports
  const resolvedDTCG = tokenData.dtcg 
    ? resolveDTCGAliases(tokenData.dtcg)
    : {};
  const dtcgFlat = flattenDTCGTokens(resolvedDTCG);
  
  const tsFlat = tokenData.ts
    ? flattenTSTokens(tokenData.ts)
    : new Map();
  
  // Merge tokens (TypeScript takes precedence)
  const mergedTokens = new Map<string, { value: string | number | string[]; source: 'dtcg' | 'ts' }>();
  
  for (const [key, token] of dtcgFlat) {
    mergedTokens.set(key, { value: token.$value, source: 'dtcg' });
  }
  
  for (const [key, token] of tsFlat) {
    mergedTokens.set(key, { value: token.value, source: 'ts' });
  }
  
  // Generate CSS using merged tokens
  const css = generateTokenCSS(mergedTokens);
  const ts = generateTSTypes(mergedTokens);
  
  return { css, ts, tokens: mergedTokens };
}
```

### 3. Token Resolver Updates

```typescript
// packages/core/src/token-resolver.ts

import { getTokenRegistry } from '@cascade/compiler/token-registry';

export async function generateTokenCSS(options: TokenResolverOptions = {}): Promise<string> {
  const registry = getTokenRegistry();
  const tokenData = await registry.load();
  
  // Generate CSS from provided tokens
  const cssVars: string[] = [];
  
  // Process DTCG tokens
  if (tokenData.dtcg) {
    processDTCGTokens(tokenData.dtcg, cssVars, options);
  }
  
  // Process TS tokens
  if (tokenData.ts) {
    processTSTokens(tokenData.ts, cssVars, options);
  }
  
  return cssVars.join('\n');
}
```

### 4. Runtime Token Access

```typescript
// packages/tokens/src/index.ts

import { getTokenRegistry } from '@cascade/compiler/token-registry';

export async function resolveToken(category: string, key: string): Promise<string> {
  const registry = getTokenRegistry();
  const tokenData = await registry.load();
  
  // Try TypeScript format first
  if (tokenData.ts) {
    const tsCategory = tokenData.ts[category];
    if (tsCategory && typeof tsCategory === 'object' && key in tsCategory) {
      const value = tsCategory[key];
      if (typeof value === 'string') {
        return value;
      }
    }
  }
  
  // Fallback to DTCG format
  if (tokenData.dtcg) {
    const dtcgCategory = tokenData.dtcg[category];
    if (dtcgCategory && typeof dtcgCategory === 'object' && key in dtcgCategory) {
      const token = dtcgCategory[key];
      if (token && typeof token === 'object' && '$value' in token) {
        return String(token.$value);
      }
    }
  }
  
  throw new Error(`Token not found: ${category}.${key}`);
}
```

## Usage Examples

### Example 1: Using Custom Token Files

```typescript
// vite.config.ts
import { cascadeVitePlugin } from '@cascade/compiler';

export default {
  plugins: [
    cascadeVitePlugin({
      tokens: {
        dtcgPath: './src/tokens/tokens.json',
        tsPath: './src/tokens/tokens.ts',
      },
    }),
  ],
};
```

### Example 2: Using a Custom Token Module

```typescript
// vite.config.ts
import { cascadeVitePlugin } from '@cascade/compiler';

export default {
  plugins: [
    cascadeVitePlugin({
      tokens: {
        moduleId: '@my-org/design-tokens',
      },
    }),
  ],
};
```

### Example 3: Using a Custom Provider

```typescript
// vite.config.ts
import { cascadeVitePlugin } from '@cascade/compiler';
import { TokenProvider } from '@cascade/compiler/token-registry';

class MyCustomProvider implements TokenProvider {
  name = 'custom';
  
  async load() {
    // Load tokens from API, database, etc.
    const response = await fetch('/api/tokens');
    const tokens = await response.json();
    return { dtcg: tokens };
  }
}

export default {
  plugins: [
    cascadeVitePlugin({
      tokens: {
        provider: new MyCustomProvider(),
      },
    }),
  ],
};
```

### Example 4: Programmatic API (Runtime)

```typescript
// app.ts
import { setTokenProvider, FileTokenProvider } from '@cascade/compiler/token-registry';

// Switch tokens at runtime (e.g., for theme switching)
async function switchTheme(theme: 'light' | 'dark') {
  const provider = new FileTokenProvider({
    dtcgPath: `./tokens/${theme}.json`,
    tsPath: `./tokens/${theme}.ts`,
  });
  
  setTokenProvider(provider);
  
  // Reload foundation CSS
  await reloadFoundationCSS();
}
```

## Implementation Plan

### Phase 1: Core Infrastructure

1. **Create token registry system**
   - `packages/compiler/src/token-registry.ts` - Registry and provider interfaces
   - `packages/compiler/src/providers/` - Provider implementations
     - `default-provider.ts`
     - `file-provider.ts`
     - `module-provider.ts`

2. **Update token compiler**
   - Modify `token-compiler.ts` to use registry instead of direct imports
   - Update `ts-token-loader.ts` to use registry

3. **Update token resolver**
   - Modify `packages/core/src/token-resolver.ts` to use registry

### Phase 2: Integration Points

4. **Update Vite plugin**
   - Add token provider configuration options
   - Integrate registry initialization
   - Update HMR to work with custom providers

5. **Update token package exports**
   - Modify `packages/tokens/src/index.ts` to use registry
   - Maintain backward compatibility for direct imports

### Phase 3: Documentation & Examples

6. **Create documentation**
   - Usage guide for token injection
   - Provider implementation guide
   - Migration guide for existing users

7. **Add examples**
   - Example with custom token files
   - Example with Style Dictionary integration
   - Example with runtime theme switching

### Phase 4: Testing & Validation

8. **Add tests**
   - Unit tests for providers
   - Integration tests for token compilation
   - E2E tests for Vite plugin integration

9. **Validate backward compatibility**
   - Ensure default behavior unchanged
   - Test existing projects still work

## Migration Path

### For Existing Users

**No changes required** - Default provider uses `@cascade/tokens` exactly as before.

### For Users Wanting Custom Tokens

1. **Option A: File-based** (simplest)
   ```typescript
   cascadeVitePlugin({
     tokens: {
       dtcgPath: './my-tokens.json',
       tsPath: './my-tokens.ts',
     },
   })
   ```

2. **Option B: Module-based**
   ```typescript
   cascadeVitePlugin({
     tokens: {
       moduleId: '@my-org/tokens',
     },
   })
   ```

3. **Option C: Custom provider** (most flexible)
   ```typescript
   cascadeVitePlugin({
     tokens: {
       provider: new MyCustomProvider(),
     },
   })
   ```

## Type Safety Considerations

### Challenge
When users provide custom tokens, TypeScript types need to be generated dynamically.

### Solution
1. **Build-time type generation** - Vite plugin generates types from provided tokens
2. **Type augmentation** - Users can augment types if needed
3. **Generic token access** - Provide generic APIs that work with any token structure

```typescript
// Generated types from custom tokens
export interface CustomTokens {
  color: {
    brand: string;
    // ... other tokens
  };
  // ... other categories
}

// Type-safe access
import { getTokens } from '@cascade/tokens';
const colors = getTokens('color'); // Typed as CustomTokens['color']
```

## Open Questions

1. **Type generation for custom tokens**
   - Should types be generated at build time?
   - How to handle dynamic token loading?
   - Should we support type augmentation?

2. **Token validation**
   - Should we validate token structure?
   - What validation rules should be enforced?
   - How to handle invalid tokens?

3. **Performance**
   - Caching strategy for loaded tokens?
   - How to handle large token sets?
   - Impact on build times?

4. **Multi-provider support**
   - Should we support multiple providers (merge tokens)?
   - How to handle conflicts?
   - Priority/override rules?

## Success Criteria

1. ✅ Users can inject custom token systems without modifying Cascade source
2. ✅ Backward compatibility maintained - existing projects work unchanged
3. ✅ Type safety preserved for custom tokens
4. ✅ Vite plugin supports token injection via configuration
5. ✅ Runtime token switching supported
6. ✅ Documentation and examples provided
7. ✅ Tests cover all provider types and integration points

## Related Work

- [DTCG Specification](https://tr.designtokens.org/format/) - Design Token Community Group format
- [Style Dictionary](https://amzn.github.io/style-dictionary/) - Popular token transformation tool
- [Figma Tokens](https://www.figma.com/community/plugin/888356646278934516/Token-Studio-for-Figma) - Figma token plugin

## Next Steps

1. Review and refine design based on feedback
2. Create ADR for architectural decision
3. Implement Phase 1 (core infrastructure)
4. Test with example custom token systems
5. Iterate based on testing results


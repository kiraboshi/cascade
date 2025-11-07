/**
 * DTCG (Design Tokens Community Group) JSON format parser
 */

export interface DTCGToken {
  $value: string | number | string[];
  $type?: string;
  $description?: string;
}

export interface DTCGTokenTree {
  [key: string]: DTCGToken | DTCGTokenTree;
}

/**
 * Parse DTCG JSON token file
 */
export function parseDTCG(tokens: DTCGTokenTree): DTCGTokenTree {
  return tokens;
}

/**
 * Resolve token aliases in DTCG format
 * Handles references like {color.blue.500}
 */
export function resolveDTCGAliases(
  tokens: DTCGTokenTree,
  visited: Set<string> = new Set()
): DTCGTokenTree {
  const resolved: DTCGTokenTree = {};
  
  for (const [key, value] of Object.entries(tokens)) {
    if (value && typeof value === 'object' && '$value' in value) {
      const token = value as DTCGToken;
      const tokenPath = key;
      
      if (visited.has(tokenPath)) {
        throw new Error(`Circular reference detected in token: ${tokenPath}`);
      }
      
      visited.add(tokenPath);
      
      // Resolve alias if value is a reference
      if (typeof token.$value === 'string' && token.$value.startsWith('{') && token.$value.endsWith('}')) {
        const refPath = token.$value.slice(1, -1).split('.');
        const resolvedValue = resolveTokenReference(tokens, refPath, visited);
        
        resolved[key] = {
          ...token,
          $value: resolvedValue,
        };
      } else {
        resolved[key] = token;
      }
      
      visited.delete(tokenPath);
    } else if (value && typeof value === 'object') {
      // Recursively resolve nested tokens
      resolved[key] = resolveDTCGAliases(value as DTCGTokenTree, visited);
    } else {
      resolved[key] = value;
    }
  }
  
  return resolved;
}

/**
 * Resolve a token reference path
 */
function resolveTokenReference(
  tokens: DTCGTokenTree,
  path: string[],
  visited: Set<string>
): string | number | string[] {
  let current: unknown = tokens;
  
  for (const segment of path) {
    if (current && typeof current === 'object' && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      throw new Error(`Token reference not found: ${path.join('.')}`);
    }
  }
  
  if (current && typeof current === 'object' && '$value' in current) {
    const token = current as DTCGToken;
    const value = token.$value;
    
    // If it's another reference, resolve it recursively
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      const refPath = value.slice(1, -1).split('.');
      return resolveTokenReference(tokens, refPath, visited);
    }
    
    return value;
  }
  
  throw new Error(`Invalid token reference: ${path.join('.')}`);
}

/**
 * Extract all tokens as a flat map
 */
export function flattenDTCGTokens(tokens: DTCGTokenTree, prefix: string = ''): Map<string, DTCGToken> {
  const flat = new Map<string, DTCGToken>();
  
  for (const [key, value] of Object.entries(tokens)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && '$value' in value) {
      flat.set(fullKey, value as DTCGToken);
    } else if (value && typeof value === 'object') {
      const nested = flattenDTCGTokens(value as DTCGTokenTree, fullKey);
      for (const [nestedKey, nestedValue] of nested) {
        flat.set(nestedKey, nestedValue);
      }
    }
  }
  
  return flat;
}



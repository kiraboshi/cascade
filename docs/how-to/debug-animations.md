# How to Debug Animations

This guide explains how to enable debug logging for Cascade Motion animations to help diagnose issues.

## Overview

Cascade Motion includes a comprehensive debug logging system that can be enabled on-demand. By default, all debug logging is **disabled** to keep the console clean. When you need to debug animation issues, you can enable specific categories of logging.

## Debug Categories

The following debug categories are available:

- `motionValue` - Motion value operations (set, animateTo, etc.)
- `animationTimeline` - Animation timeline operations
- `animatePresence` - AnimatePresence operations
- `viewportAnimation` - Viewport animation operations
- `layoutTransition` - Layout transition operations
- `default` - Default/uncategorized logs

## Enabling Debug Logging

### Enable All Categories

```typescript
import { enableDebugLogging } from '@cascade/motion-runtime';

// Enable all debug logging
enableDebugLogging('all');
```

### Enable Specific Categories

```typescript
import { enableDebugLogging } from '@cascade/motion-runtime';

// Enable only motion value logging
enableDebugLogging('motionValue');

// Enable multiple categories
enableDebugLogging(['motionValue', 'animationTimeline']);
```

### Disable Debug Logging

```typescript
import { disableDebugLogging } from '@cascade/motion-runtime';

// Disable all debug logging
disableDebugLogging('all');

// Disable specific categories
disableDebugLogging('motionValue');
```

## Common Debugging Scenarios

### Debugging Motion Value Issues

If animations aren't working as expected, enable motion value logging:

```typescript
import { enableDebugLogging } from '@cascade/motion-runtime';

// In your app initialization or component
enableDebugLogging('motionValue');

// Now you'll see logs for:
// - set() calls with old/new values
// - animateTo() calls with config
// - SpringAnimationTimeline creation and updates
// - Animation state changes
```

**Example Output**:
```
[MotionValue] set() called: { oldValue: 0, newValue: 100, ... }
[MotionValue] animateTo called: { target: 200, animationConfig: {...}, ... }
[MotionValue] SpringAnimationTimeline updateCallback called with: 150
```

### Debugging Animation Timeline Issues

If animations are stuttering or not completing:

```typescript
enableDebugLogging('animationTimeline');
```

### Debugging Viewport Animations

If scroll-triggered animations aren't firing:

```typescript
enableDebugLogging('viewportAnimation');
```

### Debugging AnimatePresence

If exit/enter animations aren't working:

```typescript
enableDebugLogging('animatePresence');
```

## Checking Enabled Categories

You can check which categories are currently enabled:

```typescript
import { getEnabledDebugCategories } from '@cascade/motion-runtime';

const enabled = getEnabledDebugCategories();
console.log('Enabled categories:', enabled);
// Output: ['motionValue', 'animationTimeline']
```

## Best Practices

### 1. Enable Only What You Need

Don't enable all categories unless necessary. Too much logging can make it harder to find the issue:

```typescript
// ❌ Too verbose
enableDebugLogging('all');

// ✅ Focused debugging
enableDebugLogging('motionValue');
```

### 2. Disable After Debugging

Remember to disable debug logging after you've resolved the issue:

```typescript
// After debugging
disableDebugLogging('motionValue');
```

### 3. Use Conditional Enabling

Enable debug logging conditionally based on environment or feature flags:

```typescript
if (process.env.NODE_ENV === 'development' && window.location.search.includes('debug=animations')) {
  enableDebugLogging('motionValue');
}
```

### 4. Use Browser DevTools Filtering

Use browser DevTools console filtering to focus on specific logs:

- Filter by `[MotionValue]` to see only motion value logs
- Filter by `[SpringAnimationTimeline]` to see only timeline logs

## Integration with Dev Tools

### React DevTools

You can create a custom hook to toggle debug logging:

```typescript
import { useState, useEffect } from 'react';
import { enableDebugLogging, disableDebugLogging } from '@cascade/motion-runtime';

function useDebugAnimations(enabled: boolean) {
  useEffect(() => {
    if (enabled) {
      enableDebugLogging('all');
    } else {
      disableDebugLogging('all');
    }
  }, [enabled]);
}

// Usage
function App() {
  const [debugEnabled, setDebugEnabled] = useState(false);
  useDebugAnimations(debugEnabled);
  
  return (
    <button onClick={() => setDebugEnabled(!debugEnabled)}>
      {debugEnabled ? 'Disable' : 'Enable'} Animation Debug
    </button>
  );
}
```

### URL Parameter Toggle

Enable debug logging via URL parameter:

```typescript
// In your app initialization
if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search);
  if (params.get('debug') === 'animations') {
    enableDebugLogging('all');
  }
}
```

Then visit: `http://localhost:3000?debug=animations`

## Production Considerations

- Debug logging is **automatically disabled** in production builds (`process.env.NODE_ENV === 'production'`)
- All debug functions check `NODE_ENV` and return early in production
- No performance impact in production builds
- Debug logging code is tree-shakeable and can be removed by bundlers

## Troubleshooting

### Logs Not Appearing

1. **Check NODE_ENV**: Debug logging only works in development mode
2. **Check Category**: Ensure you've enabled the correct category
3. **Check Console Filter**: Make sure console filters aren't hiding the logs

### Too Many Logs

1. **Disable Unnecessary Categories**: Only enable what you need
2. **Use Console Filtering**: Filter by prefix (e.g., `[MotionValue]`)
3. **Disable After Debugging**: Remember to disable when done

## See Also

- [Troubleshooting Guide](./troubleshooting.md) - Common issues and solutions
- [Performance Optimization](./optimize-performance.md) - Performance debugging tips
- [Motion Values Reference](../reference/motion-values.md) - Motion value API


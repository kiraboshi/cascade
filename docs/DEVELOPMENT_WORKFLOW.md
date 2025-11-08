# Development Workflow: Debugging with Git Submodules

This guide covers using Cascade Motion as a git submodule for active development and debugging within integration projects.

---

## Why Git Submodule for Development?

**Benefits:**
- ✅ **Direct source access** - Edit library code directly in your integration project
- ✅ **Instant feedback** - Changes reflect immediately (no rebuild/publish cycle)
- ✅ **Easy debugging** - Set breakpoints in library source code
- ✅ **Simple upstream flow** - Commit fixes in submodule, push to main repo
- ✅ **No build overhead** - TypeScript uses source directly

**Perfect for:**
- Active development and debugging
- Fixing bugs found during integration
- Experimenting with library changes
- Contributing back to upstream

---

## Setup: Adding Cascade as Submodule

### Step 1: Add Submodule to Your Project

```bash
# In your integration project root
git submodule add <cascade-repo-url> packages/cascade

# Initialize and clone
git submodule update --init --recursive
```

**Example with GitHub:**
```bash
git submodule add https://github.com/your-org/cascade.git packages/cascade
```

### Step 2: Configure pnpm Workspace

Add Cascade packages to your workspace:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'packages/cascade/packages/*'  # Cascade packages
```

### Step 3: Install Dependencies

```bash
# Install all dependencies (including Cascade's)
pnpm install
```

This will:
- Install Cascade's dependencies
- Link Cascade packages via workspace protocol
- Resolve `workspace:*` dependencies automatically

### Step 4: Configure TypeScript for Source Imports

Configure TypeScript to use source files directly (no build required):

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@cascade/motion-runtime": ["./packages/cascade/packages/motion-runtime/src"],
      "@cascade/motion-gestures": ["./packages/cascade/packages/motion-gestures/src"],
      "@cascade/compiler": ["./packages/cascade/packages/compiler/src"],
      "@cascade/core": ["./packages/cascade/packages/core/src"],
      "@cascade/tokens": ["./packages/cascade/packages/tokens/src"],
      "@cascade/react": ["./packages/cascade/packages/react/src"]
    }
  }
}
```

**Alternative: Use project references (better for large projects)**

```json
// tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@cascade/*": ["./packages/cascade/packages/*/src"]
    }
  },
  "references": [
    { "path": "./packages/cascade/packages/motion-runtime" },
    { "path": "./packages/cascade/packages/motion-gestures" },
    { "path": "./packages/cascade/packages/compiler" }
  ]
}
```

### Step 5: Verify Setup

Create a test file to verify imports work:

```typescript
// src/test-imports.ts
import { useMotionValue } from '@cascade/motion-runtime';
import { useDrag } from '@cascade/motion-gestures';

// If this compiles, you're good!
```

---

## Development Workflow

### Scenario: Debugging a Bug in Integration

#### 1. Discover Issue

While working in your integration project, you encounter a bug:

```typescript
// src/MyComponent.tsx
import { useMotionValue } from '@cascade/motion-runtime';

function MyComponent() {
  const x = useMotionValue(0);
  // Bug: x.animateTo() not working as expected
  x.animateTo(100); // Expected to animate, but doesn't
}
```

#### 2. Navigate to Library Source

Open the library source file directly:

```bash
# Open the source file
code packages/cascade/packages/motion-runtime/src/motion-value.ts
```

Or in VS Code:
- `Cmd/Ctrl + P` → type `motion-value.ts`
- Navigate directly to `packages/cascade/packages/motion-runtime/src/motion-value.ts`

#### 3. Set Breakpoints

Set breakpoints directly in library source:

```typescript
// packages/cascade/packages/motion-runtime/src/motion-value.ts
export function createMotionValue(initialValue: number) {
  // Set breakpoint here ↓
  const value = new MotionValueImpl(initialValue);
  return value;
}
```

#### 4. Debug in Integration Project

Run your integration project with debugging:

```bash
# Start dev server
pnpm dev

# Or attach debugger in VS Code
# F5 → "Node.js" or "Chrome" debugger
```

When breakpoint hits:
- ✅ See library source code
- ✅ Inspect variables
- ✅ Step through library code
- ✅ See call stack from integration → library

#### 5. Make Fix

Edit library source directly:

```typescript
// packages/cascade/packages/motion-runtime/src/motion-value.ts
export function createMotionValue(initialValue: number) {
  // Your fix here
  const value = new MotionValueImpl(initialValue);
  value.initialize(); // Added missing initialization
  return value;
}
```

**Changes reflect immediately** - No rebuild needed! TypeScript compiler picks up changes.

#### 6. Test Fix

Test in your integration project:

```typescript
// src/MyComponent.tsx
function MyComponent() {
  const x = useMotionValue(0);
  x.animateTo(100); // Now works! ✅
}
```

#### 7. Commit Fix in Submodule

Commit the fix in the submodule:

```bash
# Navigate to submodule
cd packages/cascade

# Check status
git status

# Stage changes
git add packages/motion-runtime/src/motion-value.ts

# Commit
git commit -m "fix: initialize motion value on creation"

# Check status in parent repo
cd ../..
git status
# Should show: modified: packages/cascade (new commits)
```

#### 8. Push to Upstream

Push fix to main Cascade repository:

```bash
# Still in submodule directory
cd packages/cascade

# Push to upstream
git push origin main

# Or if working on a branch
git push origin feature/fix-motion-value-init
```

#### 9. Update Parent Repo Reference

Update parent repo to point to new commit:

```bash
# Back in parent repo
cd ..

# Stage submodule update
git add packages/cascade

# Commit
git commit -m "chore: update cascade submodule with motion value fix"
```

---

## Common Workflows

### Workflow 1: Quick Bug Fix

```bash
# 1. Make fix in submodule
cd packages/cascade
# Edit files...
git add .
git commit -m "fix: description"
git push origin main

# 2. Update parent reference
cd ..
git add packages/cascade
git commit -m "chore: update cascade"
```

### Workflow 2: Feature Branch Development

```bash
# 1. Create branch in submodule
cd packages/cascade
git checkout -b feature/new-feature

# 2. Make changes
# Edit files...

# 3. Commit and push branch
git add .
git commit -m "feat: new feature"
git push origin feature/new-feature

# 4. Update parent to track branch
cd ..
git add packages/cascade
git commit -m "chore: update cascade to feature branch"
```

**Note:** Parent repo tracks specific commit, not branch. Update parent when you want to move forward.

### Workflow 3: Testing Upstream Changes

```bash
# 1. Pull latest from upstream
cd packages/cascade
git pull origin main

# 2. Test in integration project
cd ../..
pnpm dev
# Test changes...

# 3. Update parent if changes are good
git add packages/cascade
git commit -m "chore: update cascade to latest"
```

### Workflow 4: Making Local-Only Changes

```bash
# Make changes in submodule (don't commit yet)
cd packages/cascade
# Edit files...

# Test in integration
cd ../..
pnpm dev

# If good, commit in submodule
cd packages/cascade
git add .
git commit -m "fix: local change"
# Don't push yet - keep local

# Update parent
cd ..
git add packages/cascade
git commit -m "chore: local cascade changes"
```

---

## VS Code Configuration

### Recommended Settings

Create `.vscode/settings.json` in your integration project:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  }
}
```

### Multi-Root Workspace (Advanced)

For better IntelliSense, create a multi-root workspace:

```json
// cascade-dev.code-workspace
{
  "folders": [
    {
      "path": ".",
      "name": "Integration Project"
    },
    {
      "path": "./packages/cascade",
      "name": "Cascade Library"
    }
  ],
  "settings": {
    "typescript.preferences.importModuleSpecifier": "relative"
  }
}
```

Open workspace: `code cascade-dev.code-workspace`

---

## Troubleshooting

### Issue: TypeScript Can't Find Module

**Symptoms:** `Cannot find module '@cascade/motion-runtime'`

**Solutions:**

1. **Check path mapping:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@cascade/motion-runtime": ["./packages/cascade/packages/motion-runtime/src"]
    }
  }
}
```

2. **Restart TypeScript server:**
   - VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

3. **Check workspace config:**
```bash
# Verify submodule is initialized
git submodule status
```

### Issue: Changes Not Reflecting

**Symptoms:** Edited library code but changes don't appear

**Solutions:**

1. **Restart dev server:**
```bash
# Stop and restart
pnpm dev
```

2. **Clear TypeScript cache:**
```bash
rm -rf node_modules/.cache
# Or in VS Code: Restart TS Server
```

3. **Check import path:**
   - Ensure importing from source, not dist
   - Verify `tsconfig.json` paths point to `src/`

### Issue: Workspace Dependencies Not Resolved

**Symptoms:** `workspace:*` dependencies fail

**Solutions:**

1. **Verify workspace config:**
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'packages/cascade/packages/*'
```

2. **Reinstall:**
```bash
rm -rf node_modules
pnpm install
```

### Issue: Submodule Out of Sync

**Symptoms:** Submodule shows as modified but no changes

**Solutions:**

```bash
# Update submodule to latest
cd packages/cascade
git pull origin main
cd ../..

# Or reset to specific commit
cd packages/cascade
git checkout <commit-hash>
cd ../..
git add packages/cascade
git commit -m "chore: update cascade"
```

---

## Best Practices

### 1. Keep Submodule on Main Branch

```bash
cd packages/cascade
git checkout main
git pull origin main
```

### 2. Commit Frequently

- Commit fixes in submodule as you make them
- Update parent repo periodically (not every commit)

### 3. Use Feature Branches for Big Changes

```bash
cd packages/cascade
git checkout -b feature/my-feature
# Make changes...
git push origin feature/my-feature
```

### 4. Test Before Pushing

- Test fixes in integration project first
- Run Cascade tests: `cd packages/cascade && pnpm test`

### 5. Document Changes

- Write clear commit messages
- Reference issues/PRs if applicable

---

## Comparison: Submodule vs npm for Development

| Aspect | Git Submodule | npm Package |
|--------|--------------|-------------|
| **Edit Source** | ✅ Direct edit | ❌ Edit node_modules (bad) |
| **Debugging** | ✅ Breakpoints in source | ⚠️ Source maps (if available) |
| **Feedback Loop** | ✅ Instant (no build) | ❌ Build → Publish → Install |
| **Upstream Push** | ✅ Simple git push | ❌ Version → Publish → Update |
| **Setup** | ⚠️ One-time config | ✅ Just install |
| **CI/CD** | ⚠️ Need submodule setup | ✅ Standard npm install |

**For active development:** Git submodule wins ✅

---

## Quick Reference Commands

```bash
# Add submodule
git submodule add <repo-url> packages/cascade

# Initialize
git submodule update --init --recursive

# Update submodule
cd packages/cascade && git pull origin main && cd ../..

# Make fix in submodule
cd packages/cascade
# Edit files...
git add . && git commit -m "fix: description" && git push origin main

# Update parent reference
cd .. && git add packages/cascade && git commit -m "chore: update cascade"

# Clone project with submodule
git clone --recurse-submodules <repo-url>

# Check submodule status
git submodule status
```

---

## Example: Complete Debug Session

```bash
# 1. Start integration project
pnpm dev

# 2. Discover bug - open library source
code packages/cascade/packages/motion-runtime/src/motion-value.ts

# 3. Set breakpoint, debug, find issue

# 4. Make fix
# Edit motion-value.ts

# 5. Test immediately (no rebuild!)
# Refresh browser, test again

# 6. Commit fix
cd packages/cascade
git add packages/motion-runtime/src/motion-value.ts
git commit -m "fix: motion value initialization"
git push origin main

# 7. Update parent
cd ../..
git add packages/cascade
git commit -m "chore: update cascade with fix"

# Done! Fix is upstream and tested ✅
```

---

This workflow gives you the best of both worlds: easy debugging and simple upstream contribution! 🚀

---

## Quick Reference

### Setup (One-Time)

```bash
# Add submodule
git submodule add <repo-url> packages/cascade
git submodule update --init --recursive

# Or use setup script
./scripts/setup-submodule.sh <repo-url>
```

**Configure workspace:**
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'packages/cascade/packages/*'
```

**Configure TypeScript:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@cascade/motion-runtime": ["./packages/cascade/packages/motion-runtime/src"],
      "@cascade/motion-gestures": ["./packages/cascade/packages/motion-gestures/src"]
    }
  }
}
```

### Daily Workflow

**1. Make Fix in Library:**
```bash
# Edit library source directly
code packages/cascade/packages/motion-runtime/src/motion-value.ts
# Changes reflect immediately - no rebuild needed!
```

**2. Test in Integration:**
```bash
# Run your integration project
pnpm dev
# Test the fix - refresh browser, changes are live!
```

**3. Commit & Push Upstream:**
```bash
# Commit in submodule
cd packages/cascade
git add .
git commit -m "fix: description"
git push origin main

# Update parent reference
cd ../..
git add packages/cascade
git commit -m "chore: update cascade"
```

### Common Commands

```bash
# Update submodule to latest
cd packages/cascade && git pull origin main && cd ../..

# Check submodule status
git submodule status

# Clone project with submodule
git clone --recurse-submodules <repo-url>

# Make fix and push upstream
cd packages/cascade
git add . && git commit -m "fix: description" && git push origin main
cd ../.. && git add packages/cascade && git commit -m "chore: update"
```

### Troubleshooting

**TypeScript can't find module:**
- Check `tsconfig.json` paths
- Restart TS Server: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

**Changes not reflecting:**
- Restart dev server
- Clear cache: `rm -rf node_modules/.cache`

**Workspace deps not resolved:**
- Verify `pnpm-workspace.yaml` includes cascade packages
- Run `pnpm install`


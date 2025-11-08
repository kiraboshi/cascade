# Integration Strategies: Publishing & Git Submodule Usage

This document covers strategies for integrating Cascade Motion into other applications, including npm publishing and git submodule usage.

---

## Overview

Cascade Motion is structured as a **pnpm workspace monorepo** with multiple packages. You have two main integration options:

1. **Publish to npm** - Distribute as published packages (recommended for public/shared use)
2. **Git submodule** - Use source directly from repository (recommended for internal/private use)

---

## Option 1: Publishing to npm

### Current Package Structure

The monorepo contains the following publishable packages:

- `@cascade/tokens` - Design tokens (DTCG JSON + TypeScript)
- `@cascade/core` - Foundation CSS with @layer architecture
- `@cascade/compiler` - Token resolver, StyleX integration, motion compiler
- `@cascade/motion-runtime` - Runtime orchestrator for animation sequences
- `@cascade/motion-gestures` - Gesture-driven animations
- `@cascade/react` - Layout primitives (Stack, Cluster, Frame)

### Prerequisites for Publishing

1. **npm account** with access to publish `@cascade/*` scoped packages
2. **Build outputs** - All packages must be built before publishing
3. **Workspace dependencies** - Internal dependencies need to be resolved

### Current Package Configuration

All packages are already configured for publishing:

```json
{
  "name": "@cascade/motion-runtime",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"]
}
```

**Key Configuration Points:**
- ✅ Proper `main`, `module`, and `types` fields
- ✅ Modern `exports` field for ESM/CJS support
- ✅ `files` field specifies only `dist` (excludes source)
- ✅ Peer dependencies correctly specified
- ⚠️ **Issue**: Internal dependencies use `workspace:*` which must be resolved before publishing

### Publishing Workflow

#### Step 1: Resolve Workspace Dependencies

Before publishing, you need to replace `workspace:*` dependencies with actual versions. You have two options:

**Option A: Use pnpm publish (Recommended)**

pnpm can automatically resolve workspace dependencies during publish:

```bash
# Build all packages first
pnpm build

# Publish a specific package (pnpm resolves workspace:* automatically)
cd packages/motion-runtime
pnpm publish --access public

# Or publish all packages from root
pnpm -r --filter './packages/*' publish --access public
```

**Option B: Manual Resolution Script**

Create a script to replace `workspace:*` with actual versions before publishing:

```bash
# scripts/prepare-publish.sh
#!/bin/bash
# Replace workspace:* with actual versions in package.json files
# This would need to read versions from each package and update dependencies
```

#### Step 2: Build All Packages

```bash
# Build all packages
pnpm build

# Verify dist folders exist
ls packages/*/dist
```

#### Step 3: Publish Packages

**Publish Individual Package:**

```bash
cd packages/motion-runtime
pnpm publish --access public --no-git-checks
```

**Publish All Packages (with dependency order):**

```bash
# Publish in dependency order
pnpm publish --filter @cascade/tokens --access public
pnpm publish --filter @cascade/core --access public
pnpm publish --filter @cascade/compiler --access public
pnpm publish --filter @cascade/motion-runtime --access public
pnpm publish --filter @cascade/motion-gestures --access public
pnpm publish --filter @cascade/react --access public
```

#### Step 4: Verify Published Packages

```bash
# Check published package
npm view @cascade/motion-runtime

# Install and test
npm install @cascade/motion-runtime @cascade/motion-gestures
```

### Publishing Considerations

#### 1. Version Management

**Current State:** All packages are at `0.1.0`

**Recommendation:** Use semantic versioning and consider:
- **Independent versioning** - Each package versions independently
- **Synchronized versioning** - All packages share the same version (simpler for monorepo)

**Example synchronized versioning script:**

```json
// package.json
{
  "scripts": {
    "version": "pnpm -r exec pnpm version --no-git-tag-version",
    "publish:all": "pnpm -r --filter './packages/*' publish --access public"
  }
}
```

#### 2. Workspace Dependency Resolution

**Problem:** Packages use `workspace:*` for internal dependencies

**Solutions:**

1. **pnpm publish** - Automatically resolves `workspace:*` to published versions
2. **Manual replacement** - Script to replace before publishing
3. **Publish order** - Publish dependencies first, then dependents

#### 3. Build Artifacts

**Current:** TypeScript compiles to `dist/` with:
- `dist/index.js` (CommonJS)
- `dist/index.mjs` (ESM)
- `dist/index.d.ts` (TypeScript types)

**Verification:**
```bash
# Check dist contents
ls -la packages/motion-runtime/dist/
```

#### 4. Package Files Inclusion

**Current:** `"files": ["dist"]` - Only includes dist folder

**Considerations:**
- ✅ Source files excluded (smaller package)
- ✅ Type definitions included (`.d.ts` files)
- ⚠️ Some packages may need additional files (e.g., `@cascade/core` needs CSS)

**Check each package:**
```bash
# See what would be published
cd packages/motion-runtime
pnpm pack --dry-run
```

#### 5. Peer Dependencies

**Current:** React is a peer dependency

**Usage:** Consumers must install React separately:

```json
{
  "dependencies": {
    "@cascade/motion-runtime": "^0.1.0",
    "react": "^18.0.0"
  }
}
```

### Recommended Publishing Setup

#### 1. Add Publishing Scripts

Add to root `package.json`:

```json
{
  "scripts": {
    "build": "pnpm -r --filter './packages/*' build",
    "publish:check": "pnpm -r --filter './packages/*' exec pnpm publish --dry-run",
    "publish:all": "pnpm build && pnpm -r --filter './packages/*' publish --access public",
    "version:patch": "pnpm -r --filter './packages/*' version patch --no-git-tag-version",
    "version:minor": "pnpm -r --filter './packages/*' version minor --no-git-tag-version",
    "version:major": "pnpm -r --filter './packages/*' version major --no-git-tag-version"
  }
}
```

#### 2. Create `.npmrc` (Optional)

```ini
# .npmrc
access=public
```

#### 3. Add `.npmignore` Files (If Needed)

Most packages don't need this since `files` field is used, but you can add to root:

```
# .npmignore (root)
node_modules/
dist/
*.tsbuildinfo
.git/
.vscode/
.idea/
```

#### 4. CI/CD Publishing Workflow

Example GitHub Actions workflow:

```yaml
# .github/workflows/publish.yml
name: Publish

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 10.14.0
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm -r --filter './packages/*' publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Option 2: Git Submodule Usage

### Overview

Using Cascade Motion as a git submodule allows you to:
- ✅ Use source code directly (no build step required if using TypeScript)
- ✅ Make local modifications easily
- ✅ Stay in sync with upstream changes
- ✅ Avoid npm publishing overhead
- ✅ **Debug library code directly** - Set breakpoints, edit source, test immediately
- ✅ **Easy upstream contribution** - Commit fixes in submodule, push to main repo

**Perfect for active development and debugging!** See [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) for detailed debugging workflow.

### Prerequisites

1. **Git repository** with Cascade Motion as a submodule
2. **pnpm workspace** support (or manual dependency linking)
3. **TypeScript** support in consuming project

### Setup Steps

#### Step 1: Add Submodule

```bash
# In your consuming project
git submodule add <cascade-repo-url> packages/cascade
# Or if using SSH:
git submodule add git@github.com:your-org/cascade.git packages/cascade
```

#### Step 2: Initialize Submodule

```bash
# Clone submodule
git submodule update --init --recursive

# Or if already added, just init
git submodule init
git submodule update
```

#### Step 3: Configure Workspace

**Option A: Add to Existing pnpm Workspace**

If your project uses pnpm workspaces, add to `pnpm-workspace.yaml`:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'packages/cascade/packages/*'  # Cascade packages
```

**Option B: Link Packages Manually**

If not using workspaces, link packages:

```bash
# Install Cascade dependencies
cd packages/cascade
pnpm install

# Build Cascade packages
pnpm build

# Link packages (from Cascade root)
cd packages/motion-runtime
pnpm link

# Use in your project
cd ../../../
pnpm link @cascade/motion-runtime
```

**Option C: Use Path References**

In your `package.json`:

```json
{
  "dependencies": {
    "@cascade/motion-runtime": "file:./packages/cascade/packages/motion-runtime",
    "@cascade/motion-gestures": "file:./packages/cascade/packages/motion-gestures"
  }
}
```

#### Step 4: Install Dependencies

```bash
# Install all dependencies (including Cascade)
pnpm install
```

#### Step 5: Configure TypeScript

**Option A: Project References (Recommended)**

In your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "paths": {
      "@cascade/motion-runtime": ["./packages/cascade/packages/motion-runtime/src"],
      "@cascade/motion-gestures": ["./packages/cascade/packages/motion-gestures/src"]
    }
  },
  "references": [
    { "path": "./packages/cascade/packages/motion-runtime" },
    { "path": "./packages/cascade/packages/motion-gestures" }
  ]
}
```

**Option B: Path Mapping Only**

```json
{
  "compilerOptions": {
    "paths": {
      "@cascade/*": ["./packages/cascade/packages/*/src"]
    }
  }
}
```

### Usage Examples

#### With pnpm Workspace

```typescript
// In your app
import { useMotionValue } from '@cascade/motion-runtime';
import { useDrag } from '@cascade/motion-gestures';

function MyComponent() {
  const x = useMotionValue(0);
  const dragRef = useDrag({ x });
  // ...
}
```

#### With Path References

```typescript
// TypeScript resolves via path mapping
import { useMotionValue } from '@cascade/motion-runtime';
```

### Submodule Maintenance

#### Updating Submodule

```bash
# Update to latest from upstream
cd packages/cascade
git fetch origin
git checkout main  # or specific branch/tag
git pull origin main

# Return to your project
cd ../..
git add packages/cascade
git commit -m "Update cascade submodule"
```

#### Making Local Changes

```bash
# Make changes in submodule
cd packages/cascade
# Edit files...

# Commit in submodule
git add .
git commit -m "Local changes"

# Update parent repo reference
cd ../..
git add packages/cascade
git commit -m "Update submodule with local changes"
```

**Note:** Local changes in submodule won't be pushed to upstream unless you have write access.

#### Cloning Project with Submodule

```bash
# Clone with submodules
git clone --recurse-submodules <your-repo-url>

# Or if already cloned
git submodule update --init --recursive
```

### Submodule Considerations

#### 1. Build Requirements

**Option A: Use Built Packages**
- Build Cascade packages: `cd packages/cascade && pnpm build`
- Use dist outputs: `import from '@cascade/motion-runtime/dist'`

**Option B: Use Source Directly (Recommended)**
- Configure TypeScript path mapping
- Use source imports: `import from '@cascade/motion-runtime'`
- TypeScript compiler handles transpilation

#### 2. Dependency Management

**Workspace Dependencies:** Cascade packages use `workspace:*` for internal deps

**Solution:** Include Cascade packages in your workspace:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'packages/cascade/packages/*'
```

#### 3. Version Control

**Submodule Points to Specific Commit:**
- Parent repo tracks specific submodule commit
- Updates require explicit submodule update
- Prevents unexpected breaking changes

**Best Practice:** Pin to specific tags/branches:

```bash
cd packages/cascade
git checkout v0.1.0  # or specific tag
```

#### 4. CI/CD with Submodules

```yaml
# .github/workflows/ci.yml
- uses: actions/checkout@v3
  with:
    submodules: recursive  # Checkout submodules
```

---

## Comparison: npm vs Git Submodule

| Aspect | npm Publishing | Git Submodule |
|--------|---------------|---------------|
| **Setup Complexity** | Medium (build + publish) | Low (add submodule) |
| **Distribution** | Public/Private registry | Git repository access |
| **Versioning** | Semantic versioning | Git commits/tags |
| **Updates** | `npm update` | `git submodule update` |
| **Local Changes** | Publish new version | Direct file edits |
| **Build Artifacts** | Required (dist/) | Optional (can use source) |
| **Dependency Resolution** | Automatic | Manual workspace config |
| **CI/CD** | Standard npm publish | Git checkout with submodules |
| **Best For** | Public packages, distribution | Internal/private, development |

---

## Recommended Approach

### For Public Distribution
✅ **Use npm publishing**
- Easier for consumers
- Standard package management
- Versioning and changelog support

### For Internal/Private Use
✅ **Use git submodule**
- Direct source access
- Easy local modifications
- No publishing overhead

### Hybrid Approach
✅ **Both**
- Publish stable releases to npm
- Use submodule for development/testing
- Switch between based on needs

---

## Troubleshooting

### npm Publishing Issues

**Problem:** `workspace:*` dependencies not resolved

**Solution:**
```bash
# pnpm automatically resolves workspace:* during publish
pnpm publish --access public
```

**Problem:** Build fails before publishing

**Solution:**
```bash
# Build first
pnpm build
# Then publish
pnpm publish
```

### Git Submodule Issues

**Problem:** Submodule not initialized

**Solution:**
```bash
git submodule update --init --recursive
```

**Problem:** TypeScript can't resolve imports

**Solution:**
- Add path mapping to `tsconfig.json`
- Or use workspace configuration
- Or use `pnpm link`

**Problem:** Workspace dependencies not resolved

**Solution:**
- Include Cascade packages in `pnpm-workspace.yaml`
- Or use `pnpm link` for each package
- Or use path references in `package.json`

---

## Next Steps

1. **Choose integration method** based on your use case
2. **Set up publishing** (if using npm) or **configure submodule** (if using git)
3. **Test integration** in a sample project
4. **Document** your specific setup for your team

---

## Additional Resources

- [pnpm Workspaces Documentation](https://pnpm.io/workspaces)
- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)


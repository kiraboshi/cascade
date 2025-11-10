# GitHub Pages Deployment Guide

This guide explains how to deploy the Cascade demo app to GitHub Pages.

## Prerequisites

- A GitHub repository
- GitHub Pages enabled in your repository settings
- Push access to the repository

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
4. Save the settings

### 2. Configure Base Path (if needed)

The deployment workflow automatically sets the base path based on your repository name. 

**For root deployment** (if your repo is named `username.github.io`):
- The workflow uses `/` as the base path
- Your app will be available at `https://username.github.io/`

**For subdirectory deployment** (if your repo has a different name):
- The workflow uses `/${{ github.event.repository.name }}/` as the base path
- Your app will be available at `https://username.github.io/repo-name/`

To manually override the base path, edit `.github/workflows/deploy-pages.yml` and change the `VITE_BASE_PATH` environment variable:

```yaml
VITE_BASE_PATH: /your-custom-path/
```

### 3. Deploy

The app will automatically deploy when you:

- Push to the `main` or `master` branch
- Manually trigger the workflow from the **Actions** tab

## Local Testing

To test the build locally before deploying:

```bash
# Build with default base path (/)
cd apps/demo
pnpm build

# Or build with custom base path
VITE_BASE_PATH=/repo-name/ pnpm build

# Preview the build
pnpm preview
```

## Manual Deployment

If you prefer to deploy manually:

1. Build the app:
   ```bash
   cd apps/demo
   pnpm build
   ```

2. Commit and push the `dist` folder to the `gh-pages` branch, or use the GitHub CLI:
   ```bash
   gh pages deploy apps/demo/dist --branch gh-pages
   ```

## Troubleshooting

### Assets not loading correctly

- Check that the `base` path in `vite.config.ts` matches your GitHub Pages URL structure
- Ensure all asset paths are relative (Vite handles this automatically)

### Build fails in GitHub Actions

- Check that all dependencies are listed in `package.json`
- Verify that the workspace packages build successfully (`pnpm build` at root)
- Review the Actions logs for specific error messages

### 404 errors on routes

- If using React Router, ensure you're using `HashRouter` for GitHub Pages, or configure your router with the correct base path
- GitHub Pages doesn't support client-side routing without a server configuration

## Workflow Details

The deployment workflow (`.github/workflows/deploy-pages.yml`) does the following:

1. Checks out the repository
2. Sets up pnpm and Node.js
3. Installs dependencies
4. Builds all workspace packages
5. Builds the demo app with the correct base path
6. Deploys to GitHub Pages

The entire process takes about 2-3 minutes and runs automatically on every push to main/master.


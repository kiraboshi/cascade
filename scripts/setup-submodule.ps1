# Quick setup script for adding Cascade as git submodule
# Usage: .\scripts\setup-submodule.ps1 [repo-url]

param(
    [string]$RepoUrl = "https://github.com/your-org/cascade.git"
)

$ErrorActionPreference = "Stop"
$SubmodulePath = "packages/cascade"

function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Success "Setting up Cascade as git submodule..."

# Check if already exists
if (Test-Path $SubmodulePath) {
    Write-Warning "Warning: $SubmodulePath already exists"
    $response = Read-Host "Remove and re-add? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        git submodule deinit -f $SubmodulePath
        git rm -f $SubmodulePath
        Remove-Item -Recurse -Force ".git/modules/$SubmodulePath" -ErrorAction SilentlyContinue
    } else {
        Write-Warning "Aborted"
        exit 0
    }
}

# Add submodule
Write-Success "Adding submodule..."
git submodule add $RepoUrl $SubmodulePath

# Initialize
Write-Success "Initializing submodule..."
git submodule update --init --recursive

# Check if pnpm-workspace.yaml exists
if (Test-Path "pnpm-workspace.yaml") {
    Write-Success "Updating pnpm-workspace.yaml..."
    
    $workspaceContent = Get-Content "pnpm-workspace.yaml" -Raw
    
    if ($workspaceContent -notmatch "packages/cascade/packages/\*") {
        # Add cascade packages to workspace
        if ($workspaceContent -match "packages:") {
            # Append to existing packages list
            $newContent = $workspaceContent -replace "(packages:)", "`$1`n  - 'packages/cascade/packages/*'"
            Set-Content "pnpm-workspace.yaml" -Value $newContent
        } else {
            # Create new workspace file
            @"
packages:
  - 'packages/*'
  - 'packages/cascade/packages/*'
"@ | Set-Content "pnpm-workspace.yaml"
        }
        Write-Success "✓ Added cascade packages to workspace"
    } else {
        Write-Warning "✓ Cascade already in workspace"
    }
} else {
    Write-Warning "No pnpm-workspace.yaml found. Creating..."
    @"
packages:
  - 'packages/*'
  - 'packages/cascade/packages/*'
"@ | Set-Content "pnpm-workspace.yaml"
}

# Check if tsconfig.json exists
if (Test-Path "tsconfig.json") {
    Write-Success "Checking tsconfig.json..."
    Write-Warning "Note: You may need to add path mappings manually:"
    Write-Host ""
    Write-Host '  "compilerOptions": {'
    Write-Host '    "baseUrl": ".",'
    Write-Host '    "paths": {'
    Write-Host '      "@cascade/motion-runtime": ["./packages/cascade/packages/motion-runtime/src"],'
    Write-Host '      "@cascade/motion-gestures": ["./packages/cascade/packages/motion-gestures/src"]'
    Write-Host '    }'
    Write-Host '  }'
    Write-Host ""
} else {
    Write-Warning "No tsconfig.json found. You'll need to create one with path mappings."
}

# Install dependencies
Write-Success "Installing dependencies..."
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm install
} else {
    Write-Warning "pnpm not found. Install dependencies manually: pnpm install"
}

Write-Host ""
Write-Success "✓ Setup complete!"
Write-Host ""
Write-Success "Next steps:"
Write-Host "1. Add TypeScript path mappings to tsconfig.json (see above)"
Write-Host "2. Start developing: pnpm dev"
Write-Host "3. See docs/DEVELOPMENT_WORKFLOW.md for debugging workflow"
Write-Host ""


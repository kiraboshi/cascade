# Publish Cascade packages to npm
# Usage: .\scripts\publish-packages.ps1 [package-name]

param(
    [string]$PackageName = ""
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Check if pnpm is installed
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Error "Error: pnpm is not installed"
    exit 1
}

# Check if logged into npm
try {
    pnpm whoami | Out-Null
} catch {
    Write-Warning "Warning: Not logged into npm. Run 'pnpm login' first"
    exit 1
}

# Build all packages first
Write-Success "Building all packages..."
pnpm build

# Check if specific package was provided
if ($PackageName) {
    Write-Success "Publishing $PackageName..."
    
    # Check if package exists
    if (-not (Test-Path "packages\$PackageName")) {
        Write-Error "Error: Package '$PackageName' not found"
        exit 1
    }
    
    Push-Location "packages\$PackageName"
    try {
        pnpm publish --access public
        Write-Success "Successfully published $PackageName"
    } finally {
        Pop-Location
    }
} else {
    # Publish all packages in dependency order
    Write-Success "Publishing all packages..."
    
    $Packages = @(
        "@cascade/tokens",
        "@cascade/core",
        "@cascade/compiler",
        "@cascade/motion-runtime",
        "@cascade/motion-gestures",
        "@cascade/react"
    )
    
    foreach ($Package in $Packages) {
        $PackageDir = $Package -replace '@cascade/', ''
        Write-Success "Publishing $Package..."
        
        if (Test-Path "packages\$PackageDir") {
            Push-Location "packages\$PackageDir"
            try {
                pnpm publish --access public
                Write-Success "✓ Published $Package"
            } finally {
                Pop-Location
            }
        } else {
            Write-Warning "⚠ Package $PackageDir not found, skipping"
        }
    }
    
    Write-Success "All packages published successfully!"
}


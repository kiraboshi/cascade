#!/usr/bin/env pwsh
# Clean TypeScript compilation artifacts (.js, .d.ts, .map files)
# that have corresponding .ts or .tsx source files

param(
    [switch]$DryRun,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Clean TypeScript compilation artifacts

Usage:
    .\clean-typescript-artifacts.ps1          # Delete artifacts
    .\clean-typescript-artifacts.ps1 -DryRun   # Preview what would be deleted

This script removes .js, .d.ts, and .map files that are TypeScript
compilation artifacts (files with corresponding .ts or .tsx sources).

Excludes:
    - node_modules/
    - dist/
    - .git/
"@
    exit 0
}

$ErrorActionPreference = "Stop"
$deletedCount = 0
$rootPath = (Get-Location).Path

# Function to check if path should be excluded
function Should-ExcludePath {
    param([string]$Path)
    # Normalize path separators and make case-insensitive
    $normalizedPath = $Path.Replace('\', '/').ToLower()
    
    # Check if path contains excluded directories anywhere in the path
    # After normalization, all separators are forward slashes
    if ($normalizedPath.Contains('/node_modules/')) { return $true }
    if ($normalizedPath.Contains('/dist/')) { return $true }
    if ($normalizedPath.Contains('/.git/')) { return $true }
    
    return $false
}

# Get all .js, .d.ts, and .map files, excluding node_modules and dist
$artifactFiles = Get-ChildItem -Path . -Recurse -Include *.js,*.d.ts,*.map -File | 
    Where-Object {
        -not (Should-ExcludePath -Path $_.FullName)
    }

foreach ($file in $artifactFiles) {
    $shouldDelete = $false
    $reason = ""
    
    $directory = $file.DirectoryName
    $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $extension = $file.Extension
    
    # Check if there's a corresponding .ts or .tsx file
    $tsFile = Join-Path $directory "$nameWithoutExt.ts"
    $tsxFile = Join-Path $directory "$nameWithoutExt.tsx"
    
    if ((Test-Path $tsFile) -or (Test-Path $tsxFile)) {
        $shouldDelete = $true
        $reason = "has corresponding .ts/.tsx source"
    }
    # Also delete .map files if they're source maps (they'll be regenerated)
    elseif ($extension -eq ".map") {
        $shouldDelete = $true
        $reason = "is a source map file"
    }
    
    if ($shouldDelete) {
        $relativePath = $file.FullName.Replace($rootPath, "").TrimStart('\', '/').Replace('\', '/')
        
        if (-not $DryRun) {
            Remove-Item -Path $file.FullName -Force
            Write-Host "Deleted: $relativePath" -ForegroundColor Green
        } else {
            Write-Host "Would delete: $relativePath ($reason)" -ForegroundColor Yellow
        }
        $deletedCount++
    }
}

if ($DryRun) {
    Write-Host "`nDry run complete. Would delete $deletedCount file(s)." -ForegroundColor Cyan
    Write-Host "Run without -DryRun to actually delete these files." -ForegroundColor Cyan
} else {
    Write-Host "`nCleanup complete. Deleted $deletedCount file(s)." -ForegroundColor Green
}

if ($deletedCount -eq 0) {
    Write-Host "No TypeScript compilation artifacts found." -ForegroundColor Cyan
}


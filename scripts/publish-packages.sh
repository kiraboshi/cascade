#!/bin/bash
# Publish Cascade packages to npm
# Usage: ./scripts/publish-packages.sh [package-name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}Error: pnpm is not installed${NC}"
    exit 1
fi

# Check if logged into npm
if ! pnpm whoami &> /dev/null; then
    echo -e "${YELLOW}Warning: Not logged into npm. Run 'pnpm login' first${NC}"
    exit 1
fi

# Build all packages first
echo -e "${GREEN}Building all packages...${NC}"
pnpm build

# Check if specific package was provided
if [ -n "$1" ]; then
    PACKAGE_NAME="$1"
    echo -e "${GREEN}Publishing ${PACKAGE_NAME}...${NC}"
    
    # Check if package exists
    if [ ! -d "packages/${PACKAGE_NAME}" ]; then
        echo -e "${RED}Error: Package '${PACKAGE_NAME}' not found${NC}"
        exit 1
    fi
    
    cd "packages/${PACKAGE_NAME}"
    pnpm publish --access public
    cd ../..
    
    echo -e "${GREEN}Successfully published ${PACKAGE_NAME}${NC}"
else
    # Publish all packages in dependency order
    echo -e "${GREEN}Publishing all packages...${NC}"
    
    PACKAGES=(
        "@cascade/tokens"
        "@cascade/core"
        "@cascade/compiler"
        "@cascade/motion-runtime"
        "@cascade/motion-gestures"
        "@cascade/react"
    )
    
    for PACKAGE in "${PACKAGES[@]}"; do
        PACKAGE_DIR=$(echo "$PACKAGE" | sed 's/@cascade\///')
        echo -e "${GREEN}Publishing ${PACKAGE}...${NC}"
        
        if [ -d "packages/${PACKAGE_DIR}" ]; then
            cd "packages/${PACKAGE_DIR}"
            pnpm publish --access public
            cd ../..
            echo -e "${GREEN}✓ Published ${PACKAGE}${NC}"
        else
            echo -e "${YELLOW}⚠ Package ${PACKAGE_DIR} not found, skipping${NC}"
        fi
    done
    
    echo -e "${GREEN}All packages published successfully!${NC}"
fi


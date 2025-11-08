#!/bin/bash
# Quick setup script for adding Cascade as git submodule
# Usage: ./scripts/setup-submodule.sh [repo-url]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

REPO_URL="${1:-https://github.com/your-org/cascade.git}"
SUBMODULE_PATH="packages/cascade"

echo -e "${GREEN}Setting up Cascade as git submodule...${NC}"

# Check if already exists
if [ -d "$SUBMODULE_PATH" ]; then
    echo -e "${YELLOW}Warning: $SUBMODULE_PATH already exists${NC}"
    read -p "Remove and re-add? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git submodule deinit -f "$SUBMODULE_PATH"
        git rm -f "$SUBMODULE_PATH"
        rm -rf ".git/modules/$SUBMODULE_PATH"
    else
        echo -e "${YELLOW}Aborted${NC}"
        exit 0
    fi
fi

# Add submodule
echo -e "${GREEN}Adding submodule...${NC}"
git submodule add "$REPO_URL" "$SUBMODULE_PATH"

# Initialize
echo -e "${GREEN}Initializing submodule...${NC}"
git submodule update --init --recursive

# Check if pnpm-workspace.yaml exists
if [ -f "pnpm-workspace.yaml" ]; then
    echo -e "${GREEN}Updating pnpm-workspace.yaml...${NC}"
    
    # Check if already contains cascade path
    if ! grep -q "packages/cascade/packages/\*" pnpm-workspace.yaml; then
        # Add cascade packages to workspace
        if grep -q "packages:" pnpm-workspace.yaml; then
            # Append to existing packages list
            sed -i.bak '/packages:/a\
  - '\''packages/cascade/packages/*'\''
' pnpm-workspace.yaml
            rm pnpm-workspace.yaml.bak
        else
            # Create new workspace file
            cat > pnpm-workspace.yaml << EOF
packages:
  - 'packages/*'
  - 'packages/cascade/packages/*'
EOF
        fi
        echo -e "${GREEN}✓ Added cascade packages to workspace${NC}"
    else
        echo -e "${YELLOW}✓ Cascade already in workspace${NC}"
    fi
else
    echo -e "${YELLOW}No pnpm-workspace.yaml found. Creating...${NC}"
    cat > pnpm-workspace.yaml << EOF
packages:
  - 'packages/*'
  - 'packages/cascade/packages/*'
EOF
fi

# Check if tsconfig.json exists
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}Checking tsconfig.json...${NC}"
    echo -e "${YELLOW}Note: You may need to add path mappings manually:${NC}"
    echo ""
    echo '  "compilerOptions": {'
    echo '    "baseUrl": ".",'
    echo '    "paths": {'
    echo '      "@cascade/motion-runtime": ["./packages/cascade/packages/motion-runtime/src"],'
    echo '      "@cascade/motion-gestures": ["./packages/cascade/packages/motion-gestures/src"]'
    echo '    }'
    echo '  }'
    echo ""
else
    echo -e "${YELLOW}No tsconfig.json found. You'll need to create one with path mappings.${NC}"
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
if command -v pnpm &> /dev/null; then
    pnpm install
else
    echo -e "${YELLOW}pnpm not found. Install dependencies manually: pnpm install${NC}"
fi

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Add TypeScript path mappings to tsconfig.json (see above)"
echo "2. Start developing: pnpm dev"
echo "3. See docs/DEVELOPMENT_WORKFLOW.md for debugging workflow"
echo ""


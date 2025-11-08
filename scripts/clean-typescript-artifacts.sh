#!/bin/bash
# Clean TypeScript compilation artifacts (.js, .d.ts, .map files)
# that have corresponding .ts or .tsx source files

set -e

DRY_RUN=false

show_help() {
    cat << EOF
Clean TypeScript compilation artifacts

Usage:
    ./clean-typescript-artifacts.sh          # Delete artifacts
    ./clean-typescript-artifacts.sh --dry-run   # Preview what would be deleted

This script removes .js, .d.ts, and .map files that are TypeScript
compilation artifacts (files with corresponding .ts or .tsx sources).

Excludes:
    - node_modules/
    - dist/
    - .git/
EOF
    exit 0
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_help
fi

if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
fi

deleted_count=0

# Find all .js, .d.ts, and .map files, excluding node_modules and dist
find . -type f \( -name "*.js" -o -name "*.d.ts" -o -name "*.map" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/dist/*" \
    ! -path "*/.git/*" \
    ! -path "./node_modules/*" \
    ! -path "./dist/*" \
    ! -path "./.git/*" \
    | while read -r file; do
    
    should_delete=false
    reason=""
    
    dir=$(dirname "$file")
    basename=$(basename "$file")
    name_without_ext="${basename%.*}"
    ext="${basename##*.}"
    
    # Check if there's a corresponding .ts or .tsx file
    if [[ -f "$dir/$name_without_ext.ts" ]] || [[ -f "$dir/$name_without_ext.tsx" ]]; then
        should_delete=true
        reason="has corresponding .ts/.tsx source"
    # Also delete .map files (they'll be regenerated)
    elif [[ "$ext" == "map" ]]; then
        should_delete=true
        reason="is a source map file"
    fi
    
    if [[ "$should_delete" == true ]]; then
        relative_path="${file#./}"
        
        if [[ "$DRY_RUN" == true ]]; then
            echo -e "\033[33mWould delete: $relative_path ($reason)\033[0m"
        else
            rm -f "$file"
            echo -e "\033[32mDeleted: $relative_path\033[0m"
        fi
        ((deleted_count++))
    fi
done

if [[ "$DRY_RUN" == true ]]; then
    echo -e "\n\033[36mDry run complete. Would delete $deleted_count file(s).\033[0m"
    echo -e "\033[36mRun without --dry-run to actually delete these files.\033[0m"
else
    echo -e "\n\033[32mCleanup complete. Deleted $deleted_count file(s).\033[0m"
fi

if [[ $deleted_count -eq 0 ]]; then
    echo -e "\033[36mNo TypeScript compilation artifacts found.\033[0m"
fi


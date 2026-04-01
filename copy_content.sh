#!/bin/bash

# Define the base directory for source content
SOURCE_BASE_DIR="${SOURCE_BASE_DIR:-./}"
# Define the target directory for VitePress docs  
TARGET_DOCS_DIR="${TARGET_DOCS_DIR:-xi7ang.github.io/docs}"

# List of content repositories (directories)
CONTENT_REPOS=(
  "AIknowledge"
  "auto"
  "book"
  "chinese-traditional"
  "cross-border"
  "curriculum"
  "edu-knowlege"
  "healthy"
  "movies"
  "self-media"
  "tools"
)

update_resource_tabs_months() {
  local source_repo_path="$1"
  local index_file="$2"

  if [ ! -f "$index_file" ] || ! grep -q "ResourceTabs" "$index_file"; then
    return
  fi

  local months_literal="[]"
  local month_values=()
  mapfile -t month_values < <(
    find "$source_repo_path" -maxdepth 1 -type f -name '20*.md' -printf '%f\n' | \
      sed 's/\.md$//' | grep -E '^20[0-9]{4}$' | sort -r
  )

  if [ ${#month_values[@]} -gt 0 ]; then
    months_literal="["
    local i
    for i in "${!month_values[@]}"; do
      if [ "$i" -gt 0 ]; then
        months_literal+=", "
      fi
      months_literal+="'${month_values[$i]}'"
    done
    months_literal+="]"
  fi

  python3 - "$index_file" "$months_literal" <<'PY'
from pathlib import Path
import re
import sys

index_file = Path(sys.argv[1])
months_literal = sys.argv[2]
text = index_file.read_text(encoding='utf-8')
new_text, count = re.subn(
    r'(<ResourceTabs\s+category="[^"]+"\s+:months=")\[[^\"]*\]("\s*/>)',
    rf'\g<1>{months_literal}\g<2>',
    text,
    count=1,
)
if count:
    index_file.write_text(new_text, encoding='utf-8')
PY

  echo "  - Updated ResourceTabs months in $(realpath --relative-to="$(pwd)" "$index_file") => $months_literal"
}

echo "Starting content synchronization..."
echo "Source: $SOURCE_BASE_DIR"
echo "Target: $TARGET_DOCS_DIR"

# Create the docs directory if it doesn't exist
mkdir -p "$TARGET_DOCS_DIR"
# Create the public directory if it doesn't exist
mkdir -p "$TARGET_DOCS_DIR/public"

# Copy the commits.json file from the module
if [ -f "docs/public/commits.json" ]; then
  cp docs/public/commits.json "$TARGET_DOCS_DIR/public/commits.json"
  echo "Copied commits.json"
else
  echo "Warning: commits.json not found, skipping"
fi

for REPO in "${CONTENT_REPOS[@]}"; do
  SOURCE_REPO_PATH="$SOURCE_BASE_DIR/$REPO"
  TARGET_REPO_PATH="$TARGET_DOCS_DIR/$REPO"
  TARGET_PUBLIC_REPO_PATH="$TARGET_DOCS_DIR/public/$REPO"

  echo "Processing repository: $REPO"
  
  # Check if source repository exists
  if [ ! -d "$SOURCE_REPO_PATH" ]; then
    echo "  - Warning: Source directory $SOURCE_REPO_PATH not found, skipping"
    continue
  fi

  # Create target directory for the repository
  mkdir -p "$TARGET_REPO_PATH"
  mkdir -p "$TARGET_PUBLIC_REPO_PATH"

  # Copy README.md to index.md in the target directory (full content)
  # But preserve existing index.md files that use ResourceTabs component
  if [ -f "$SOURCE_REPO_PATH/README.md" ]; then
    if [ -f "$TARGET_REPO_PATH/index.md" ] && grep -q "ResourceTabs" "$TARGET_REPO_PATH/index.md"; then
      echo "  - Skipping $REPO/index.md (uses ResourceTabs component)"
    else
      cp "$SOURCE_REPO_PATH/README.md" "$TARGET_REPO_PATH/index.md"
      echo "  - Copied README.md to $REPO/index.md"
    fi
  else
    echo "  - Warning: README.md not found in $REPO"
  fi

  # Copy other .md files (excluding README.md)
  md_files_count=0
  for md_file_src in "$SOURCE_REPO_PATH"/*.md; do
    if [ -f "$md_file_src" ] && [ "$(basename "$md_file_src")" != "README.md" ]; then
      cp "$md_file_src" "$TARGET_REPO_PATH/"
      # Also copy to public directory as static resources for ResourceTabs component
      cp "$md_file_src" "$TARGET_PUBLIC_REPO_PATH/"
      md_files_count=$((md_files_count + 1))
    fi
  done
  echo "  - Copied $md_files_count .md files to $REPO/ and public/$REPO/"

  update_resource_tabs_months "$SOURCE_REPO_PATH" "$TARGET_REPO_PATH/index.md"
  update_resource_tabs_months "$SOURCE_REPO_PATH" "$TARGET_PUBLIC_REPO_PATH/index.md"

  # Copy image files to the public directory, maintaining repo structure
  img_files_count=0
  for img_file_src in "$SOURCE_REPO_PATH"/*.{png,jpg,jpeg,gif,svg}; do
    if [ -f "$img_file_src" ]; then
      cp "$img_file_src" "$TARGET_PUBLIC_REPO_PATH/"
      img_files_count=$((img_files_count + 1))
    fi
  done
  echo "  - Copied $img_files_count image files to public/$REPO/"

  # Modify image paths in the copied Markdown files
  for md_file in "$TARGET_REPO_PATH"/*.md; do
    if [ -f "$md_file" ]; then
      # Use sed with extended regex (-E) for more reliable matching
      # Only modify relative paths that don't already start with /
      sed -E "s#src=\"([^/][^\"]+\.(png|jpg|jpeg|gif|svg))\"#src=\"/$REPO/\1\"#g" "$md_file" > "$md_file.tmp" && \
      mv "$md_file.tmp" "$md_file"
      echo "  - Modified image paths in $(basename "$md_file")"
    fi
  done
done

echo "Content copying and image path modification complete."
echo "Summary: Processed ${#CONTENT_REPOS[@]} repositories"

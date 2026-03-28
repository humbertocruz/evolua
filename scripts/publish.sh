#!/usr/bin/env bash
# Publish all @evolua/* packages to npmjs
# Requires: NPM_TOKEN env var set

set -e

REGISTRY="https://registry.npmjs.org/"
SCOPE="@evolua"
DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Check token
if [ -z "$NPM_TOKEN" ]; then
  echo "❌ NPM_TOKEN not set. Run: export NPM_TOKEN=your_token_here"
  exit 1
fi

# Configure .npmrc for this publish session
NPMRC=".npmrc.publish"
echo "${SCOPE}:registry=${REGISTRY}" > "$NPMRC"
echo "//${REGISTRY#https://}:_authToken=${NPM_TOKEN}" >> "$NPMRC"

echo "📦 Publishing @evolua/* packages..."

cd "$DIR/packages"

for pkg in types db ui runtime core next; do
  if [ -d "$pkg" ]; then
    echo ""
    echo "─── Publishing @evolua/$pkg ───"
    cd "$pkg"
    
    # Get current version
    PKG_VERSION=$(node -p "require('./package.json').version")
    PKG_NAME=$(node -p "require('./package.json').name")
    
    echo "  Current: $PKG_NAME@$PKG_VERSION"
    
    # Check if version already exists
    if npm view "$PKG_NAME@$PKG_VERSION" version &>/dev/null; then
      echo "  ⏭️  $PKG_VERSION already published on npm — skipping"
    else
      echo "  🚀 Publishing..."
      cd "$DIR/packages/$pkg"
      npm publish --registry "$REGISTRY" --access public
      echo "  ✅ Published!"
    fi
    
    cd "$DIR/packages"
  fi
done

# Cleanup
rm -f "$NPMRC"

echo ""
echo "✅ Done!"

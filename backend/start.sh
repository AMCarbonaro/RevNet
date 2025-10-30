#!/bin/bash
set -e

echo "=== Diagnostic Information ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo ""
echo "=== Checking dist directory ==="
if [ -d "dist" ]; then
  echo "dist directory exists"
  find dist -name "*.js" -type f | head -20
else
  echo "ERROR: dist directory does not exist!"
fi

echo ""
echo "=== Checking for main.js ==="
if [ -f "dist/src/main.js" ]; then
  echo "Found: dist/src/main.js"
  START_FILE="dist/src/main.js"
elif [ -f "dist/main.js" ]; then
  echo "Found: dist/main.js"
  START_FILE="dist/main.js"
else
  echo "ERROR: Could not find main.js file!"
  exit 1
fi

echo ""
echo "=== Starting application ==="
echo "Starting: node $START_FILE"
node --max-old-space-size=256 "$START_FILE"


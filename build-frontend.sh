#!/bin/bash
set -e

echo "Installing all dependencies (including dev dependencies)..."
npm install

echo "Building Angular application..."
npm run build

echo "Build completed successfully!"
echo "Output directory: dist/revnet"

#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci

echo "Building Angular application..."
npm run build

echo "Build completed successfully!"
echo "Output directory: dist/revnet"

#!/bin/bash
set -e

echo "=== RevNet3 Frontend Build Script for Render ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo "Installing all dependencies..."
npm install --production=false

echo "Installing Angular CLI globally..."
npm install -g @angular/cli@17.3.0

echo "Verifying Angular CLI installation..."
ng version

echo "Building Angular application..."
ng build --configuration production

echo "Build completed successfully!"
echo "Output directory: dist/revnet"
ls -la dist/revnet/

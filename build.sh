#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build:prod

echo "Build completed successfully!"
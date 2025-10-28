#!/bin/bash

# Render build script for RevNet3
echo "🚀 Building RevNet3 for Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Build backend
echo "🏗️ Building backend..."
cd backend
npm install
npm run build
cd ..

echo "✅ Build complete!"

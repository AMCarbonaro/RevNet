#!/bin/bash

# RevNet3 Deployment Script for DigitalOcean
echo "🚀 Starting RevNet3 deployment to DigitalOcean..."

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "❌ doctl (DigitalOcean CLI) is not installed."
    echo "Please install it from: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Check if user is authenticated
if ! doctl account get &> /dev/null; then
    echo "❌ Not authenticated with DigitalOcean."
    echo "Please run: doctl auth init"
    exit 1
fi

# Check if Docker is running (for local testing)
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker is not running. Skipping local Docker build test."
else
    # Test Docker build locally
    echo "📦 Testing Docker build locally..."
    docker build -t revnet3:latest .
    
    if [ $? -ne 0 ]; then
        echo "❌ Docker build failed! Please fix the issues before deploying."
        exit 1
    fi
    
    echo "✅ Docker build test passed!"
fi

# Deploy to DigitalOcean App Platform
echo "🚀 Deploying to DigitalOcean App Platform..."

# Option 1: Deploy using app.yaml (recommended)
if [ -f ".do/app.yaml" ]; then
    echo "📋 Using .do/app.yaml configuration..."
    doctl apps create --spec .do/app.yaml
    
    if [ $? -ne 0 ]; then
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ .do/app.yaml not found. Please create the configuration file first."
    exit 1
fi

echo "🎉 RevNet3 successfully deployed to DigitalOcean!"
echo "🌐 Your application will be available at the URL provided by DigitalOcean App Platform"
echo "📊 Monitor your deployment at: https://cloud.digitalocean.com/apps"

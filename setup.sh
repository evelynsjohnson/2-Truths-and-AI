#!/bin/bash

# Setup script for 2 Truths and AI React App
# This script copies assets from the original project and installs dependencies

echo "=========================================="
echo "2 Truths and AI - React App Setup"
echo "=========================================="
echo ""

# Check if we're in the react-app directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the react-app directory"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Copy assets if they exist
if [ -d "../img" ]; then
    echo "Copying image assets..."
    cp -r ../img/* public/assets/img/ 2>/dev/null
    echo "✓ Images copied"
else
    echo "⚠ Warning: ../img directory not found. Skipping image copy."
fi

if [ -d "../mp3" ]; then
    echo "Copying audio assets..."
    cp -r ../mp3/* public/assets/mp3/ 2>/dev/null
    echo "✓ Audio files copied"
else
    echo "⚠ Warning: ../mp3 directory not found. Skipping audio copy."
fi

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo ""
echo "To start the development server, run:"
echo "  npm start"
echo ""
echo "The app will be available at http://localhost:3000"
echo ""

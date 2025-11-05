#!/bin/bash

# Setup script for 2 Truths and AI (Cloudflare Workers + React)
# This script installs dependencies for the project

echo "=========================================="
echo "2 Truths and AI - Project Setup"
echo "=========================================="
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the project root directory"
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

# Check if .dev.vars exists
if [ ! -f ".dev.vars" ]; then
    echo "⚠ Warning: .dev.vars file not found"
    echo "  Create .dev.vars with your Azure OpenAI credentials:"
    echo "  AZURE_OPENAI_API_KEY=your_key_here"
    echo "  AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/"
    echo ""
else
    echo "✓ Environment variables configured"
fi

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "The app will be available at http://localhost:3000"
echo ""
echo "To deploy to Cloudflare Workers, run:"
echo "  npm run build && npm run deploy"
echo ""

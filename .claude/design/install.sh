#!/bin/bash

echo "📊 Chart Design System Storybook Setup"
echo "======================================"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Installation complete!"
echo ""
echo "📚 To start Storybook, run:"
echo "   npm run storybook"
echo ""
echo "🌐 Storybook will be available at: http://localhost:6006"
echo ""
echo "📁 HTML chart examples are located in: ../../docs/charts/"
echo ""
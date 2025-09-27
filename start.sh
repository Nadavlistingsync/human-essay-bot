#!/bin/bash

echo "🤖 Starting Human Essay Bot..."
echo "================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create one with your OpenAI API key:"
    echo "   OPENAI_API_KEY=your_api_key_here"
    echo ""
    echo "📝 You can copy env.example to .env and edit it:"
    echo "   cp env.example .env"
    echo ""
fi

echo "🚀 Launching Human Essay Bot..."
npm start

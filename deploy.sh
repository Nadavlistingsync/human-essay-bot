#!/bin/bash

# Human Essay Bot Deployment Script
echo "🚀 Deploying Human Essay Bot..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Please create one with your OPENAI_API_KEY."
    echo "Example: echo 'OPENAI_API_KEY=your_key_here' > .env"
fi

# Test the application locally first
echo "🧪 Testing application locally..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test health endpoint
if curl -s http://localhost:3001/api/health | grep -q "healthy"; then
    echo "✅ Local server test passed!"
    kill $SERVER_PID
else
    echo "❌ Local server test failed!"
    kill $SERVER_PID
    exit 1
fi

echo "🎉 Application is ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Choose a deployment platform:"
echo "   • Railway: https://railway.app (Recommended)"
echo "   • Render: https://render.com"
echo "   • Vercel: https://vercel.com"
echo "   • Netlify: https://netlify.com"
echo ""
echo "2. Connect your GitHub repository"
echo "3. Set environment variables:"
echo "   • OPENAI_API_KEY=your_openai_api_key_here"
echo "   • NODE_ENV=production"
echo ""
echo "4. Deploy and test your endpoints:"
echo "   • /api/health"
echo "   • /api/generate-essay-simple"
echo "   • /"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions."
